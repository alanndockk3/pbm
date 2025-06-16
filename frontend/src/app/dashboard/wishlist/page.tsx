'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from '@/components/footer';
import Wishlist from '@/components/account/Wishlist';
import { 
  Heart, 
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Filter,
  Grid3X3,
  List,
  Search,
  Package
} from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useWishlistStore, useWishlistItems, useWishlistLoading } from '../../../../lib/profile/useWishListStore';
import { useProductStore, useProducts } from '../../../../lib/product/useProductStore';
import type { Product } from '../../../../types/product';

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Wishlist store
  const { loadWishlist, removeFromWishlist, subscribeToWishlist } = useWishlistStore();
  const wishlistProductIds = useWishlistItems(); // Array of product IDs
  const wishlistLoading = useWishlistLoading();
  
  // Product store
  const { initializeProducts } = useProductStore();
  const allProducts = useProducts();
  
  // Memoize wishlistItems to prevent infinite re-renders
  const wishlistItems = useMemo(() => {
    return wishlistProductIds
      .map(productId => allProducts.find(product => product.id === productId))
      .filter(Boolean) as Product[];
  }, [wishlistProductIds, allProducts]);
  
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Initialize data on mount
  useEffect(() => {
    if (user?.uid) {
      // Load products and wishlist
      initializeProducts();
      loadWishlist(user.uid);
      
      // Subscribe to real-time wishlist updates
      const unsubscribe = subscribeToWishlist(user.uid);
      return unsubscribe; // Cleanup on unmount
    }
  }, [user?.uid, initializeProducts, loadWishlist, subscribeToWishlist]);

  // Memoize categories to prevent unnecessary recalculations
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(wishlistItems.map(item => item.category)))];
  }, [wishlistItems]);

  // Filter and sort items
  useEffect(() => {
    let filtered = wishlistItems;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => { // Create new array to avoid mutations
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          // Sort by position in wishlist (more recent additions first)
          const aIndex = wishlistProductIds.indexOf(a.id);
          const bIndex = wishlistProductIds.indexOf(b.id);
          return aIndex - bIndex;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredItems(filtered);
  }, [wishlistItems, searchTerm, selectedCategory, sortBy, wishlistProductIds]);

  const handleViewItem = (itemId: string) => {
    router.push(`/dashboard/products/${itemId}`);
  };

  const handleAddToCart = (itemId: string) => {
    console.log('Add to cart:', itemId);
    // Add to cart logic here
    // You might want to show a success toast
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!user?.uid) return;
    
    try {
      await removeFromWishlist(user.uid, itemId);
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = async () => {
    if (!user?.uid) return;
    
    try {
      // Remove all selected items from wishlist
      const removePromises = selectedItems.map(itemId => 
        removeFromWishlist(user.uid!, itemId)
      );
      await Promise.all(removePromises);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error removing selected items:', error);
    }
  };

  const handleAddSelectedToCart = () => {
    const selectedProducts = filteredItems.filter(item => 
      selectedItems.includes(item.id) && item.inStock
    );
    selectedProducts.forEach(product => {
      console.log('Add to cart:', product.id);
    });
    // Add to cart logic for selected items
    setSelectedItems([]);
  };

  // Memoize computed values to prevent unnecessary recalculations
  const stats = useMemo(() => {
    const inStockCount = filteredItems.filter(item => item.inStock).length;
    const outOfStockCount = filteredItems.filter(item => !item.inStock).length;
    const totalValue = filteredItems.reduce((sum, item) => sum + item.price, 0);
    
    return { inStockCount, outOfStockCount, totalValue };
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
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
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">My Wishlist</h1>
              <p className="text-rose-600 dark:text-rose-400">
                {wishlistLoading ? 'Loading...' : (
                  <>
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} 
                    {searchTerm || selectedCategory !== 'All' ? ' found' : ' saved'}
                  </>
                )}
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

        {/* Wishlist Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">{filteredItems.length}</div>
              <div className="text-sm text-rose-600 dark:text-rose-400">Total Items</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.inStockCount}</div>
              <div className="text-sm text-rose-600 dark:text-rose-400">In Stock</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
              <div className="text-sm text-rose-600 dark:text-rose-400">Out of Stock</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">${stats.totalValue.toFixed(2)}</div>
              <div className="text-sm text-rose-600 dark:text-rose-400">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
            <input
              type="text"
              placeholder="Search wishlist..."
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
            <option value="newest">Recently Added</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {filteredItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/50 dark:bg-rose-900/50 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
            >
              {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
            </Button>
            
            {selectedItems.length > 0 && (
              <>
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  {selectedItems.length} selected
                </Badge>
                
                <Button
                  size="sm"
                  onClick={handleAddSelectedToCart}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  disabled={!selectedItems.some(id => filteredItems.find(item => item.id === id)?.inStock)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add Selected to Cart
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Selected
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Wishlist Content */}
      <section className="container mx-auto px-4 pb-12">
        {wishlistLoading ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-rose-700 dark:text-rose-300">Loading your wishlist...</p>
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              {searchTerm || selectedCategory !== 'All' ? (
                <>
                  <Package className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                    No items found
                  </h3>
                  <p className="text-rose-600 dark:text-rose-400 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-rose-600 dark:text-rose-400 mb-6">
                    Start adding items you love to keep track of them!
                  </p>
                  <Button 
                    onClick={() => router.push('/dashboard/products')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    Browse Products
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Wishlist
            items={filteredItems}
            isCompact={false}
            showActions={true}
            onViewItem={handleViewItem}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        )}
      </section>

      <Footer />
    </div>
  );
}