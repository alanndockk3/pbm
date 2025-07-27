'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, X, Star, Eye } from "lucide-react";
import { WishlistProductModal } from './WishlistProductModal';
import type { Product } from '../../../../types/product';

interface WishlistProductCardProps {
  product: Product;
  onViewClick?: (productId: string) => void;
  onAddToCart?: (productId: string, quantity?: number) => void;
  onRemoveFromWishlist?: (productId: string) => void;
  showActions?: boolean;
  isCompact?: boolean;
}

export function WishlistProductCard({
  product,
  onViewClick,
  onAddToCart,
  onRemoveFromWishlist,
  showActions = true,
  isCompact = false
}: WishlistProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = () => {
    setIsModalOpen(true);
  };

  const handleAddToCart = (productId: string, quantity?: number) => {
    if (onAddToCart) {
      onAddToCart(productId, quantity);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(productId);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isCompact) {
    // Compact version for grid view (like dashboard)
    return (
      <>
        <div 
          className="group aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={handleViewClick}
          style={{
            backgroundImage: product.image ? `url(${product.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Fallback gradient background when no image */}
          {!product.image && (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900"></div>
          )}
          
          {/* Heart Icon - only show when no image and not hovering */}
          {!product.image && (
            <Heart className="w-6 h-6 text-pink-500 relative z-10 mb-2 group-hover:opacity-0 transition-all duration-300" />
          )}

          {/* Product Info on Hover */}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <p className="text-white text-sm font-medium text-center px-2 line-clamp-2">{product.name}</p>
          </div>

          {/* Stock Status Badge */}
          {!product.inStock && (
            <div className="absolute top-1 right-1 z-10">
              <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">
                Out
              </Badge>
            </div>
          )}

          {/* Remove button */}
          {showActions && onRemoveFromWishlist && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromWishlist(product.id);
              }}
              className="absolute top-1 left-1 z-30 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {/* Product Modal for compact version */}
        <WishlistProductModal
          product={product}
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
          onRemoveFromWishlist={handleRemoveFromWishlist}
        />
      </>
    );
  }

  // Full card version for product listings
  return (
    <>
      <div className="group relative bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Product Image */}
        <div 
          className="aspect-square relative overflow-hidden cursor-pointer"
          onClick={handleViewClick}
          style={{
            backgroundImage: product.image ? `url(${product.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Fallback gradient background when no image */}
          {!product.image && (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
          )}

          {/* Stock Status Badge */}
          {!product.inStock && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 text-white">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewClick}
              className="bg-white/90 text-gray-900 hover:bg-white"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <Badge variant="secondary" className="text-xs mb-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              {product.category}
            </Badge>
            <h3 className="font-semibold text-rose-900 dark:text-rose-100 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors" onClick={handleViewClick}>
              {product.name}
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400 line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-current text-yellow-500" />
              <span className="text-sm font-medium text-rose-900 dark:text-rose-100 ml-1">
                {product.rating}
              </span>
            </div>
            <span className="text-sm text-rose-600 dark:text-rose-400">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product.id, 1);
                }}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:from-gray-400 disabled:to-gray-500"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              {/* Remove from Wishlist Heart Button */}
              {onRemoveFromWishlist && (
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromWishlist(product.id);
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Product Modal */}
        <WishlistProductModal
          product={product}
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
          onRemoveFromWishlist={handleRemoveFromWishlist}
        />
      </div>
    </>
  );
}