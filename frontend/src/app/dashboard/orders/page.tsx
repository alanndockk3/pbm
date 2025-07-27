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
      
      <div className="container mx-auto px-4 py-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Your Orders</h1>
              <p className="text-rose-600 dark:text-rose-400">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
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
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                {selectedStatus === 'all' ? 'No orders found' : `No ${selectedStatus} orders`}
              </h3>
              <p className="text-rose-600 dark:text-rose-400 mb-6">
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
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card 
                  key={order.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer"
                  onClick={() => handleViewOrder(order.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <p className="text-sm text-rose-600 dark:text-rose-400">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-pink-600 hover:text-pink-700 p-2"
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
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Items Summary */}
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <div>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400">
                            {order.items.length > 1 
                              ? `${order.items[0].name} + ${order.items.length - 1} more`
                              : order.items[0]?.name || 'No items'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <div>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400">
                            {order.shippingMethod}
                          </p>
                        </div>
                      </div>

                      {/* Total and Payment */}
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <div>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            ${order.totals.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Description */}
                    <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-700">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                          {statusConfig.description}
                        </p>
                        {order.status === 'shipped' && order.estimatedDelivery && (
                          <>
                            <span className="text-rose-400">•</span>
                            <Calendar className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span className="text-xs text-rose-600 dark:text-rose-400">
                              Est. delivery {formatDate(order.estimatedDelivery)}
                            </span>
                          </>
                        )}
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