// components/cart/CartItem.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle } from "lucide-react";
import { QuantityControls } from './QuantityControls';
import { CartItemActions } from './CartItemActions';
import type { CartItem as CartItemType } from '../../../../lib/profile/useCartStore';

interface CartItemProps {
  item: CartItemType;
  isProcessing: boolean;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onMoveToWishlist: (item: CartItemType) => void;
  onRemove: (productId: string) => void;
}

export const CartItem = ({ 
  item, 
  isProcessing, 
  onQuantityChange, 
  onMoveToWishlist, 
  onRemove 
}: CartItemProps) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-pink-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-rose-900 dark:text-rose-100 text-lg">
                  {item.name}
                </h3>
                {item.category && (
                  <Badge variant="secondary" className="mt-1 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                    {item.category}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-rose-900 dark:text-rose-100">
                  ${item.price.toFixed(2)}
                </p>
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  ${(item.price * item.quantity).toFixed(2)} total
                </p>
              </div>
            </div>

            {item.description && (
              <p className="text-rose-700 dark:text-rose-300 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Quantity and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QuantityControls
                  quantity={item.quantity}
                  productId={item.productId}
                  inStock={item.inStock ?? true}
                  disabled={isProcessing}
                  onQuantityChange={onQuantityChange}
                />

                {!item.inStock && (
                  <Badge variant="destructive" className="bg-red-500 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Out of Stock
                  </Badge>
                )}
              </div>

              <CartItemActions
                productId={item.productId}
                disabled={isProcessing}
                onMoveToWishlist={() => onMoveToWishlist(item)}
                onRemove={() => onRemove(item.productId)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};