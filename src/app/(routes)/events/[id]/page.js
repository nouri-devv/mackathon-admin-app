'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
import { CalendarIcon, MapPinIcon, ArrowLeftIcon, StarIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAdmin } from '../../../../hooks/useAdmin';
import Sidebar from '../../../../components/Sidebar';

export default function EventPage({ params }) {
  const { admin } = useAdmin();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [attendeesList, setAttendeesList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', resolvedParams.id));
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          setEvent(eventData);
          setIsRegistered(eventData.attendees?.includes(admin?.id) || false);
          
          // Fetch attendees information
          if (eventData.attendees && eventData.attendees.length > 0) {
            await fetchAttendeeDetails(eventData.attendees);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      fetchEvent();
    }
  }, [resolvedParams.id, admin]);

  const fetchAttendeeDetails = async (attendeeIds) => {
    setAttendanceLoading(true);
    try {
      const attendeesData = [];
      
      for (const userId of attendeeIds) {
        const userDoc = await getDoc(doc(db, 'studentUsers', userId));
        if (userDoc.exists()) {
          attendeesData.push({
            id: userDoc.id,
            ...userDoc.data(),
            attended: false // Default attendance status
          });
        }
      }
      
      setAttendeesList(attendeesData);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const markAttendance = async (studentId, currentStatus) => {
    try {
      // Find the student in the attendees list
      const updatedList = attendeesList.map(student => {
        if (student.id === studentId) {
          return { ...student, attended: !currentStatus };
        }
        return student;
      });
      
      setAttendeesList(updatedList);
      
      // If marking as attended, award credit points
      if (!currentStatus) {
        const studentRef = doc(db, 'studentUsers', studentId);
        const studentDoc = await getDoc(studentRef);
        
        if (studentDoc.exists()) {
          const currentPoints = studentDoc.data().creditPoints || 0;
          const eventPoints = event.creditPoints || 0;
          
          await updateDoc(studentRef, {
            creditPoints: currentPoints + eventPoints
          });
        }
      } else {
        // If unmarking attendance, remove credit points
        const studentRef = doc(db, 'studentUsers', studentId);
        const studentDoc = await getDoc(studentRef);
        
        if (studentDoc.exists()) {
          const currentPoints = studentDoc.data().creditPoints || 0;
          const eventPoints = event.creditPoints || 0;
          
          await updateDoc(studentRef, {
            creditPoints: Math.max(0, currentPoints - eventPoints) // Ensure points don't go negative
          });
        }
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-700">Event not found</h2>
      <Link href="/events" className="mt-4 text-indigo-600 hover:text-indigo-800">
        Return to events
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <Link 
            href="/events" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Events
          </Link>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-indigo-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                    <StarIcon className="h-5 w-5 text-white mr-2" />
                    <span className="text-white font-medium">
                      {event.creditPoints || 0} Credit Points
                    </span>
                  </div>
                  {event.attendees && (
                    <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                      <UserGroupIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-white font-medium">
                        {event.attendees.length} Registered
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <p className="text-gray-700 text-lg leading-relaxed">{event.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="text-gray-900">
                      {new Date(event.date?.seconds * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <MapPinIcon className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-gray-900">{event.location}</p>
                  </div>
                </div>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attendees Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Attendees</h2>
            </div>
            
            <div className="p-6">
              {attendanceLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : attendeesList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendeesList.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.firstName} {student.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => markAttendance(student.id, student.attended)}
                              className={`flex items-center px-3 py-1.5 rounded-md ${
                                student.attended 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              <CheckCircleIcon className={`h-5 w-5 mr-1.5 ${student.attended ? 'text-green-600' : 'text-gray-400'}`} />
                              {student.attended ? 'Attended' : 'Mark Attended'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No registered attendees for this event yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}