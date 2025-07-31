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
import { ProductModal } from '@/components/product/ProductModal';
import type { Product } from '../../../../types/product';
import type { StripeProduct } from '../../../../lib/product/useProductStore';

interface WishlistCardProps {
  onAddToCart?: (itemId: string) => void;
  className?: string;
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
    // Add any other StripeProduct specific fields with defaults
    metadata: {},
    active: true,
    defaultPrice: undefined, // Will use legacy price field
  };
};

export default function WishlistCard({ onAddToCart, className = "" }: WishlistCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Wishlist store
  const { loadWishlist, removeFromWishlist, subscribeToWishlist, toggleWishlist } = useWishlistStore();
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

  // Convert selected product to StripeProduct format when needed
  const selectedStripeProduct = useMemo(() => {
    return selectedProduct ? convertToStripeProduct(selectedProduct) : null;
  }, [selectedProduct]);

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
      // Close modal if the removed item was being viewed
      if (selectedProduct?.id === itemId) {
        setIsModalOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Handle heart click for ProductModal (toggles wishlist)
  const handleHeartClick = async (e: React.MouseEvent) => {
    if (!user?.uid || !selectedProduct) return;
    
    try {
      await toggleWishlist(user.uid, selectedProduct.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Handle purchase click for ProductModal
  const handlePurchaseClick = () => {
    if (selectedProduct) {
      handleAddToCartClick(selectedProduct.id, 1);
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
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`loading-${i}`} className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-xl flex items-center justify-center animate-pulse">
                <Heart className="w-6 h-6 text-pink-300" />
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">Your wishlist is empty</h3>
            <p className="text-rose-600 dark:text-rose-400 mb-4">Start adding items you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {/* Show first 6 wishlist items */}
            {wishlistItems.slice(0, 6).map((item) => (
              <div 
                key={`wishlist-item-${item.id}`} 
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

                {/* Price overlay at bottom - always visible */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 z-10 transform translate-y-0 group-hover:translate-y-full transition-transform duration-300">
                  <p className="text-white text-sm font-bold text-center">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                
                {/* Product Info on Hover - slides up from bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-center text-white">
                    <p className="font-medium text-sm line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-xs text-gray-200 line-clamp-1 mb-2">{item.category}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span className="text-xs">{item.rating}</span>
                      <span className="text-xs text-gray-300">({item.reviews})</span>
                    </div>
                    <p className="font-bold text-sm">${item.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Stock Status Badge */}
                {!item.inStock && (
                  <div className="absolute top-1 right-1 z-30">
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
      
      {/* Product Modal - Updated to use ProductModal */}
      {selectedStripeProduct && (
        <ProductModal
          product={selectedStripeProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onHeartClick={handleHeartClick}
          onPurchaseClick={handlePurchaseClick}
          showQuantity={true}
          purchaseButtonText="Add to Cart"
          disabled={false}
          isInWishlist={true}
        />
      )}
    </Card>
  );
}