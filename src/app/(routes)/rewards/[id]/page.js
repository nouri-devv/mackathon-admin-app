'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { GiftIcon, TagIcon, CurrencyDollarIcon, CalendarIcon, PencilIcon, TrashIcon, CheckCircleIcon, ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../../../hooks/useAdmin';
import Sidebar from '../../../../components/Sidebar';

export default function RewardPage({ params }) {
  const { admin } = useAdmin();
  const router = useRouter();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redemptions, setRedemptions] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const rewardDoc = await getDoc(doc(db, 'rewards', resolvedParams.id));
        if (rewardDoc.exists()) {
          const rewardData = { id: rewardDoc.id, ...rewardDoc.data() };
          setReward(rewardData);
          setFormData({
            title: rewardData.title || '',
            description: rewardData.description || '',
            creditCost: rewardData.creditCost || 100,
            quantity: rewardData.quantity || 0,
            expiryDate: rewardData.expiryDate ? new Date(rewardData.expiryDate.seconds * 1000).toISOString().split('T')[0] : '',
            imageUrl: rewardData.imageUrl || '',
            category: rewardData.category || '',
            tags: rewardData.tags || []
          });
          
          // Fetch redemption details
          if (rewardData.redeemedBy && rewardData.redeemedBy.length > 0) {
            await fetchRedemptionDetails(rewardData.redeemedBy);
          }
        }
      } catch (error) {
        console.error('Error fetching reward:', error);
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      fetchReward();
    }
  }, [resolvedParams.id, admin]);

  const fetchRedemptionDetails = async (userIds) => {
    try {
      const redemptionData = [];
      
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, 'studentUsers', userId));
        if (userDoc.exists()) {
          redemptionData.push({
            id: userDoc.id,
            ...userDoc.data(),
            redeemed: true
          });
        }
      }
      
      setRedemptions(redemptionData);
    } catch (error) {
      console.error('Error fetching redemption details:', error);
    }
  };

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
    if (formData.quantity < 0) errors.quantity = "Quantity cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const rewardRef = doc(db, 'rewards', resolvedParams.id);
      
      // Prepare updated data
      const updatedData = {
        ...formData,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
      };
      
      await updateDoc(rewardRef, updatedData);
      
      // Update the state with new data
      setReward({
        ...reward,
        ...updatedData
      });
      
      setEditMode(false);
    } catch (error) {
      console.error("Error updating reward:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReward = async () => {
    try {
      await deleteDoc(doc(db, 'rewards', resolvedParams.id));
      router.push('/rewards');
    } catch (error) {
      console.error("Error deleting reward:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (!reward) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-700">Reward not found</h2>
      <Link href="/rewards" className="mt-4 text-indigo-600 hover:text-indigo-800">
        Return to rewards
      </Link>
    </div>
  );

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'No expiry date';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <Link 
            href="/rewards" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Rewards
          </Link>

          {editMode ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="bg-indigo-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">Edit Reward</h1>
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
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                        >
                          <option value="">Select category</option>
                          <option value="gift">Gift</option>
                          <option value="voucher">Voucher</option>
                          <option value="merch">Merchandise</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
  
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                        />
                      </div>
                    </div>
  
                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                          placeholder="Add a tag"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
  
                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-800">{reward.title}</h1>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <PencilIcon className="h-5 w-5 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                <img src={reward.imageUrl}
    alt={reward.title}
    className="w-full h-64 object-cover rounded-lg mb-4"
 />
                <p className="text-gray-600 mb-2">{reward.description}</p>
                <p className="text-gray-800 font-medium mb-2">Credit Cost: {reward.creditCost}</p>
                <p className="text-gray-800 font-medium mb-2">Available: {reward.quantity}</p>
                <p className="text-gray-600 mb-2">Expiry Date: {formatDate(reward.expiryDate)}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {reward.tags?.map((tag, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                {redemptions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Redeemed By</h3>
                    <ul className="space-y-2">
                      {redemptions.map((user) => (
                        <li key={user.id} className="flex items-center space-x-2">
                          <UserCircleIcon className="h-5 w-5 text-gray-500" />
                          <span>{user.displayName || user.email || 'Unnamed User'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
  
            {/* Delete Modal */}
            {deleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Are you sure you want to delete this reward?
                  </h2>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteReward}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  