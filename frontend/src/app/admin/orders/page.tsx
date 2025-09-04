// app/admin/orders/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RefreshCw, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useAdminOrders, useAdminOrderActions, type AdminOrder } from '../../../../lib/admin/useAdminOrderStore';
import { OrderStats } from '@/components/admin/orders/OrderStats';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsModal } from '@/components/admin/orders/OrderDetailsModal';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  
  // Real database integration
  const { orders, loading, error, realTimeActive } = useAdminOrders();
  const { loadAllOrders, updateOrderStatus, updateOrderTracking, setupRealtimeListener, stopRealtimeListener } = useAdminOrderActions();
  
  // UI state
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load orders on mount and setup realtime listener
  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllOrders();
      const unsubscribe = setupRealtimeListener();
      
      // Cleanup on unmount
      return () => {
        stopRealtimeListener();
      };
    }
  }, [user, loadAllOrders, setupRealtimeListener, stopRealtimeListener]);

  // Filter orders whenever orders or filters change
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(lowerSearch) ||
        order.customer.name.toLowerCase().includes(lowerSearch) ||
        order.customer.email.toLowerCase().includes(lowerSearch) ||
        order.trackingNumber?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: AdminOrder['status']) => {
    try {
      // Add order to updating set
      setUpdatingOrders(prev => new Set(prev).add(orderId));
      
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        setUpdateStatus({ type: 'error', message: 'Order not found' });
        return;
      }

      console.log(`🔄 Updating order ${order.orderNumber} (${orderId}) status from ${order.status} to ${newStatus}`);
      
      await updateOrderStatus(orderId, order.customerId, newStatus, `Status updated to ${newStatus} by admin`);
      
      // Show success feedback
      setUpdateStatus({ type: 'success', message: `Order ${order.orderNumber} status updated to ${newStatus}` });
      console.log(`✅ Order ${order.orderNumber} status updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateStatus({ type: null, message: '' }), 3000);
      
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      setUpdateStatus({ type: 'error', message: 'Failed to update order status. Please try again.' });
      
      // Clear error message after 5 seconds
      setTimeout(() => setUpdateStatus({ type: null, message: '' }), 5000);
    } finally {
      // Remove order from updating set
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingNumber: string, carrier?: string) => {
    try {
      // Add order to updating set
      setUpdatingOrders(prev => new Set(prev).add(orderId));
      
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        setUpdateStatus({ type: 'error', message: 'Order not found' });
        return;
      }

      console.log(`🔄 Updating tracking for order ${order.orderNumber} (${orderId}): ${trackingNumber}${carrier ? ` (${carrier})` : ''}`);
      
      await updateOrderTracking(orderId, order.customerId, trackingNumber, carrier);
      
      setUpdateStatus({ type: 'success', message: `Tracking updated for order ${order.orderNumber}` });
      console.log(`✅ Tracking updated for order ${order.orderNumber}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateStatus({ type: null, message: '' }), 3000);
      
    } catch (error) {
      console.error('❌ Failed to update tracking:', error);
      setUpdateStatus({ type: 'error', message: 'Failed to update tracking information. Please try again.' });
      
      // Clear error message after 5 seconds
      setTimeout(() => setUpdateStatus({ type: null, message: '' }), 5000);
    } finally {
      // Remove order from updating set
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAllOrders();
      console.log('📄 Orders refreshed manually');
    } catch (error) {
      console.error('❌ Failed to refresh orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // Create CSV export
    const csvHeaders = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Status',
      'Payment Status',
      'Total',
      'Order Date',
      'Tracking Number'
    ].join(',');
    
    const csvData = filteredOrders.map(order => [
      order.orderNumber,
      order.customer.name,
      order.customer.email,
      order.status,
      order.paymentStatus,
      order.total.toFixed(2),
      order.orderDate.toLocaleDateString(),
      order.trackingNumber || ''
    ].join(',')).join('\n');
    
    const csvContent = `${csvHeaders}\n${csvData}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                  Order Management
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-rose-600 dark:text-rose-400">
                    Track and manage customer orders
                  </p>
                  {realTimeActive && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={filteredOrders.length === 0}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Status Notifications */}
          {updateStatus.type && (
            <div className={`mb-6 p-4 border rounded-lg ${
              updateStatus.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {updateStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <h3 className={`font-medium ${
                    updateStatus.type === 'success' 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {updateStatus.type === 'success' ? 'Success' : 'Error'}
                  </h3>
                  <p className={`text-sm ${
                    updateStatus.type === 'success' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {updateStatus.message}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpdateStatus({ type: null, message: '' })}
                  className={`ml-auto ${
                    updateStatus.type === 'success'
                      ? 'border-green-300 text-green-700 hover:bg-green-50'
                      : 'border-red-300 text-red-700 hover:bg-red-50'
                  }`}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">Error Loading Orders</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="ml-auto border-red-300 text-red-700 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-700 dark:text-blue-300">Loading orders from database...</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <OrderStats orders={orders} />

          {/* Filters */}
          <OrderFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            paymentFilter={paymentFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onPaymentChange={setPaymentFilter}
            totalCount={orders.length}
            filteredCount={filteredOrders.length}
          />
        </header>

        {/* Orders Table */}
        <section className="pb-12">
          <OrdersTable
            orders={filteredOrders}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdateTracking={handleUpdateTracking}
            loading={loading}
            updatingOrders={updatingOrders}
          />
        </section>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onUpdateTracking={handleUpdateTracking}
        />
      </div>
    </div>
  );
}