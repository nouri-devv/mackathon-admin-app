'use client';
import { useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/navigation';
import { GiftIcon, TagIcon, CurrencyDollarIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAdmin } from '../../../hooks/useAdmin';
import Sidebar from '../../../components/Sidebar';

export default function Rewards() {
  const { admin } = useAdmin();
  const router = useRouter();
  const [rewards, rewardsLoading, rewardsError] = useCollection(
    collection(db, "rewards"),
    {}
  );
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creditCost: 100,
    quantity: 10,
    expiryDate: '',
    imageUrl: '',
    category: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditCost' || name === 'quantity' ? parseInt(value) || 0 : value
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
    if (formData.creditCost <= 0) errors.creditCost = "Credit cost must be greater than 0";
    if (formData.quantity <= 0) errors.quantity = "Quantity must be greater than 0";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "rewards"), {
        ...formData,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        createdAt: serverTimestamp(),
        redeemedBy: []
      });
      
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        creditCost: 100,
        quantity: 10,
        expiryDate: '',
        imageUrl: '',
        category: '',
        tags: []
      });
    } catch (error) {
      console.error("Error adding reward:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (rewardsLoading) {
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
              <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
              <p className="text-gray-600">Manage available rewards for students</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Reward
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rewards?.docs.map((doc) => {
              const reward = doc.data();
              return (
                <div
                  key={doc.id}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/rewards/${doc.id}`)}
                >
                  {reward.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={reward.imageUrl} 
                        alt={reward.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Reward+Image";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold">{reward.title}</h2>
                      <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{reward.creditCost || 0} Credits</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{reward.description}</p>
                    <div className="space-y-2 mb-4">
                      {reward.category && (
                        <div className="flex items-center text-gray-500">
                          <TagIcon className="h-5 w-5 mr-2" />
                          <span className="capitalize">{reward.category}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-500">
                        <GiftIcon className="h-5 w-5 mr-2" />
                        <span>{reward.quantity} Available</span>
                      </div>
                    </div>
                    {reward.tags && reward.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reward.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {reward.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{reward.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {rewards?.docs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <GiftIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No rewards available</h3>
              <p className="text-gray-500 mb-6">Create your first reward for students to redeem with their credit points.</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Reward
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Reward Modal */}
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
                <h2 className="text-xl font-bold text-gray-900">Add New Reward</h2>
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
                      Reward Title*
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
                      placeholder="Enter reward title"
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
                      placeholder="Describe your reward"
                    ></textarea>
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="creditCost" className="block text-sm font-medium text-gray-700 mb-1">
                        Credit Cost*
                      </label>
                      <input
                        type="number"
                        id="creditCost"
                        name="creditCost"
                        value={formData.creditCost}
                        onChange={handleChange}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.creditCost ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="100"
                      />
                      {formErrors.creditCost && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.creditCost}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Available Quantity*
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="10"
                      />
                      {formErrors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select a category</option>
                        <option value="merchandise">Merchandise</option>
                        <option value="experience">Experience</option>
                        <option value="voucher">Voucher</option>
                        <option value="service">Service</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (optional)
                      </label>
                      <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com/reward-image.jpg"
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
                    {isSubmitting ? 'Creating...' : 'Create Reward'}
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