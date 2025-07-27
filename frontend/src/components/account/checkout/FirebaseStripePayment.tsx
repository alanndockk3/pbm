// components/checkout/FirebaseStripePayment.tsx
'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useCartItems } from '../../../../lib/profile/useCartStore';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc 
} from 'firebase/firestore';
import { db } from '../../../../client/firebaseConfig';
import { CreditCard, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

type PaymentState = 'idle' | 'creating' | 'redirecting' | 'success' | 'error';

export const FirebaseStripePayment = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const cartItems = useCartItems(); // Get current cart items
    const { 
        shippingAddress, 
        shippingOption, 
        totals, 
        items, 
        setStep,
        setPaymentMethod 
    } = useCheckoutStore();
    
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const createCheckoutSession = async () => {
        if (!user?.uid) {
            setErrorMessage('You must be logged in to complete checkout');
            return;
        }

        setPaymentState('creating');
        setErrorMessage('');

        try {
            console.log('Creating Firebase checkout session...');

            // Build line_items with product IDs in metadata for order creation
            const line_items = items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        metadata: {
                            product_id: item.productId, // Store product ID for order creation
                            image_url: item.image || '',
                        }
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            }));

            // Shipping rate logic
            const shippingRate = shippingOption?.price || 0;

            // Enhanced metadata for order creation
            const sessionMetadata = {
                userId: user.uid,
                itemCount: items.length.toString(),
                shippingMethod: shippingOption?.name || 'Standard',
                customerEmail: user.email || '',
                customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                subtotal: totals.subtotal.toFixed(2),
                originalShipping: totals.shipping.toFixed(2),
                originalTax: totals.tax.toFixed(2),
                originalTotal: totals.total.toFixed(2),
                // Store order items as JSON for order creation
                orderItems: JSON.stringify(items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                }))),
                // Store shipping address for order creation
                shippingFirstName: shippingAddress.firstName || '',
                shippingLastName: shippingAddress.lastName || '',
                shippingPhone: shippingAddress.phone || '',
                shippingAddress1: shippingAddress.address1 || '',
                shippingAddress2: shippingAddress.address2 || '',
                shippingCity: shippingAddress.city || '',
                shippingState: shippingAddress.state || '',
                shippingZip: shippingAddress.zipCode || '',
                shippingCountry: shippingAddress.country || 'US',
                // Estimated delivery
                estimatedDeliveryDays: shippingOption?.estimatedDays || '5-7 days'
            };

            // Create checkout session document
            const checkoutSessionRef = await addDoc(
                collection(db, 'users', user.uid, 'checkout_sessions'),
                {
                    mode: 'payment',
                    billing_address_collection: 'required',
                    shipping_address_collection: {
                        allowed_countries: [
                            'US'
                        ]
                    },
                    line_items,

                    ...(shippingRate > 0 && {
                        shipping_options: [
                            {
                                shipping_rate_data: {
                                    type: 'fixed_amount',
                                    fixed_amount: {
                                        amount: Math.round(shippingRate * 100),
                                        currency: 'usd',
                                    },
                                    display_name: shippingOption?.name || 'Standard Shipping',
                                    delivery_estimate: {
                                        minimum: {
                                            unit: 'business_day',
                                            value: parseInt(shippingOption?.estimatedDays?.split('-')[0] || '5'),
                                        },
                                        maximum: {
                                            unit: 'business_day',
                                            value: parseInt(shippingOption?.estimatedDays?.split('-')[1] || '7'),
                                        },
                                    },
                                },
                            },
                        ]
                    }),

                    allow_promotion_codes: true,
                    success_url: `${window.location.origin}/dashboard/checkout/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/dashboard/checkout`,
                    customer_email: user.email,
                    metadata: sessionMetadata,
                }
            );

            console.log('Checkout session created:', checkoutSessionRef.id);
            setPaymentState('redirecting');

            const unsubscribe = onSnapshot(
                doc(db, 'users', user.uid, 'checkout_sessions', checkoutSessionRef.id),
                (snap) => {
                    const data = snap.data();
                    if (data?.url) {
                        console.log('Redirecting to Stripe Checkout:', data.url);
                        setPaymentMethod({ type: 'stripe_checkout' });
                        
                        // Don't clear cart here - wait for successful payment
                        window.location.href = data.url;
                        unsubscribe();
                    }

                    if (data?.error) {
                        console.error('Checkout session error:', data.error);
                        setErrorMessage(data.error.message || 'Failed to create checkout session');
                        setPaymentState('error');
                        unsubscribe();
                    }
                },
                (error) => {
                    console.error('Error listening to checkout session:', error);
                    setErrorMessage('Failed to create checkout session');
                    setPaymentState('error');
                }
            );

            setTimeout(() => {
                if (paymentState === 'redirecting') {
                    setErrorMessage('Checkout session creation timed out. Please try again.');
                    setPaymentState('error');
                    unsubscribe();
                }
            }, 30000);

        } catch (error) {
            console.error('Error creating checkout session:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to create checkout session'
            );
            setPaymentState('error');
        }
    };

    const handleBackToShipping = () => {
        setStep(2);
    };

    const getStateMessage = () => {
        switch (paymentState) {
            case 'creating':
                return 'Creating secure checkout session...';
            case 'redirecting':
                return 'Redirecting to secure payment...';
            case 'success':
                return 'Payment successful!';
            case 'error':
                return errorMessage;
            default:
                return '';
        }
    };

    const getStateIcon = () => {
        switch (paymentState) {
            case 'creating':
            case 'redirecting':
                return <Loader2 className="w-6 h-6 animate-spin text-pink-600" />;
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-600" />;
            default:
                return <Lock className="w-6 h-6 text-gray-600" />;
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Secure Payment
                </CardTitle>
                <p className="text-rose-600 dark:text-rose-400 text-sm">
                    Complete your order with Stripe's secure checkout
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Processing State */}
                {(paymentState === 'creating' || paymentState === 'redirecting') && (
                    <div className="text-center py-8">
                        {getStateIcon()}
                        <p className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2 mt-4">
                            {getStateMessage()}
                        </p>
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            Please don't close this window
                        </p>
                        {paymentState === 'redirecting' && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Stripe will handle shipping and payment processing
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Success State */}
                {paymentState === 'success' && (
                    <div className="text-center py-8">
                        {getStateIcon()}
                        <p className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2 mt-4">
                            {getStateMessage()}
                        </p>
                    </div>
                )}

                {/* Error State */}
                {paymentState === 'error' && (
                    <div className="text-center py-8">
                        {getStateIcon()}
                        <p className="text-lg font-medium text-red-600 mb-2 mt-4">
                            Payment Setup Failed
                        </p>
                        <p className="text-sm text-red-500 mb-4">
                            {errorMessage}
                        </p>
                        <div className="space-x-4">
                            <Button
                                onClick={() => {
                                    setPaymentState('idle');
                                    setErrorMessage('');
                                }}
                                variant="outline"
                                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={handleBackToShipping}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Shipping
                            </Button>
                        </div>
                    </div>
                )}

                {/* Idle State - Ready to Checkout */}
                {paymentState === 'idle' && (
                    <>
                        {/* Payment Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <div>
                                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                                        Secure Stripe Checkout
                                    </h4>
                                    <p className="text-blue-600 dark:text-blue-300 text-sm">
                                        Tax calculation, shipping, and payment processing handled automatically by Stripe.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="w-4 h-4" />
                                <span>Secure payment processing</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="w-4 h-4" />
                                <span>Multiple payment methods</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="w-4 h-4" />
                                <span>Address validation</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="w-4 h-4" />
                                <span>Mobile optimized</span>
                            </div>
                        </div>

                        {/* Order Summary - Compact */}
                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
                            <h4 className="font-medium text-rose-900 dark:text-rose-100 mb-3">Order Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-rose-600 dark:text-rose-400">
                                        Items ({items.length}):
                                    </span>
                                    <span className="text-rose-900 dark:text-rose-100">
                                        ${totals.subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-rose-600 dark:text-rose-400">Est. Shipping:</span>
                                    <span className="text-rose-900 dark:text-rose-100">
                                        ${totals.shipping.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-rose-600 dark:text-rose-400">Est. Tax:</span>
                                    <span className="text-rose-900 dark:text-rose-100">
                                        ${totals.tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-rose-200 dark:border-rose-700 pt-2">
                                    <div className="flex justify-between font-bold text-base">
                                        <span className="text-rose-900 dark:text-rose-100">Est. Total:</span>
                                        <span className="text-rose-900 dark:text-rose-100">
                                            ${totals.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-rose-500 dark:text-rose-500 mt-2">
                                * Final total will be calculated by Stripe based on your address
                            </p>
                        </div>

                        {/* Order Items Preview */}
                        <div className="bg-gray-50 dark:bg-gray-800/20 rounded-lg p-4">
                            <h4 className="font-medium text-rose-900 dark:text-rose-100 mb-3">
                                Items Being Ordered ({items.length})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-rose-700 dark:text-rose-300">
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span className="text-rose-900 dark:text-rose-100">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleBackToShipping}
                                className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Shipping
                            </Button>
                            <Button
                                onClick={createCheckoutSession}
                                disabled={paymentState !== 'idle'}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                            >
                                <Lock className="w-5 h-5 mr-2" />
                                Complete Order - ${totals.total.toFixed(2)}
                            </Button>
                        </div>

                        {/* Security Notice */}
                        <div className="text-center text-xs text-rose-500 dark:text-rose-400">
                            <Lock className="w-3 h-3 inline mr-1" />
                            Powered by Stripe - PCI DSS compliant and bank-level security
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};