'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AdminAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    adminId: ''
  });

  useEffect(() => {
    const admin = localStorage.getItem('adminUser');
    if (admin) {
      router.push('/'); // Changed from '/events' to '/'
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const adminRef = collection(db, 'adminUsers');
      const q = query(adminRef, where('adminId', '==', formData.adminId));
      const querySnapshot = await getDocs(q);

      if (isLogin) {
        // Login flow
        if (querySnapshot.empty) {
          setError('Admin ID not found. Please sign up.');
          return;
        }

        const adminDoc = querySnapshot.docs[0];
        const adminData = {
          id: adminDoc.id,
          ...adminDoc.data()
        };

        localStorage.setItem('adminUser', JSON.stringify(adminData));
        router.push('/'); // Changed from '/events' to '/'
      } else {
        // Signup flow
        if (!querySnapshot.empty) {
          setError('Admin ID already exists. Please login.');
          setIsLogin(true);
          return;
        }

        const docRef = await addDoc(collection(db, 'adminUsers'), {
          ...formData,
          createdAt: new Date()
        });

        const adminData = {
          id: docRef.id,
          ...formData
        };
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        router.push('/'); // Changed from '/events' to '/'
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isLogin ? 'Admin Login' : 'Admin Sign Up'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin ID
              </label>
              <input
                type="text"
                required
                value={formData.adminId}
                onChange={(e) => setFormData({...formData, adminId: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}