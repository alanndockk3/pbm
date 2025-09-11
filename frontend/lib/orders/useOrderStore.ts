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
  loadUserOrdersFromAPI: (userId: string) => Promise<void>;
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

// Fetch product image by productId
const fetchProductImage = async (productId: string): Promise<string | undefined> => {
  try {
    const response = await fetch(`/api/stripe/products/${productId}`);
    if (response.ok) {
      const product = await response.json();
      return product.images?.[0] || product.image || undefined;
    }
  } catch (error) {
    console.warn('Failed to fetch product image for:', productId, error);
  }
  return undefined;
};

// Convert Firebase webhook order to Order type
const convertWebhookOrderToOrder = async (doc: any, userId: string): Promise<Order> => {
  const data = typeof doc.data === 'function' ? doc.data() : doc.data;
  
  // Parse order items (already in correct format from webhook)
  let items: OrderItem[] = [];
  try {
    if (data.items && Array.isArray(data.items)) {
      // Fetch product images for each item
      const itemsWithImages = await Promise.all(
        data.items.map(async (item: any) => {
          const image = item.image || await fetchProductImage(item.productId || item.id);
          return {
            productId: item.productId || item.id,
            name: item.name || 'Unknown Item',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image,
            category: item.category || 'Handmade'
          };
        })
      );
      items = itemsWithImages;
    } else {
      // Fallback: create a single item from the order data if no items array
      if (data.totals && data.totals.subtotal > 0) {
        const image = await fetchProductImage(doc.id);
        items = [{
          productId: doc.id,
          name: 'Order Item',
          price: data.totals.subtotal,
          quantity: 1,
          image,
          category: 'Handmade'
        }];
      }
    }
  } catch (error) {
    console.error('Error parsing order items:', error);
    items = [];
  }
  
  // Build shipping address (already in correct format from webhook)
  const shippingAddress: OrderAddress = {
    firstName: data.shippingAddress?.firstName || 'Customer',
    lastName: data.shippingAddress?.lastName || '',
    email: data.shippingAddress?.email || data.customerEmail || '',
    phone: data.shippingAddress?.phone || '',
    address1: data.shippingAddress?.address1 || '',
    address2: data.shippingAddress?.address2 || '',
    city: data.shippingAddress?.city || '',
    state: data.shippingAddress?.state || '',
    zipCode: data.shippingAddress?.zipCode || '',
    country: data.shippingAddress?.country || 'US',
  };
  
  // Calculate estimated delivery
  const deliveryDays = data.estimatedDelivery 
    ? parseInt(data.estimatedDelivery.split('-')[1] || '7')
    : 7;
  const createdDate = data.createdAt ? new Date(data.createdAt) : new Date();
  const estimatedDelivery = new Date(createdDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();
  
  // Generate order number and confirmation
  const timestamp = createdDate.getTime().toString().slice(-6);
  const sessionShort = data.stripeSessionId?.slice(-4) || '0000';
  const orderNumber = `PBM${timestamp}${sessionShort}`;
  const confirmationNumber = data.confirmationNumber || generateSecureConfirmationNumber(userId);
  
  // Build totals (already in correct format from webhook)
  const totals: OrderTotals = {
    subtotal: data.totals?.subtotal || 0,
    shipping: data.totals?.shipping || 0,
    tax: data.totals?.tax || 0,
    total: data.totals?.total || 0,
  };
  
  // Get status from webhook data
  const status: OrderStatus = data.status || 'pending';
  
  // Use statusHistory from webhook data if available, otherwise build it
  let statusHistory = data.statusHistory || [
    {
      status: status as OrderStatus,
      timestamp: createdDate.toISOString(),
      note: 'Order created via Stripe webhook'
    }
  ];
  
  // If no statusHistory exists but we have orderStatus, add it
  if (!data.statusHistory && data.orderStatus && data.orderStatus !== status) {
    statusHistory.push({
      status: data.orderStatus,
      timestamp: data.updatedAt || new Date().toISOString(),
      note: data.statusNote || `Status updated to ${data.orderStatus}`
    });
  }
  
  return {
    id: doc.id,
    orderNumber,
    confirmationNumber,
    customerId: userId,
    customerEmail: data.customerEmail || '',
    customerName: data.customerName || `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
    
    items,
    totals,
    
    shippingAddress,
    shippingMethod: data.shippingMethod || 'Standard Shipping',
    estimatedDelivery,
    
    paymentMethod: data.paymentMethod || 'Stripe Checkout',
    paymentIntentId: data.paymentIntentId || data.stripeSessionId || '',
    
    status,
    statusHistory,
    
    createdAt: createdDate.toISOString(),
    updatedAt: data.updatedAt || createdDate.toISOString(),
    
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

      loadUserOrdersFromAPI: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          
          // Fetch orders from API endpoint (uses Admin SDK with proper permissions)
          const response = await fetch(`/api/orders?userId=${userId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch orders');
          }
          
          
          // Convert API response to Order objects
          const orders = await Promise.all(
            result.orders.map(async (orderData: any) => {
              return await convertWebhookOrderToOrder({ id: orderData.id, data: orderData }, userId);
            })
          );
          
          set({ orders, isLoading: false });
          
        } catch (error) {
          console.error('Error loading orders from API:', error);
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
          if (order.paymentIntentId && (order.paymentIntentId.startsWith('cs_') || order.paymentIntentId.startsWith('pi_'))) {
            const orderRef = doc(db, 'users', order.customerId, 'orders', order.id);
            await updateDoc(orderRef, {
              trackingNumber,
              carrier: carrier || '',
              updatedAt: new Date().toISOString()
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
          
          
        } catch (error) {
          console.error('Error updating order tracking:', error);
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
          !order.paymentIntentId?.startsWith('cs_') && !order.paymentIntentId?.startsWith('pi_')
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
  const { orders, isLoading, error, loadUserOrdersFromAPI } = useOrderStore();
  
  React.useEffect(() => {
    if (userId) {
      loadUserOrdersFromAPI(userId);
    }
  }, [userId, loadUserOrdersFromAPI]);
  
  return { orders, isLoading, error };
};

export const useOrderActions = () => {
  const store = useOrderStore();
  return {
    createOrder: store.createLocalOrder,
    getOrder: store.getOrder,
    updateOrderStatus: store.updateOrderStatus,
    updateOrderTracking: store.updateOrderTracking,
    loadUserOrdersFromAPI: store.loadUserOrdersFromAPI
  };
};