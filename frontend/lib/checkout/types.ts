// lib/checkout/types.ts
import type { OrderItem, OrderTotals, OrderAddress } from '../../types/order';

export type CheckoutStep = 1 | 2 | 3 | 4;

// Use the same OrderAddress from order types
export type CheckoutShippingAddress = Partial<OrderAddress>;

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
  type?: 'card' | 'apple_pay' | 'google_pay';
  cardLast4?: string;
  brand?: string;
}

// Use OrderItem from order types instead of defining a new one
export type CheckoutOrderItem = OrderItem;

export interface CheckoutSession {
  step: CheckoutStep;
  shippingAddress: CheckoutShippingAddress;
  billingAddress: BillingAddress;
  shippingOption: ShippingOption | null;
  paymentMethod: PaymentMethod;
  items: CheckoutOrderItem[]; // Use the aligned type
  totals: OrderTotals; // Use OrderTotals from order types
  paymentIntentId?: string;
  orderId?: string;
}