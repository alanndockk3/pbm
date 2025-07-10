'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 border-0 shadow-xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
        <DialogTitle className="sr-only">
          {product.name} - Product Details
        </DialogTitle>
        <div className="grid md:grid-cols-2 min-h-[500px]">
          {/* Product Image Section */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: product.image ? `url(${product.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!product.image && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {!product.inStock && (
                <Badge className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  Only 1 left!
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-8 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <Badge 
                variant="secondary" 
                className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-medium px-3 py-1 rounded-full mb-3"
              >
                {product.category}
              </Badge>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.reviews} reviews
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${product.price.toFixed(2)}
              </div>
              {product.inStock && (
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {product.quantity} available
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-0 w-fit">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-l-lg rounded-r-none border-r-0 border-gray-200 dark:border-gray-700"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="h-10 w-16 flex items-center justify-center border-t border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.quantity}
                    className="h-10 w-10 rounded-r-lg rounded-l-none border-l-0 border-gray-200 dark:border-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:from-gray-300 disabled:to-gray-300 h-12 text-base font-medium rounded-xl shadow-lg transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleRemoveFromWishlist}
                className="w-full text-red-500 dark:text-red-400 hover:bg-red-50 hover:opacity-80 dark:hover:bg-red-900/20 dark:hover:opacity-80 h-11 text-sm font-medium rounded-xl transition-all duration-200"
              >
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Remove from Wishlist
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}