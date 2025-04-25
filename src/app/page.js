'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../hooks/useAdmin';
import { collection } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { StarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const { admin, loading } = useAdmin(false);
  const [events, eventsLoading] = useCollection(
    collection(db, "events"),
    {}
  );

  // Calculate total points from registered events
  const calculateTotalPoints = () => {
    if (!events?.docs) return 0;
    
    return events.docs.reduce((total, doc) => {
      const event = doc.data();
      if (event.attendees?.includes(admin?.id)) {
        return total + (event.creditPoints || 0);
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/signup');
    }
  }, [admin, loading, router]);

  if (loading || !admin || eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {admin?.firstName}!
            </h1>
            <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-full">
              <StarIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-medium">
                {calculateTotalPoints()} Total Points
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {events?.docs.slice(0, 3).map((doc) => {
                const event = doc.data();
                return (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/events/${doc.id}`)}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      <StarIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{event.creditPoints || 0} Points</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link 
              href="/events"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
            >
              View all events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}