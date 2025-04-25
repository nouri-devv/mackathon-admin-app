'use client';
import { useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/navigation';
import { CalendarIcon, MapPinIcon, StarIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAdmin } from '../../../hooks/useAdmin';
import Sidebar from '../../../components/Sidebar';

// Add formatDate helper function
const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return '';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Events() {
  const { admin } = useAdmin();
  const router = useRouter();
  const [events, eventsLoading, eventsError] = useCollection(
    collection(db, "events"),
    {}
  );
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    creditPoints: 10,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditPoints' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.date) errors.date = "Date is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "events"), {
        ...formData,
        date: new Date(formData.date),
        attendees: [],
        createdAt: serverTimestamp()
      });
      
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        creditPoints: 0,
        tags: []
      });
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600">Welcome, {admin?.firstName}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Event
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events?.docs.map((doc) => {
              const event = doc.data();
              return (
                <div
                  key={doc.id}
                  className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/events/${doc.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      <StarIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{event.creditPoints || 0} Points</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-500">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  {event.tags && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Modal with Blur Background */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/30"
            onClick={() => setShowModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto pointer-events-auto">
              <div className="flex justify-between items-center border-b px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter event title"
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe your event"
                    ></textarea>
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location*
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Event location"
                      />
                      {formErrors.location && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date and Time*
                      </label>
                      <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.date && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="creditPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Points
                    </label>
                    <input
                      type="number"
                      id="creditPoints"
                      name="creditPoints"
                      value={formData.creditPoints}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Add a tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <div key={index} className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                            <span className="text-indigo-700 text-sm">{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-indigo-600 hover:text-indigo-800"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}