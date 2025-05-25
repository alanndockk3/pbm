import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../client/firebaseConfig';
import { useAuthStore } from './useAuthStore';
import { Heart } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const router = useRouter();
  const { user, setUser, loading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsInitializing(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    // Redirect to home if user is not authenticated and initialization is complete
    if (!isInitializing && !user) {
      router.push('/');
    }
  }, [user, isInitializing, router]);

  // Show loading screen while initializing or if user is not authenticated
  if (isInitializing || loading || !user) {
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
              {isInitializing ? 'Initializing...' : 'Checking authentication...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render children only if user is authenticated
  return <>{children}</>;
};