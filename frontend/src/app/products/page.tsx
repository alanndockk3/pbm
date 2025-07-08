"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Grid3X3,
  List,
  Package,
  ArrowLeft,
  Sparkles,
  Gift,
  Loader2,
  Heart
} from "lucide-react";
import { useProductStore, useProducts, useCategories } from '../../../lib/product/useProductStore';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '../../../types/product';
import { Timestamp } from 'firebase/firestore';

export default function ProductsPage() {
  const initializeProducts = useProductStore(state => state.initializeProducts);
  const searchProducts = useProductStore(state => state.searchProducts);
  const products = useProducts();
  const categories = useCategories();
  const isLoading = useProductStore(state => state.loading);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  // Initialize products when component mounts
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  // Get filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = searchProducts(searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'stock':
          return b.quantity - a.quantity;
        case 'newest':
          // Handle Firestore Timestamp for createdAt if it exists
          try {
            const getTime = (item: any) => {
              if (!item.createdAt) return 0;
              if (item.createdAt instanceof Timestamp) {
                return item.createdAt.toDate().getTime();
              }
              return new Date(item.createdAt).getTime();
            };
            return getTime(b) - getTime(a);
          } catch (error) {
            console.warn('Error sorting by date:', error);
            return 0;
          }
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy, searchProducts]);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleProductView = (product: Product) => {
    // Navigate to product detail page or show modal
    console.log('View product:', product);
    // You can implement navigation to product detail page here
    // For example: router.push(`/products/${product.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('name');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">Loading Products</h2>
          <p className="text-rose-600 dark:text-rose-400">Fetching our beautiful handmade items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                Handmade Products
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                Discover our beautiful collection of handcrafted treasures
              </p>
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
            className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 min-w-[150px]"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 min-w-[180px]"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="stock">Most in Stock</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Results count and badges */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <p className="text-rose-600 dark:text-rose-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Handcrafted with Love
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Gift className="w-3 h-3 mr-1" />
              Perfect for Gifting
            </Badge>
          </div>
        </div>
      </header>

      {/* Products Grid/List */}
      <section className="container mx-auto px-4 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              No products found
            </h3>
            <p className="text-rose-600 dark:text-rose-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredProducts.map((product: Product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onPurchaseClick={() => handleProductView(product)}
                purchaseButtonText="View Details"
                showQuantity={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-rose-200 dark:border-rose-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-rose-800 dark:text-rose-200">PBM - Pretties by Marg</span>
              <p className="text-xs text-rose-600 dark:text-rose-400">Handcrafted with love since 2024</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-rose-600 dark:text-rose-400">
            <button 
              onClick={handleBackToHome}
              className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
            >
              Home
            </button>
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors">
              Custom Orders
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}