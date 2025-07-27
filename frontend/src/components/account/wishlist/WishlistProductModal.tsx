'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Minus, Plus, X, Package, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from '../../../../types/product';

interface WishlistProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productId: string, quantity?: number) => void;
  onRemoveFromWishlist?: (productId: string) => void;
}

export function WishlistProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onRemoveFromWishlist
}: WishlistProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock multiple images - replace with actual product images array
  const productImages = product.image ? [product.image] : []; // Changed to single image for testing

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle ESC key press
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

  const handleAddToCart = () => {
    if (onAddToCart && product.inStock) {
      onAddToCart(product.id, quantity);
    }
  };

  const handleRemoveFromWishlist = () => {
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
      onClose();
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
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

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-5xl w-full max-h-[85vh] bg-white dark:bg-rose-950 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex flex-col lg:flex-row min-h-[650px]">
          
          {/* Product Image Section - Left Side */}
          <div className="lg:w-1/2 relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 overflow-hidden">
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
                    {/* Left Arrow - Only show if not at first image */}
                    {currentImageIndex > 0 && (
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    )}
                    
                    {/* Right Arrow - Only show if not at last image */}
                    {currentImageIndex < productImages.length - 1 && (
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                    )}
                    
                    {/* Image Dots Indicator - Only show if more than one image */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
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
                <Package className="w-24 h-24 text-pink-300 dark:text-pink-700 opacity-50" />
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {!product.inStock ? (
                <Badge className="bg-red-500/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                  Out of Stock
                </Badge>
              ) : product.quantity <= 5 ? (
                <Badge className="bg-orange-500/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                  Only {product.quantity} left!
                </Badge>
              ) : (
                <Badge className="bg-green-500/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                  In Stock
                </Badge>
              )}
              
              {product.isFeatured && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details Section - Right Side */}
          <div className="lg:w-1/2 flex flex-col">
            
            {/* Product Info Section */}
            <div className="p-8 border-t lg:border-t-0 lg:border-l border-rose-100 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 flex-1">
              
              <Badge 
                variant="secondary" 
                className="mb-3 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
              >
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
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
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
                {product.inStock && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    Available: {product.quantity} items
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-8">
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

              {/* Quantity Selector - Moved closer to bottom */}
              {product.inStock && (
                <div className="mt-auto mb-6">
                  <label className="block text-sm font-semibold text-rose-900 dark:text-rose-100 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-0 w-fit bg-white dark:bg-rose-800 rounded-lg border border-rose-200 dark:border-rose-700 shadow-sm">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="h-10 w-16 flex items-center justify-center text-sm font-semibold text-rose-900 dark:text-rose-100 border-x border-rose-200 dark:border-rose-700">
                      {quantity}
                    </div>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.quantity}
                      className="h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-8 pt-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 border-t border-rose-200 dark:border-rose-700">
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? `Add ${quantity} to Cart` : 'Out of Stock'}
                </button>
                
                <button
                  onClick={handleRemoveFromWishlist}
                  className="w-full border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 h-10 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  Remove from Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}