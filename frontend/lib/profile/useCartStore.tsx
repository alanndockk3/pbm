// Firebase-connected cart store
// Replace your local cart store with this version

import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

// Cart item interface
export interface CartItem {
  id: string; // This will be the productId
  productId: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string; // Single image URL
  inStock?: boolean;
  quantity: number;
  addedAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Firestore cart item (what gets stored in Firebase)
interface FirestoreCartItem {
  productId: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
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
  addToCart: (userId: string, product: any, quantity?: number) => Promise<void>;
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
      console.log('Loading cart for user:', userId);
      set({ loading: true, error: null });
      
      const cartRef = collection(db, 'users', userId, 'cart');
      const snapshot = await getDocs(cartRef);
      
      const items: CartItem[] = snapshot.docs.map(doc => ({
        id: doc.id, // Document ID is the productId
        productId: doc.id, // Same as document ID
        ...doc.data()
      } as CartItem));
      
      console.log('Loaded cart items from Firebase:', items);
      set({ items, loading: false });
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load cart',
        loading: false 
      });
    }
  },

  addToCart: async (userId: string, product: any, quantity = 1) => {
    try {
      console.log('Adding to cart:', { userId, productId: product.id, quantity });
      set({ loading: true, error: null });
      
      const productId = product.id;
      const cartItemRef = doc(db, 'users', userId, 'cart', productId);
      
      // Check if item already exists
      const existingDoc = await getDoc(cartItemRef);
      
      if (existingDoc.exists()) {
        // Update existing item quantity
        const existingData = existingDoc.data() as FirestoreCartItem;
        const newQuantity = existingData.quantity + quantity;
        
        await updateDoc(cartItemRef, {
          quantity: newQuantity,
          updatedAt: serverTimestamp(),
        });
        
        console.log('Updated existing cart item quantity to:', newQuantity);
      } else {
        // Create new cart item with productId as document ID
        const cartItem: FirestoreCartItem = {
          productId: productId,
          name: product.name || '',
          price: product.price || 0,
          description: product.description,
          category: product.category,
          image: product.image, // Single image
          inStock: product.inStock !== false, // Default to true if not specified
          quantity: quantity,
          addedAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };
        
        await setDoc(cartItemRef, cartItem);
        console.log('Created new cart item in Firebase:', cartItem);
      }
      
      // Reload cart to get updated data (optional - real-time listener will handle this)
      // await get().loadCart(userId);
      set({ loading: false });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add to cart',
        loading: false 
      });
      throw error; // Re-throw so caller can handle it
    }
  },

  updateCartItemQuantity: async (userId: string, productId: string, quantity: number) => {
    try {
      console.log('Updating cart item quantity:', { userId, productId, quantity });
      set({ loading: true, error: null });
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await get().removeFromCart(userId, productId);
        return;
      }
      
      const cartItemRef = doc(db, 'users', userId, 'cart', productId);
      await updateDoc(cartItemRef, {
        quantity,
        updatedAt: serverTimestamp(),
      });
      
      console.log('Updated cart item quantity in Firebase:', quantity);
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
      console.log('Removing from cart:', { userId, productId });
      set({ loading: true, error: null });
      
      const cartItemRef = doc(db, 'users', userId, 'cart', productId);
      await deleteDoc(cartItemRef);
      
      console.log('Removed item from Firebase cart:', productId);
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
      console.log('Clearing cart for user:', userId);
      set({ loading: true, error: null });
      
      const cartRef = collection(db, 'users', userId, 'cart');
      const snapshot = await getDocs(cartRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('Cart cleared successfully in Firebase');
      set({ loading: false });
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        loading: false 
      });
    }
  },

  subscribeToCart: (userId: string) => {
    console.log('Subscribing to cart changes for user:', userId);
    const cartRef = collection(db, 'users', userId, 'cart');
    
    return onSnapshot(cartRef, 
      (snapshot) => {
        const items: CartItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          productId: doc.id, // Document ID is the productId
          ...doc.data()
        } as CartItem));
        
        console.log('Cart updated via real-time subscription:', items);
        set({ items, error: null, loading: false });
      },
      (error) => {
        console.error('Error in cart subscription:', error);
        set({ error: error.message, loading: false });
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