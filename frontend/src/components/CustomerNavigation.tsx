'use client'

import Link from 'next/link';
import { useAuthStore } from '../../lib/auth/useAuthStore';
import { Button } from '@/components/ui/button';
import { User, Heart, ShoppingBag, LogOut } from 'lucide-react';

export function CustomerNavigation() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        Welcome, {user?.fullName || user?.displayName || 'Customer'}
      </span>
      
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </Button>
        </Link>
        
        <Link href="/dashboard/favorites">
          <Button variant="ghost" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}