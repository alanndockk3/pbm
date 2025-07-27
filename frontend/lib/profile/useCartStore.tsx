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

// Helper function to create a valid Firestore document ID
const createValidDocId = (productId: string): string => {
  // Remove any characters that might cause issues
  return productId.replace(/[^a-zA-Z0-9_-]/g, '_');
};

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
        productId: doc.data().productId || doc.id, // Use stored productId or fallback to doc ID
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
    console.log('🛒 addToCart called');
    console.log('🛒 userId:', userId);
    console.log('🛒 product:', product);
    console.log('🛒 quantity:', quantity);
    
    try {
      set({ loading: true, error: null });
      
      // Validate inputs step by step
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid user ID: ${userId}`);
      }
      
      if (!product) {
        throw new Error('Product is required');
      }
      
      if (!product.id) {
        throw new Error('Product ID is required');
      }
      
      if (!product.name) {
        throw new Error('Product name is required');
      }
      
      if (typeof product.price !== 'number' || product.price < 0) {
        throw new Error(`Invalid product price: ${product.price}`);
      }
      
      const productId = String(product.id);
      console.log('🛒 Using productId:', productId);
      
      // Test if we can create a document reference
      let cartItemRef;
      try {
        cartItemRef = doc(db, 'users', userId, 'cart', productId);
        console.log('🛒 Document reference created:', cartItemRef.path);
      } catch (docError) {
        console.error('❌ Failed to create document reference:', docError);
        if (docError instanceof Error) {
          throw new Error(`Invalid document path: ${docError.message}`);
        } else {
          throw new Error('Invalid document path: Unknown error');
        }
      }
      
      // Check if item already exists
      console.log('🛒 Checking if item already exists...');
      const existingDoc = await getDoc(cartItemRef);
      console.log('🛒 Existing document check result:', existingDoc.exists());
      
      if (existingDoc.exists()) {
        // Update existing item quantity
        const existingData = existingDoc.data() as FirestoreCartItem;
        const newQuantity = existingData.quantity + quantity;
        
        console.log('🛒 Updating existing item quantity to:', newQuantity);
        await updateDoc(cartItemRef, {
          quantity: newQuantity,
          updatedAt: serverTimestamp(),
        });
        
        console.log('✅ Updated existing cart item quantity');
      } else {
        // Create new cart item
        const cartItem: FirestoreCartItem = {
          productId: productId,
          name: String(product.name),
          price: Number(product.price),
          description: product.description || '',
          category: product.category || '',
          image: product.image || product.images?.[0] || '',
          inStock: product.inStock !== false,
          quantity: quantity,
          addedAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };
        
        console.log('🛒 Creating new cart item:', cartItem);
        await setDoc(cartItemRef, cartItem);
        console.log('✅ Created new cart item successfully');
      }
      
      set({ loading: false });
      console.log('✅ addToCart completed successfully');
      
    } catch (error) {
      console.error('❌ Error in addToCart:', error);
      
      // Properly handle the unknown error type
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else if (error && typeof error === 'object' && 'code' in error) {
        // Handle Firebase error format
        console.error('❌ Firebase error details:', {
          code: (error as any).code,
          message: (error as any).message,
          name: (error as any).name
        });
      } else {
        console.error('❌ Unknown error type:', error);
      }
      
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
      
      const validDocId = createValidDocId(productId);
      const cartItemRef = doc(db, 'users', userId, 'cart', validDocId);
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
      
      const validDocId = createValidDocId(productId);
      const cartItemRef = doc(db, 'users', userId, 'cart', validDocId);
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
          productId: doc.data().productId || doc.id, // Use stored productId or fallback to doc ID
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