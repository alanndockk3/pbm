'use client'

import React from 'react';
import { ProductImageManager } from './ProductImageManager';
import { BasicProductInfo } from './BasicProductInfo';
import { ProductStatusManager } from './ProductStatusManager';
import type { StripeProduct } from '../../../lib/product/useProductStore';

interface ProductLayoutProps {
  product: StripeProduct;
  productImages: string[];
  selectedImageIndex: number;
  currentImage: string;
  hasImages: boolean;
  dragActive: boolean;
  formData: {
    name: string;
    description: string;
    category: string;
    price: string;
    quantity: string;
    inStock: boolean;
    isFeatured: boolean;
    active: boolean;
  };
  isEditing: boolean;
  formattedPrice: string;
  onImageSelect: (index: number) => void;
  onImageRemove: (index: number) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFormDataChange: (field: string, value: string | number | boolean) => void;
}

export function ProductLayout({
  product,
  productImages,
  selectedImageIndex,
  currentImage,
  hasImages,
  dragActive,
  formData,
  isEditing,
  formattedPrice,
  onImageSelect,
  onImageRemove,
  onDrag,
  onDrop,
  onFormDataChange
}: ProductLayoutProps) {
  return (
    <section className="container mx-auto px-4 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Product Images and Info Section - Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Product Images */}
          <ProductImageManager
            productImages={productImages}
            selectedImageIndex={selectedImageIndex}
            currentImage={currentImage}
            hasImages={hasImages}
            dragActive={dragActive}
            onImageSelect={onImageSelect}
            onImageRemove={onImageRemove}
            onDrag={onDrag}
            onDrop={onDrop}
            productName={product.name}
          />

          {/* Middle Column - Basic Product Info */}
          <BasicProductInfo
            product={product}
            formData={formData}
            isEditing={isEditing}
            onFormDataChange={onFormDataChange}
            formattedPrice={formattedPrice}
          />

          {/* Right Column - Status and Metadata */}
          <ProductStatusManager
            product={product}
            formData={formData}
            isEditing={isEditing}
            onFormDataChange={onFormDataChange}
          />
        </div>
      </div>
    </section>
  );
}
