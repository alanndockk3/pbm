'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star,
  Package,
  Eye,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/library/utils";
import { ProductModal } from './ProductModal';
import { useWishlistStore, useIsInWishlist, useIsItemLoading } from '../../../lib/profile/useWishListStore';
import { useAuthStore } from '../../../lib/auth/useAuthStore';
import { formatPrice } from '../../../lib/product/useProductStore';
import type { StripeProduct } from '../../../lib/product/useProductStore';

interface ProductCardProps {
  product: StripeProduct;
  onViewClick?: () => void;
  onPurchaseClick?: () => void;
  showQuantity?: boolean;
  purchaseButtonText?: string;
  disabled?: boolean;
  className?: string;
}

export const ProductCard = ({
  product,
  onViewClick,
  onPurchaseClick,
  showQuantity = false,
  purchaseButtonText = "Add to Cart",
  disabled = false,
  className
}: ProductCardProps) => {
  const { user } = useAuthStore();
  const { toggleWishlist } = useWishlistStore();
  const isInWishlist = useIsInWishlist(product.id);
  const isWishlistLoading = useIsItemLoading(product.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = () => {
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.uid) {
      console.log('User must be logged in to use wishlist');
      return;
    }

    try {
      await toggleWishlist(user.uid, product.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handlePurchaseClick = () => {
    const isProductInStock = product.inStock ?? true;
    if (!disabled && isProductInStock) {
      onPurchaseClick?.();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle image - prefer the first image from images array, then fallback to image field
  const productImage = product.images?.[0] || product.image;
  const hasImage = productImage && productImage.trim() !== '';
  const imageUrl = productImage || '';

  // Get safe values for all properties
  const productPrice = product.price ?? 0;
  const productQuantity = product.quantity ?? 0;
  const productRating = product.rating ?? 0;
  const productReviews = product.reviews ?? 0;
  const productCategory = product.category ?? 'Uncategorized';
  const isProductInStock = product.inStock ?? true;
  const isProductFeatured = product.isFeatured ?? false;
  const productDescription = product.description ?? '';

  // Get formatted price (handles both legacy and Stripe pricing)
  const formattedPrice = product.defaultPrice 
    ? formatPrice(product.defaultPrice.unit_amount, product.defaultPrice.currency)
    : `${productPrice.toFixed(2)}`;

  return (
    <>
      <div 
        className={cn(
          "rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm group overflow-hidden cursor-pointer",
          className
        )}
        onClick={handleCardClick}
      >
        {/* Product Image Section */}
        <div className="relative overflow-hidden aspect-square">
          {hasImage ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
              <Package className="w-16 h-16 text-pink-500 opacity-50" />
            </div>
          )}
          
          {/* Overlay with action button - ONLY View Details button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick();
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>

          {/* Stock status badges */}
          {!isProductInStock && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}
          
          {productQuantity <= 5 && isProductInStock && productQuantity > 0 && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
              Low Stock
            </Badge>
          )}

          {/* Featured badge */}
          {isProductFeatured && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              Featured
            </Badge>
          )}
        </div>
        
        {/* Product Info Section */}
        <div className="p-4">
          {/* Category Badge */}
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              {productCategory}
            </Badge>
          </div>
          
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Product Description */}
          <p className="text-rose-700 dark:text-rose-300 text-sm mb-3 line-clamp-2">
            {productDescription || 'No description available'}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(productRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400">
              ({productReviews} reviews)
            </span>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {formattedPrice}
            </span>
            {showQuantity && (
              <span className="text-sm text-rose-600 dark:text-rose-400">
                Qty: {productQuantity}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary Action Button Row */}
            <div className="flex gap-2">
              <Button
                className={cn(
                  "flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white",
                  (!isProductInStock || disabled) && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchaseClick();
                }}
                disabled={!isProductInStock || disabled}
              >
                {!isProductInStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {purchaseButtonText}
                  </>
                )}
              </Button>

              {/* Wishlist Heart Button - Next to Add to Cart */}
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHeartClick(e);
                }}
                disabled={isWishlistLoading}
                className={cn(
                  "border-rose-300 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900",
                  isInWishlist 
                    ? "text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20" 
                    : "text-rose-700 dark:text-rose-300",
                  isWishlistLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={closeModal}
        onHeartClick={handleHeartClick}
        onPurchaseClick={onPurchaseClick}
        showQuantity={showQuantity}
        purchaseButtonText={purchaseButtonText}
        disabled={disabled}
        isInWishlist={isInWishlist}
      />
    </>
  );
};

export default ProductCard;