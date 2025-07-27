// lib/orders/orderUtils.ts
import type { Order } from '../../types/order';

export const getOrderStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getOrderStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'processing':
      return '🏭';
    case 'shipped':
      return '🚚';
    case 'delivered':
      return '✅';
    case 'cancelled':
      return '❌';
    default:
      return '📦';
  }
};

export const formatOrderDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatOrderNumber = (orderNumber: string) => {
  return `#${orderNumber}`;
};
