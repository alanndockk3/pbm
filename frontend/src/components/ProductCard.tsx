'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star,
  Package,
  Eye,
  ShoppingCart,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from '../../lib/product/useProductStore';

interface ProductCardProps {
  product: Product;
  onViewClick?: () => void;
  onHeartClick?: () => void;
  onPurchaseClick?: () => void;
  showQuantity?: boolean;
  purchaseButtonText?: string;
  disabled?: boolean;
  className?: string;
}

export const ProductCard = ({
  product,
  onViewClick,
  onHeartClick,
  onPurchaseClick,
  showQuantity = false,
  purchaseButtonText = "Add to Cart",
  disabled = false,
  className
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = () => {
    setIsModalOpen(true);
    onViewClick?.();
  };

  const handleHeartClick = () => {
    onHeartClick?.();
  };

  const handlePurchaseClick = () => {
    if (!disabled && product.inStock) {
      onPurchaseClick?.();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const hasImage = product.image && product.image.trim() !== '';
  const imageUrl = product.image || '';

  return (
    <>
      <div className={cn(
        "rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm group overflow-hidden",
        className
      )}>
        {/* Product Image Section */}
        <div className="relative overflow-hidden aspect-square">
          {hasImage ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
              <Package className="w-16 h-16 text-pink-500 opacity-50" />
            </div>
          )}
          
          {/* Overlay with action buttons */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white"
              onClick={handleViewClick}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Stock status badges */}
          {!product.inStock && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}
          
          {product.quantity <= 5 && product.inStock && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
              Low Stock
            </Badge>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
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
              {product.category}
            </Badge>
          </div>
          
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Product Description */}
          <p className="text-rose-700 dark:text-rose-300 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              ${product.price.toFixed(2)}
            </span>
            {showQuantity && (
              <span className="text-sm text-rose-600 dark:text-rose-400">
                Qty: {product.quantity}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute -top-12 right-0 bg-white/90 hover:bg-white z-10"
              onClick={closeModal}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {/* Modal Content */}
            <div className="bg-white dark:bg-rose-900 rounded-xl overflow-hidden shadow-2xl">
              {/* Large Image */}
              <div className="relative aspect-square max-h-[70vh]">
                {hasImage ? (
                  <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-contain bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
                    <Package className="w-32 h-32 text-pink-500 opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Product Details in Modal */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                      {product.category}
                    </Badge>
                    <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-2">
                      {product.name}
                    </h2>
                    <p className="text-rose-700 dark:text-rose-300 mb-4">
                      {product.description}
                    </p>
                    
                    {/* Rating in Modal */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
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
                  </div>
                  
                  <div className="text-right">
                    <span className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                      ${product.price.toFixed(2)}
                    </span>
                    {showQuantity && (
                      <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                        Quantity: {product.quantity}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons in Modal */}
                <div className="flex gap-3 mt-6">
                  <Button 
                    className={cn(
                      "flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white",
                      (!product.inStock || disabled) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={handlePurchaseClick}
                    disabled={!product.inStock || disabled}
                  >
                    {!product.inStock ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {purchaseButtonText}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900"
                    onClick={handleHeartClick}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;