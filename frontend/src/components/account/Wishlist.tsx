'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Eye, ShoppingCart, X } from "lucide-react";
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '../../../types/product';

interface WishlistProps {
  items?: Product[];
  isCompact?: boolean;
  showActions?: boolean;
  onViewItem?: (itemId: string) => void;
  onAddToCart?: (itemId: string) => void;
  onRemoveFromWishlist?: (itemId: string) => void;
  onViewAll?: () => void;
}

// Mock data for demonstration - converting to Product type
const mockWishlistItems: Product[] = [
  {
    id: '1',
    name: 'Handwoven Scarf',
    description: 'Beautiful handwoven scarf made from organic cotton',
    price: 45.00,
    category: 'Accessories',
    inStock: true,
    quantity: 12,
    rating: 4.8,
    reviews: 24,
    isFeatured: false,
    image: '',
  },
  {
    id: '2',
    name: 'Ceramic Mug Set',
    description: 'Set of 2 handcrafted ceramic mugs with unique glazing',
    price: 32.00,
    category: 'Home & Kitchen',
    inStock: true,
    quantity: 8,
    rating: 4.9,
    reviews: 18,
    isFeatured: true,
    image: '',
  },
  {
    id: '3',
    name: 'Knitted Blanket',
    description: 'Cozy wool blanket perfect for cold evenings',
    price: 78.00,
    category: 'Home & Decor',
    inStock: false,
    quantity: 0,
    rating: 4.7,
    reviews: 31,
    isFeatured: false,
    image: '',
  },
  {
    id: '4',
    name: 'Embroidered Pillow',
    description: 'Decorative pillow with intricate embroidery work',
    price: 28.00,
    category: 'Home & Decor',
    inStock: true,
    quantity: 15,
    rating: 4.6,
    reviews: 12,
    isFeatured: false,
    image: '',
  },
  {
    id: '5',
    name: 'Wooden Jewelry Box',
    description: 'Handcrafted wooden jewelry box with velvet lining',
    price: 65.00,
    category: 'Storage',
    inStock: true,
    quantity: 6,
    rating: 4.8,
    reviews: 22,
    isFeatured: false,
    image: '',
  },
  {
    id: '6',
    name: 'Hand-painted Vase',
    description: 'Unique ceramic vase with hand-painted floral design',
    price: 42.00,
    category: 'Home & Decor',
    inStock: true,
    quantity: 9,
    rating: 4.5,
    reviews: 16,
    isFeatured: false,
    image: '',
  },
];

export default function Wishlist({
  items = mockWishlistItems,
  isCompact = false,
  showActions = true,
  onViewItem,
  onAddToCart,
  onRemoveFromWishlist,
  onViewAll
}: WishlistProps) {

  const handleViewItem = (itemId: string) => {
    if (onViewItem) {
      onViewItem(itemId);
    } else {
      console.log('View item:', itemId);
    }
  };

  const handleAddToCart = (itemId: string) => {
    if (onAddToCart) {
      onAddToCart(itemId);
    } else {
      console.log('Add to cart:', itemId);
    }
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(itemId);
    } else {
      console.log('Remove from wishlist:', itemId);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all wishlist items');
    }
  };

  if (isCompact) {
    // Compact version for dashboard
    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Wishlist</CardTitle>
                <CardDescription className="text-rose-700 dark:text-rose-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'} you love
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700"
              onClick={handleViewAll}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <p className="text-rose-600 dark:text-rose-400">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {items.slice(0, 6).map((item) => (
                <div 
                  key={item.id} 
                  className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => handleViewItem(item.id)}
                >
                  <Heart className="w-4 h-4 text-pink-500 fill-current" />
                  
                  {/* Hover overlay with item info */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex flex-col items-center justify-center p-2">
                    <p className="text-white text-xs font-medium text-center mb-1">{item.name}</p>
                    <p className="text-white text-xs">${item.price.toFixed(2)}</p>
                    {!item.inStock && (
                      <p className="text-red-300 text-xs mt-1">Out of Stock</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full version for dedicated wishlist page using ProductCard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">My Wishlist</h1>
          <p className="text-rose-600 dark:text-rose-400">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-rose-600 dark:text-rose-400 mb-6">
              Start adding items you love to keep track of them!
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPurchaseClick={() => handleAddToCart(item.id)}
              showQuantity={false}
              purchaseButtonText="Add to Cart"
            />
          ))}
        </div>
      )}
    </div>
  );
}