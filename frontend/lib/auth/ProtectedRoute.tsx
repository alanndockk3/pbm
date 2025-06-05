'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './useAuthStore';
import { Heart } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/' 
}) => {
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading) {
      // No user - redirect to home/login
      if (!user) {
        console.log('No user found, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      // Check role requirements
      if (requiredRole && user.role !== requiredRole) {
        console.log(`Access denied. Required: ${requiredRole}, User has: ${user.role}`);
        
        // Redirect based on user's actual role
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      console.log('Access granted to protected route');
    }
  }, [user, loading, initialized, router, requiredRole, redirectTo]);

  // Show loading while auth is being determined
  if (!initialized || loading) {
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
              Verifying access...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have access (will redirect via useEffect)
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
};