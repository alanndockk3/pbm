// components/admin/orders/OrdersTable.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Package, Truck, Edit2, ExternalLink, Copy } from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import type { AdminOrder } from '../../../../lib/admin/useAdminOrderStore';

interface OrdersTableProps {
  orders: AdminOrder[];
  onViewOrder: (order: AdminOrder) => void;
  onUpdateStatus: (orderId: string, status: AdminOrder['status']) => void;
  loading?: boolean;
}

const TrackingNumberInput = ({ 
  order, 
  onUpdateTracking 
}: { 
  order: AdminOrder;
  onUpdateTracking?: (orderId: string, trackingNumber: string, carrier?: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState('');

  const handleSave = () => {
    if (trackingNumber.trim() && onUpdateTracking) {
      onUpdateTracking(order.id, trackingNumber.trim(), carrier.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTrackingNumber(order.trackingNumber || '');
    setCarrier('');
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isEditing && !order.trackingNumber) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditing(true)}
        className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        <Truck className="w-3 h-3 mr-1" />
        Add Tracking
      </Button>
    );
  }

  if (!isEditing && order.trackingNumber) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {order.trackingNumber}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyToClipboard(order.trackingNumber!)}
          className="p-1 h-6 w-6"
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="p-1 h-6 w-6"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
      />
      <input
        type="text"
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        placeholder="Carrier (optional)"
        className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!trackingNumber.trim()}
          className="text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export function OrdersTable({ orders, onViewOrder, onUpdateStatus, loading = false }: OrdersTableProps) {
  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              Loading Orders...
            </h3>
            <p className="text-rose-600 dark:text-rose-400">
              Fetching order data from database
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              Try adjusting your search or filter criteria, or check back later for new orders.
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
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Tracking</th>
                <th className="text-left p-4 font-semibold text-rose-900 dark:text-rose-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-rose-100 dark:border-rose-800 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-rose-900 dark:text-rose-100">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      {order.sessionId && (
                        <p className="text-xs text-gray-500 font-mono">
                          {order.sessionId.slice(-8)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-rose-900 dark:text-rose-100">
                        {order.customer.name}
                      </p>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {order.customer.email}
                      </p>
                      {order.customer.phone && (
                        <p className="text-xs text-rose-500 dark:text-rose-500">
                          {order.customer.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <OrderStatusBadge status={order.status} />
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value as AdminOrder['status'])}
                        className="w-full px-2 py-1 text-xs border border-rose-200 dark:border-rose-700 rounded bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  <td className="p-4">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-rose-900 dark:text-rose-100">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-rose-600 dark:text-rose-400">
                        ${order.subtotal.toFixed(2)} + ${order.shipping.toFixed(2)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm text-rose-700 dark:text-rose-300">
                        {order.orderDate.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-rose-500 dark:text-rose-500">
                        {order.orderDate.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <TrackingNumberInput 
                      order={order}
                      onUpdateTracking={(orderId, trackingNumber, carrier) => {
                        // This would be passed down from the parent component
                        console.log('Update tracking:', { orderId, trackingNumber, carrier });
                      }}
                    />
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
                      {order.shippingAddress.city && order.shippingAddress.state && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const address = `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`;
                            window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination could be added here for large datasets */}
        {orders.length > 0 && (
          <div className="p-4 border-t border-rose-100 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10">
            <p className="text-sm text-rose-600 dark:text-rose-400 text-center">
              Showing all {orders.length} orders
              {/* Future: Add pagination controls here */}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}