// types/order.ts
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  confirmationNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  
  // Items and pricing
  items: OrderItem[];
  totals: OrderTotals;
  
  // Shipping information
  shippingAddress: OrderAddress;
  shippingMethod: string;
  estimatedDelivery: string;
  
  // Payment information
  paymentMethod: string;
  paymentIntentId?: string;
  
  // Order status and tracking
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Optional tracking info
  trackingNumber?: string;
  carrier?: string;
}