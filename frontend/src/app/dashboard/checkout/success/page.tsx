// app/dashboard/checkout/success/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from '@/components/Header';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar, 
  Mail, 
  Download,
  ArrowRight,
  MapPin,
  CreditCard,
  Clock
} from 'lucide-react';

interface OrderDetails {
  orderId: string;
  confirmationNumber: string;
  total: string;
  subtotal: string;
  shipping: string;
  tax: string;
  itemCount: string;
  customerEmail: string;
  customerName: string;
  shippingMethod: string;
  estimatedDelivery: string;
  paymentMethod: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

const PaymentMethodIcon = ({ method }: { method: string }) => {
  switch (method) {
    case 'apple_pay':
      return <div className="w-5 h-5 bg-black rounded text-white flex items-center justify-center text-xs font-bold"></div>;
    case 'google_pay':
      return <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded text-white flex items-center justify-center text-xs font-bold">G</div>;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
};

const formatPaymentMethod = (method: string) => {
  switch (method) {
    case 'apple_pay': return 'Apple Pay';
    case 'google_pay': return 'Google Pay';
    case 'card': return 'Credit Card';
    default: return 'Credit Card';
  }
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Extract all order details from search parameters
    const details: OrderDetails = {
      orderId: searchParams.get('orderId') || '',
      confirmationNumber: searchParams.get('confirmationNumber') || '',
      total: searchParams.get('total') || '0.00',
      subtotal: searchParams.get('subtotal') || '0.00',
      shipping: searchParams.get('shipping') || '0.00',
      tax: searchParams.get('tax') || '0.00',
      itemCount: searchParams.get('itemCount') || '0',
      customerEmail: searchParams.get('customerEmail') || '',
      customerName: searchParams.get('customerName') || '',
      shippingMethod: searchParams.get('shippingMethod') || '',
      estimatedDelivery: searchParams.get('estimatedDelivery') || '',
      paymentMethod: searchParams.get('paymentMethod') || 'card',
      shippingCity: searchParams.get('shippingCity') || '',
      shippingState: searchParams.get('shippingState') || '',
      shippingZip: searchParams.get('shippingZip') || '',
    };

    setOrderDetails(details);
  }, [searchParams]);

  const formatDate = (isoString: string) => {
    if (!isoString) return 'TBD';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEstimatedDays = () => {
    if (!orderDetails?.estimatedDelivery) return 'TBD';
    const deliveryDate = new Date(orderDetails.estimatedDelivery);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Today';
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <Header navigateBack={true} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-rose-600 dark:text-rose-400">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* <Header navigateBack={true} /> */}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-rose-600 dark:text-rose-400 mb-1">
            Thank you for your purchase, {orderDetails.customerName}
          </p>
          <p className="text-sm text-rose-500 dark:text-rose-500">
            A confirmation email has been sent to {orderDetails.customerEmail}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Details */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-rose-600 dark:text-rose-400">Order Number</p>
                    <p className="font-bold text-rose-900 dark:text-rose-100">{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-rose-600 dark:text-rose-400">Confirmation Code</p>
                    <p className="font-bold text-rose-900 dark:text-rose-100">{orderDetails.confirmationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-rose-600 dark:text-rose-400">Items Ordered</p>
                    <p className="font-bold text-rose-900 dark:text-rose-100">{orderDetails.itemCount} item{parseInt(orderDetails.itemCount) !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-rose-600 dark:text-rose-400">Order Total</p>
                    <p className="font-bold text-rose-900 dark:text-rose-100">${orderDetails.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <p className="text-sm text-rose-600 dark:text-rose-400">Shipping Address</p>
                    </div>
                    <p className="font-medium text-rose-900 dark:text-rose-100">{orderDetails.customerName}</p>
                    <p className="text-rose-700 dark:text-rose-300">
                      {orderDetails.shippingCity}, {orderDetails.shippingState} {orderDetails.shippingZip}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-rose-600" />
                      <p className="text-sm text-rose-600 dark:text-rose-400">Estimated Delivery</p>
                    </div>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {formatDate(orderDetails.estimatedDelivery)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {getEstimatedDays()} via {orderDetails.shippingMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <PaymentMethodIcon method={orderDetails.paymentMethod} />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {formatPaymentMethod(orderDetails.paymentMethod)}
                    </p>
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                      Payment processed successfully
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Paid
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Order Total Breakdown */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-rose-600 dark:text-rose-400">Subtotal:</span>
                  <span className="text-rose-900 dark:text-rose-100">${orderDetails.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rose-600 dark:text-rose-400">Shipping:</span>
                  <span className="text-rose-900 dark:text-rose-100">${orderDetails.shipping}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rose-600 dark:text-rose-400">Tax:</span>
                  <span className="text-rose-900 dark:text-rose-100">${orderDetails.tax}</span>
                </div>
                <div className="border-t border-rose-200 dark:border-rose-700 pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-rose-900 dark:text-rose-100">Total:</span>
                    <span className="text-rose-900 dark:text-rose-100">${orderDetails.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Order Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tracking Information */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">
                We'll keep you updated
              </h3>
              <p className="text-rose-600 dark:text-rose-400 mb-4">
                You'll receive email updates about your order status and tracking information once your items ship.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-rose-500 dark:text-rose-500">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Processing</span>
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Shipped</span>
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}