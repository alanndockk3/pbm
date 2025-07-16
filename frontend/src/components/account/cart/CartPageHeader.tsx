// components/cart/CartPageHeader.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CartPageHeaderProps {
  totalItems: number;
  hasItems: boolean;
  onClearCart: () => void;
}

export const CartPageHeader = ({ totalItems, hasItems, onClearCart }: CartPageHeaderProps) => {
  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Shopping Cart</h1>
            <p className="text-rose-600 dark:text-rose-400">
              {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasItems && (
            <Button 
              variant="outline"
              onClick={onClearCart}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};