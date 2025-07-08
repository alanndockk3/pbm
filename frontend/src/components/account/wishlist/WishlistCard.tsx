'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Eye,
  ShoppingCart,
  DollarSign,
  Star
} from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useWishlistStore, useWishlistItems, useWishlistLoading } from '../../../../lib/profile/useWishListStore';
import { useProductStore, useProducts } from '../../../../lib/product/useProductStore';
import { WishlistProductCard } from './WishlistProductCard';
import { WishlistProductModal } from './WishlistProductModal';
import type { Product } from '../../../../types/product';

interface WishlistCardProps {
  onAddToCart?: (itemId: string) => void;
  className?: string;
}

export default function WishlistCard({ onAddToCart, className = "" }: WishlistCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Wishlist store
  const { loadWishlist, removeFromWishlist, subscribeToWishlist } = useWishlistStore();
  const wishlistProductIds = useWishlistItems();
  const wishlistLoading = useWishlistLoading();
  
  // Product store
  const { initializeProducts } = useProductStore();
  const allProducts = useProducts();
  
  // Get actual product objects from wishlist IDs
  const wishlistItems = useMemo(() => {
    return wishlistProductIds
      .map(productId => allProducts.find(product => product.id === productId))
      .filter(Boolean) as Product[];
  }, [wishlistProductIds, allProducts]);

  // Initialize data on mount
  useEffect(() => {
    if (user?.uid) {
      initializeProducts();
      loadWishlist(user.uid);
      
      const unsubscribe = subscribeToWishlist(user.uid);
      return unsubscribe;
    }
  }, [user?.uid, initializeProducts, loadWishlist, subscribeToWishlist]);

  const handleViewAllWishlist = () => {
    router.push('/dashboard/wishlist');
  };

  const handleViewWishlistItem = (itemId: string) => {
    console.log('Viewing wishlist item:', itemId); // Debug log
    const product = wishlistItems.find(item => item.id === itemId);
    console.log('Found product:', product); // Debug log
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
      console.log('Modal should open now'); // Debug log
    }
  };

  const handleAddToCartClick = (itemId: string, quantity: number = 1) => {
    if (onAddToCart) {
      onAddToCart(itemId);
    } else {
      console.log('Add to cart:', itemId, 'Quantity:', quantity);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!user?.uid) return;
    
    try {
      await removeFromWishlist(user.uid, itemId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Wishlist</CardTitle>
              <CardDescription className="text-rose-700 dark:text-rose-300">
                {wishlistLoading ? 'Loading...' : `${wishlistItems.length} items you love`}
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewAllWishlist}
            className="text-purple-600 hover:text-purple-700"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {wishlistLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-xl flex items-center justify-center animate-pulse">
                <Heart className="w-6 h-6 text-pink-300" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">Your wishlist is empty</h3>
            <p className="text-rose-600 dark:text-rose-400 mb-4">Start adding items you love!</p>
            <Button 
              onClick={() => router.push('/dashboard/products')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {/* Show first 6 wishlist items */}
            {wishlistItems.slice(0, 6).map((item) => (
              <div 
                key={item.id} 
                className="group aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleViewWishlistItem(item.id)}
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
                  <Heart className="w-6 h-6 text-pink-500 relative z-10 mb-2 group-hover:opacity-0 transition-all duration-300" />
                )}
                
                {/* Product Info on Hover */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <p className="text-white text-sm font-medium text-center px-2 line-clamp-2">{item.name}</p>
                </div>

                {/* Stock Status Badge */}
                {!item.inStock && (
                  <div className="absolute top-1 right-1 z-10">
                    <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">
                      Out
                    </Badge>
                  </div>
                )}
              </div>
            ))}
            
            {/* Show placeholder boxes if less than 6 items */}
            {Array.from({ length: Math.max(0, 6 - wishlistItems.length) }).map((_, index) => (
              <div 
                key={`placeholder-${index}`} 
                className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center opacity-50"
              >
                <Heart className="w-6 h-6 text-gray-400" />
              </div>
            ))}
          </div>
        )}
        
        {/* Show "View More" if there are more than 6 items */}
        {wishlistItems.length > 6 && (
          <div className="text-center mt-4">
            <Button 
              variant="outline"
              onClick={handleViewAllWishlist}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300"
            >
              View {wishlistItems.length - 6} More Items
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Wishlist Product Modal */}
      {selectedProduct && (
        <WishlistProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCartClick}
          onRemoveFromWishlist={handleRemoveFromWishlist}
        />
      )}
    </Card>
  );
}