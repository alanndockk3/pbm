import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection,
  doc, 
  getDoc,
  setDoc, 
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

// Wishlist item interface for Firestore
interface WishlistItem {
  productId: string;
  dateAdded: string;
  notes?: string;
}

// Wishlist store state interface
interface WishlistStore {
  items: string[]; // Array of product IDs
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Actions
  loadWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string, productId: string, notes?: string) => Promise<boolean>;
  removeFromWishlist: (userId: string, productId: string) => Promise<boolean>;
  toggleWishlist: (userId: string, productId: string, notes?: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Real-time listener
  subscribeToWishlist: (userId: string) => () => void;
}

// Helper function to get wishlist collection reference
const getWishlistRef = (userId: string) => collection(db, 'users', userId, 'wishlist');
const getWishlistItemRef = (userId: string, productId: string) => doc(db, 'users', userId, 'wishlist', productId);

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      loadWishlist: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const wishlistRef = getWishlistRef(userId);
          const q = query(wishlistRef, orderBy('dateAdded', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const items: string[] = [];
          querySnapshot.forEach((doc) => {
            items.push(doc.id); // doc.id is the productId
          });

          set({ 
            items, 
            isLoading: false, 
            lastUpdated: new Date().toISOString() 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load wishlist';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Wishlist load error:', error);
        }
      },

      addToWishlist: async (userId: string, productId: string, notes?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if item already exists
          const currentItems = get().items;
          if (currentItems.includes(productId)) {
            set({ isLoading: false });
            return true; // Already in wishlist
          }

          const wishlistItemRef = getWishlistItemRef(userId, productId);
          const wishlistItem: WishlistItem = {
            productId,
            dateAdded: new Date().toISOString(),
            ...(notes && { notes })
          };

          await setDoc(wishlistItemRef, wishlistItem);

          // Update local state
          set(state => ({ 
            items: [productId, ...state.items], // Add to beginning (most recent first)
            isLoading: false,
            lastUpdated: new Date().toISOString()
          }));

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add to wishlist';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Add to wishlist error:', error);
          return false;
        }
      },

      removeFromWishlist: async (userId: string, productId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const wishlistItemRef = getWishlistItemRef(userId, productId);
          await deleteDoc(wishlistItemRef);

          // Update local state
          set(state => ({ 
            items: state.items.filter(id => id !== productId),
            isLoading: false,
            lastUpdated: new Date().toISOString()
          }));

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove from wishlist';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Remove from wishlist error:', error);
          return false;
        }
      },

      toggleWishlist: async (userId: string, productId: string, notes?: string) => {
        const currentItems = get().items;
        const isCurrentlyInWishlist = currentItems.includes(productId);

        if (isCurrentlyInWishlist) {
          return await get().removeFromWishlist(userId, productId);
        } else {
          return await get().addToWishlist(userId, productId, notes);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },

      getWishlistCount: () => {
        return get().items.length;
      },

      subscribeToWishlist: (userId: string) => {
        const wishlistRef = getWishlistRef(userId);
        const q = query(wishlistRef, orderBy('dateAdded', 'desc'));
        
        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            const items: string[] = [];
            querySnapshot.forEach((doc) => {
              items.push(doc.id);
            });

            set({ 
              items, 
              lastUpdated: new Date().toISOString(),
              error: null 
            });
          },
          (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Wishlist sync error';
            set({ error: errorMessage });
            console.error('Wishlist subscription error:', error);
          }
        );

        return unsubscribe;
      },

      clearWishlist: () => {
        set({ 
          items: [], 
          error: null, 
          lastUpdated: null,
          isLoading: false 
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        items: state.items, 
        lastUpdated: state.lastUpdated 
      }),
    }
  )
);

// Convenience hooks for specific wishlist data
export const useWishlistItems = () => useWishlistStore(state => state.items);
export const useWishlistLoading = () => useWishlistStore(state => state.isLoading);
export const useWishlistError = () => useWishlistStore(state => state.error);
export const useWishlistCount = () => useWishlistStore(state => state.items.length);
export const useIsInWishlist = (productId: string) => useWishlistStore(state => state.isInWishlist(productId));