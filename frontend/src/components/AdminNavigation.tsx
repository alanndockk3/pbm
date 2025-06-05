'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/auth/useAuthStore';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';

export function AdminNavigation() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
      
      <div className="pt-4 mt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={() => logout()}
          className="w-full justify-start text-gray-600 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </nav>
  );
}