'use client'

import React, { useEffect, useState } from 'react';
import { useAuthStore } from './useAuthStore';
import { Loader2, LoaderPinwheel } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, initialized, initializeAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeAuth();

    // Set initialization complete after a brief delay to ensure auth state is processed
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [initializeAuth]);

  // Show loading screen while initializing
  if (isInitializing || !initialized) {
    // Simple spinner version for authenticated users
    if (user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
          <div className="text-center">
            <LoaderPinwheel className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          </div>
        </div>
      );
    }

    // Full loading experience for unauthenticated users
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
          <div className="text-center">
            <LoaderPinwheel className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          </div>
        </div>
      );
  }

  // Render children - auth state is now managed globally by the store
  return <>{children}</>;
};