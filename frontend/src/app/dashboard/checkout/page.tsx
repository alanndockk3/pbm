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
import { PaymentSimulation } from '@/components/account/checkout/PaymentSimulation';
import { ReviewPlaceholder } from '@/components/account/checkout/ReviewPlaceholder';
import { OrderSummary } from '@/components/account/cart/OrderSummary';

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

    // Convert cart items to checkout format
    const checkoutItems = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
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
        return <PaymentSimulation />; // Updated to use PaymentSimulation
      case 4:
        return <ReviewPlaceholder />;
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
      <Header navigateBack={true} />
      
      <CheckoutLayout currentStep={step}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            {renderStepContent()}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <OrderSummary
              totalItems={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              subtotal={totals.subtotal}
              shipping={totals.shipping}
              tax={totals.tax}
              total={totals.total}
              cartLoading={false}
              cartItems={cartItems}
              onCheckout={() => console.log('Checkout from summary')}
            />
            
            {/* Back to Cart Link */}
            <button
              onClick={handleBackToCart}
              className="w-full text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 text-sm underline transition-colors duration-200"
            >
              ← Return to Cart
            </button>
          </div>
        </div>

        {/* Development Debug Panel (remove in production) */}
        <DebugPanel />
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

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
      <details className="cursor-pointer">
        <summary className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          🔧 Debug Info (Development Only)
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
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
            <p>Email: {shippingAddress.email || 'Not filled'}</p>
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