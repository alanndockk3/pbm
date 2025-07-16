// lib/checkout/useCheckoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  CheckoutSession, 
  CheckoutShippingAddress, 
  BillingAddress, 
  ShippingOption, 
  PaymentMethod, 
  OrderItem, 
  OrderTotals 
} from './types';

interface CheckoutState extends CheckoutSession {
  // Actions
  setStep: (step: CheckoutSession['step']) => void;
  setShippingAddress: (address: CheckoutShippingAddress) => void; // Changed this line
  setBillingAddress: (address: Partial<BillingAddress>) => void;
  setShippingOption: (option: ShippingOption) => void;
  setPaymentMethod: (method: Partial<PaymentMethod>) => void;
  setItems: (items: OrderItem[]) => void;
  updateTotals: (totals: Partial<OrderTotals>) => void;
  setPaymentIntentId: (id: string) => void;
  setOrderId: (id: string) => void;
  resetCheckout: () => void;
  
  // Computed
  isStepValid: (step: number) => boolean;
  canProceedToNext: () => boolean;
}

const initialState: CheckoutSession = {
  step: 1,
  shippingAddress: {}, // This is now CheckoutShippingAddress (all optional)
  billingAddress: { sameAsShipping: true },
  shippingOption: null,
  paymentMethod: {},
  items: [],
  totals: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  }
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

      resetCheckout: () => set(initialState),

      // Validation helpers
      isStepValid: (step) => {
        const state = get();
        
        switch (step) {
          case 1: // Shipping
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
        totals: state.totals
      })
    }
  )
);