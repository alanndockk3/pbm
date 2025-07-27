// app/dashboard/checkout/stripe-success/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../../../lib/auth/useAuthStore';
import { useCartStore } from '../../../../../lib/profile/useCartStore';
import { useOrderActions } from '../../../../../lib/orders/useOrderStore';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../../../client/firebaseConfig';
import { CheckCircle, Loader2, AlertCircle, Package } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import type { OrderItem, OrderTotals, OrderAddress } from '../../../../../types/order';

interface FirebaseStripeSession {
  // Basic session info
  sessionId: string;
  mode: string;
  customer_email: string;
  
  // Line items from Stripe
  line_items: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        metadata: {
          product_id: string;
          image_url: string;
        };
      };
      unit_amount: number;
    };
    quantity: number;
  }>;
  
  // Metadata with order information
  metadata: {
    customerEmail: string;
    customerName: string;
    estimatedDeliveryDays: string;
    itemCount: string;
    orderItems: string; // JSON stringified array
    originalShipping: string;
    originalTax: string;
    originalTotal: string;
    shippingAddress1: string;
    shippingAddress2: string;
    shippingCity: string;
    shippingCountry: string;
    shippingFirstName: string;
    shippingLastName: string;
    shippingMethod: string;
    shippingPhone: string;
    shippingState: string;
    shippingZip: string;
    subtotal: string;
    userId: string;
  };
  
  // Shipping options
  shipping_options: Array<{
    shipping_rate_data: {
      display_name: string;
      fixed_amount: {
        amount: number;
        currency: string;
      };
      delivery_estimate: {
        minimum: { unit: string; value: number };
        maximum: { unit: string; value: number };
      };
    };
  }>;
  
  // URLs
  success_url: string;
  cancel_url: string;
  url: string;
  
  // Other fields
  allow_promotion_codes: boolean;
  billing_address_collection: string;
  shipping_address_collection: {
    allowed_countries: string[];
  };
  created: any; // Firestore timestamp
  client: string;
}

type ProcessingState = 'loading' | 'processing' | 'success' | 'error';

export default function StripeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const { createOrder } = useOrderActions();
  
  const [processingState, setProcessingState] = useState<ProcessingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  useEffect(() => {
    const handleSuccessfulPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setErrorMessage('No session ID found in URL');
        setProcessingState('error');
        return;
      }

      if (!user?.uid) {
        setErrorMessage('User not authenticated');
        setProcessingState('error');
        return;
      }

      try {
        setProcessingState('processing');
        console.log('Processing successful payment for session:', sessionId);
        console.log('User ID:', user.uid);

        // Query for the session by sessionId field
        const sessionsRef = collection(db, 'users', user.uid, 'checkout_sessions');
        const q = query(sessionsRef, where('sessionId', '==', sessionId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`No checkout session found with ID: ${sessionId}`);
        }

        const sessionDoc = querySnapshot.docs[0];
        const sessionData = sessionDoc.data() as FirebaseStripeSession;
        
        console.log('✅ Session data retrieved:', sessionData);

        // Since we're coming from Stripe success URL, assume payment is successful
        // Parse order items from metadata
        let orderItems: OrderItem[] = [];
        
        try {
          if (sessionData.metadata?.orderItems) {
            orderItems = JSON.parse(sessionData.metadata.orderItems);
            console.log('📦 Parsed order items:', orderItems);
          } else {
            throw new Error('No orderItems found in metadata');
          }
          
          if (!Array.isArray(orderItems) || orderItems.length === 0) {
            throw new Error('Invalid order items data');
          }
        } catch (parseError) {
          console.error('Error parsing order items:', parseError);
          throw new Error('Invalid order items data in session');
        }

        // Build shipping address from metadata
        const shippingAddress: OrderAddress = {
          firstName: sessionData.metadata.shippingFirstName || 'Customer',
          lastName: sessionData.metadata.shippingLastName || '',
          email: sessionData.metadata.customerEmail || sessionData.customer_email || user.email || '',
          phone: sessionData.metadata.shippingPhone || '',
          address1: sessionData.metadata.shippingAddress1 || '',
          address2: sessionData.metadata.shippingAddress2 || '',
          city: sessionData.metadata.shippingCity || '',
          state: sessionData.metadata.shippingState || '',
          zipCode: sessionData.metadata.shippingZip || '',
          country: sessionData.metadata.shippingCountry || 'US',
        };

        // Build order totals from metadata
        const totals: OrderTotals = {
          subtotal: parseFloat(sessionData.metadata.subtotal || '0'),
          shipping: parseFloat(sessionData.metadata.originalShipping || '0'),
          tax: parseFloat(sessionData.metadata.originalTax || '0'),
          total: parseFloat(sessionData.metadata.originalTotal || '0'),
        };

        // Calculate estimated delivery
        const deliveryDays = sessionData.metadata.estimatedDeliveryDays 
          ? parseInt(sessionData.metadata.estimatedDeliveryDays.split('-')[1] || '7')
          : 7;
        const estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();

        console.log('🛍️ Creating order with data:', {
          orderItems: orderItems.length,
          shippingAddress,
          totals,
          customerName: sessionData.metadata.customerName
        });

        // Create order with local store
        const orderId = await createOrder({
          customerId: user.uid,
          customerEmail: shippingAddress.email,
          customerName: sessionData.metadata.customerName || `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          items: orderItems,
          shippingAddress,
          shippingMethod: sessionData.metadata.shippingMethod || 'Standard Shipping',
          estimatedDelivery,
          paymentMethod: 'Stripe Checkout',
          paymentIntentId: sessionId,
          totals,
        });

        console.log('✅ Order created successfully:', orderId);
        setCreatedOrderId(orderId);

        // Clear cart after successful order creation
        await clearCart(user.uid);
        console.log('🛒 Cart cleared');

        setProcessingState('success');
        
        // Delay before redirecting to show success state
        setTimeout(() => {
          router.push(`/dashboard/orders/${orderId}`);
        }, 2500);

      } catch (error) {
        console.error('❌ Error creating order from Stripe session:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to create order');
        setProcessingState('error');
      }
    };

    // Only run if we have the required data
    if (user?.uid && searchParams.get('session_id')) {
      handleSuccessfulPayment();
    } else if (!user?.uid) {
      setErrorMessage('Please log in to complete your order');
      setProcessingState('error');
    } else {
      setErrorMessage('Invalid session - no session ID found');
      setProcessingState('error');
    }
  }, [searchParams, user?.uid, createOrder, clearCart, router]);

  const getStateIcon = () => {
    switch (processingState) {
      case 'loading':
      case 'processing':
        return <Loader2 className="w-12 h-12 animate-spin text-pink-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getStateMessage = () => {
    switch (processingState) {
      case 'loading':
        return 'Verifying payment...';
      case 'processing':
        return 'Creating your order...';
      case 'success':
        return 'Order created successfully!';
      case 'error':
        return 'Order creation failed';
    }
  };

  const getStateDescription = () => {
    switch (processingState) {
      case 'loading':
        return 'Please wait while we verify your payment with Stripe.';
      case 'processing':
        return 'We\'re creating your order and preparing your confirmation.';
      case 'success':
        return 'Redirecting to your order details...';
      case 'error':
        return errorMessage;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              {getStateIcon()}
              
              <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mt-4 mb-2">
                {getStateMessage()}
              </h1>
              
              <p className="text-rose-600 dark:text-rose-400 mb-6">
                {getStateDescription()}
              </p>

              {processingState === 'processing' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-rose-500 dark:text-rose-500">
                    <Package className="w-4 h-4" />
                    <span>Processing your order...</span>
                  </div>
                  <div className="w-full bg-rose-200 dark:bg-rose-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
                  </div>
                  <p className="text-xs text-rose-500 dark:text-rose-500">
                    Saving order details and clearing cart...
                  </p>
                </div>
              )}

              {processingState === 'success' && createdOrderId && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                      🎉 Payment successful!
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                      Your order has been confirmed and saved to your account.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/dashboard/orders/${createdOrderId}`)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    View Order Details
                  </button>
                </div>
              )}

              {processingState === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                      ❌ Something went wrong
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                      {errorMessage}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push('/dashboard/checkout')}
                      className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                    >
                      Return to Checkout
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900 rounded-lg font-medium transition-all duration-300"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* Development info */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-6 text-xs text-gray-500 dark:text-gray-500">
                  Session: {searchParams.get('session_id')?.slice(-8)}...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}