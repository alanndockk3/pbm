// components/AdminNavigation.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/auth/useAuthStore';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  X,
  ChevronRight,
  ChevronLeft,
  Home
} from 'lucide-react';

export function AdminNavigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [isSheetOpen, setIsSheetOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pbm-admin-nav-open');
      return stored === 'true';
    }
    return false;
  });

  const navigationSections = [
    {
      title: "Overview",
      items: [
        { path: '/admin', label: 'Dashboard', icon: BarChart3 },
      ]
    },
    {
      title: "Management",
      items: [
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/users', label: 'Users', icon: Users },
      ]
    },
    {
      title: "System",
      items: [
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user) return 'A';
    const fullName = user.fullName || user.displayName || '';
    const emailName = user.email?.split('@')[0] || '';
    const nameToUse = fullName || emailName;
    if (!nameToUse) return 'A';
    const parts = nameToUse.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : nameToUse.slice(0, 2).toUpperCase();
  };

  const toggleSheet = () => {
    const newState = !isSheetOpen;
    setIsSheetOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pbm-admin-nav-open', newState.toString());
      window.dispatchEvent(new CustomEvent('admin-sidebar-toggle', { detail: { isOpen: newState } }));
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pbm-admin-nav-open', 'false');
      window.dispatchEvent(new CustomEvent('admin-sidebar-toggle', { detail: { isOpen: false } }));
    }
  };

  const navigateAndClose = (path: string) => {
    router.push(path);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) closeSheet();
  };

  const handleLogoutAndClose = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pbm-admin-nav-open');
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
      {/* Full screen overlay for mobile */}
      {isSheetOpen && (
        <div 
          className="fixed inset-0 bg-black/40 lg:hidden z-[40]"
          onClick={closeSheet}
        />
      )}

      {/* Sidebar panel */}
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
          {/* Admin Profile Card */}
          <div className="mx-3 mt-3 mb-6 p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 rounded-2xl border border-purple-200/60 dark:border-purple-700/40 shadow-sm flex-shrink-0 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/50">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                  {user?.fullName || user?.displayName || 'Administrator'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">{user?.email}</p>
              </div>
              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSheet}
                className="lg:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 p-2 h-auto rounded-full transition-all duration-200 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Admin Status */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-200/60 dark:border-purple-700/40">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Role
                </p>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  Administrator
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Status
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 mb-6 border-t border-gray-200/60 dark:border-gray-700/40"></div>

          {/* Navigation */}
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
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 transition-all duration-200 ${
                              isActive 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                            }`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            
                            {isActive && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                                <ChevronRight className="w-4 h-4 text-purple-500" />
                              </div>
                            )}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full shadow-sm"></div>
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

          {/* Logout section */}
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

      {/* Toggle Button */}
      <button
        onClick={toggleSheet}
        className={`fixed z-[50] w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
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
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </>
  );
}