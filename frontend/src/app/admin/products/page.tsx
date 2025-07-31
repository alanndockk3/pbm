// app/admin/products/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useProductStore, useProducts, useProductLoading, useProductError } from '../../../../lib/product/useProductStore';
import { useStripeAdminStore } from '../../../../lib/admin/useStripeAdminStore';
import { useAdminFilters } from '../../../../lib/admin/useAdminFilters';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminFilters } from '@/components/admin/AdminFilters';
import { AdminProductGrid } from '@/components/admin/AdminProductGrid';
import { AdminAlerts } from '@/components/admin/AdminAlerts';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import type { StripeProduct } from '../../../../lib/product/useProductStore';

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthStore();
  
  // Product store
  const { initializeProducts } = useProductStore();
  const products = useProducts();
  const productLoading = useProductLoading();
  const productError = useProductError();
  
  // Admin store
  const { 
    loading: adminLoading, 
    error: adminError, 
    toggleProductActive,
    toggleProductFeatured,
    deleteProduct,
    clearError 
  } = useStripeAdminStore();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StripeProduct | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter hook
  const { filteredProducts, categories } = useAdminFilters({
    products,
    searchTerm,
    selectedCategory,
    sortBy,
  });

  // Initialize products on mount
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

  // Handle URL parameters
  useEffect(() => {
    const filter = searchParams.get('filter');
    
    if (filter === 'outOfStock') {
      // You could add logic to filter out of stock items
      setSelectedCategory('All'); // Or implement a special filter
    }
  }, [searchParams]);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  const handleEditProduct = (product: StripeProduct) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (product: StripeProduct) => {
    const confirmMessage = `Are you sure you want to delete "${product.name}"? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      const imageUrls = product.images || (product.image ? [product.image] : []);
      const success = await deleteProduct(product.id, imageUrls);
      
      if (success) {
        setSuccessMessage('Product deleted successfully!');
      }
    }
  };

  const handleToggleActive = async (product: StripeProduct) => {
    const success = await toggleProductActive(product);
    
    if (success) {
      setSuccessMessage(
        `Product ${product.active ? 'deactivated' : 'activated'} successfully!`
      );
    }
  };

  const handleToggleFeatured = async (product: StripeProduct) => {
    const success = await toggleProductFeatured(product);
    
    if (success) {
      const isFeatured = product.metadata?.isFeatured === 'true' || product.isFeatured;
      setSuccessMessage(
        `Product ${isFeatured ? 'removed from' : 'added to'} featured successfully!`
      );
    }
  };

  const handleProductSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleClearSuccess = () => {
    setSuccessMessage(null);
  };

  const handleClearError = () => {
    clearError();
  };


  // Loading state
  if (authLoading || productLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ArrowLeft className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading Products...</p>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!user || user.role !== 'admin') {
    return null;
  }

  const isLoading = adminLoading || productLoading;
  const errorMessage = adminError || productError;

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                Product Management
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                Manage your product catalog and inventory
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AdminAlerts
          successMessage={successMessage}
          errorMessage={errorMessage}
          onClearSuccess={handleClearSuccess}
          onClearError={handleClearError}
        />

        {/* Stats Cards */}
        <AdminStats products={products} />

        {/* Filters and Search */}
        <AdminFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categories={categories.filter((category): category is string => category !== undefined)}
          resultCount={filteredProducts.length}
          totalCount={products.length}
        />
      </header>

      {/* Products Grid */}
      <section className="pb-12">
        <AdminProductGrid
          products={filteredProducts}
          viewMode={viewMode}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleFeatured={handleToggleFeatured}
          onToggleActive={handleToggleActive}
          isLoading={isLoading}
        />
      </section>

      {/* Modals */}

      {/* Edit Product Modal */}
      <AdminProductForm
        product={editingProduct}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSuccess={() => handleProductSuccess('Product updated successfully!')}
        mode="edit"
      />
    </>
  );
}