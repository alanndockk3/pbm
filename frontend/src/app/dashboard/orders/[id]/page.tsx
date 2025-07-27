// app/dashboard/orders/[id]/page.tsx
'use client'

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from '@/components/Header';
import { useOrderActions } from '../../../../../lib/orders/useOrderStore';
import type { OrderStatus } from '../../../../../types/order';
import { 
  Package, 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Truck, 
  Phone, 
  Mail,
  CheckCircle,
  Clock,
  Copy,
  Download,
  MessageCircle,
  AlertCircle
} from "lucide-react";

// Status configuration (same as orders page)
const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Pending',
        description: 'Order received, awaiting confirmation'
      };
    case 'confirmed':
      return {
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'Confirmed',
        description: 'Payment confirmed, preparing to ship'
      };
    case 'processing':
      return {
        icon: Package,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        label: 'Processing',
        description: 'Order being prepared for shipment'
      };
    case 'shipped':
      return {
        icon: Truck,
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        label: 'Shipped',
        description: 'Package is on its way'
      };
    case 'delivered':
      return {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Delivered',
        description: 'Package has been delivered'
      };
    default:
      return {
        icon: Package,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        label: 'Unknown',
        description: 'Status unknown'
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // You could add a toast notification here
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getOrder } = useOrderActions();
  
  const orderId = params.id as string;
  const order = getOrder(orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <Header navigateBack={true} />
        <div className="container mx-auto px-4 py-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                Order Not Found
              </h3>
              <p className="text-rose-600 dark:text-rose-400 mb-6">
                The order you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => router.push('/dashboard/orders')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/orders')}
              className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                Order #{order.orderNumber}
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                Placed on {formatDateTime(order.createdAt)} • Confirmation #{order.confirmationNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Status & Timeline */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory.map((status, index) => {
                    const config = getStatusConfig(status.status);
                    const Icon = config.icon;
                    const isLast = index === order.statusHistory.length - 1;
                    
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isLast ? config.color : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-rose-900 dark:text-rose-100">
                              {config.label}
                            </h4>
                            <span className="text-sm text-rose-600 dark:text-rose-400">
                              {formatDateTime(status.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                            {status.note || config.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-pink-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-rose-900 dark:text-rose-100">
                          {item.name}
                        </h4>
                        {item.category && (
                          <p className="text-sm text-rose-600 dark:text-rose-400">
                            {item.category}
                          </p>
                        )}
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-900 dark:text-rose-100">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Shipping Address
                    </h4>
                    <div className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.address1}</p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Contact Information
                    </h4>
                    <div className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{order.shippingAddress.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-rose-200 dark:border-rose-700 pt-4">
                  <div className="flex items-center gap-4">
                    <Truck className="w-5 h-5 text-rose-600" />
                    <div>
                      <p className="font-medium text-rose-900 dark:text-rose-100">
                        {order.shippingMethod}
                      </p>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        Estimated delivery: {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                  
                  {order.trackingNumber && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            Tracking Number
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {order.trackingNumber}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(order.trackingNumber!)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="space-y-6">
            
            {/* Order Summary */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Subtotal:</span>
                    <span className="text-rose-900 dark:text-rose-100">${order.totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Shipping:</span>
                    <span className="text-rose-900 dark:text-rose-100">${order.totals.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Tax:</span>
                    <span className="text-rose-900 dark:text-rose-100">${order.totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-rose-200 dark:border-rose-700 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-rose-900 dark:text-rose-100">Total:</span>
                      <span className="text-rose-900 dark:text-rose-100">${order.totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Order Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-900 dark:text-rose-100 font-mono">
                        {order.orderNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.orderNumber)}
                        className="p-1 h-auto text-rose-600"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Confirmation:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-900 dark:text-rose-100 font-mono">
                        {order.confirmationNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.confirmationNumber)}
                        className="p-1 h-auto text-rose-600"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Payment Method:</span>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-900 dark:text-rose-100">{order.paymentMethod}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-rose-600 dark:text-rose-400">Order Date:</span>
                    <span className="text-rose-900 dark:text-rose-100">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
                  >
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}