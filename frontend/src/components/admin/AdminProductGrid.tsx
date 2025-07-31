// components/admin/AdminProductGrid.tsx
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { AdminProductCard } from './AdminProductCard';
import type { StripeProduct } from '../../../lib/product/useProductStore';

interface AdminProductGridProps {
  products: StripeProduct[];
  viewMode: 'grid' | 'list';
  onEditProduct: (product: StripeProduct) => void;
  onDeleteProduct: (product: StripeProduct) => void;
  onToggleFeatured: (product: StripeProduct) => void;
  onToggleActive: (product: StripeProduct) => void;
  isLoading?: boolean;
}

export function AdminProductGrid({
  products,
  viewMode,
  onEditProduct,
  onDeleteProduct,
  onToggleFeatured,
  onToggleActive,
  isLoading = false,
}: AdminProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">
          No products found
        </h3>
        <p className="text-rose-600 dark:text-rose-400">
          Try adjusting your search or filter criteria, or add a new product.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
    }`}>
      {products.map(product => (
        <AdminProductCard
          key={product.id}
          product={product}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          onToggleFeatured={onToggleFeatured}
          onToggleActive={onToggleActive}
          onViewDetails={onEditProduct} // For now, view details opens edit modal
          disabled={isLoading}
        />
      ))}
    </div>
  );
}