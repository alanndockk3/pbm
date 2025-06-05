'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './useAuthStore';
import { Heart } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, initialized, initializeAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth...');
    
    // Initialize the auth store (this sets up the onAuthStateChanged listener)
    initializeAuth();
    
    // Set initialization complete after a brief delay to ensure auth state is processed
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [initializeAuth]);

  // Show loading screen while initializing
  if (isInitializing || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="w-32 h-2 bg-rose-200 dark:bg-rose-800 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-rose-700 dark:text-rose-300 text-sm">
              Initializing authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render children - auth state is now managed globally by the store
  return <>{children}</>;
};