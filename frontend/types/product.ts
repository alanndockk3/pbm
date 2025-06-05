// types/product.ts
export interface Product {
    id: number;
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
  }
  
  export interface ProductFormData {
    name: string;
    price: string;
    quantity: string;
    category: string;
    description: string;
    rating: string;
    reviews: string;
    isFeatured: boolean;
    image: string | null;
  }
  
  export interface ProductState {
    products: Product[];
    featuredProducts: Product[];
    categories: string[];
    loading: boolean;
    error: string | null;
    hasHydrated: boolean;
    
    // Actions
    initializeProducts: () => void;
    setHasHydrated: (state: boolean) => void;
    getFeaturedProducts: () => Product[];
    getProductsByCategory: (category: string) => Product[];
    getProductById: (id: number) => Product | undefined;
    updateProductStock: (id: number, quantity: number) => void;
    toggleFeatured: (id: number) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: number, updates: Partial<Product>) => void;
    deleteProduct: (id: number) => void;
    getCategories: () => string[];
    searchProducts: (query: string) => Product[];
  }