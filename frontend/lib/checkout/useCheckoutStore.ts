// lib/checkout/useCheckoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderItem, OrderTotals } from '../../types/order';

export interface CheckoutSession {
  // Cart items
  items: OrderItem[];
  
  // Calculated totals
  totals: OrderTotals;
  
  // URLs for Stripe
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutState extends CheckoutSession {
  // Actions
  setItems: (items: OrderItem[]) => void;
  updateTotals: (totals: Partial<OrderTotals>) => void;
  resetCheckout: () => void;
  
  // Stripe Checkout Session helpers
  getStripeCheckoutSessionData: () => any;
}

const initialState: CheckoutSession = {
  items: [],
  totals: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  },
  successUrl: typeof window !== 'undefined' ? window.location.origin + '/dashboard/checkout/success' : '',
  cancelUrl: typeof window !== 'undefined' ? window.location.origin + '/dashboard/checkout/cancelled' : ''
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setItems: (items) => {
        set({ items });
        // Only calculate subtotal - let Stripe handle shipping and tax
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ totals: { subtotal, shipping: 0, tax: 0, total: 0 } });
      },

      updateTotals: (newTotals) => 
        set((state) => {
          const totals = { ...state.totals, ...newTotals };
          // Don't recalculate total - let Stripe handle it
          return { totals };
        }),

      resetCheckout: () => set(initialState),

      // Helper to get Stripe Checkout Session data
      getStripeCheckoutSessionData: () => {
        const state = get();
        
        return {
          collect_shipping_address: true, // Always collect shipping via Stripe
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
          // Add customer email if available
          customer_email: undefined, // Will be collected by Stripe
          // Add metadata for order tracking
          metadata: {
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
      name: 'checkout-store',
      // Only persist essential data, not sensitive payment info
      partialize: (state) => ({
        items: state.items,
        totals: state.totals,
        successUrl: state.successUrl,
        cancelUrl: state.cancelUrl,
      })
    }
  )
);