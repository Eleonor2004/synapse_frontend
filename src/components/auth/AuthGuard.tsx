'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../app/store/authStore';
import { useIsClient } from '../../hooks/useIsClient'; // Import our custom hook
import { Loader2 } from 'lucide-react'; // For a nice loading spinner

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useIsClient(); // Use the hook to detect client-side mounting

  useEffect(() => {
    // Initialize auth state from localStorage when the component mounts on the client
    initialize();
  }, [initialize]);

  useEffect(() => {
    // This effect runs only on the client, after `isClient` becomes true.
    // It handles the redirection logic.
    if (isClient && !isAuthenticated) {
      // Redirect to login page, but also remember where the user was trying to go.
      // This allows us to redirect them back after a successful login.
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isClient, isAuthenticated, router, pathname]);

  // --- THE FIX IN ACTION ---
  // 1. If we are not on the client yet, or if auth state is not yet determined,
  //    render a loading state. This will be the same on the server and the initial client render.
  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // 2. Only if we are on the client AND the user is authenticated, render the actual page content.
  return <>{children}</>;
}