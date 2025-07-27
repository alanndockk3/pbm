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
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../client/firebaseConfig';

// Wishlist item interface for Firestore
interface WishlistItem {
  productId: string;
  dateAdded: string;
  notes?: string;
}

// Wishlist store state interface
interface WishlistStore {
  items: string[]; // Array of product IDs
  isLoading: boolean; // Global loading state for initial load
  loadingItems: Set<string>; // Track which specific items are being updated
  error: string | null;
  lastUpdated: string | null;
  currentUserId: string | null; // Track current user
  isSubscribed: boolean; // Track if real-time listener is active
  
  // Actions
  loadWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string, productId: string, notes?: string) => Promise<boolean>;
  removeFromWishlist: (userId: string, productId: string) => Promise<boolean>;
  toggleWishlist: (userId: string, productId: string, notes?: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  isItemLoading: (productId: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setItemLoading: (productId: string, loading: boolean) => void;
  setCurrentUser: (userId: string | null) => void;
  
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
      loadingItems: new Set<string>(),
      error: null,
      lastUpdated: null,
      currentUserId: null,
      isSubscribed: false,

      loadWishlist: async (userId: string) => {
        set({ isLoading: true, error: null, currentUserId: userId });
        
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
        // Set item-specific loading state
        set(state => ({
          loadingItems: new Set(state.loadingItems).add(productId),
          error: null
        }));
        
        try {
          // Check if item already exists
          const currentItems = get().items;
          if (currentItems.includes(productId)) {
            // Remove from loading state
            set(state => {
              const newLoadingItems = new Set(state.loadingItems);
              newLoadingItems.delete(productId);
              return { loadingItems: newLoadingItems };
            });
            return true; // Already in wishlist
          }

          const wishlistItemRef = getWishlistItemRef(userId, productId);
          const wishlistItem: WishlistItem = {
            productId,
            dateAdded: new Date().toISOString(),
            ...(notes && { notes })
          };

          await setDoc(wishlistItemRef, wishlistItem);

          // Only update local state if real-time listener is not active
          // The listener will handle the state update automatically
          const { isSubscribed } = get();
          if (!isSubscribed) {
            set(state => {
              const newLoadingItems = new Set(state.loadingItems);
              newLoadingItems.delete(productId);
              
              // Ensure no duplicates when adding
              const newItems = state.items.includes(productId) 
                ? state.items 
                : [productId, ...state.items];
              
              return { 
                items: newItems,
                loadingItems: newLoadingItems,
                lastUpdated: new Date().toISOString()
              };
            });
          } else {
            // Just remove from loading state, listener will update items
            set(state => {
              const newLoadingItems = new Set(state.loadingItems);
              newLoadingItems.delete(productId);
              return { loadingItems: newLoadingItems };
            });
          }

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add to wishlist';
          
          // Remove from loading state and set error
          set(state => {
            const newLoadingItems = new Set(state.loadingItems);
            newLoadingItems.delete(productId);
            
            return { 
              error: errorMessage, 
              loadingItems: newLoadingItems 
            };
          });
          
          console.error('Add to wishlist error:', error);
          return false;
        }
      },

      removeFromWishlist: async (userId: string, productId: string) => {
        // Set item-specific loading state
        set(state => ({
          loadingItems: new Set(state.loadingItems).add(productId),
          error: null
        }));
        
        try {
          const wishlistItemRef = getWishlistItemRef(userId, productId);
          await deleteDoc(wishlistItemRef);

          // Only update local state if real-time listener is not active
          const { isSubscribed } = get();
          if (!isSubscribed) {
            set(state => {
              const newLoadingItems = new Set(state.loadingItems);
              newLoadingItems.delete(productId);
              
              return { 
                items: state.items.filter(id => id !== productId),
                loadingItems: newLoadingItems,
                lastUpdated: new Date().toISOString()
              };
            });
          } else {
            // Just remove from loading state, listener will update items
            set(state => {
              const newLoadingItems = new Set(state.loadingItems);
              newLoadingItems.delete(productId);
              return { loadingItems: newLoadingItems };
            });
          }

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove from wishlist';
          
          // Remove from loading state and set error
          set(state => {
            const newLoadingItems = new Set(state.loadingItems);
            newLoadingItems.delete(productId);
            
            return { 
              error: errorMessage, 
              loadingItems: newLoadingItems 
            };
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

      isItemLoading: (productId: string) => {
        return get().loadingItems.has(productId);
      },

      getWishlistCount: () => {
        return get().items.length;
      },

      subscribeToWishlist: (userId: string) => {
        const wishlistRef = getWishlistRef(userId);
        const q = query(wishlistRef, orderBy('dateAdded', 'desc'));
        
        // Mark as subscribed
        set({ isSubscribed: true });
        
        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            const items: string[] = [];
            querySnapshot.forEach((doc) => {
              items.push(doc.id);
            });

            // Remove duplicates and ensure unique items
            const uniqueItems = Array.from(new Set(items));

            set({ 
              items: uniqueItems, 
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

        // Return unsubscribe function that also marks as not subscribed
        return () => {
          unsubscribe();
          set({ isSubscribed: false });
        };
      },

      clearWishlist: () => {
        set({ 
          items: [], 
          error: null, 
          lastUpdated: null,
          isLoading: false,
          loadingItems: new Set<string>(),
          currentUserId: null,
          isSubscribed: false
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setItemLoading: (productId: string, loading: boolean) => {
        set(state => {
          const newLoadingItems = new Set(state.loadingItems);
          if (loading) {
            newLoadingItems.add(productId);
          } else {
            newLoadingItems.delete(productId);
          }
          return { loadingItems: newLoadingItems };
        });
      },

      setCurrentUser: (userId: string | null) => {
        const currentUserId = get().currentUserId;
        
        // If user logged out (userId is null) or changed users, clear wishlist
        if (!userId || (currentUserId && currentUserId !== userId)) {
          get().clearWishlist();
        }
        
        set({ currentUserId: userId });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        items: state.items, 
        lastUpdated: state.lastUpdated,
        currentUserId: state.currentUserId
      }),
    }
  )
);

// Set up auth state listener to clear wishlist on logout
onAuthStateChanged(auth, (user) => {
  const store = useWishlistStore.getState();
  store.setCurrentUser(user?.uid || null);
});

// Convenience hooks for specific wishlist data
export const useWishlistItems = () => useWishlistStore(state => state.items);
export const useWishlistLoading = () => useWishlistStore(state => state.isLoading);
export const useWishlistError = () => useWishlistStore(state => state.error);
export const useWishlistCount = () => useWishlistStore(state => state.items.length);
export const useIsInWishlist = (productId: string) => useWishlistStore(state => state.isInWishlist(productId));
export const useIsItemLoading = (productId: string) => useWishlistStore(state => state.isItemLoading(productId));