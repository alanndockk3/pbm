'use client'

import React, { useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Eye, ShoppingCart, X } from "lucide-react";
import { ProductCard } from '@/components/product/ProductCard';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useWishlistStore, useWishlistItems, useWishlistLoading } from '../../../../lib/profile/useWishListStore';
import { useProductStore, useProducts } from '../../../../lib/product/useProductStore';
import type { Product } from '../../../../types/product';

interface WishlistProps {
  items?: Product[]; // Optional override for items
  isCompact?: boolean;
  showActions?: boolean;
  onViewItem?: (itemId: string) => void;
  onAddToCart?: (itemId: string) => void;
  onRemoveFromWishlist?: (itemId: string) => void;
  onViewAll?: () => void;
}

export default function Wishlist({
  items, // If provided, use these items instead of fetching from store
  isCompact = false,
  showActions = true,
  onViewItem,
  onAddToCart,
  onRemoveFromWishlist,
  onViewAll
}: WishlistProps) {
  const { user } = useAuthStore();
  
  // Wishlist store
  const { loadWishlist, removeFromWishlist, subscribeToWishlist } = useWishlistStore();
  const wishlistProductIds = useWishlistItems();
  const wishlistLoading = useWishlistLoading();
  
  // Product store
  const { initializeProducts } = useProductStore();
  const allProducts = useProducts();
  
  // Get actual product objects from wishlist IDs (only if items not provided)
  const wishlistItems = useMemo(() => {
    if (items) {
      return items; // Use provided items if available
    }
    
    return wishlistProductIds
      .map(productId => allProducts.find(product => product.id === productId))
      .filter(Boolean) as Product[];
  }, [items, wishlistProductIds, allProducts]);

  // Initialize data on mount (only if items not provided)
  useEffect(() => {
    if (!items && user?.uid) {
      initializeProducts();
      loadWishlist(user.uid);
      
      const unsubscribe = subscribeToWishlist(user.uid);
      return unsubscribe;
    }
  }, [items, user?.uid, initializeProducts, loadWishlist, subscribeToWishlist]);

  const handleViewItem = (itemId: string) => {
    if (onViewItem) {
      onViewItem(itemId);
    } else {
      console.log('View item:', itemId);
    }
  };

  const handleAddToCart = (itemId: string) => {
    if (onAddToCart) {
      onAddToCart(itemId);
    } else {
      console.log('Add to cart:', itemId);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(itemId);
    } else if (user?.uid) {
      try {
        await removeFromWishlist(user.uid, itemId);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all wishlist items');
    }
  };

  // Loading state (only show if items not provided and we're loading from store)
  const isLoading = !items && wishlistLoading;

  if (isCompact) {
    // Compact version for dashboard
    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Wishlist</CardTitle>
                <CardDescription className="text-rose-700 dark:text-rose-300">
                  {isLoading ? 'Loading...' : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} you love`}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700"
              onClick={handleViewAll}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center animate-pulse">
                  <Heart className="w-4 h-4 text-pink-300" />
                </div>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <p className="text-rose-600 dark:text-rose-400">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {wishlistItems.slice(0, 6).map((item) => (
                <div 
                  key={item.id} 
                  className="aspect-square rounded-lg flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden"
                  onClick={() => handleViewItem(item.id)}
                  style={{
                    backgroundImage: item.image ? `url(${item.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Fallback gradient background when no image */}
                  {!item.image && (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900"></div>
                  )}
                  
                  {/* Heart Icon - only show when no image and not hovering */}
                  {!item.image && (
                    <Heart className="w-4 h-4 text-pink-500 fill-current relative z-10 group-hover:opacity-0 transition-opacity duration-200" />
                  )}
                  
                  {/* Stock status indicator */}
                  {!item.inStock && (
                    <div className="absolute top-1 right-1 z-30">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Hover overlay with item info */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex flex-col items-center justify-center p-2">
                    <p className="text-white text-xs font-medium text-center line-clamp-2">{item.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Show placeholder boxes if less than 6 items */}
              {Array.from({ length: Math.max(0, 6 - wishlistItems.length) }).map((_, index) => (
                <div 
                  key={`placeholder-${index}`} 
                  className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center opacity-50"
                >
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full version for dedicated wishlist page using ProductCard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">My Wishlist</h1>
          <p className="text-rose-600 dark:text-rose-400">
            {isLoading ? 'Loading...' : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} saved`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-xl shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-rose-600 dark:text-rose-400 mb-6">
              Start adding items you love to keep track of them!
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard
                product={item}
                onPurchaseClick={() => handleAddToCart(item.id)}
                onViewClick={() => handleViewItem(item.id)}
                showQuantity={false}
                purchaseButtonText="Add to Cart"
              />
              {/* Remove from wishlist button */}
              {showActions && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}