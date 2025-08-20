'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star,
  Package,
  ShoppingCart,
  X,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/library/utils";
import { useIsItemLoading } from '../../../lib/profile/useWishListStore';
import { formatPrice } from '../../../lib/product/useProductStore';
import type { StripeProduct } from '../../../lib/product/useProductStore';

interface ProductModalProps {
  product: StripeProduct;
  isOpen: boolean;
  onClose: () => void;
  onHeartClick?: (e: React.MouseEvent) => void;
  onPurchaseClick?: () => void;
  showQuantity?: boolean;
  purchaseButtonText?: string;
  disabled?: boolean;
  isInWishlist?: boolean;
}

export const ProductModal = ({
  product,
  isOpen,
  onClose,
  onHeartClick,
  onPurchaseClick,
  showQuantity = false,
  purchaseButtonText = "Add to Cart",
  disabled = false,
  isInWishlist = false,
}: ProductModalProps) => {
  const isWishlistLoading = useIsItemLoading(product.id);
  const [quantity, setQuantity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Handle multiple images - use images array if available, otherwise fallback to single image
  const productImages = product.images?.length ? product.images : (product.image ? [product.image] : []);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle ESC key press and body overflow
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHeartClick?.(e);
  };

  const handlePurchaseClick = () => {
    const isProductInStock = product.inStock ?? true;
    if (!disabled && isProductInStock) {
      onPurchaseClick?.();
    }
  };

  const incrementQuantity = () => {
    const maxQuantity = product.quantity ?? 99;
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-rose-950 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Mobile Layout: Vertical Stack */}
        <div className="flex flex-col lg:flex-row">
          
          {/* Product Image Section */}
          <div className="w-full lg:w-1/2 h-80 sm:h-96 lg:h-[500px] relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 overflow-hidden">
            {productImages.length > 0 ? (
              <>
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                />
                
                {/* Image Navigation - Only show if more than one image */}
                {productImages.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    {currentImageIndex > 0 && (
                      <button
                        onClick={previousImage}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    )}
                    
                    {/* Right Arrow */}
                    {currentImageIndex < productImages.length - 1 && (
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    )}
                    
                    {/* Image Dots Indicator */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'bg-white shadow-lg' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-16 h-16 lg:w-24 lg:h-24 text-pink-300 dark:text-pink-700 opacity-50" />
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute top-3 left-3 lg:top-6 lg:left-6 flex flex-col gap-2">
              {!isProductInStock ? (
                <Badge className="bg-red-500/90 text-white text-xs font-medium px-2 py-1 lg:px-3 lg:py-1 rounded-full shadow-md backdrop-blur-sm">
                  Out of Stock
                </Badge>
              ) : productQuantity <= 5 && productQuantity > 0 ? (
                <Badge className="bg-orange-500/90 text-white text-xs font-medium px-2 py-1 lg:px-3 lg:py-1 rounded-full shadow-md backdrop-blur-sm">
                  Only {productQuantity} left!
                </Badge>
              ) : (
                <Badge className="bg-green-500/90 text-white text-xs font-medium px-2 py-1 lg:px-3 lg:py-1 rounded-full shadow-md backdrop-blur-sm">
                  In Stock
                </Badge>
              )}
              
              {isProductFeatured && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-medium px-2 py-1 lg:px-3 lg:py-1 rounded-full shadow-md backdrop-blur-sm">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col max-h-[55vh] lg:max-h-[500px]">
            
            {/* Product Info Section - Scrollable */}
            <div className="p-3 lg:p-8 border-t lg:border-t-0 lg:border-l border-rose-100 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 flex-1 overflow-y-auto">
              
              <Badge 
                variant="secondary" 
                className="mb-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
              >
                {productCategory}
              </Badge>
              
              <h2 className="text-lg lg:text-2xl xl:text-3xl font-bold text-rose-900 dark:text-rose-100 mb-2">
                {product.name}
              </h2>
              
              <p className="text-rose-700 dark:text-rose-300 mb-3 leading-relaxed text-sm lg:text-base">
                {productDescription || 'No description available'}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 lg:w-5 lg:h-5 ${
                        i < Math.floor(productRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-rose-600 dark:text-rose-400">
                  ({productReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-rose-900 dark:text-rose-100">
                  {formattedPrice}
                </span>
                {showQuantity && isProductInStock && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    Available: {productQuantity} items
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              {isProductInStock && (
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-0 w-fit bg-white dark:bg-rose-800 rounded-lg border border-rose-200 dark:border-rose-700 shadow-sm">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-9 w-9 lg:h-10 lg:w-10 rounded-l-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                    <div className="h-9 w-12 lg:h-10 lg:w-16 flex items-center justify-center text-sm font-semibold text-rose-900 dark:text-rose-100 border-x border-rose-200 dark:border-rose-700">
                      {quantity}
                    </div>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= (productQuantity || 99)}
                      className="h-9 w-9 lg:h-10 lg:w-10 rounded-r-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-3 lg:p-8 lg:pt-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 border-t border-rose-200 dark:border-rose-700 flex-shrink-0">
              <div className="space-y-3">
                <button
                  onClick={handlePurchaseClick}
                  disabled={!isProductInStock || disabled}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white h-11 lg:h-12 text-base lg:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                  {!isProductInStock ? 'Out of Stock' : `Add ${quantity} to Cart`}
                </button>
                
                <button
                  onClick={handleHeartClick}
                  disabled={isWishlistLoading}
                  className={cn(
                    "w-full h-9 lg:h-10 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                    isInWishlist 
                      ? "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" 
                      : "border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900",
                    isWishlistLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                  {isWishlistLoading 
                    ? 'Updating...' 
                    : (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductModal;