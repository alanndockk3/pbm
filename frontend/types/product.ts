// types/product.ts
export interface Product {
  id: string; 
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