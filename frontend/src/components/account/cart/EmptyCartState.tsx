// components/cart/EmptyCartState.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Heart } from "lucide-react";

export const EmptyCartState = () => {
  const router = useRouter();

  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <ShoppingBag className="w-24 h-24 text-rose-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">
          Your cart is empty
        </h2>
        <p className="text-rose-600 dark:text-rose-400 mb-8">
          Looks like you haven't added anything to your cart yet. Start exploring our beautiful handmade collection!
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/dashboard/products')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Browse Products
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/wishlist')}
            className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
          >
            <Heart className="w-4 h-4 mr-2" />
            View Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
};