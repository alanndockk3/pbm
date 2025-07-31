// app/admin/orders/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RefreshCw, Package } from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { OrderStats } from '@/components/admin/orders/OrderStats';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsModal } from '@/components/admin/orders/OrderDetailsModal';

// Order interface
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: Date;
  updatedDate: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PBM-2025-001',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567'
    },
    items: [
      { id: '1', name: 'Handwoven Scarf', quantity: 1, price: 45.00 },
      { id: '2', name: 'Ceramic Mug', quantity: 2, price: 25.00 }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    total: 103.95,
    subtotal: 95.00,
    shipping: 8.95,
    tax: 0.00,
    shippingAddress: {
      name: 'Sarah Johnson',
      address1: '123 Oak Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'US'
    },
    orderDate: new Date('2025-01-28'),
    updatedDate: new Date('2025-01-29'),
    estimatedDelivery: new Date('2025-02-05')
  },
  {
    id: '2',
    orderNumber: 'PBM-2025-002',
    customer: {
      name: 'Michael Chen',
      email: 'michael.chen@email.com'
    },
    items: [
      { id: '3', name: 'Knitted Blanket', quantity: 1, price: 89.00 }
    ],
    status: 'shipped',
    paymentStatus: 'paid',
    total: 97.95,
    subtotal: 89.00,
    shipping: 8.95,
    tax: 0.00,
    shippingAddress: {
      name: 'Michael Chen',
      address1: '456 Pine Avenue',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'US'
    },
    orderDate: new Date('2025-01-27'),
    updatedDate: new Date('2025-01-30'),
    estimatedDelivery: new Date('2025-02-03'),
    trackingNumber: 'TRK123456789'
  },
  {
    id: '3',
    orderNumber: 'PBM-2025-003',
    customer: {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com'
    },
    items: [
      { id: '4', name: 'Pottery Set', quantity: 1, price: 120.00 },
      { id: '5', name: 'Tea Towels', quantity: 3, price: 15.00 }
    ],
    status: 'pending',
    paymentStatus: 'pending',
    total: 183.95,
    subtotal: 165.00,
    shipping: 18.95,
    tax: 0.00,
    shippingAddress: {
      name: 'Emily Rodriguez',
      address1: '789 Maple Drive',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'US'
    },
    orderDate: new Date('2025-01-30'),
    updatedDate: new Date('2025-01-30')
  }
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedDate: new Date() }
        : order
    ));
  };

  const handleBackToDashboard = () => {
    router.push('/admin');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading Orders...</p>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                Order Management
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                Track and manage customer orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

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
      />
    </>
  );
}