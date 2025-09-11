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
  Timestamp,
  getFirestore,
  getDoc
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

// Convert Firestore order to AdminOrder
const convertToAdminOrder = async (doc: any, customerId: string): Promise<AdminOrder> => {
  const data = doc.data();
  
  // Determine if this is from the new orders collection or old checkout_sessions
  const isNewOrderFormat = data.items && Array.isArray(data.items) && data.totals;
  
  // Parse order items
  let items: AdminOrder['items'] = [];
  try {
    if (data.items && Array.isArray(data.items)) {
      // Fetch product images for each item
      const itemsWithImages = await Promise.all(
        data.items.map(async (item: any) => {
          const image = item.image || await fetchProductImage(item.productId || item.id);
          return {
            id: item.productId || item.id || `item_${Date.now()}`,
            name: item.name || 'Unknown Item',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: image || undefined
          };
        })
      );
      items = itemsWithImages;
    } else if (data.metadata?.itemSummary) {
      // Fallback to metadata parsing for older orders
      const itemSummary = JSON.parse(data.metadata.itemSummary);
      const itemsWithImages = await Promise.all(
        itemSummary.map(async (item: any) => {
          const image = await fetchProductImage(item.productId || item.id);
          return {
            id: item.productId || item.id || `item_${Date.now()}`,
            name: item.name || 'Unknown Item',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: image || undefined
          };
        })
      );
      items = itemsWithImages;
    }
  } catch (error) {
    console.error('Error parsing order items:', error);
    // Fallback to basic item structure
    items = [{
      id: 'unknown',
      name: 'Order Items',
      quantity: 1,
      price: parseFloat(data.totals?.subtotal || data.metadata?.subtotal || '0'),
      image: undefined
    }];
  }
  
  // Build customer info
  const customer = {
    name: data.customerName || data.metadata?.customerName || 
           `${data.shippingAddress?.firstName || data.metadata?.shippingFirstName || ''} ${data.shippingAddress?.lastName || data.metadata?.shippingLastName || ''}`.trim() || 
           'Unknown Customer',
    email: data.customerEmail || data.metadata?.customerEmail || data.customer_email || '',
    phone: data.shippingAddress?.phone || data.metadata?.shippingPhone || undefined
  };
  
  // Build shipping address
  const shippingAddress = {
    name: customer.name,
    address1: data.shippingAddress?.address1 || data.metadata?.shippingAddress1 || '',
    address2: data.shippingAddress?.address2 || data.metadata?.shippingAddress2 || undefined,
    city: data.shippingAddress?.city || data.metadata?.shippingCity || '',
    state: data.shippingAddress?.state || data.metadata?.shippingState || '',
    zipCode: data.shippingAddress?.zipCode || data.metadata?.shippingZip || '',
    country: data.shippingAddress?.country || data.metadata?.shippingCountry || 'US'
  };
  
  // Parse dates
  const createdDate = data.createdAt ? new Date(data.createdAt) : (data.created?.toDate ? data.created.toDate() : new Date());
  const updatedDate = data.updatedAt ? new Date(data.updatedAt) : (data.updated?.toDate ? data.updated.toDate() : createdDate);
  
  // Calculate estimated delivery
  let estimatedDelivery: Date | undefined;
  if (data.estimatedDelivery) {
    estimatedDelivery = new Date(data.estimatedDelivery);
  } else if (data.metadata?.estimatedDeliveryDays) {
    const days = parseInt(data.metadata.estimatedDeliveryDays.split('-')[1] || '7');
    estimatedDelivery = new Date(createdDate.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  // Generate order number
  const timestamp = createdDate.getTime().toString().slice(-6);
  const sessionShort = (data.stripeSessionId || data.sessionId || doc.id).slice(-4);
  const orderNumber = data.orderNumber || `PBM${timestamp}${sessionShort}`;
  
  // Determine payment status
  let paymentStatus: AdminOrder['paymentStatus'] = 'pending';
  if (data.payment_status === 'paid' || data.status === 'complete' || data.status === 'completed') {
    paymentStatus = 'paid';
  } else if (data.payment_status === 'failed') {
    paymentStatus = 'failed';
  }
  
  // Determine order status
  let status: AdminOrder['status'] = 'confirmed';
  if (data.status) {
    status = data.status;
  } else if (data.orderStatus) {
    status = data.orderStatus;
  } else if (data.payment_status === 'paid') {
    status = 'confirmed';
  }
  
  // Parse totals
  const subtotal = data.totals?.subtotal || parseFloat(data.metadata?.subtotal || '0');
  const shipping = data.totals?.shipping || parseFloat(data.metadata?.shipping || '0');
  const tax = data.totals?.tax || parseFloat(data.metadata?.tax || '0');
  const total = data.totals?.total || parseFloat(data.metadata?.total || data.amount_total?.toString() || '0') / (data.amount_total ? 100 : 1);
  
  return {
    id: doc.id,
    orderNumber,
    customerId, // This should be the actual user ID, not the session ID
    sessionId: data.stripeSessionId || data.sessionId,
    paymentIntentId: data.paymentIntentId || data.payment_intent,
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
    carrier: data.carrier,
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
          
          // Use collectionGroup to get all orders from all users
          const ordersQuery = query(
            collectionGroup(db, 'orders'),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(ordersQuery);
          
          const orders: AdminOrder[] = [];
          
          // Convert all orders asynchronously
          const orderPromises = querySnapshot.docs.map(async (doc) => {
            try {
              // Extract customer ID from the document path
              const pathParts = doc.ref.path.split('/');
              const customerId = pathParts[1]; // users/{customerId}/orders/{orderId}
              
              
              const order = await convertToAdminOrder(doc, customerId);
              
              // Only include orders with valid items and customer info
              if (order.items.length > 0 && order.customer.email) {
                return order;
              }
              return null;
            } catch (error) {
              console.error('Error converting order:', doc.id, error);
              return null;
            }
          });
          
          const resolvedOrders = await Promise.all(orderPromises);
          const validOrders = resolvedOrders.filter((order): order is AdminOrder => order !== null);
          
          // Deduplicate orders by ID, prioritizing newer orders (from orders collection over checkout_sessions)
          const uniqueOrders = validOrders.reduce((acc, order) => {
            const existingIndex = acc.findIndex(existingOrder => existingOrder.id === order.id);
            if (existingIndex === -1) {
              acc.push(order);
            } else {
              // If we find a duplicate, keep the one with more complete data (newer format)
              const existingOrder = acc[existingIndex];
              const isNewerFormat = order.items.some(item => item.image !== undefined) || 
                                   (order.sessionId && order.sessionId.startsWith('cs_'));
              
              if (isNewerFormat) {
                console.warn(`Replacing duplicate order ${order.id} with newer format`);
                acc[existingIndex] = order;
              } else {
                console.warn(`Skipping duplicate order ${order.id} (keeping existing newer format)`);
              }
            }
            return acc;
          }, [] as AdminOrder[]);
          
          set({ orders: uniqueOrders, loading: false });
          
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
          
          // Check if customerId looks like a session ID (starts with cs_)
          if (customerId.startsWith('cs_')) {
            console.error(`Invalid customerId detected: ${customerId}. This looks like a session ID, not a user ID.`);
            
            // Try to find the correct user ID by looking up the order in the global orders collection
            try {
              const globalOrderRef = doc(db, 'orders', orderId);
              const globalOrderDoc = await getDoc(globalOrderRef);
              
              if (globalOrderDoc.exists()) {
                const globalOrderData = globalOrderDoc.data();
                const correctUserId = globalOrderData?.customerId;
                
                if (correctUserId && !correctUserId.startsWith('cs_')) {
                  
                  // Update the order in the correct location
                  const correctOrderRef = doc(db, 'users', correctUserId, 'orders', orderId);
                  
                  // Get current order data to preserve existing statusHistory
                  const currentOrderDoc = await getDoc(correctOrderRef);
                  const currentData = currentOrderDoc.exists() ? currentOrderDoc.data() : {};
                  
                  // Build status history array
                  const existingStatusHistory = currentData.statusHistory || [];
                  const newStatusUpdate = {
                    status: status,
                    timestamp: new Date().toISOString(),
                    note: note || `Status updated to ${status} by admin`,
                    updatedBy: 'admin'
                  };
                  
                  const updateData: any = {
                    status: status,
                    statusHistory: [...existingStatusHistory, newStatusUpdate],
                    updatedAt: new Date().toISOString()
                  };
                  
                  await updateDoc(correctOrderRef, updateData);
                  
                  // Also update the global order
                  await updateDoc(globalOrderRef, updateData);
                  
                  // Update local state
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
                  
                  return; // Success, exit early
                }
              }
            } catch (lookupError) {
              console.error('Error looking up correct user ID:', lookupError);
            }
            
            throw new Error(`Invalid customer ID: ${customerId}. Expected user ID but got session ID. Please contact support to fix this order.`);
          }
          
          // Update in Firestore
          const orderRef = doc(db, 'users', customerId, 'orders', orderId);
          
          // Get current order data to preserve existing statusHistory
          const currentOrderDoc = await getDoc(orderRef);
          const currentData = currentOrderDoc.exists() ? currentOrderDoc.data() : {};
          
          // Build status history array
          const existingStatusHistory = currentData.statusHistory || [];
          const newStatusUpdate = {
            status: status,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${status} by admin`,
            updatedBy: 'admin'
          };
          
          const updateData: any = {
            status: status,
            statusHistory: [...existingStatusHistory, newStatusUpdate],
            updatedAt: new Date().toISOString()
          };
          
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
          
          
        } catch (error) {
          console.error('Error updating order status:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update order status' });
          throw error;
        }
      },

      updateOrderTracking: async (orderId: string, customerId: string, trackingNumber: string, carrier?: string) => {
        try {
          
          // Check if customerId looks like a session ID (starts with cs_)
          if (customerId.startsWith('cs_')) {
            console.error(`Invalid customerId detected: ${customerId}. This looks like a session ID, not a user ID.`);
            
            // Try to find the correct user ID by looking up the order in the global orders collection
            try {
              const globalOrderRef = doc(db, 'orders', orderId);
              const globalOrderDoc = await getDoc(globalOrderRef);
              
              if (globalOrderDoc.exists()) {
                const globalOrderData = globalOrderDoc.data();
                const correctUserId = globalOrderData?.customerId;
                
                if (correctUserId && !correctUserId.startsWith('cs_')) {
                  
                  // Update the order in the correct location
                  const correctOrderRef = doc(db, 'users', correctUserId, 'orders', orderId);
                  
                  // Get current order data to preserve existing statusHistory
                  const currentOrderDoc = await getDoc(correctOrderRef);
                  const currentData = currentOrderDoc.exists() ? currentOrderDoc.data() : {};
                  
                  // Build status history array
                  const existingStatusHistory = currentData.statusHistory || [];
                  const currentOrder = get().orders.find(o => o.id === orderId);
                  
                  const updateData: any = {
                    trackingNumber,
                    updatedAt: new Date().toISOString()
                  };
                  
                  if (carrier) {
                    updateData.carrier = carrier;
                  }
                  
                  // Also update status to shipped if it's not already shipped or delivered
                  if (currentOrder && !['shipped', 'delivered'].includes(currentOrder.status)) {
                    updateData.status = 'shipped';
                    
                    // Add status update to history
                    const newStatusUpdate = {
                      status: 'shipped',
                      timestamp: new Date().toISOString(),
                      note: `Order shipped with tracking number ${trackingNumber}${carrier ? ` via ${carrier}` : ''}`,
                      updatedBy: 'admin'
                    };
                    updateData.statusHistory = [...existingStatusHistory, newStatusUpdate];
                  }
                  
                  await updateDoc(correctOrderRef, updateData);
                  
                  // Also update the global order
                  await updateDoc(globalOrderRef, updateData);
                  
                  // Update local state
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
                  
                  return; // Success, exit early
                }
              }
            } catch (lookupError) {
              console.error('Error looking up correct user ID:', lookupError);
            }
            
            throw new Error(`Invalid customer ID: ${customerId}. Expected user ID but got session ID. Please contact support to fix this order.`);
          }
          
          // Update in Firestore
          const orderRef = doc(db, 'users', customerId, 'orders', orderId);
          
          // Get current order data to preserve existing statusHistory
          const currentOrderDoc = await getDoc(orderRef);
          const currentData = currentOrderDoc.exists() ? currentOrderDoc.data() : {};
          
          // Build status history array
          const existingStatusHistory = currentData.statusHistory || [];
          const currentOrder = get().orders.find(o => o.id === orderId);
          
          const updateData: any = {
            trackingNumber,
            updatedAt: new Date().toISOString()
          };
          
          if (carrier) {
            updateData.carrier = carrier;
          }
          
          // Also update status to shipped if it's not already shipped or delivered
          if (currentOrder && !['shipped', 'delivered'].includes(currentOrder.status)) {
            updateData.status = 'shipped';
            
            // Add status update to history
            const newStatusUpdate = {
              status: 'shipped',
              timestamp: new Date().toISOString(),
              note: `Order shipped with tracking number ${trackingNumber}${carrier ? ` via ${carrier}` : ''}`,
              updatedBy: 'admin'
            };
            updateData.statusHistory = [...existingStatusHistory, newStatusUpdate];
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

        
        const ordersQuery = query(
          collectionGroup(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribeRealtime = onSnapshot(
          ordersQuery,
          async (snapshot) => {
            try {
              
              // Convert all orders asynchronously
              const orderPromises = snapshot.docs.map(async (doc) => {
                try {
                  const pathParts = doc.ref.path.split('/');
                  const customerId = pathParts[1];
                  
                  
                  const order = await convertToAdminOrder(doc, customerId);
                  
                  if (order.items.length > 0 && order.customer.email) {
                    return order;
                  }
                  return null;
                } catch (error) {
                  console.error('Error converting realtime order:', doc.id, error);
                  return null;
                }
              });
              
              const resolvedOrders = await Promise.all(orderPromises);
              const validOrders = resolvedOrders.filter((order): order is AdminOrder => order !== null);
              
              // Deduplicate orders by ID, prioritizing newer orders
              const orders = validOrders.reduce((acc, order) => {
                const existingIndex = acc.findIndex(existingOrder => existingOrder.id === order.id);
                if (existingIndex === -1) {
                  acc.push(order);
                } else {
                  // If we find a duplicate, keep the one with more complete data (newer format)
                  const existingOrder = acc[existingIndex];
                  const isNewerFormat = order.items.some(item => item.image !== undefined) || 
                                       (order.sessionId && order.sessionId.startsWith('cs_'));
                  
                  if (isNewerFormat) {
                    console.warn(`Replacing duplicate order ${order.id} with newer format in realtime update`);
                    acc[existingIndex] = order;
                  } else {
                    console.warn(`Skipping duplicate order ${order.id} in realtime update (keeping existing newer format)`);
                  }
                }
                return acc;
              }, [] as AdminOrder[]);
              
              
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