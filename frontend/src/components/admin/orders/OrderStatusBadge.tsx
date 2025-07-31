// components/admin/orders/OrderStatusBadge.tsx
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle
} from "lucide-react";

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
    confirmed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: CheckCircle },
    processing: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Package },
    shipped: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const paymentConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    refunded: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
  };

  const config = paymentConfig[status];

  return (
    <Badge className={config.color}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}