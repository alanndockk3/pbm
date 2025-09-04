// lib/admin/useAdminOrderStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  collection, 
  collectionGroup,
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  onSnapshot,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

// Admin-specific order interface that matches your existing structure
export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: Date;
  updatedDate: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
  // Additional fields for admin
  customerId: string;
  sessionId?: string;
  paymentIntentId?: string;
  carrier?: string;
}

interface AdminOrderState {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
  realTimeActive: boolean;
  
  // Actions
  loadAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, customerId: string, status: AdminOrder['status'], note?: string) => Promise<void>;
  updateOrderTracking: (orderId: string, customerId: string, trackingNumber: string, carrier?: string) => Promise<void>;
  setupRealtimeListener: () => () => void;
  stopRealtimeListener: () => void;
  setError: (error: string | null) => void;
}

// Convert Firestore checkout session to AdminOrder
const convertToAdminOrder = (doc: any, customerId: string): AdminOrder => {
  const data = doc.data();
  
  // Parse order items
  let items: AdminOrder['items'] = [];
  try {
    if (data.metadata?.itemSummary) {
      const itemSummary = JSON.parse(data.metadata.itemSummary);
      items = itemSummary.map((item: any) => ({
        id: item.productId || item.id || `item_${Date.now()}`,
        name: item.name || 'Unknown Item',
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: null // Image URLs are not stored in metadata to stay under 500 chars
      }));
    }
  } catch (error) {
    console.error('Error parsing order items:', error);
    // Fallback to basic item structure
    items = [{
      id: 'unknown',
      name: 'Order Items',
      quantity: 1,
      price: parseFloat(data.metadata?.subtotal || '0'),
      image: ''
    }];
  }
  
  // Build customer info
  const customer = {
    name: data.metadata?.customerName || 
           `${data.metadata?.shippingFirstName || ''} ${data.metadata?.shippingLastName || ''}`.trim() || 
           'Unknown Customer',
    email: data.metadata?.customerEmail || data.customer_email || '',
    phone: data.metadata?.shippingPhone || undefined
  };
  
  // Build shipping address
  const shippingAddress = {
    name: customer.name,
    address1: data.metadata?.shippingAddress1 || '',
    address2: data.metadata?.shippingAddress2 || undefined,
    city: data.metadata?.shippingCity || '',
    state: data.metadata?.shippingState || '',
    zipCode: data.metadata?.shippingZip || '',
    country: data.metadata?.shippingCountry || 'US'
  };
  
  // Parse dates
  const createdDate = data.created?.toDate ? data.created.toDate() : new Date();
  const updatedDate = data.updated?.toDate ? data.updated.toDate() : createdDate;
  
  // Calculate estimated delivery
  let estimatedDelivery: Date | undefined;
  if (data.metadata?.estimatedDeliveryDays) {
    const days = parseInt(data.metadata.estimatedDeliveryDays.split('-')[1] || '7');
    estimatedDelivery = new Date(createdDate.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  // Generate order number
  const timestamp = createdDate.getTime().toString().slice(-6);
  const sessionShort = (data.sessionId || doc.id).slice(-4);
  const orderNumber = `PBM${timestamp}${sessionShort}`;
  
  // Determine payment status
  let paymentStatus: AdminOrder['paymentStatus'] = 'pending';
  if (data.payment_status === 'paid' || data.status === 'complete') {
    paymentStatus = 'paid';
  } else if (data.payment_status === 'failed') {
    paymentStatus = 'failed';
  }
  
  // Determine order status
  let status: AdminOrder['status'] = 'confirmed';
  if (data.orderStatus) {
    status = data.orderStatus;
  } else if (data.payment_status === 'paid') {
    status = 'confirmed';
  }
  
  // Parse totals
  const subtotal = parseFloat(data.metadata?.subtotal || '0');
  const shipping = parseFloat(data.metadata?.shipping || '0');
  const tax = parseFloat(data.metadata?.tax || '0');
  const total = parseFloat(data.metadata?.total || data.amount_total?.toString() || '0') / (data.amount_total ? 100 : 1);
  
  return {
    id: doc.id,
    orderNumber,
    customerId,
    sessionId: data.sessionId,
    paymentIntentId: data.payment_intent,
    customer,
    items,
    status,
    paymentStatus,
    total,
    subtotal,
    shipping,
    tax,
    shippingAddress,
    orderDate: createdDate,
    updatedDate: updatedDate,
    estimatedDelivery,
    trackingNumber: data.trackingNumber,
    notes: data.notes
  };
};

let unsubscribeRealtime: (() => void) | null = null;

export const useAdminOrderStore = create<AdminOrderState>()(
  devtools(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,
      realTimeActive: false,

      loadAllOrders: async () => {
        set({ loading: true, error: null });
        
        try {
          console.log('Loading all orders for admin...');
          
          // Use collectionGroup to get all checkout_sessions from all users
          const ordersQuery = query(
            collectionGroup(db, 'checkout_sessions'),
            orderBy('created', 'desc')
          );
          
          const querySnapshot = await getDocs(ordersQuery);
          console.log(`Found ${querySnapshot.size} checkout sessions`);
          
          const orders: AdminOrder[] = [];
          
          querySnapshot.forEach((doc) => {
            try {
              // Extract customer ID from the document path
              const pathParts = doc.ref.path.split('/');
              const customerId = pathParts[1]; // users/{customerId}/checkout_sessions/{sessionId}
              
              const order = convertToAdminOrder(doc, customerId);
              
              // Only include orders with valid items and customer info
              if (order.items.length > 0 && order.customer.email) {
                orders.push(order);
              }
            } catch (error) {
              console.error('Error converting order:', doc.id, error);
            }
          });
          
          console.log(`Loaded ${orders.length} valid orders`);
          set({ orders, loading: false });
          
        } catch (error) {
          console.error('Error loading orders:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load orders',
            loading: false 
          });
        }
      },

      updateOrderStatus: async (orderId: string, customerId: string, status: AdminOrder['status'], note?: string) => {
        try {
          console.log(`Updating order ${orderId} status to ${status}`);
          
          // Update in Firestore
          const orderRef = doc(db, 'users', customerId, 'checkout_sessions', orderId);
          const updateData: any = {
            orderStatus: status,
            updated: Timestamp.now()
          };
          
          if (note) {
            updateData.statusNote = note;
          }
          
          await updateDoc(orderRef, updateData);
          
          // Update local state immediately for better UX
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    status, 
                    updatedDate: new Date(),
                    notes: note || order.notes
                  }
                : order
            )
          }));
          
          // Small delay to ensure local update is processed before real-time listener
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('Order status updated successfully');
          
        } catch (error) {
          console.error('Error updating order status:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update order status' });
          throw error;
        }
      },

      updateOrderTracking: async (orderId: string, customerId: string, trackingNumber: string, carrier?: string) => {
        try {
          console.log(`Updating tracking for order ${orderId}`);
          
          // Update in Firestore
          const orderRef = doc(db, 'users', customerId, 'checkout_sessions', orderId);
          const updateData: any = {
            trackingNumber,
            updated: Timestamp.now()
          };
          
          if (carrier) {
            updateData.carrier = carrier;
          }
          
          // Also update status to shipped if it's not already shipped or delivered
          const currentOrder = get().orders.find(o => o.id === orderId);
          if (currentOrder && !['shipped', 'delivered'].includes(currentOrder.status)) {
            updateData.orderStatus = 'shipped';
          }
          
          await updateDoc(orderRef, updateData);
          
          // Update local state immediately for better UX
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    trackingNumber,
                    status: (!['shipped', 'delivered'].includes(order.status)) ? 'shipped' : order.status,
                    updatedDate: new Date()
                  }
                : order
            )
          }));
          
          // Small delay to ensure local update is processed before real-time listener
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('Order tracking updated successfully');
          
        } catch (error) {
          console.error('Error updating order tracking:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update tracking' });
          throw error;
        }
      },

      setupRealtimeListener: () => {
        if (unsubscribeRealtime) {
          unsubscribeRealtime();
        }

        console.log('Setting up realtime listener for admin orders');
        
        const ordersQuery = query(
          collectionGroup(db, 'checkout_sessions'),
          orderBy('created', 'desc')
        );
        
        unsubscribeRealtime = onSnapshot(
          ordersQuery,
          (snapshot) => {
            try {
              console.log('Realtime update: processing', snapshot.size, 'checkout sessions');
              
              const orders: AdminOrder[] = [];
              
              snapshot.forEach((doc) => {
                try {
                  const pathParts = doc.ref.path.split('/');
                  const customerId = pathParts[1];
                  
                  const order = convertToAdminOrder(doc, customerId);
                  
                  if (order.items.length > 0 && order.customer.email) {
                    orders.push(order);
                  }
                } catch (error) {
                  console.error('Error converting realtime order:', doc.id, error);
                }
              });
              
              console.log(`Realtime update: ${orders.length} valid orders`);
              
              // Only update if the orders have actually changed to avoid overriding local updates
              const currentOrders = get().orders;
              const hasChanged = orders.length !== currentOrders.length || 
                orders.some((newOrder, index) => {
                  const currentOrder = currentOrders[index];
                  return !currentOrder || 
                    newOrder.status !== currentOrder.status ||
                    newOrder.trackingNumber !== currentOrder.trackingNumber ||
                    newOrder.updatedDate.getTime() !== currentOrder.updatedDate.getTime();
                });
              
              if (hasChanged) {
                set({ orders, realTimeActive: true, error: null });
              } else {
                set({ realTimeActive: true, error: null });
              }
              
            } catch (error) {
              console.error('Error in realtime listener:', error);
              set({ error: 'Failed to sync with database' });
            }
          },
          (error) => {
            console.error('Realtime listener error:', error);
            set({ 
              error: 'Lost connection to database',
              realTimeActive: false 
            });
          }
        );

        set({ realTimeActive: true });
        return unsubscribeRealtime;
      },

      stopRealtimeListener: () => {
        if (unsubscribeRealtime) {
          unsubscribeRealtime();
          unsubscribeRealtime = null;
        }
        set({ realTimeActive: false });
      },

      setError: (error) => set({ error })
    }),
    {
      name: 'admin-order-store'
    }
  )
);

// Cleanup function
export const cleanupAdminOrderStore = () => {
  useAdminOrderStore.getState().stopRealtimeListener();
};

// Custom hooks for easier usage
export const useAdminOrders = () => {
  const store = useAdminOrderStore();
  return {
    orders: store.orders,
    loading: store.loading,
    error: store.error,
    realTimeActive: store.realTimeActive
  };
};

export const useAdminOrderActions = () => {
  const store = useAdminOrderStore();
  return {
    loadAllOrders: store.loadAllOrders,
    updateOrderStatus: store.updateOrderStatus,
    updateOrderTracking: store.updateOrderTracking,
    setupRealtimeListener: store.setupRealtimeListener,
    stopRealtimeListener: store.stopRealtimeListener
  };
};