// components/admin/AdminProductCard.tsx
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star,
  Package,
  Edit,
  Trash2,
  Eye,
  Settings
} from "lucide-react";
import { cn } from "@/library/utils";
import { formatPrice, getProductPrice } from '../../../lib/product/useProductStore';
import type { StripeProduct } from '../../../lib/product/useProductStore';

interface AdminProductCardProps {
  product: StripeProduct;
  onEdit?: (product: StripeProduct) => void;
  onDelete?: (product: StripeProduct) => void;
  onToggleFeatured?: (product: StripeProduct) => void;
  onToggleActive?: (product: StripeProduct) => void;
  onViewDetails?: (product: StripeProduct) => void;
  disabled?: boolean;
  className?: string;
}

export const AdminProductCard = ({
  product,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleActive,
  onViewDetails,
  disabled = false,
  className
}: AdminProductCardProps) => {
  
  // Get safe values for all properties
  const productPrice = getProductPrice(product);
  const formattedPrice = product.defaultPrice 
    ? formatPrice(product.defaultPrice.unit_amount, product.defaultPrice.currency)
    : `${productPrice.toFixed(2)}`;
  
  const quantity = parseInt(product.metadata?.quantity || '0') || product.quantity || 0;
  const rating = parseFloat(product.metadata?.rating || '0') || product.rating || 0;
  const reviews = parseInt(product.metadata?.reviews || '0') || product.reviews || 0;
  const category = product.metadata?.category || product.category || 'Uncategorized';
  const isInStock = product.metadata?.inStock !== 'false' && product.inStock !== false;
  const isFeatured = product.metadata?.isFeatured === 'true' || product.isFeatured || false;
  
  // Handle image - prefer the first image from images array, then fallback to image field
  const productImage = product.images?.[0] || product.image;
  const hasImage = productImage && productImage.trim() !== '';
  const imageUrl = productImage || '';

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(product);
    }
  };

  const handleToggleFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFeatured) {
      onToggleFeatured(product);
    }
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleActive) {
      onToggleActive(product);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-rose-900/20 backdrop-blur-sm group overflow-hidden cursor-pointer border border-rose-100 dark:border-rose-800",
        !product.active && "opacity-75 border-gray-300",
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
        
        {/* Clean overlay with single action */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-white/95 hover:bg-white shadow-lg"
            onClick={handleEdit}
            disabled={disabled}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {/* Top badges - cleaner layout */}
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <div className="flex flex-col gap-1">
            {!product.active && (
              <Badge className="bg-red-500 text-white text-xs w-fit">
                Inactive
              </Badge>
            )}
            {!isInStock && (
              <Badge className="bg-orange-500 text-white text-xs w-fit">
                Out of Stock
              </Badge>
            )}
          </div>
          
          {isFeatured && (
            <Badge className="bg-yellow-500 text-white text-xs">
              ⭐ Featured
            </Badge>
          )}
        </div>

        {/* Quick actions - bottom corner */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 hover:bg-white p-2 shadow-lg"
              onClick={handleToggleFeatured}
              disabled={disabled}
              title={isFeatured ? "Remove from featured" : "Add to featured"}
            >
              <Star className={cn("w-3 h-3", isFeatured ? "text-yellow-600 fill-current" : "text-gray-400")} />
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 hover:bg-white text-red-600 p-2 shadow-lg"
              onClick={handleDelete}
              disabled={disabled}
              title="Delete product"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Product Info Section - Much cleaner */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 w-fit">
          {category}
        </Badge>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Product ID - smaller and less prominent */}
        <p className="text-rose-400 dark:text-rose-500 text-xs font-mono">
          {product.id.slice(0, 12)}...
        </p>

        {/* Key metrics in a clean row */}
        <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-800">
          <div className="text-left">
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {formattedPrice}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Stock: {quantity}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-rose-900 dark:text-rose-100">
                {rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {reviews} reviews
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-sm font-medium flex items-center gap-1",
            product.active ? "text-green-600" : "text-red-600"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              product.active ? "bg-green-500" : "bg-red-500"
            )} />
            {product.active ? "Active" : "Inactive"}
          </div>
          
          {quantity <= 5 && quantity > 0 && isInStock && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              Low Stock
            </Badge>
          )}
        </div>

        {/* Single action button */}
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white mt-3"
          onClick={handleEdit}
          disabled={disabled}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Button>
      </div>
    </div>
  );
};

export default AdminProductCard;