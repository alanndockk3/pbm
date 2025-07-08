'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star,
  Package,
  ShoppingCart,
  X
} from "lucide-react";
import { cn } from "@/library/utils";
import type { Product } from '../../../types/product';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onHeartClick?: () => void;
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
  if (!isOpen) return null;

  const handleHeartClick = () => {
    onHeartClick?.();
  };

  const handlePurchaseClick = () => {
    if (!disabled && product.inStock) {
      onPurchaseClick?.();
    }
  };

  const hasImage = product.image && product.image.trim() !== '';
  const imageUrl = product.image || '';

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute -top-12 right-0 bg-white/90 hover:bg-white z-10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        {/* Modal Content */}
        <div className="bg-white dark:bg-rose-900 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-full">
          {/* Image Section */}
          <div className="flex-1 relative min-h-0 lg:min-h-[70vh]">
            {hasImage ? (
              <img 
                src={imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
                <Package className="w-32 h-32 text-pink-500 opacity-50" />
              </div>
            )}

            {/* Wishlist Heart Button Overlay */}
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "absolute top-4 right-4",
                isInWishlist 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-white/90 hover:bg-white text-rose-600 hover:text-rose-700"
              )}
              onClick={handleHeartClick}
            >
              <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
            </Button>
          </div>
          
          {/* Product Details Section */}
          <div className="lg:w-96 p-6 border-t lg:border-t-0 lg:border-l border-rose-100 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 flex flex-col">
            {/* Product Info */}
            <div className="flex-1">
              <Badge variant="secondary" className="mb-3 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                {product.category}
              </Badge>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-rose-900 dark:text-rose-100 mb-3">
                {product.name}
              </h2>
              
              <p className="text-rose-700 dark:text-rose-300 mb-4 leading-relaxed">
                {product.description}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-rose-600 dark:text-rose-400">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-rose-900 dark:text-rose-100">
                  ${product.price.toFixed(2)}
                </span>
                {showQuantity && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    Available: {product.quantity} items
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {!product.inStock ? (
                  <Badge className="bg-red-500 text-white">
                    Out of Stock
                  </Badge>
                ) : product.quantity <= 5 ? (
                  <Badge className="bg-orange-500 text-white">
                    Only {product.quantity} left!
                  </Badge>
                ) : (
                  <Badge className="bg-green-500 text-white">
                    In Stock
                  </Badge>
                )}
                
                {product.isFeatured && (
                  <Badge className="ml-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Purchase Button */}
              <Button 
                className={cn(
                  "w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-lg",
                  (!product.inStock || disabled) && "opacity-50 cursor-not-allowed"
                )}
                onClick={handlePurchaseClick}
                disabled={!product.inStock || disabled}
              >
                {!product.inStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {purchaseButtonText}
                  </>
                )}
              </Button>
              
              {/* Wishlist Button */}
              <Button 
                variant="outline" 
                className={cn(
                  "w-full py-3",
                  isInWishlist 
                    ? "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" 
                    : "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
                )}
                onClick={handleHeartClick}
              >
                <Heart className={cn("w-4 h-4 mr-2", isInWishlist && "fill-current")} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;