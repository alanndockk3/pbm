// app/admin/layout.tsx
'use client'

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../lib/auth/ProtectedRoute';
import { AdminNavigation } from '@/components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track sidebar state for dynamic layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pbm-admin-nav-open');
      return stored === 'true';
    }
    return false;
  });

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('pbm-admin-nav-open');
        setIsSidebarOpen(stored === 'true');
      }
    };

    // Listen for storage changes (when sidebar is toggled)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the navigation component
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsSidebarOpen(e.detail.isOpen);
    };
    
    window.addEventListener('admin-sidebar-toggle' as any, handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-sidebar-toggle' as any, handleSidebarToggle);
    };
  }, []);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        {/* Admin Navigation - collapsible sidebar */}
        <AdminNavigation />
        
        {/* Main Content - Only adjust layout on desktop when sidebar is open */}
        <main className={`px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
          isSidebarOpen 
            ? 'lg:ml-72 max-w-none' 
            : 'max-w-7xl mx-auto'
        }`}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}