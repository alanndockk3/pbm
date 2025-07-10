"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Grid3X3,
  List,
  Package,
  ArrowLeft,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useProductStore, useProducts, useCategories } from '../../../../lib/product/useProductStore';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductsPage() {
  const router = useRouter();
  const initializeProducts = useProductStore(state => state.initializeProducts);
  const searchProducts = useProductStore(state => state.searchProducts);
  const products = useProducts();
  const categories = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

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
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    return filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'stock':
          return b.quantity - a.quantity;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const filteredProducts = getFilteredProducts();

  const handleProductAction = (product: any) => {
    // Handle product actions like view, add to wishlist, purchase
    console.log('Product action:', product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
            {/* Header */}
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
      <Heart className="w-5 h-5 text-white" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">PBM</h1>
      <p className="text-xs text-rose-600 dark:text-rose-300">Pretties by Marg</p>
    </div>
  </div>
  <div className="flex items-center gap-4">
    <Button 
      variant="outline" 
      className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 relative"
      onClick={() => router.push('/dashboard/cart')} // You can adjust this route as needed
    >
      <ShoppingBag className="w-4 h-4 mr-2" />
      Cart
    </Button>
  </div>
</header>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Products</h1>
              <p className="text-rose-600 dark:text-rose-400">Browse our handmade collection</p>
            </div>
          </div>
          
          {/* View mode toggle */}
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

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
          </p>
        </div>
      </header>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              No products found
            </h3>
            <p className="text-rose-600 dark:text-rose-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onPurchaseClick={() => handleProductAction(product)}
                purchaseButtonText="Add to Cart"
                showQuantity={true}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}