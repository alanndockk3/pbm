// app/dashboard/orders/page.tsx
'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from '@/components/Header';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useUserOrders } from '../../../../lib/orders/useOrderStore';
import type { OrderStatus } from '../../../../types/order';
import { 
  Package, 
  ArrowLeft, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  RotateCcw,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react";

// Status configuration
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
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        label: 'Cancelled',
        description: 'Order has been cancelled'
      };
    case 'refunded':
      return {
        icon: RotateCcw,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Refunded',
        description: 'Order refunded to original payment method'
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
    year: 'numeric',
    month: 'short',
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

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { orders, isLoading, error } = useUserOrders(user?.uid || null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <Header navigateBack={true} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-rose-400 mx-auto mb-4 animate-pulse" />
            <p className="text-rose-600 dark:text-rose-400">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <Header navigateBack={true} />
        <div className="container mx-auto px-4 py-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                Error Loading Orders
              </h3>
              <p className="text-rose-600 dark:text-rose-400 mb-6">
                {error}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filter orders by status
  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-rose-900 dark:text-rose-100">Your Orders</h1>
            <p className="text-sm sm:text-base text-rose-600 dark:text-rose-400">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
              className={selectedStatus === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'}
            >
              All ({orders.length})
            </Button>
            {(['confirmed', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map(status => {
              const count = statusCounts[status] || 0;
              if (count === 0) return null;
              
              const config = getStatusConfig(status);
              return (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'}
                >
                  {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                {selectedStatus === 'all' ? 'No orders found' : `No ${selectedStatus} orders`}
              </h3>
              <p className="text-sm sm:text-base text-rose-600 dark:text-rose-400 mb-6 max-w-md mx-auto">
                {selectedStatus === 'all' 
                  ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                  : `You don't have any orders with ${selectedStatus} status.`
                }
              </p>
              <Button
                onClick={() => router.push('/dashboard/products')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card 
                  key={order.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer"
                  onClick={() => handleViewOrder(order.id)}
                >
                  <CardHeader className="pb-3 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {order.items[0]?.image ? (
                            <img 
                              src={order.items[0].image} 
                              alt={order.items[0].name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg text-rose-900 dark:text-rose-100 truncate">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                            {formatDateTime(order.createdAt)}
                          </p>
                          {order.confirmationNumber && (
                            <p className="text-xs text-rose-500 dark:text-rose-500 font-mono truncate">
                              Conf: {order.confirmationNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <Badge className={`${statusConfig.color} text-xs`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{statusConfig.label}</span>
                          <span className="sm:hidden">{statusConfig.label.slice(0, 4)}</span>
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-pink-600 hover:text-pink-700 p-2 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Items Summary */}
                      <div className="flex items-start gap-3">
                        <Package className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400 truncate">
                            {order.items.length > 1 
                              ? `${order.items[0].name} + ${order.items.length - 1} more`
                              : order.items[0]?.name || 'No items'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100 truncate">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400 truncate">
                            {order.shippingMethod}
                          </p>
                        </div>
                      </div>

                      {/* Total and Payment */}
                      <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-1">
                        <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            ${order.totals.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400 truncate">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Description */}
                    <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-700">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                          <p className="text-sm text-rose-600 dark:text-rose-400">
                            {statusConfig.description}
                          </p>
                        </div>
                        {order.status === 'shipped' && order.estimatedDelivery && (
                          <div className="flex items-center gap-2 sm:ml-auto">
                            <span className="text-rose-400 hidden sm:inline">•</span>
                            <Calendar className="w-3 h-3 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                            <span className="text-xs text-rose-600 dark:text-rose-400 whitespace-nowrap">
                              Est. delivery {formatDate(order.estimatedDelivery)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Order Details */}
                    <div className="mt-3 pt-3 border-t border-rose-100 dark:border-rose-800">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="text-rose-600 dark:text-rose-400">
                          <span className="font-medium">Subtotal:</span> 
                          <span className="block sm:inline sm:ml-1">${order.totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="text-rose-600 dark:text-rose-400">
                          <span className="font-medium">Shipping:</span> 
                          <span className="block sm:inline sm:ml-1">${order.totals.shipping.toFixed(2)}</span>
                        </div>
                        <div className="text-rose-600 dark:text-rose-400">
                          <span className="font-medium">Tax:</span> 
                          <span className="block sm:inline sm:ml-1">${order.totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="text-rose-900 dark:text-rose-100 font-medium">
                          <span>Total:</span> 
                          <span className="block sm:inline sm:ml-1">${order.totals.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}