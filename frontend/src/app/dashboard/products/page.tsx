"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Grid3X3,
  List,
  Package,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useProductStore, useProducts, useCategories, useProductLoading, useProductError } from '../../../../lib/product/useProductStore';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useCartStore, useCartTotalItems } from '../../../../lib/profile/useCartStore';
import Header from '@/components/Header';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const cartTotalItems = useCartTotalItems();
  
  // Updated store hooks
  const { 
    initializeProducts, 
    refreshProducts,
    searchProducts, 
    getProductsByCategory 
  } = useProductStore();
  
  const products = useProducts();
  const categories = useCategories();
  const loading = useProductLoading();
  const error = useProductError();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  // Initialize products when component mounts
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  // Get filtered and sorted products
  const getFilteredProducts = () => {
    let filteredProducts = products;

    // Apply search filter
    if (searchTerm.trim()) {
      filteredProducts = searchProducts(searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredProducts = getProductsByCategory(selectedCategory);
    }

    // Apply sorting
    return filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'stock':
          return (b.quantity || 0) - (a.quantity || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const filteredProducts = getFilteredProducts();

  const handleProductAction = async (product: any) => {
    console.log('🛒 handleProductAction called with product:', product);
    console.log('🛒 Product structure:', {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      images: product.images,
      inStock: product.inStock,
      category: product.category,
      description: product.description
    });
    
    if (!user?.uid) {
      console.log('❌ User must be logged in to add to cart');
      router.push('/auth');
      return;
    }

    if (!product.inStock) {
      console.log('❌ Product is out of stock');
      return;
    }

    try {
      setAddingToCart(product.id);
      
      // Convert Stripe product to cart format
      const cartProduct = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.image || product.images?.[0] || null,
        priceId: product.defaultPrice?.id || null, // Store Stripe price ID for checkout
        category: product.category,
        description: product.description,
        inStock: product.inStock,
        quantity: 1
      };
      
      console.log('🛒 Converted cart product:', cartProduct);
      console.log('🛒 About to call addToCart with:', {
        userId: user.uid,
        product: cartProduct,
        quantity: 1
      });
      
      await addToCart(user.uid, cartProduct, 1);
      
      console.log('✅ Product added to cart successfully!', product.name);
      
      // Show success feedback
      setRecentlyAdded(product.id);
      setTimeout(() => setRecentlyAdded(null), 2000);
      
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      
      // Show user-friendly error
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleCartNavigation = () => {
    router.push('/dashboard/cart');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetryLoad = () => {
    refreshProducts();
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <Header navigateBack={true} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              Loading Products...
            </h3>
            <p className="text-rose-600 dark:text-rose-400">
              Please wait while we fetch the latest products
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
        <Header navigateBack={true} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              Failed to Load Products
            </h3>
            <p className="text-rose-600 dark:text-rose-400 mb-6">
              {error}
            </p>
            <div className="space-x-4">
              <Button 
                onClick={handleRetryLoad}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={handleBackToDashboard}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Error Banner (if error but products exist) */}
      {error && products.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error} - Showing cached products
            </p>
          </div>
        </div>
      )}

      {/* Page Title and Controls */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">Products</h1>
            <p className="text-rose-600 dark:text-rose-400">Browse our handmade collection</p>
          </div>
          
          {/* View Mode Toggle and Cart Info */}
          <div className="flex items-center gap-4">
            {/* Cart Info */}
            {cartTotalItems > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCartNavigation}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400"
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                {cartTotalItems} item{cartTotalItems !== 1 ? 's' : ''} in cart
              </Button>
            )}
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/50 dark:bg-rose-900/50 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="stock">Stock Level</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-rose-600 dark:text-rose-400">
            Showing {filteredProducts.length} of {products.length} products
            {loading && <span className="ml-2 text-pink-500">(updating...)</span>}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              No products found
            </h3>
            <p className="text-rose-600 dark:text-rose-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            {searchTerm || selectedCategory !== 'All' ? (
              <div className="space-x-4">
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                >
                  Clear Filters
                </Button>
                <Button 
                  onClick={handleBackToDashboard}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleRetryLoad}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Refresh Products
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {filteredProducts.map(product => (
              <div key={product.id} className="relative">
                <ProductCard 
                  product={product}
                  onPurchaseClick={() => handleProductAction(product)}
                  purchaseButtonText={
                    addingToCart === product.id 
                      ? "Adding..." 
                      : recentlyAdded === product.id 
                        ? "Added!" 
                        : "Add to Cart"
                  }
                  disabled={addingToCart === product.id || !product.inStock}
                  showQuantity={true}
                />
                
                {/* Success indicator */}
                {recentlyAdded === product.id && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 animate-pulse z-10">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                
                {/* Out of stock indicator */}
                {!product.inStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 z-10">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}