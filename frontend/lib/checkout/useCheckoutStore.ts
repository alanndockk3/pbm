// lib/checkout/useCheckoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  type?: 'card' | 'apple_pay' | 'google_pay' | 'stripe_checkout';
  cardLast4?: string;
  brand?: string;
}

export interface CheckoutSession {
  step: CheckoutStep;
  shippingAddress: CheckoutShippingAddress;
  billingAddress: BillingAddress;
  shippingOption: ShippingOption | null;
  paymentMethod: PaymentMethod;
  items: OrderItem[]; // Use OrderItem from order types
  totals: OrderTotals; // Use OrderTotals from order types
  paymentIntentId?: string;
  orderId?: string;
  // Add shipping collection flag
  collectShippingAddress: boolean;
  // Add success/cancel URLs for Stripe
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutState extends CheckoutSession {
  // Actions
  setStep: (step: CheckoutSession['step']) => void;
  setShippingAddress: (address: CheckoutShippingAddress) => void;
  setBillingAddress: (address: Partial<BillingAddress>) => void;
  setShippingOption: (option: ShippingOption) => void;
  setPaymentMethod: (method: Partial<PaymentMethod>) => void;
  setItems: (items: OrderItem[]) => void;
  updateTotals: (totals: Partial<OrderTotals>) => void;
  setPaymentIntentId: (id: string) => void;
  setOrderId: (id: string) => void;
  setCollectShippingAddress: (collect: boolean) => void;
  setSuccessUrl: (url: string) => void;
  setCancelUrl: (url: string) => void;
  resetCheckout: () => void;
  
  // Computed
  isStepValid: (step: number) => boolean;
  canProceedToNext: () => boolean;
  
  // Stripe Checkout Session helpers
  getStripeCheckoutSessionData: () => any;
}

const initialState: CheckoutSession = {
  step: 1,
  shippingAddress: {
    country: 'US' 
  },
  billingAddress: { sameAsShipping: true },
  shippingOption: null,
  paymentMethod: {},
  items: [],
  totals: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  },
  collectShippingAddress: true, // Default to collecting shipping
  successUrl: typeof window !== 'undefined' ? window.location.origin + '/dashboard/checkout/success' : '',
  cancelUrl: typeof window !== 'undefined' ? window.location.origin + '/dashboard/checkout/cancelled' : ''
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setShippingAddress: (address) => 
        set((state) => ({
          shippingAddress: { ...state.shippingAddress, ...address }
        })),

      setBillingAddress: (address) => 
        set((state) => ({
          billingAddress: { ...state.billingAddress, ...address }
        })),

      setShippingOption: (option) => {
        set({ shippingOption: option });
        // Recalculate totals when shipping changes
        const state = get();
        get().updateTotals({ shipping: option.price });
      },

      setPaymentMethod: (method) => 
        set((state) => ({
          paymentMethod: { ...state.paymentMethod, ...method }
        })),

      setItems: (items) => {
        set({ items });
        // Recalculate totals when items change
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        get().updateTotals({ subtotal });
      },

      updateTotals: (newTotals) => 
        set((state) => {
          const totals = { ...state.totals, ...newTotals };
          // Calculate tax based on subtotal
          const tax = totals.subtotal * 0.08; // 8% tax rate
          const total = totals.subtotal + totals.shipping + tax;
          return { totals: { ...totals, tax, total } };
        }),

      setPaymentIntentId: (paymentIntentId) => set({ paymentIntentId }),

      setOrderId: (orderId) => set({ orderId }),

      setCollectShippingAddress: (collectShippingAddress) => set({ collectShippingAddress }),

      setSuccessUrl: (successUrl) => set({ successUrl }),

      setCancelUrl: (cancelUrl) => set({ cancelUrl }),

      resetCheckout: () => set(initialState),

      // Validation helpers
      isStepValid: (step) => {
        const state = get();
        
        switch (step) {
          case 1: // Shipping
            // If collecting shipping via Stripe, we might not need all fields
            if (state.collectShippingAddress && state.paymentMethod.type === 'stripe_checkout') {
              return true; // Stripe will collect this
            }
            const { firstName, lastName, email, address1, city, state: stateField, zipCode } = state.shippingAddress;
            return !!(firstName && lastName && email && address1 && city && stateField && zipCode);
          
          case 2: // Delivery
            return !!state.shippingOption;
          
          case 3: // Payment
            return state.isStepValid(1) && state.isStepValid(2) && !!state.paymentMethod.type;
          
          default:
            return false;
        }
      },

      canProceedToNext: () => {
        const state = get();
        return state.isStepValid(state.step);
      },

      // Helper to get Stripe Checkout Session data
      getStripeCheckoutSessionData: () => {
        const state = get();
        
        return {
          collect_shipping_address: state.collectShippingAddress,
          success_url: state.successUrl || `${window.location.origin}/dashboard/checkout/success`,
          cancel_url: state.cancelUrl || `${window.location.origin}/dashboard/checkout/cancelled`,
          // Add line items based on cart items
          line_items: state.items.map(item => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
                metadata: {
                  productId: item.productId,
                  category: item.category || 'Handmade'
                }
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
          })),
          // Add shipping if selected
          ...(state.shippingOption && state.shippingOption.price > 0 && {
            shipping_options: [{
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: Math.round(state.shippingOption.price * 100),
                  currency: 'usd',
                },
                display_name: state.shippingOption.name,
                delivery_estimate: {
                  minimum: {
                    unit: 'business_day',
                    value: parseInt(state.shippingOption.estimatedDays.split('-')[0]) || 5,
                  },
                  maximum: {
                    unit: 'business_day',
                    value: parseInt(state.shippingOption.estimatedDays.split('-')[1]) || 7,
                  },
                },
              },
            }]
          }),
          // Add customer email if available
          ...(state.shippingAddress.email && {
            customer_email: state.shippingAddress.email
          }),
          // Add metadata for order tracking
          metadata: {
            orderId: state.orderId || `order_${Date.now()}`,
            totalItems: state.items.length.toString(),
            subtotal: state.totals.subtotal.toFixed(2),
            shipping: state.totals.shipping.toFixed(2),
            tax: state.totals.tax.toFixed(2),
            total: state.totals.total.toFixed(2),
          }
        };
      }
    }),
    {
      name: 'checkout-session',
      // Only persist essential data, not sensitive payment info
      partialize: (state) => ({
        step: state.step,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        shippingOption: state.shippingOption,
        items: state.items,
        totals: state.totals,
        collectShippingAddress: state.collectShippingAddress,
        successUrl: state.successUrl,
        cancelUrl: state.cancelUrl
      })
    }
  )
);