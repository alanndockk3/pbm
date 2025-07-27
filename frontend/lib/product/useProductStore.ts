import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  collectionGroup,
  where 
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

// Interfaces for Stripe integration
export interface StripePrice {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number; // Price in cents
  type: 'one_time' | 'recurring';
  billing_scheme: 'per_unit' | 'tiered';
  product: string; // Reference to product ID
  tax_behavior?: 'inclusive' | 'exclusive' | 'unspecified';
  metadata?: Record<string, any>;
  created?: Timestamp;
  updated?: Timestamp;
}

export interface StripeProduct {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  images?: string[];
  metadata?: {
    quantity?: string;
    category?: string;
    rating?: string;
    reviews?: string;
    inStock?: string;
    isFeatured?: string;
    [key: string]: any;
  };
  role?: string;
  tax_code?: string;
  created?: Timestamp;
  updated?: Timestamp;
  // Computed fields from prices subcollection
  prices?: StripePrice[];
  defaultPrice?: StripePrice;
  // Legacy fields for compatibility with existing components
  price?: number;
  quantity?: number;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  image?: string;
}

export interface ProductState {
  products: StripeProduct[];
  featuredProducts: StripeProduct[];
  categories: string[];
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;
  isRealTimeActive: boolean;
  
  // Read-only methods
  initializeProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  getFeaturedProducts: () => StripeProduct[];
  getProductsByCategory: (category: string) => StripeProduct[];
  getProductById: (id: string) => StripeProduct | undefined;
  getCategories: () => string[];
  searchProducts: (query: string) => StripeProduct[];
  setupRealtimeListener: () => () => void;
  stopRealtimeListener: () => void;
}

// Helper function to convert unit_amount to dollar price
const centsToDollars = (cents: number): number => {
  return cents / 100;
};

// Helper function to get metadata as typed values
const getMetadataValue = (metadata: Record<string, any> | undefined, key: string, defaultValue: any = null) => {
  if (!metadata || !metadata[key]) return defaultValue;
  
  const value = metadata[key];
  
  // Handle different types based on key
  switch (key) {
    case 'quantity':
    case 'reviews':
      return parseInt(value) || 0;
    case 'rating':
      return parseFloat(value) || 0;
    case 'inStock':
    case 'isFeatured':
      return value === 'true' || value === true;
    default:
      return value;
  }
};

// Convert Firestore document to StripeProduct
const firestoreToStripeProduct = (doc: any, prices: StripePrice[] = []): StripeProduct => {
  const data = doc.data();
  const metadata = data.metadata || {};
  
  // Find the default active price
  const defaultPrice = prices.find(p => p.active) || prices[0];
  
  return {
    id: doc.id,
    active: data.active ?? true,
    name: data.name || '',
    description: data.description || '',
    images: data.images || [],
    metadata: metadata,
    role: data.role,
    tax_code: data.tax_code,
    created: data.created,
    updated: data.updated,
    prices: prices,
    defaultPrice: defaultPrice,
    // Legacy compatibility fields for existing components
    price: defaultPrice ? centsToDollars(defaultPrice.unit_amount) : 0,
    quantity: getMetadataValue(metadata, 'quantity', 0),
    category: getMetadataValue(metadata, 'category', 'Uncategorized'),
    rating: getMetadataValue(metadata, 'rating', 0),
    reviews: getMetadataValue(metadata, 'reviews', 0),
    inStock: getMetadataValue(metadata, 'inStock', true),
    isFeatured: getMetadataValue(metadata, 'isFeatured', false),
    image: data.images?.[0] || null,
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

        refreshProducts: async () => {
          console.log('🔄 Manual refresh requested');
          // Just call initializeProducts again for manual refresh
          await get().initializeProducts();
        },

        initializeProducts: async () => {
          set({ loading: true, error: null });
          
          try {
            console.log('🚀 Starting product initialization...');
            
            // Get active products without ordering first
            console.log('📦 Fetching active products...');
            const productsQuery = query(
              collection(db, 'products'), 
              where('active', '==', true)
            );
            
            const productsSnapshot = await getDocs(productsQuery);
            console.log(`Found ${productsSnapshot.size} active products`);
            
            // Try to get prices, but don't fail if it doesn't work
            let pricesByProduct: Record<string, StripePrice[]> = {};
            
            try {
              console.log('💰 Fetching prices...');
              
              // Get all prices without filtering first
              const pricesQuery = query(collectionGroup(db, 'prices'));
              const pricesSnapshot = await getDocs(pricesQuery);
              console.log(`Found ${pricesSnapshot.size} prices`);
              
              // Group prices by product and filter active ones in memory
              pricesSnapshot.forEach((doc) => {
                const price = {
                  id: doc.id,
                  ...doc.data(),
                } as StripePrice;
                
                console.log('Price data:', price);
                
                // Filter active prices in memory instead of in query
                if (price.active === true) {
                  if (!pricesByProduct[price.product]) {
                    pricesByProduct[price.product] = [];
                  }
                  pricesByProduct[price.product].push(price);
                }
              });
            } catch (priceError) {
              console.warn('⚠️ Could not fetch prices, continuing without them:', priceError);
            }

            // Build products with their prices
            const products: StripeProduct[] = [];
            productsSnapshot.forEach((doc) => {
              console.log('Processing product:', doc.id, doc.data());
              const productPrices = pricesByProduct[doc.id] || [];
              const product = firestoreToStripeProduct(doc, productPrices);
              console.log('Processed product:', product);
              products.push(product);
            });

            console.log(`✅ Processed ${products.length} products`);

            const featuredProducts = products.filter(p => p.isFeatured);
            const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => Boolean(cat))))];

            console.log(`🌟 Found ${featuredProducts.length} featured products`);
            console.log(`📁 Found ${categories.length} categories:`, categories);

            set({
              products,
              featuredProducts,
              categories,
              loading: false,
              hasHydrated: true,
              error: null
            });

            // Setup realtime listener
            get().setupRealtimeListener();

          } catch (error) {
            console.error('❌ Error loading products:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load products',
              loading: false 
            });
          }
        },

        setupRealtimeListener: () => {
          if (unsubscribeRealtime) {
            unsubscribeRealtime();
          }

          // Use the same query as initialization - just active products, no ordering
          const productsQuery = query(
            collection(db, 'products'),
            where('active', '==', true)
          );
          
          unsubscribeRealtime = onSnapshot(productsQuery, 
            async (snapshot) => {
              try {
                console.log('🔄 Realtime listener triggered, found', snapshot.size, 'products');
                
                // Get updated prices
                let pricesByProduct: Record<string, StripePrice[]> = {};
                
                try {
                  const pricesQuery = query(collectionGroup(db, 'prices'));
                  const pricesSnapshot = await getDocs(pricesQuery);
                  
                  pricesSnapshot.forEach((doc) => {
                    const price = {
                      id: doc.id,
                      ...doc.data(),
                    } as StripePrice;
                    
                    // Filter active prices in memory
                    if (price.active === true) {
                      if (!pricesByProduct[price.product]) {
                        pricesByProduct[price.product] = [];
                      }
                      pricesByProduct[price.product].push(price);
                    }
                  });
                } catch (priceError) {
                  console.warn('⚠️ Realtime price fetch failed:', priceError);
                }

                const products: StripeProduct[] = [];
                snapshot.forEach((doc) => {
                  console.log('🔄 Processing realtime product:', doc.id, doc.data());
                  const productPrices = pricesByProduct[doc.id] || [];
                  const product = firestoreToStripeProduct(doc, productPrices);
                  console.log('🔄 Processed realtime product:', product);
                  products.push(product);
                });

                console.log(`🔄 Realtime processed ${products.length} products`);

                const featuredProducts = products.filter(p => p.isFeatured);
                const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => Boolean(cat))))];

                set({
                  products,
                  featuredProducts,
                  categories,
                  isRealTimeActive: true,
                  error: null
                });
              } catch (error) {
                console.error('❌ Error in realtime listener:', error);
                set({ 
                  error: 'Failed to sync with database',
                  isRealTimeActive: false 
                });
              }
            },
            (error) => {
              console.error('❌ Realtime listener error:', error);
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

        getProductById: (id: string) => {
          const { products } = get();
          return products.find(product => product.id === id);
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
            product.description?.toLowerCase().includes(lowercaseQuery) ||
            product.category?.toLowerCase().includes(lowercaseQuery)
          );
        },
      }),
      {
        name: 'stripe-product-store',
        partialize: (state) => ({ 
          products: state.products,
          featuredProducts: state.featuredProducts,
          categories: state.categories,
          hasHydrated: state.hasHydrated
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
          // Don't automatically setup realtime listener on rehydration
          // if (state && state.products.length > 0) {
          //   state.setupRealtimeListener();
          // }
        },
      }
    ),
    {
      name: 'stripe-product-store',
    }
  )
);

// Cleanup function
export const cleanupProductStore = () => {
  useProductStore.getState().stopRealtimeListener();
};

// Convenience hooks
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
export const useRefreshProducts = () => useProductStore(state => state.refreshProducts);

// Helper functions for price display
export const formatPrice = (unitAmount: number, currency: string = 'usd'): string => {
  const price = centsToDollars(unitAmount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};

// Helper to get the best price for a product
export const getProductPrice = (product: StripeProduct): number => {
  if (product.defaultPrice) {
    return centsToDollars(product.defaultPrice.unit_amount);
  }
  return product.price || 0;
};

// Helper to get formatted price string
export const getFormattedPrice = (product: StripeProduct): string => {
  if (product.defaultPrice) {
    return formatPrice(product.defaultPrice.unit_amount, product.defaultPrice.currency);
  }
  return `$${(product.price || 0).toFixed(2)}`;
};