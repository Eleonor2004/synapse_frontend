"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useIsClient } from '@/hooks/useIsClient';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, initialize } = useAuthStore();
  const router = useRouter();
  const isClient = useIsClient();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // This effect handles redirection
  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push('/login'); // Not logged in at all
      } else if (user && user.role !== 'admin') {
        // Logged in, but not an admin
        // We don't redirect here, we'll show a "Forbidden" message instead.
      }
    }
  }, [isClient, isAuthenticated, user, router]);

  if (!isClient || !user) {
    // Show a loading state while we verify the user's role
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    // Show a clear "Access Denied" message if the user is not an admin
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <ShieldAlert className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">Access Denied</h3>
        <p className="text-yellow-600 dark:text-yellow-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  // If all checks pass, render the actual page content
  return <>{children}</>;
}