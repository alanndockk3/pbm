import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

// Product type definition
export interface Product {
  id: number;
  firestoreId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
  isFeatured?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;
  isRealTimeActive: boolean;
  
  // Actions
  initializeProducts: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  getFeaturedProducts: () => Product[];
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: number) => Product | undefined;
  updateProductStock: (id: number, quantity: number) => Promise<void>;
  toggleFeatured: (id: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'firestoreId'>) => Promise<string | null>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getCategories: () => string[];
  searchProducts: (query: string) => Product[];
  setupRealtimeListener: () => () => void;
  stopRealtimeListener: () => void;
}

// Convert Firestore document to Product
const firestoreToProduct = (doc: any): Product => {
  const data = doc.data();
  return {
    id: parseInt(doc.id) || Date.now(),
    firestoreId: doc.id,
    name: data.name || '',
    price: data.price || 0,
    quantity: data.quantity || 0,
    image: data.image || null,
    category: data.category || '',
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    inStock: data.inStock || false,
    description: data.description || '',
    isFeatured: data.isFeatured || false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

// Convert Product to Firestore data
const productToFirestore = (product: Omit<Product, 'id' | 'firestoreId'>) => {
  return {
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    image: product.image,
    category: product.category,
    rating: product.rating,
    reviews: product.reviews,
    inStock: product.inStock,
    description: product.description,
    isFeatured: product.isFeatured || false,
    updatedAt: serverTimestamp(),
  };
};

let unsubscribeRealtime: (() => void) | null = null;

export const useProductStore = create<ProductState>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
        featuredProducts: [],
        categories: [],
        loading: false,
        error: null,
        hasHydrated: false,
        isRealTimeActive: false,

        setHasHydrated: (state: boolean) => {
          set({ hasHydrated: state });
        },

        initializeProducts: async () => {
          set({ loading: true, error: null });
          
          try {
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const products: Product[] = [];
            querySnapshot.forEach((doc) => {
              products.push(firestoreToProduct(doc));
            });

            const featuredProducts = products.filter(p => p.isFeatured);
            const categories = Array.from(new Set(products.map(p => p.category)));

            set({
              products,
              featuredProducts,
              categories,
              loading: false,
              hasHydrated: true,
              error: null
            });

            // Auto-setup realtime listener after initial load
            get().setupRealtimeListener();

          } catch (error) {
            console.error('Error loading products:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load products',
              loading: false 
            });
          }
        },

        setupRealtimeListener: () => {
          // Don't setup multiple listeners
          if (unsubscribeRealtime) {
            unsubscribeRealtime();
          }

          const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
          
          unsubscribeRealtime = onSnapshot(q, 
            (snapshot) => {
              const products: Product[] = [];
              snapshot.forEach((doc) => {
                products.push(firestoreToProduct(doc));
              });

              const featuredProducts = products.filter(p => p.isFeatured);
              const categories = Array.from(new Set(products.map(p => p.category)));

              set({
                products,
                featuredProducts,
                categories,
                isRealTimeActive: true,
                error: null
              });
            },
            (error) => {
              console.error('Realtime listener error:', error);
              set({ 
                error: 'Failed to sync with database',
                isRealTimeActive: false 
              });
            }
          );

          set({ isRealTimeActive: true });
          return unsubscribeRealtime;
        },

        stopRealtimeListener: () => {
          if (unsubscribeRealtime) {
            unsubscribeRealtime();
            unsubscribeRealtime = null;
          }
          set({ isRealTimeActive: false });
        },

        getFeaturedProducts: () => {
          const { featuredProducts } = get();
          return featuredProducts;
        },

        getProductsByCategory: (category: string) => {
          const { products } = get();
          if (category === 'All') return products;
          return products.filter(product => product.category === category);
        },

        getProductById: (id: number) => {
          const { products } = get();
          return products.find(product => product.id === id);
        },

        updateProductStock: async (id: number, quantity: number) => {
          try {
            const { products } = get();
            const product = products.find(p => p.id === id);
            if (!product?.firestoreId) return;

            const docRef = doc(db, 'products', product.firestoreId);
            await updateDoc(docRef, {
              quantity,
              inStock: quantity > 0,
              updatedAt: serverTimestamp()
            });

            // Optimistic update - realtime listener will sync the actual data
            set(state => ({
              products: state.products.map(p =>
                p.id === id ? { ...p, quantity, inStock: quantity > 0 } : p
              ),
              featuredProducts: state.featuredProducts.map(p =>
                p.id === id ? { ...p, quantity, inStock: quantity > 0 } : p
              )
            }));

          } catch (error) {
            console.error('Error updating stock:', error);
            set({ error: 'Failed to update stock' });
          }
        },

        toggleFeatured: async (id: number) => {
          try {
            const { products } = get();
            const product = products.find(p => p.id === id);
            if (!product?.firestoreId) return;

            const newFeaturedStatus = !product.isFeatured;
            const docRef = doc(db, 'products', product.firestoreId);
            await updateDoc(docRef, {
              isFeatured: newFeaturedStatus,
              updatedAt: serverTimestamp()
            });

            // Optimistic update
            set(state => {
              const updatedProducts = state.products.map(p =>
                p.id === id ? { ...p, isFeatured: newFeaturedStatus } : p
              );
              const featuredProducts = updatedProducts.filter(p => p.isFeatured);
              
              return {
                products: updatedProducts,
                featuredProducts
              };
            });

          } catch (error) {
            console.error('Error toggling featured:', error);
            set({ error: 'Failed to update featured status' });
          }
        },

        addProduct: async (productData: Omit<Product, 'id' | 'firestoreId'>) => {
          try {
            set({ loading: true, error: null });

            const firestoreData = {
              ...productToFirestore(productData),
              createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'products'), firestoreData);
            
            set({ loading: false });
            return docRef.id;

          } catch (error) {
            console.error('Error adding product:', error);
            set({ 
              error: 'Failed to add product',
              loading: false 
            });
            return null;
          }
        },

        updateProduct: async (id: number, updates: Partial<Product>) => {
          try {
            const { products } = get();
            const product = products.find(p => p.id === id);
            if (!product?.firestoreId) return;

            const docRef = doc(db, 'products', product.firestoreId);
            const updateData = productToFirestore({ ...product, ...updates });
            
            await updateDoc(docRef, updateData);

            // Optimistic update
            set(state => {
              const updatedProducts = state.products.map(p =>
                p.id === id ? { ...p, ...updates } : p
              );
              const featuredProducts = updatedProducts.filter(p => p.isFeatured);
              const categories = Array.from(new Set(updatedProducts.map(p => p.category)));
              
              return {
                products: updatedProducts,
                featuredProducts,
                categories
              };
            });

          } catch (error) {
            console.error('Error updating product:', error);
            set({ error: 'Failed to update product' });
          }
        },

        deleteProduct: async (id: number) => {
          try {
            const { products } = get();
            const product = products.find(p => p.id === id);
            if (!product?.firestoreId) return;

            await deleteDoc(doc(db, 'products', product.firestoreId));

            // Optimistic update
            set(state => {
              const updatedProducts = state.products.filter(p => p.id !== id);
              const featuredProducts = updatedProducts.filter(p => p.isFeatured);
              const categories = Array.from(new Set(updatedProducts.map(p => p.category)));
              
              return {
                products: updatedProducts,
                featuredProducts,
                categories
              };
            });

          } catch (error) {
            console.error('Error deleting product:', error);
            set({ error: 'Failed to delete product' });
          }
        },

        getCategories: () => {
          const { categories } = get();
          return categories;
        },

        searchProducts: (query: string) => {
          const { products } = get();
          if (!query.trim()) return products;
          
          const lowercaseQuery = query.toLowerCase();
          return products.filter(product =>
            product.name.toLowerCase().includes(lowercaseQuery) ||
            product.description.toLowerCase().includes(lowercaseQuery) ||
            product.category.toLowerCase().includes(lowercaseQuery)
          );
        }
      }),
      {
        name: 'product-store',
        partialize: (state) => ({ 
          // Only persist essential data, not loading states
          products: state.products,
          featuredProducts: state.featuredProducts,
          categories: state.categories,
          hasHydrated: state.hasHydrated
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
          // Re-setup realtime listener after rehydration
          if (state && state.products.length > 0) {
            state.setupRealtimeListener();
          }
        },
      }
    ),
    {
      name: 'product-store',
    }
  )
);

// Cleanup function for app unmount
export const cleanupProductStore = () => {
  useProductStore.getState().stopRealtimeListener();
};

// Stable selector hooks
export const useFeaturedProducts = () => {
  return useProductStore((state) => state.featuredProducts);
};

export const useProducts = () => {
  return useProductStore((state) => state.products);
};

export const useCategories = () => {
  return useProductStore((state) => state.categories);
};

export const useProductLoading = () => useProductStore(state => state.loading);
export const useProductError = () => useProductStore(state => state.error);
export const useHasHydrated = () => useProductStore(state => state.hasHydrated);
export const useIsRealTimeActive = () => useProductStore(state => state.isRealTimeActive);