// lib/orders/useOrderStore.ts - Updated to use checkout sessions
import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';
import type { Order, OrderStatus, OrderItem, OrderTotals, OrderAddress } from '../../types/order';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUserOrdersFromFirebase: (userId: string) => Promise<void>;
  createLocalOrder: (orderData: Partial<Order>) => Promise<string>; // Keep for testing
  getOrder: (orderId: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, carrier?: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Secure confirmation number generator using crypto API + timestamp + user ID
const generateSecureConfirmationNumber = (userId: string): string => {
  // Use crypto.getRandomValues for cryptographically secure random numbers
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  
  // Convert to base36 and take first 4 chars
  const randomPart = Array.from(array)
    .map(b => b.toString(36))
    .join('')
    .slice(0, 4)
    .toUpperCase();
  
  // Add timestamp component (last 4 digits of timestamp)
  const timestamp = Date.now().toString().slice(-4);
  
  // Add user ID component (first 2 chars of user ID hash)
  const userHash = Array.from(userId)
    .reduce((hash, char) => hash + char.charCodeAt(0), 0)
    .toString(36)
    .slice(0, 2)
    .toUpperCase();
  
  return `${randomPart}${timestamp}${userHash}`;
};

// Convert Firebase checkout session to Order type
const convertCheckoutSessionToOrder = (doc: any, userId: string): Order => {
  const data = doc.data();
  
  // Parse order items
  let items: OrderItem[] = [];
  try {
    if (data.metadata?.orderItems) {
      items = JSON.parse(data.metadata.orderItems);
    } else if (data.line_items) {
      items = data.line_items.map((item: any, index: number) => ({
        productId: item.price_data?.product_data?.metadata?.product_id || `item_${index}`,
        name: item.price_data?.product_data?.name || `Item ${index + 1}`,
        price: (item.price_data?.unit_amount || 0) / 100,
        quantity: item.quantity || 1,
        image: item.price_data?.product_data?.metadata?.image_url || '',
        category: 'Handmade'
      }));
    }
  } catch (error) {
    console.error('Error parsing order items:', error);
    items = [];
  }
  
  // Build shipping address
  const shippingAddress: OrderAddress = {
    firstName: data.metadata?.shippingFirstName || 'Customer',
    lastName: data.metadata?.shippingLastName || '',
    email: data.metadata?.customerEmail || data.customer_email || '',
    phone: data.metadata?.shippingPhone || '',
    address1: data.metadata?.shippingAddress1 || '',
    address2: data.metadata?.shippingAddress2 || '',
    city: data.metadata?.shippingCity || '',
    state: data.metadata?.shippingState || '',
    zipCode: data.metadata?.shippingZip || '',
    country: data.metadata?.shippingCountry || 'US',
  };
  
  // Calculate estimated delivery
  const deliveryDays = data.metadata?.estimatedDeliveryDays 
    ? parseInt(data.metadata.estimatedDeliveryDays.split('-')[1] || '7')
    : 7;
  const createdDate = data.created?.toDate ? data.created.toDate() : new Date();
  const estimatedDelivery = new Date(createdDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();
  
  // Generate order number and confirmation
  const timestamp = createdDate.getTime().toString().slice(-6);
  const sessionShort = data.sessionId?.slice(-4) || '0000';
  const orderNumber = `PBM${timestamp}${sessionShort}`;
  const confirmationNumber = data.confirmationNumber || generateSecureConfirmationNumber(userId);
  
  // Build totals
  const totals: OrderTotals = {
    subtotal: parseFloat(data.metadata?.subtotal || '0'),
    shipping: parseFloat(data.metadata?.originalShipping || '0'),
    tax: parseFloat(data.metadata?.originalTax || '0'),
    total: parseFloat(data.metadata?.originalTotal || '0'),
  };
  
  return {
    id: doc.id,
    orderNumber,
    confirmationNumber,
    customerId: userId,
    customerEmail: data.metadata?.customerEmail || data.customer_email || '',
    customerName: data.metadata?.customerName || `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
    
    items,
    totals,
    
    shippingAddress,
    shippingMethod: data.metadata?.shippingMethod || 'Standard Shipping',
    estimatedDelivery,
    
    paymentMethod: 'Stripe Checkout',
    paymentIntentId: data.sessionId || '',
    
    status: 'confirmed' as OrderStatus,
    statusHistory: [
      {
        status: 'confirmed' as OrderStatus,
        timestamp: createdDate.toISOString(),
        note: 'Payment confirmed via Stripe'
      }
    ],
    
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    
    trackingNumber: data.trackingNumber,
    carrier: data.carrier
  };
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      loadUserOrdersFromFirebase: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔍 Loading orders from Firebase for user:', userId);
          
          // Query checkout sessions from Firebase
          const sessionsRef = collection(db, 'users', userId, 'checkout_sessions');
          const q = query(sessionsRef, orderBy('created', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const orders = querySnapshot.docs
            .map(doc => convertCheckoutSessionToOrder(doc, userId))
            .filter(order => order.items.length > 0); // Only include orders with items
          
          set({ orders, isLoading: false });
          console.log(`✅ Loaded ${orders.length} orders from Firebase`);
          
        } catch (error) {
          console.error('❌ Error loading orders from Firebase:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load orders',
            isLoading: false 
          });
        }
      },

      // Keep the local order creation for testing/simulation
      createLocalOrder: async (orderData) => {
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const orderNumber = `PBM${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
        const confirmationNumber = generateSecureConfirmationNumber(orderData.customerId || 'test');
        const now = new Date().toISOString();
        
        const newOrder: Order = {
          id: orderId,
          orderNumber,
          confirmationNumber,
          customerId: orderData.customerId || '',
          customerEmail: orderData.customerEmail || '',
          customerName: orderData.customerName || '',
          
          items: orderData.items || [],
          totals: orderData.totals || {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0
          },
          
          shippingAddress: orderData.shippingAddress || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address1: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US'
          },
          shippingMethod: orderData.shippingMethod || 'Standard Shipping',
          estimatedDelivery: orderData.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          
          paymentMethod: orderData.paymentMethod || 'Test Payment',
          paymentIntentId: orderData.paymentIntentId,
          
          status: 'confirmed',
          statusHistory: [
            {
              status: 'confirmed',
              timestamp: now,
              note: 'Order created locally'
            }
          ],
          
          createdAt: now,
          updatedAt: now,
          
          trackingNumber: orderData.trackingNumber,
          carrier: orderData.carrier
        };
        
        set(state => ({
          orders: [newOrder, ...state.orders]
        }));
        
        console.log('✅ Local order created:', orderId);
        return orderId;
      },

      getOrder: (orderId) => {
        const { orders } = get();
        return orders.find(order => order.id === orderId) || null;
      },

      updateOrderStatus: (orderId, status, note) => {
        set(state => ({
          orders: state.orders.map(order => 
            order.id === orderId 
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  statusHistory: [
                    ...order.statusHistory,
                    {
                      status,
                      timestamp: new Date().toISOString(),
                      note: note || `Order ${status}`
                    }
                  ]
                }
              : order
          )
        }));
      },

      updateOrderTracking: async (orderId, trackingNumber, carrier) => {
        try {
          const order = get().getOrder(orderId);
          if (!order) throw new Error('Order not found');
          
          // Update Firebase if this is a real order (has sessionId)
          if (order.paymentIntentId && order.paymentIntentId.startsWith('cs_')) {
            const orderRef = doc(db, 'users', order.customerId, 'checkout_sessions', order.id);
            await updateDoc(orderRef, {
              trackingNumber,
              carrier: carrier || '',
              updatedAt: new Date()
            });
          }
          
          // Update local state
          set(state => ({
            orders: state.orders.map(o => 
              o.id === orderId 
                ? { ...o, trackingNumber, carrier, updatedAt: new Date().toISOString() }
                : o
            )
          }));
          
          console.log('✅ Order tracking updated');
          
        } catch (error) {
          console.error('❌ Error updating order tracking:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update tracking' });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'orders-store',
      partialize: (state) => ({
        orders: state.orders.filter(order => 
          // Only persist local/test orders, not Firebase orders
          !order.paymentIntentId?.startsWith('cs_')
        )
      })
    }
  )
);

// Custom hooks for easier usage
export const useOrders = () => {
  const store = useOrderStore();
  return {
    orders: store.orders,
    isLoading: store.isLoading,
    error: store.error
  };
};

export const useUserOrders = (userId: string | null) => {
  const { orders, isLoading, error, loadUserOrdersFromFirebase } = useOrderStore();
  
  React.useEffect(() => {
    if (userId) {
      loadUserOrdersFromFirebase(userId);
    }
  }, [userId, loadUserOrdersFromFirebase]);
  
  return { orders, isLoading, error };
};

export const useOrderActions = () => {
  const store = useOrderStore();
  return {
    createOrder: store.createLocalOrder, // For testing
    getOrder: store.getOrder,
    updateOrderStatus: store.updateOrderStatus,
    updateOrderTracking: store.updateOrderTracking,
    loadUserOrdersFromFirebase: store.loadUserOrdersFromFirebase
  };
};