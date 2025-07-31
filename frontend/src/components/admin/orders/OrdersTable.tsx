// components/admin/orders/OrdersTable.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Package } from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';

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
    image?: string;
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
  notes?: string;
}

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrdersTable({ orders, onViewOrder, onUpdateStatus }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              No orders found
            </h3>
            <p className="text-rose-600 dark:text-rose-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-rose-50 dark:bg-rose-900/30">
              <tr>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Order</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Customer</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Status</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Payment</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Total</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Date</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-rose-100 dark:border-rose-800 hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-rose-900 dark:text-rose-100">{order.orderNumber}</p>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-rose-900 dark:text-rose-100">{order.customer.name}</p>
                      <p className="text-sm text-rose-600 dark:text-rose-400">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-rose-900 dark:text-rose-100">${order.total.toFixed(2)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      {order.orderDate.toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewOrder(order)}
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                        className="px-2 py-1 text-xs border border-rose-200 dark:border-rose-700 rounded bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}