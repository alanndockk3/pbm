'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth/useAuthStore';
import { useCartTotalItems } from '../../lib/profile/useCartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  User, 
  Heart, 
  Package,
  LogOut,
  X,
  Settings
} from 'lucide-react';

export function CustomerNavigation() {
  const { user, logout } = useAuthStore();
  const cartTotalItems = useCartTotalItems();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Function to get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const fullName = user.fullName || user.displayName || '';
    const emailName = user.email?.split('@')[0] || '';
    const nameToUse = fullName || emailName;
    
    if (!nameToUse) return 'U';
    
    const nameParts = nameToUse.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else {
      return nameToUse.slice(0, 2).toUpperCase();
    }
  };

  const handleCartClick = () => {
    router.push('/dashboard/cart');
  };

  const handleProfileClick = () => {
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const navigateAndClose = (path: string) => {
    router.push(path);
    closeSheet();
  };

  const handleLogoutAndClose = async () => {
    await logout();
    closeSheet();
    router.replace('/');
  };

  // Close sheet on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSheet();
      }
    };

    if (isSheetOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSheetOpen]);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Cart Button */}
        <Button 
          variant="ghost" 
          size="default"
          className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 relative px-4 py-2 mr-3"
          onClick={handleCartClick}
        >
          Cart
          <ShoppingBag className="w-5 h-5 mr" />
          
          {cartTotalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-pink-500 hover:bg-pink-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
              {cartTotalItems > 99 ? '99+' : cartTotalItems}
            </Badge>
          )}
        </Button>

        {/* User Initials Circle */}
        <button
          onClick={handleProfileClick}
          className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:from-pink-500 hover:to-purple-600 transition-all duration-200 hover:scale-105"
          title="Open Menu"
        >
          {getUserInitials()}
        </button>
      </div>

      {/* Sheet Overlay */}
      {isSheetOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={closeSheet}
        />
      )}

      {/* Right Side Sheet */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isSheetOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sheet Header */}
          <div className="flex items-center justify-between p-6 border-b border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials()}
              </div>
              <div>
                <h3 className="font-semibold text-rose-900">
                  {user?.fullName || user?.displayName || 'Customer'}
                </h3>
                <p className="text-sm text-rose-600">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSheet}
              className="text-rose-700 hover:text-rose-900"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => navigateAndClose('/dashboard')}
                className="w-full justify-start text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                <User className="w-5 h-5 mr-3" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigateAndClose('/dashboard/orders')}
                className="w-full justify-start text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                <Package className="w-5 h-5 mr-3" />
                My Orders
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigateAndClose('/dashboard/wishlist')}
                className="w-full justify-start text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                <Heart className="w-5 h-5 mr-3" />
                Wishlist
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigateAndClose('/dashboard/products')}
                className="w-full justify-start text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Browse Products
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigateAndClose('/dashboard/profile')}
                className="w-full justify-start text-rose-700 hover:text-rose-900 hover:bg-rose-50"
              >
                <Settings className="w-5 h-5 mr-3" />
                Account Settings
              </Button>
            </nav>
          </div>

          {/* Sheet Footer */}
          <div className="p-6 border-t border-rose-200 bg-rose-50">
            <Button
              variant="outline"
              onClick={handleLogoutAndClose}
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}