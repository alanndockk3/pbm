// components/cart/OrderSummary.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, Shield } from "lucide-react";
import type { CartItem } from '../../../../lib/profile/useCartStore';

interface OrderSummaryProps {
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  cartLoading: boolean;
  cartItems: CartItem[];
  onCheckout: () => void;
}

export const OrderSummary = ({ 
  totalItems, 
  subtotal, 
  shipping, 
  tax, 
  total, 
  cartLoading, 
  cartItems, 
  onCheckout 
}: OrderSummaryProps) => {
  const router = useRouter();

  return (
    <div className="lg:col-span-1">
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm sticky top-6">
        <CardHeader>
          <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Lines */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-rose-700 dark:text-rose-300">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-rose-900 dark:text-rose-100">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-rose-700 dark:text-rose-300">Shipping</span>
              <span className="font-medium text-rose-900 dark:text-rose-100">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            
            {shipping === 0 ? (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Truck className="w-4 h-4" />
                <span>Free shipping applied!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-600 text-sm">
                <Truck className="w-4 h-4" />
                <span>Free shipping on orders over $75</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-rose-700 dark:text-rose-300">Tax</span>
              <span className="font-medium text-rose-900 dark:text-rose-100">${tax.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-rose-200 dark:border-rose-700 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-rose-900 dark:text-rose-100">Total</span>
                <span className="text-lg font-bold text-rose-900 dark:text-rose-100">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Button 
            onClick={onCheckout}
            disabled={cartLoading || cartItems.some(item => !item.inStock)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-lg"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-rose-600 dark:text-rose-400 mt-4">
            <Shield className="w-4 h-4" />
            <span>Secure checkout</span>
          </div>

          {/* Continue Shopping */}
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/products')}
            className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};