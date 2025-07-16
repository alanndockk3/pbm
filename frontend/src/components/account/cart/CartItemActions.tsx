// components/cart/CartItemActions.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";

interface CartItemActionsProps {
  productId: string;
  disabled: boolean;
  onMoveToWishlist: () => void;
  onRemove: () => void;
}

export const CartItemActions = ({ 
  productId, 
  disabled, 
  onMoveToWishlist, 
  onRemove 
}: CartItemActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMoveToWishlist}
        disabled={disabled}
        className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-800"
        title="Move to Wishlist"
      >
        <Heart className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800"
        title="Remove from Cart"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
