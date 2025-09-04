'use client'

import React from 'react';
import { Badge } from "@/components/ui/badge";

interface BasicProductInfoProps {
  product: any;
  formData: any;
  isEditing: boolean;
  onFormDataChange: (field: string, value: string | number) => void;
  formattedPrice: string;
}

export const BasicProductInfo: React.FC<BasicProductInfoProps> = ({
  product,
  formData,
  isEditing,
  onFormDataChange,
  formattedPrice
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
        Basic Information
      </h3>
      
      {/* Product ID */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Product ID
        </label>
        <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
          {product.id}
        </p>
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
          Product Name *
        </label>
        {isEditing ? (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormDataChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter product name"
          />
        ) : (
          <p className="text-lg text-rose-900 dark:text-rose-100 font-medium">
            {product.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
          Category
        </label>
        {isEditing ? (
          <input
            type="text"
            value={formData.category}
            onChange={(e) => onFormDataChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter category"
          />
        ) : (
          <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
            {product.category || 'Uncategorized'}
          </Badge>
        )}
      </div>

      {/* Price and Quantity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
            Price *
          </label>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => onFormDataChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0.00"
            />
          ) : (
            <p className="text-xl font-bold text-rose-900 dark:text-rose-100">
              {formattedPrice}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
            Quantity
          </label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => onFormDataChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0"
            />
          ) : (
            <p className="text-lg text-rose-900 dark:text-rose-100">
              {product.quantity || 0}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
          Description
        </label>
        {isEditing ? (
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[80px]"
            placeholder="Enter product description"
          />
        ) : (
          <p className="text-rose-700 dark:text-rose-300 leading-relaxed text-sm">
            {product.description || 'No description available for this product.'}
          </p>
        )}
      </div>
    </div>
  );
};
