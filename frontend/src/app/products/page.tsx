"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Heart,
  Filter,
  X,
  ShoppingCart,
  User
} from "lucide-react";
import Footer from '@/components/footer';
import { useProductStore, useProducts, useCategories, type StripeProduct } from '../../../lib/product/useProductStore';
import ProductCard from '@/components/product/ProductCard';
import { useAuthStore } from '../../../lib/auth/useAuthStore';
import { LoginModal } from '@/components/login-modal';
import { SignupModal } from '@/components/signup-modal';

export default function PublicProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const initializeProducts = useProductStore(state => state.initializeProducts);
  const searchProducts = useProductStore(state => state.searchProducts);
  const products = useProducts();
  const categories = useCategories();
  const isLoading = useProductStore(state => state.loading);
  const error = useProductStore(state => state.error);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

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
          const priceA = a.defaultPrice?.unit_amount || (a.price || 0) * 100;
          const priceB = b.defaultPrice?.unit_amount || (b.price || 0) * 100;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = a.defaultPrice?.unit_amount || (a.price || 0) * 100;
          const priceB2 = b.defaultPrice?.unit_amount || (b.price || 0) * 100;
          return priceB2 - priceA2;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'stock':
          return (b.quantity || 0) - (a.quantity || 0);
        case 'newest':
          // Handle Firestore Timestamp for created field
          try {
            const getTime = (item: StripeProduct) => {
              if (!item.created) return 0;
              if (item.created && typeof item.created.toDate === 'function') {
                return item.created.toDate().getTime();
              }
              return new Date(item.created as any).getTime();
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
    router.push('/');
  };

  const handleProductView = (product: StripeProduct) => {
    // For public page, focus on viewing product details
    // Could navigate to a product detail page or show in modal
    console.log('View product details:', product);
    
    // If you have a product detail page:
    // router.push(`/products/${product.id}`);
    
    // For now, we'll just log - you can implement product detail modal/page later
  };

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleProductAction = () => {
    setIsSignupOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || sortBy !== 'name';

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">Error Loading Products</h2>
          <p className="text-rose-600 dark:text-rose-400 mb-4">{error}</p>
          <Button
            onClick={() => initializeProducts()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
          {user ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => router.push('/dashboard/cart')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setIsSignupOpen(true)}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
            <input
              type="text"
              placeholder="Search for handmade treasures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 placeholder-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
            />
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {hasActiveFilters && '(Active)'}
            </Button>
          </div>

          {/* Desktop filters */}
          <div className="hidden lg:flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

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

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-white/50 dark:bg-rose-900/50 rounded-lg p-1">
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

        {/* Mobile filters dropdown */}
        {showFilters && (
          <div className="lg:hidden bg-white/90 dark:bg-rose-900/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-rose-200 dark:border-rose-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-rose-900 dark:text-rose-100">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="stock">Most in Stock</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">View:</span>
                <div className="flex items-center gap-1 bg-white/50 dark:bg-rose-900/50 rounded-lg p-1">
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
          </div>
        )}

        {/* Results count and active filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-rose-600 dark:text-rose-400">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-rose-600 hover:text-rose-800 p-0 h-auto mt-1"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all filters
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Handcrafted
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Gift className="w-3 h-3 mr-1" />
              Gift Ready
            </Badge>
          </div>
        </div>
      </header>

      {/* Products Grid/List */}
      <section className="container mx-auto px-4 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-20 h-20 text-rose-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-rose-900 dark:text-rose-100 mb-4">
              {products.length === 0 ? 'No products available' : 'No products found'}
            </h3>
            <p className="text-rose-600 dark:text-rose-400 mb-6 max-w-md mx-auto">
              {products.length === 0 
                ? 'We are currently updating our inventory. Please check back soon!'
                : 'Try adjusting your search terms or filters to find what you\'re looking for.'
              }
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredProducts.map((product: StripeProduct) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onPurchaseClick={() => handleProductAction()}
                purchaseButtonText="Sign Up to Purchase"
                showQuantity={false}
                // Disable cart/wishlist functionality on public page
                disabled={!user}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}