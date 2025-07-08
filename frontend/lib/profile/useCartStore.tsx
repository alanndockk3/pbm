import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

// Cart item interface
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  images?: string[];
  inStock?: boolean;
  quantity: number;
  addedAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore cart item (what gets stored in Firebase)
interface FirestoreCartItem {
  productId: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  images?: string[];
  inStock?: boolean;
  quantity: number;
  addedAt: Timestamp;
  updatedAt: Timestamp;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadCart: (userId: string) => Promise<void>;
  addToCart: (userId: string, productId: string, product: Partial<CartItem>, quantity?: number) => Promise<void>;
  updateCartItemQuantity: (userId: string, productId: string, quantity: number) => Promise<void>;
  removeFromCart: (userId: string, productId: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  subscribeToCart: (userId: string) => () => void;
  
  // Computed getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadCart: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const cartRef = collection(db, 'users', userId, 'cart');
      const snapshot = await getDocs(cartRef);
      
      const items: CartItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CartItem));
      
      set({ items, loading: false });
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load cart',
        loading: false 
      });
    }
  },

  addToCart: async (userId: string, productId: string, product: Partial<CartItem>, quantity = 1) => {
    try {
      set({ loading: true, error: null });
      
      const cartRef = collection(db, 'users', userId, 'cart');
      
      // Check if item already exists in cart
      const existingItems = get().items;
      const existingItem = existingItems.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update quantity if item exists
        await get().updateCartItemQuantity(userId, productId, existingItem.quantity + quantity);
      } else {
        // Add new item to cart
        const cartItem: FirestoreCartItem = {
          productId,
          name: product.name || '',
          price: product.price || 0,
          description: product.description,
          category: product.category,
          images: product.images,
          inStock: product.inStock,
          quantity,
          addedAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };
        
        await addDoc(cartRef, cartItem);
      }
      
      set({ loading: false });
    } catch (error) {
      console.error('Error adding to cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add to cart',
        loading: false 
      });
    }
  },

  updateCartItemQuantity: async (userId: string, productId: string, quantity: number) => {
    try {
      set({ loading: true, error: null });
      
      const existingItems = get().items;
      const existingItem = existingItems.find(item => item.productId === productId);
      
      if (!existingItem) {
        throw new Error('Item not found in cart');
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await get().removeFromCart(userId, productId);
        return;
      }
      
      const cartItemRef = doc(db, 'users', userId, 'cart', existingItem.id);
      await updateDoc(cartItemRef, {
        quantity,
        updatedAt: serverTimestamp(),
      });
      
      set({ loading: false });
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update cart item',
        loading: false 
      });
    }
  },

  removeFromCart: async (userId: string, productId: string) => {
    try {
      set({ loading: true, error: null });
      
      const existingItems = get().items;
      const existingItem = existingItems.find(item => item.productId === productId);
      
      if (!existingItem) {
        throw new Error('Item not found in cart');
      }
      
      const cartItemRef = doc(db, 'users', userId, 'cart', existingItem.id);
      await deleteDoc(cartItemRef);
      
      set({ loading: false });
    } catch (error) {
      console.error('Error removing from cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove from cart',
        loading: false 
      });
    }
  },

  clearCart: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const cartRef = collection(db, 'users', userId, 'cart');
      const snapshot = await getDocs(cartRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      set({ items: [], loading: false });
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        loading: false 
      });
    }
  },

  subscribeToCart: (userId: string) => {
    const cartRef = collection(db, 'users', userId, 'cart');
    
    return onSnapshot(cartRef, 
      (snapshot) => {
        const items: CartItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CartItem));
        
        set({ items, error: null });
      },
      (error) => {
        console.error('Error in cart subscription:', error);
        set({ error: error.message });
      }
    );
  },

  // Computed getters
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartItem: (productId: string) => {
    return get().items.find(item => item.productId === productId);
  },

  isInCart: (productId: string) => {
    return get().items.some(item => item.productId === productId);
  },
}));

// Selector hooks for better performance
export const useCartItems = () => useCartStore(state => state.items);
export const useCartLoading = () => useCartStore(state => state.loading);
export const useCartError = () => useCartStore(state => state.error);
export const useCartTotalItems = () => useCartStore(state => state.getTotalItems());
export const useCartTotalPrice = () => useCartStore(state => state.getTotalPrice());
export const useIsInCart = (productId: string) => useCartStore(state => state.isInCart(productId));
export const useCartItem = (productId: string) => useCartStore(state => state.getCartItem(productId));