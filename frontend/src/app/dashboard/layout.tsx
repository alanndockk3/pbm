// app/dashboard/layout.tsx
'use client'
import { useEffect, useState } from 'react';
import { Heart } from "lucide-react";
import { CustomerNavigation } from '@/components/CustomerNavigation';
import { ProtectedRoute } from '../../../lib/auth/ProtectedRoute';
import { useAuthStore } from '../../../lib/auth/useAuthStore';
import { useCartStore } from '../../../lib/profile/useCartStore';
import { useWishlistStore } from '../../../lib/profile/useWishListStore';
import { useProductStore } from '../../../lib/product/useProductStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { loadCart, subscribeToCart } = useCartStore();
  const { loadWishlist, subscribeToWishlist } = useWishlistStore();
  const { initializeProducts } = useProductStore();
  
  // Track sidebar state for dynamic layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pbm-nav-open');
      return stored === 'true';
    }
    return false;
  });

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('pbm-nav-open');
        setIsSidebarOpen(stored === 'true');
      }
    };

    // Listen for storage changes (when sidebar is toggled)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the navigation component
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsSidebarOpen(e.detail.isOpen);
    };
    
    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
    };
  }, []);

  // Initialize all shared data when entering dashboard
  useEffect(() => {
    console.log('Dashboard layout: Initializing shared data');
   
    // Initialize products (available to all dashboard pages)
    initializeProducts();
    if (user?.uid) {
      console.log('Dashboard layout: Initializing user-specific data for:', user.uid);
     
      // Load cart and set up real-time subscription
      loadCart(user.uid);
      const unsubscribeCart = subscribeToCart(user.uid);
     
      // Load wishlist and set up real-time subscription
      loadWishlist(user.uid);
      const unsubscribeWishlist = subscribeToWishlist(user.uid);
     
      // Cleanup subscriptions when user changes or component unmounts
      return () => {
        console.log('Dashboard layout: Cleaning up subscriptions');
        unsubscribeCart();
        unsubscribeWishlist();
      };
    }
  }, [user?.uid, initializeProducts, loadCart, subscribeToCart, loadWishlist, subscribeToWishlist]);

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        {/* Sticky Header - Higher z-index to stay above sidebar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-rose-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Left side - PBM Branding */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-rose-800">PBM</h1>
                  <p className="text-xs text-rose-600">Pretties by Marg</p>
                </div>
              </div>
             
              {/* Right side - Navigation */}
              <CustomerNavigation />
            </div>
          </div>
        </header>
       
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