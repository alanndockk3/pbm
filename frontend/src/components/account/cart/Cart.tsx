'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  Package
} from "lucide-react";
import type { CartItem } from '../../../../lib/profile/useCartStore';

interface CartProps {
  items: CartItem[];
  isCompact?: boolean;
  showActions?: boolean;
  onViewItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveFromCart?: (itemId: string) => void;
  onViewAll?: () => void;
  onCheckout?: () => void;
}

const Cart: React.FC<CartProps> = ({
  items = [],
  isCompact = false,
  showActions = true,
  onViewItem,
  onUpdateQuantity,
  onRemoveFromCart,
  onViewAll,
  onCheckout
}) => {
  // Calculate total price
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const displayItems = isCompact ? items.slice(0, 3) : items;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                Shopping Cart
                {totalItems > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {totalItems}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-rose-700 dark:text-rose-300">
                {items.length === 0 ? 'Your cart is empty' : `${items.length} item${items.length !== 1 ? 's' : ''} in cart`}
              </CardDescription>
            </div>
          </div>
          {onViewAll && items.length > 0 && isCompact && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700"
              onClick={onViewAll}
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-purple-400 dark:text-purple-300" />
            </div>
            <p className="text-rose-600 dark:text-rose-400 mb-4">
              Start adding some beautiful handmade items to your cart!
            </p>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              onClick={() => window.location.href = '/dashboard/products'}
            >
              <Package className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {displayItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-800/20 hover:bg-rose-100/50 dark:hover:bg-rose-800/30 transition-colors"
                >
                  {/* Product Image Placeholder */}
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-700 dark:to-purple-700 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
                    onClick={() => onViewItem?.(item.productId)}
                  >
                    <Package className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-medium text-rose-900 dark:text-rose-100 text-sm truncate cursor-pointer hover:text-purple-600"
                      onClick={() => onViewItem?.(item.productId)}
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  {showActions && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-rose-900/40 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-rose-100 dark:hover:bg-rose-800"
                          onClick={() => onUpdateQuantity?.(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium text-rose-900 dark:text-rose-100 min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-rose-100 dark:hover:bg-rose-800"
                          onClick={() => onUpdateQuantity?.(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => onRemoveFromCart?.(item.productId)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Price for this item */}
                  <div className="text-right">
                    <p className="font-medium text-rose-900 dark:text-rose-100 text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Actions */}
            {items.length > 0 && (
              <>
                {/* Total */}
                <div className="border-t border-rose-200 dark:border-rose-700 pt-3 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-rose-900 dark:text-rose-100">Total:</span>
                    <span className="text-lg font-bold text-rose-900 dark:text-rose-100">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {showActions && (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      onClick={onCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                    {onViewAll && isCompact && (
                      <Button 
                        variant="outline" 
                        className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                        onClick={onViewAll}
                      >
                        View Full Cart
                      </Button>
                    )}
                  </div>
                )}

                {/* Compact mode: Show remaining items count */}
                {isCompact && items.length > 3 && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 text-center mt-2">
                    And {items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}...
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Cart;