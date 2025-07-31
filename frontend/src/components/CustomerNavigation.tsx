'use client'
import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/auth/useAuthStore';
import { useCartTotalItems } from '../../lib/profile/useCartStore';
import { useWishlistItems } from '../../lib/profile/useWishListStore';
import { useProducts } from '../../lib/product/useProductStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  User, 
  Heart, 
  Package,
  LogOut,
  X,
  Settings,
  Home,
  Menu,
  ChevronRight,
  ChevronLeft,
  ShoppingCart
} from 'lucide-react';

export function CustomerNavigation() {
  const { user, logout } = useAuthStore();
  const cartTotalItems = useCartTotalItems();
  const router = useRouter();
  const pathname = usePathname();
  
  // Wishlist count calculation - same as dashboard
  const wishlistProductIds = useWishlistItems();
  const allProducts = useProducts();
  
  // Get actual product objects from wishlist IDs and count them
  const wishlistCount = useMemo(() => {
    return wishlistProductIds
      .map(productId => allProducts.find(product => product.id === productId))
      .filter(Boolean).length;
  }, [wishlistProductIds, allProducts]);
  
  const [isSheetOpen, setIsSheetOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pbm-nav-open');
      return stored === 'true';
    }
    return false;
  });

  const navigationSections = [
    {
      title: "Overview",
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
      ]
    },
    {
      title: "Shopping",
      items: [
        { path: '/dashboard/products', label: 'Browse Products', icon: ShoppingBag },
        { path: '/dashboard/cart', label: 'Shopping Cart', icon: ShoppingCart, count: cartTotalItems },
        { path: '/dashboard/wishlist', label: 'Wishlist', icon: Heart, count: wishlistCount },
      ]
    },
    {
      title: "Orders",
      items: [
        { path: '/dashboard/orders', label: 'My Orders', icon: Package },
      ]
    },
    {
      title: "Account",
      items: [
        { path: '/dashboard/profile', label: 'Account Settings', icon: Settings },
      ]
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const fullName = user.fullName || user.displayName || '';
    const emailName = user.email?.split('@')[0] || '';
    const nameToUse = fullName || emailName;
    if (!nameToUse) return 'U';
    const parts = nameToUse.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : nameToUse.slice(0, 2).toUpperCase();
  };

  const handleCartClick = () => router.push('/dashboard/cart');

  const toggleSheet = () => {
    const newState = !isSheetOpen;
    setIsSheetOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pbm-nav-open', newState.toString());
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isOpen: newState } }));
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pbm-nav-open', 'false');
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isOpen: false } }));
    }
  };

  const navigateAndClose = (path: string) => {
    router.push(path);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) closeSheet();
  };

  const handleLogoutAndClose = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pbm-nav-open');
    }
    router.replace('/');
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSheet();
    };

    if (isSheetOpen) {
      document.addEventListener('keydown', handleEscape);
      if (window.innerWidth < 1024) document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSheetOpen]);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="default"
          className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 relative px-4 py-2 mr-3"
          onClick={handleCartClick}
        >
          Cart
          <ShoppingBag className="w-5 h-5 ml-2" />
          {cartTotalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-pink-500 hover:bg-pink-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
              {cartTotalItems > 99 ? '99+' : cartTotalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Full screen overlay for mobile */}
      {isSheetOpen && (
        <div 
          className="fixed inset-0 bg-black/40 lg:hidden z-[40]"
          onClick={closeSheet}
        />
      )}

      {/* Sidebar panel - now behind header and full height */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm z-[45] transform transition-transform duration-300 ease-in-out ${
          isSheetOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 sm:w-96 lg:w-72`}
        style={{
          borderRight: isSheetOpen ? '1px solid rgb(251 113 133 / 0.3)' : 'none',
          boxShadow: isSheetOpen ? '2px 0 8px -2px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <div className="flex flex-col h-full bg-white/98 dark:bg-gray-900/98">
          {/* Enhanced Profile Card - moved to very top, no spacer */}
          <div className="mx-3 mt-3 mb-6 p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-rose-900/30 rounded-2xl border border-pink-200/60 dark:border-pink-700/40 shadow-sm flex-shrink-0 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 via-purple-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                  {user?.fullName || user?.displayName || 'Customer'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">{user?.email}</p>
              </div>
              {/* Close button for mobile - positioned in profile card */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSheet}
                className="lg:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 p-2 h-auto rounded-full transition-all duration-200 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Member Info Row */}
            <div className="flex items-center justify-between pt-3 border-t border-pink-200/60 dark:border-pink-700/40">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Member since
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {user?.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    }) : 
                    'Recently'
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Status
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 mb-6 border-t border-gray-200/60 dark:border-gray-700/40"></div>

          {/* Categorized Navigation - takes up available space */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 px-3">
              <div className="space-y-4">
                {navigationSections.map((section) => (
                  <div key={section.title}>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                      {section.title}
                    </h4>
                    <nav className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = isActivePath(item.path);
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.path}
                            onClick={() => navigateAndClose(item.path)}
                            className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                              isActive
                                ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 text-pink-700 dark:text-pink-300 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 transition-all duration-200 ${
                              isActive 
                                ? 'text-pink-600 dark:text-pink-400' 
                                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                            }`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            
                            {/* Show count badge for items that have one */}
                            {item.count !== undefined && item.count > 0 && (
                              <Badge className={`text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full ${
                                item.path === '/dashboard/cart' 
                                  ? 'bg-pink-500 hover:bg-pink-600' 
                                  : 'bg-purple-500 hover:bg-purple-600'
                              }`}>
                                {item.count > 99 ? '99+' : item.count}
                              </Badge>
                            )}
                            
                            {isActive && !item.count && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                                <ChevronRight className="w-4 h-4 text-pink-500" />
                              </div>
                            )}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-r-full shadow-sm"></div>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Logout section */}
          <div className="p-3 border-t border-gray-200/60 dark:border-gray-700/40 flex-shrink-0 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
            <button
              onClick={handleLogoutAndClose}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-6 transition-transform duration-200" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button - positioned relative to sidebar */}
      <button
        onClick={toggleSheet}
        className={`fixed z-[50] w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
          isSheetOpen 
            ? 'left-[320px] sm:left-[384px] lg:left-[296px]' 
            : 'left-2'
        }`}
        title={isSheetOpen ? "Close Menu" : "Open Menu"}
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
        }}
      >
        {isSheetOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </>
  );
}