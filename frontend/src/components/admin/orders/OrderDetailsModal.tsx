// components/admin/orders/OrderDetailsModal.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Edit, Download } from "lucide-react";
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

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order {order.orderNumber}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Placed on {order.orderDate.toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl px-3 py-1"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Status</h3>
              <OrderStatusBadge status={order.status} />
              {order.trackingNumber && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Status</h3>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Information</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-gray-600 dark:text-gray-400">{order.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && (
                <p>{order.shippingAddress.address2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Items</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Summary</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Email Customer
            </Button>
            <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50">
              <Edit className="w-4 h-4 mr-2" />
              Edit Order
            </Button>
            <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}