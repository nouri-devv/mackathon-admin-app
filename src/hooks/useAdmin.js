'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdmin(requireAuth = true) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    
    if (adminData) {
      setAdmin(JSON.parse(adminData));
      setLoading(false);
    } else if (requireAuth) {
      router.push('/signup');
    } else {
      setLoading(false);
    }
  }, [requireAuth, router]);

  const logout = () => {
    localStorage.removeItem('adminUser');
    setAdmin(null);
    router.push('/signup');
  };

  return { admin, loading, logout };
}