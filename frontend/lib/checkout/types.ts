// lib/checkout/types.ts

// Base shipping address interface - matches your Zod schema exactly
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email?: string; // Optional since we get from user object
  phone: string;
  address1: string;
  address2?: string; // Optional in schema
  city: string;
  state: string;
  zipCode: string;
  country: string; // Required (has default in schema)
}

// For the checkout session, create a type that matches what's actually optional during form filling
export interface CheckoutShippingAddress {
  firstName?: string;
  lastName?: string;
  email?: string; // Optional - will be populated from user
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string; // Optional during form filling, will get default 'US'
}

export interface BillingAddress {
  sameAsShipping: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface PaymentMethod {
  type: 'card' | 'apple_pay' | 'google_pay';
  saveForFuture?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CheckoutSession {
  step: 1 | 2 | 3 | 4; // shipping, delivery, payment, review
  shippingAddress: CheckoutShippingAddress; // Use checkout-specific type
  billingAddress: BillingAddress; // Already has optional fields
  shippingOption: ShippingOption | null;
  paymentMethod: Partial<PaymentMethod>;
  items: OrderItem[];
  totals: OrderTotals;
  paymentIntentId?: string;
  orderId?: string;
}