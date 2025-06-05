// data/productService.ts
import { getStorageUrlWithFallback } from '../lib/firebase/storage';
import { rawMockProducts, type RawProductData } from './mockProducts';
import type { Product } from '../lib/product/useProductStore';

/**
 * Convert raw product data to Product with resolved Firebase Storage URLs
 * @param rawProduct - Raw product data with imagePath
 * @returns Promise<Product> - Product with resolved image URL
 */
const convertRawProductToProduct = async (rawProduct: RawProductData): Promise<Product> => {
  const imageUrl = await getStorageUrlWithFallback(rawProduct.imagePath);
  
  return {
    id: rawProduct.id,
    name: rawProduct.name,
    price: rawProduct.price,
    quantity: rawProduct.quantity,
    image: imageUrl,
    category: rawProduct.category,
    rating: rawProduct.rating,
    reviews: rawProduct.reviews,
    inStock: rawProduct.inStock,
    description: rawProduct.description,
    isFeatured: rawProduct.isFeatured
  };
};

/**
 * Get all products with resolved Firebase Storage URLs
 * @returns Promise<Product[]> - Array of products with resolved image URLs
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productPromises = rawMockProducts.map(convertRawProductToProduct);
    const products = await Promise.all(productPromises);
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
};

/**
 * Get featured products with resolved Firebase Storage URLs
 * @returns Promise<Product[]> - Array of featured products
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const featuredRawProducts = rawMockProducts.filter(product => product.isFeatured);
    const productPromises = featuredRawProducts.map(convertRawProductToProduct);
    const products = await Promise.all(productPromises);
    return products;
  } catch (error) {
    console.error('Error loading featured products:', error);
    throw error;
  }
};

/**
 * Get products by category with resolved Firebase Storage URLs
 * @param category - Product category to filter by
 * @returns Promise<Product[]> - Array of products in the specified category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const categoryRawProducts = rawMockProducts.filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
    const productPromises = categoryRawProducts.map(convertRawProductToProduct);
    const products = await Promise.all(productPromises);
    return products;
  } catch (error) {
    console.error(`Error loading products for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get a single product by ID with resolved Firebase Storage URL
 * @param id - Product ID
 * @returns Promise<Product | null> - Product with resolved image URL or null if not found
 */
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const rawProduct = rawMockProducts.find(product => product.id === id);
    if (!rawProduct) {
      return null;
    }
    
    const product = await convertRawProductToProduct(rawProduct);
    return product;
  } catch (error) {
    console.error(`Error loading product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get products with pagination
 * @param page - Page number (1-based)
 * @param limit - Number of products per page
 * @returns Promise<{products: Product[], total: number, hasMore: boolean}>
 */
export const getProductsPaginated = async (
  page: number = 1, 
  limit: number = 12
): Promise<{
  products: Product[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedRawProducts = rawMockProducts.slice(startIndex, endIndex);
    const productPromises = paginatedRawProducts.map(convertRawProductToProduct);
    const products = await Promise.all(productPromises);
    
    return {
      products,
      total: rawMockProducts.length,
      hasMore: endIndex < rawMockProducts.length
    };
  } catch (error) {
    console.error('Error loading paginated products:', error);
    throw error;
  }
};

/**
 * Search products by name or description
 * @param query - Search query
 * @returns Promise<Product[]> - Array of matching products
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const searchTerm = query.toLowerCase();
    const matchingRawProducts = rawMockProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
    
    const productPromises = matchingRawProducts.map(convertRawProductToProduct);
    const products = await Promise.all(productPromises);
    return products;
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    throw error;
  }
};