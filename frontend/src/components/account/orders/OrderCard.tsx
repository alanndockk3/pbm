// components/account/orders/OrderCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Eye, Truck } from 'lucide-react';
import type { Order } from '../../../../types/order';
import { getOrderStatusColor, getOrderStatusIcon, formatOrderDate, formatOrderNumber } from '../../../../lib/orders/orderUtils';

interface OrderCardProps {
  order: Order;
  onViewDetails?: (orderId: string) => void;
  isCompact?: boolean;
}

export const OrderCard = ({ order, onViewDetails, isCompact = false }: OrderCardProps) => {
  const handleViewDetails = () => {
    onViewDetails?.(order.id);
  };

  // Format the creation date
  const createdDate = new Date(order.createdAt);
  const formattedDate = formatOrderDate(createdDate);

  if (isCompact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 dark:bg-rose-800/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-700 dark:to-purple-700 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <p className="font-medium text-rose-900 dark:text-rose-100">
              {formatOrderNumber(order.orderNumber)}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {formattedDate} • ${order.totals.total.toFixed(2)}
            </p>
          </div>
        </div>
        <Badge className={getOrderStatusColor(order.status)}>
          {getOrderStatusIcon(order.status)} {order.status}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
              {formatOrderNumber(order.orderNumber)}
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Placed on {formattedDate}
            </p>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            {getOrderStatusIcon(order.status)} {order.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-rose-600 dark:text-rose-400">Items:</span>
            <span className="text-rose-900 dark:text-rose-100">
              {order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-rose-600 dark:text-rose-400">Total:</span>
            <span className="font-semibold text-rose-900 dark:text-rose-100">
              ${order.totals.total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-rose-600 dark:text-rose-400">Shipping:</span>
            <span className="text-rose-900 dark:text-rose-100">{order.shippingMethod}</span>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="flex items-center gap-2 mb-4 text-sm text-rose-600 dark:text-rose-400">
            <Truck className="w-4 h-4" />
            <span>Tracking: {order.trackingNumber}</span>
            {order.carrier && <span>({order.carrier})</span>}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {order.trackingNumber && (
            <Button
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              onClick={() => {
                // Open tracking URL - you can customize this based on carrier
                const trackingUrl = order.carrier?.toLowerCase() === 'ups' 
                  ? `https://www.ups.com/track?tracknum=${order.trackingNumber}`
                  : order.carrier?.toLowerCase() === 'fedex'
                  ? `https://www.fedex.com/fedextrack/?tracknumber=${order.trackingNumber}`
                  : `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
                
                window.open(trackingUrl, '_blank');
              }}
            >
              <Truck className="w-4 h-4 mr-2" />
              Track
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};