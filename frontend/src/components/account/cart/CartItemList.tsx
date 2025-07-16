// components/cart/CartItemList.tsx
import React from 'react';
import { CartItem } from './CartItem';
import type { CartItem as CartItemType } from '../../../../lib/profile/useCartStore';

interface CartItemListProps {
  items: CartItemType[];
  processingItems: Set<string>;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onMoveToWishlist: (item: CartItemType) => void;
  onRemove: (productId: string) => void;
}

export const CartItemList = ({ 
  items, 
  processingItems, 
  onQuantityChange, 
  onMoveToWishlist, 
  onRemove 
}: CartItemListProps) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          isProcessing={processingItems.has(item.productId)}
          onQuantityChange={onQuantityChange}
          onMoveToWishlist={onMoveToWishlist}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
