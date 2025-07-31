// components/account/wishlist/Wishlist.tsx
'use client'

import React, { useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import WishlistCard from './WishlistCard';
import { ProductCard } from '@/components/product/ProductCard'; // Using ProductCard instead
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useWishlistStore, useWishlistItems, useWishlistLoading } from '../../../../lib/profile/useWishListStore';
import { useProductStore, useProducts } from '../../../../lib/product/useProductStore';
import type { Product } from '../../../../types/product';
import type { StripeProduct } from '../../../../lib/product/useProductStore';

interface WishlistProps {
  items?: Product[]; // Optional override for items
  isCompact?: boolean;
  showActions?: boolean;
  onViewItem?: (itemId: string) => void;
  onAddToCart?: (itemId: string, quantity?: number) => void;
  onRemoveFromWishlist?: (itemId: string) => void;
  onViewAll?: () => void;
}

// Helper function to convert Product to StripeProduct format
const convertToStripeProduct = (product: Product): StripeProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    images: product.image ? [product.image] : [],
    image: product.image ?? undefined,
    price: product.price,
    quantity: product.quantity,
    rating: product.rating,
    reviews: product.reviews,
    category: product.category,
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    metadata: {},
    active: true,
    defaultPrice: undefined,
  };
};

export default function Wishlist({
  items,
  isCompact = false,
  showActions = true,
  onViewItem,
  onAddToCart,
  onRemoveFromWishlist,
  onViewAll
}: WishlistProps) {
  const { user } = useAuthStore();
  
  // Wishlist store
  const { loadWishlist, removeFromWishlist: removeFromWishlistStore, subscribeToWishlist } = useWishlistStore();
  const wishlistProductIds = useWishlistItems();
  const wishlistLoading = useWishlistLoading();
  
  // Product store
  const { initializeProducts } = useProductStore();
  const allProducts = useProducts();
  
  // Get actual product objects from wishlist IDs (only if items not provided)
  const wishlistItems = useMemo(() => {
    if (items) {
      return items
    }
    
    return wishlistProductIds
      .map(productId => allProducts.find(product => product.id === productId))
      .filter(Boolean) as Product[];
  }, [items, wishlistProductIds, allProducts]);

  // Convert to StripeProduct format for ProductCard
  const stripeWishlistItems = useMemo(() => {
    return wishlistItems.map(convertToStripeProduct);
  }, [wishlistItems]);

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

  const handleAddToCart = (itemId: string, quantity: number = 1) => {
    if (onAddToCart) {
      onAddToCart(itemId, quantity);
    } else {
      console.log('Add to cart:', itemId, 'quantity:', quantity);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(itemId);
    } else if (user?.uid) {
      try {
        await removeFromWishlistStore(user.uid, itemId);
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

  const handleProductAction = (product: StripeProduct) => {
    handleAddToCart(product.id, 1);
  };

  // Loading state (only show if items not provided and we're loading from store)
  const isLoading = !items && wishlistLoading;

  if (isCompact) {
    // Compact version for dashboard - use WishlistCard
    return (
      <WishlistCard 
        onAddToCart={handleAddToCart}
      />
    );
  }

  // Full version for dedicated wishlist page
  return (
    <div className="space-y-6">
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stripeWishlistItems.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPurchaseClick={() => handleProductAction(item)}
              purchaseButtonText="Add to Cart"
              showQuantity={true}
              className="relative group"
            />
          ))}
        </div>
      )}
    </div>
  );
}