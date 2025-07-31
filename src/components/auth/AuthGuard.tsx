'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../app/store/authStore';

// This is a Higher-Order Component (HOC) that protects routes
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state on component mount
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Redirect if not authenticated
    // We also check if the initialization is complete by seeing if `isAuthenticated` is no longer null
    if (!isAuthenticated) {
      // You might want to add a loading state here
      // For now, we redirect immediately if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // If authenticated, render the children (the protected page)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Optionally, return a loading spinner while checking auth
  return <div>Loading...</div>;
}