// app/dashboard/checkout/page.tsx
'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useCartItems, useCartTotalPrice } from '../../../../lib/profile/useCartStore';
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import Header from '@/components/Header';
import { CheckoutLayout } from '@/components/account/checkout/CheckoutLayout';
import { ShippingForm } from '@/components/account/checkout/ShippingForm';
import { ShippingOptions } from '@/components/account/checkout/ShippingOptions';
import { FirebaseStripePayment } from '@/components/account/checkout/FirebaseStripePayment';
import { OrderItem } from '../../../../types/order';
import { OrderReview } from '@/components/account/checkout/OrderReview';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft } from 'lucide-react';

// Compact Order Summary Component
const CompactOrderSummary = () => {
  const { totals, items } = useCheckoutStore();
  const cartItems = useCartItems();
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-rose-900 dark:text-rose-100 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Items Count */}
        <div className="text-sm text-rose-600 dark:text-rose-400">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item{cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''} in cart
        </div>
        
        {/* Pricing Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-rose-600 dark:text-rose-400">Subtotal:</span>
            <span className="text-rose-900 dark:text-rose-100">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rose-600 dark:text-rose-400">Shipping:</span>
            <span className="text-rose-900 dark:text-rose-100">${totals.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rose-600 dark:text-rose-400">Tax:</span>
            <span className="text-rose-900 dark:text-rose-100">${totals.tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-rose-200 dark:border-rose-700 pt-2">
            <div className="flex justify-between font-bold text-base">
              <span className="text-rose-900 dark:text-rose-100">Total:</span>
              <span className="text-rose-900 dark:text-rose-100">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Items Preview - Compact */}
        <div className="border-t border-rose-200 dark:border-rose-700 pt-3">
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cartItems.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded flex items-center justify-center">
                  <Package className="w-3 h-3 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-rose-900 dark:text-rose-100 truncate text-xs">{item.name}</p>
                  <p className="text-rose-600 dark:text-rose-400 text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="text-rose-900 dark:text-rose-100 text-xs font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {cartItems.length > 3 && (
              <p className="text-xs text-rose-500 dark:text-rose-500 text-center">
                +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItems = useCartItems();
  const cartTotalPrice = useCartTotalPrice();
  const { 
    step, 
    setItems, 
    updateTotals, 
    totals
  } = useCheckoutStore();

  // Initialize checkout with cart data
  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      router.push('/dashboard/cart');
      return;
    }

    // Convert cart items to checkout format (OrderItem type)
    const checkoutItems: OrderItem[] = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      category: item.category || 'Handmade' // Add default category if missing
    }));

    // Initialize checkout state
    setItems(checkoutItems);
    updateTotals({ subtotal: cartTotalPrice });

  }, [cartItems, cartTotalPrice, setItems, updateTotals, router]);
  
  // Render the appropriate step component
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ShippingForm />;
      case 2:
        return <ShippingOptions />;
      case 3:
        return <FirebaseStripePayment />; // Use your Firebase Stripe component
      case 4:
        return <OrderReview />;
      default:
        return <ShippingForm />;
    }
  };

  const handleBackToCart = () => {
    router.push('/dashboard/cart');
  };

  // Don't render if cart is empty (will redirect)
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* <Header navigateBack={true} /> */}
      
      <CheckoutLayout currentStep={step}>
        {/* More compact layout - better proportions */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Checkout Form - Takes up more space */}
          <div className="lg:col-span-3">
            {renderStepContent()}
          </div>
          
          {/* Compact Order Summary Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <CompactOrderSummary />
            
            {/* Back to Cart Link */}
            <button
              onClick={handleBackToCart}
              className="w-full text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 text-sm underline transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Return to Cart
            </button>

            {/* Help text for payment step */}
            {step === 3 && (
              <div className="text-center text-xs text-rose-500 dark:text-rose-500 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                🔒 Secure payment powered by Stripe. Complete checkout will redirect to Stripe's secure payment page.
              </div>
            )}
          </div>
        </div>

        {/* Development Debug Panel (remove in production) */}
        {process.env.NODE_ENV !== 'production' && <DebugPanel />}
      </CheckoutLayout>
    </div>
  );
}

// Debug component to monitor checkout state (remove in production)
const DebugPanel = () => {
  const { 
    step, 
    shippingAddress, 
    shippingOption, 
    totals, 
    items 
  } = useCheckoutStore();

  return (
    <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
      <details className="cursor-pointer">
        <summary className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
          🔧 Debug Info (Development Only)
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium mb-1">Checkout State:</h4>
            <p>Current Step: {step}</p>
            <p>Items Count: {items.length}</p>
            <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
            <p>Shipping: ${totals.shipping.toFixed(2)}</p>
            <p>Tax: ${totals.tax.toFixed(2)}</p>
            <p>Total: ${totals.total.toFixed(2)}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Form Data:</h4>
            <p>Name: {shippingAddress.firstName} {shippingAddress.lastName}</p>
            <p>Email: {shippingAddress.email || 'From user'}</p>
            <p>City: {shippingAddress.city || 'Not filled'}</p>
            <p>State: {shippingAddress.state || 'Not filled'}</p>
            <p>Shipping: {shippingOption?.name || 'Not selected'}</p>
            <p>Shipping Cost: ${shippingOption?.price?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </details>
    </div>
  );
};