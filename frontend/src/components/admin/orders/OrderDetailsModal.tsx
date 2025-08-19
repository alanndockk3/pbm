// components/admin/orders/OrderDetailsModal.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Edit, 
  Download, 
  X, 
  Package, 
  MapPin, 
  Phone, 
  Calendar,
  Truck,
  Copy,
  ExternalLink,
  Clock
} from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import type { AdminOrder } from '../../../../lib/admin/useAdminOrderStore';

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTracking?: (orderId: string, trackingNumber: string, carrier?: string) => void;
}

export function OrderDetailsModal({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateTracking 
}: OrderDetailsModalProps) {
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  if (!isOpen || !order) return null;

  const handleUpdateTracking = () => {
    if (trackingNumber.trim() && onUpdateTracking) {
      onUpdateTracking(order.id, trackingNumber.trim(), carrier.trim() || undefined);
      setIsEditingTracking(false);
      setTrackingNumber('');
      setCarrier('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatAddress = (address: AdminOrder['shippingAddress']) => {
    const parts = [
      address.address1,
      address.address2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country
    ].filter(Boolean);
    return parts.join('\n');
  };

  const openInMaps = () => {
    const address = `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`;
    window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Order {order.orderNumber}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-rose-600 dark:text-rose-400">
                  Placed on {order.orderDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {order.sessionId && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    Session: {order.sessionId.slice(-8)}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl px-3 py-1"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Order Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Status and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Order Status
                  </h3>
                  <OrderStatusBadge status={order.status} />
                  {order.trackingNumber && (
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Tracking Number:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {order.trackingNumber}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(order.trackingNumber!)}
                          className="p-1 h-6 w-6"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Payment Status</h3>
                  <PaymentStatusBadge status={order.paymentStatus} />
                  {order.paymentIntentId && (
                    <p className="text-xs text-gray-500 font-mono">
                      Payment ID: {order.paymentIntentId.slice(-12)}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-lg">{order.customer.name}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`mailto:${order.customer.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`tel:${order.customer.phone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(formatAddress(order.shippingAddress))}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openInMaps}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items ({order.items.length})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-pink-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-6">
              
              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
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

              {/* Delivery Information */}
              {order.estimatedDelivery && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Delivery Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Delivery:</p>
                    <p className="font-medium">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking Management */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Tracking Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {!isEditingTracking ? (
                    <div className="space-y-3">
                      {order.trackingNumber ? (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tracking Number:</p>
                          <div className="flex items-center gap-2">
                            <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-sm flex-1">
                              {order.trackingNumber}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(order.trackingNumber!)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No tracking information yet</p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingTracking(true);
                          setTrackingNumber(order.trackingNumber || '');
                        }}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {order.trackingNumber ? 'Update' : 'Add'} Tracking
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Carrier (Optional)</label>
                        <input
                          type="text"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          placeholder="e.g., UPS, FedEx, USPS"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateTracking}
                          disabled={!trackingNumber.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save Tracking
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingTracking(false);
                            setTrackingNumber('');
                            setCarrier('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    onClick={() => {
                      const subject = encodeURIComponent(`Order Update - ${order.orderNumber}`);
                      const body = encodeURIComponent(`Dear ${order.customer.name},\n\nRegarding your order ${order.orderNumber}...\n\nBest regards,\nPretties by Marg Team`);
                      window.open(`mailto:${order.customer.email}?subject=${subject}&body=${body}`);
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Customer
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-rose-300 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      // Create a simple invoice/receipt
                      const invoiceData = {
                        orderNumber: order.orderNumber,
                        date: order.orderDate.toLocaleDateString(),
                        customer: order.customer,
                        items: order.items,
                        totals: {
                          subtotal: order.subtotal,
                          shipping: order.shipping,
                          tax: order.tax,
                          total: order.total
                        }
                      };
                      
                      // In a real app, you'd generate a proper PDF or formatted document
                      const invoiceText = `
INVOICE - ${order.orderNumber}
Date: ${order.orderDate.toLocaleDateString()}

Customer: ${order.customer.name}
Email: ${order.customer.email}

Items:
${order.items.map(item => `${item.name} - Qty: ${item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Subtotal: ${order.subtotal.toFixed(2)}
Shipping: ${order.shipping.toFixed(2)}
Tax: ${order.tax.toFixed(2)}
Total: ${order.total.toFixed(2)}

Shipping Address:
${order.shippingAddress.name}
${order.shippingAddress.address1}
${order.shippingAddress.address2 ? order.shippingAddress.address2 + '\n' : ''}${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}
                      `;
                      
                      const blob = new Blob([invoiceText], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `invoice-${order.orderNumber}.txt`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      const orderData = {
                        orderNumber: order.orderNumber,
                        customerId: order.customerId,
                        sessionId: order.sessionId,
                        paymentIntentId: order.paymentIntentId,
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        total: order.total,
                        customer: order.customer,
                        items: order.items,
                        shippingAddress: order.shippingAddress,
                        dates: {
                          created: order.orderDate.toISOString(),
                          updated: order.updatedDate.toISOString(),
                          estimated_delivery: order.estimatedDelivery
                        },
                        tracking: {
                          number: order.trackingNumber,
                          carrier: order.carrier || 'Unknown'
                        }
                      };
                      
                      copyToClipboard(JSON.stringify(orderData, null, 2));
                      // You could show a toast notification here
                      console.log('Order data copied to clipboard');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Order Data
                  </Button>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Order Timeline</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Order Placed</p>
                      <p className="text-xs text-gray-500">
                        {order.orderDate.toLocaleDateString()} at {order.orderDate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {order.paymentStatus === 'paid' && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Payment Confirmed</p>
                        <p className="text-xs text-gray-500">
                          {order.orderDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === 'processing' && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Processing</p>
                        <p className="text-xs text-gray-500">Order is being prepared</p>
                      </div>
                    </div>
                  )}
                  
                  {order.trackingNumber && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Shipped</p>
                        <p className="text-xs text-gray-500">
                          Tracking: {order.trackingNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.estimatedDelivery && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expected Delivery</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {order.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notes</h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Technical Info (Development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">🔧 Tech Info</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs font-mono space-y-1">
                    <p>Order ID: {order.id}</p>
                    <p>Customer ID: {order.customerId}</p>
                    {order.sessionId && <p>Session: {order.sessionId}</p>}
                    {order.paymentIntentId && <p>Payment: {order.paymentIntentId}</p>}
                    <p>Created: {order.orderDate.toISOString()}</p>
                    <p>Updated: {order.updatedDate.toISOString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}