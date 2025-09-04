'use client'

import React from 'react';
import { Badge } from "@/components/ui/badge";

interface ProductStatusManagerProps {
  product: any;
  formData: any;
  isEditing: boolean;
  onFormDataChange: (field: string, value: boolean) => void;
}

export const ProductStatusManager: React.FC<ProductStatusManagerProps> = ({
  product,
  formData,
  isEditing,
  onFormDataChange
}) => {
  const isProductFeatured = product.metadata?.isFeatured === 'true' || product.isFeatured || false;
  const isProductInStock = product.inStock ?? true;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
        Status & Metadata
      </h3>
      
      {/* Product Status */}
      <div className="space-y-3">
        {/* Active Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Status
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formData.active ? 'Visible to customers' : 'Hidden from customers'}
            </p>
          </div>
          {isEditing ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => onFormDataChange('active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
            </label>
          ) : (
            <Badge className={`${product.active ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {product.active ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>

        {/* Featured Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Product
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formData.isFeatured ? 'Featured on homepage' : 'Not featured'}
            </p>
          </div>
          {isEditing ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => onFormDataChange('isFeatured', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
            </label>
          ) : (
            <Badge className={`${isProductFeatured ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
              {isProductFeatured ? 'Featured' : 'Not Featured'}
            </Badge>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              In Stock
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formData.inStock ? 'Available for purchase' : 'Out of stock'}
            </p>
          </div>
          {isEditing ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => onFormDataChange('inStock', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
            </label>
          ) : (
            <Badge className={`${isProductInStock ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {isProductInStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          )}
        </div>
      </div>

      {/* Metadata Information */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-3">
          Product Metadata
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="font-medium text-rose-700 dark:text-rose-300">Created:</span>
            <span className="text-rose-600 dark:text-rose-400">
              {product.created && typeof product.created === 'number' ? new Date(product.created * 1000).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-rose-700 dark:text-rose-300">Updated:</span>
            <span className="text-rose-600 dark:text-rose-400">
              {product.updated && typeof product.updated === 'number' ? new Date(product.updated * 1000).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-rose-700 dark:text-rose-300">Type:</span>
            <span className="text-rose-600 dark:text-rose-400">
              {(product as any).type || 'service'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-rose-700 dark:text-rose-300">Currency:</span>
            <span className="text-rose-600 dark:text-rose-400">
              {product.defaultPrice?.currency?.toUpperCase() || 'USD'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
