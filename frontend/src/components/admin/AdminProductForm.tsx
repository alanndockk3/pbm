// components/admin/AdminProductForm.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, AlertCircle, CheckCircle } from "lucide-react";
import { useAdminStore } from '../../../lib/admin/useAdminStore';
import { ImageUpload } from './ImageUpload';
import type { Product } from '../../../types/product';

interface AdminProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (productId: string) => void;
  mode: 'add' | 'edit';
}

const CATEGORIES = [
  'Accessories',
  'Home & Kitchen',
  'Home Decor',
  'Bath & Body',
  'Storage',
  'Baby & Kids',
  'Stationery',
];

export const AdminProductForm = ({
  product,
  isOpen,
  onClose,
  onSuccess,
  mode
}: AdminProductFormProps) => {
  const { 
    loading, 
    uploading, 
    error, 
    addProduct, 
    updateProduct, 
    clearError 
  } = useAdminStore();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
    rating: '5.0',
    reviews: '0',
    isFeatured: false,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        category: product.category,
        description: product.description,
        rating: product.rating.toString(),
        reviews: product.reviews.toString(),
        isFeatured: product.isFeatured || false,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        quantity: '',
        category: '',
        description: '',
        rating: '5.0',
        reviews: '0',
        isFeatured: false,
      });
    }
    setSelectedImage(null);
  }, [product, mode]);

  // Clear error when form opens
  useEffect(() => {
    if (isOpen) {
      clearError();
      setShowSuccess(false);
    }
  }, [isOpen, clearError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Product name is required';
    }
    if (!formData.category) {
      return 'Category is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      return 'Valid price is required';
    }
    if (parseInt(formData.quantity) < 0) {
      return 'Quantity cannot be negative';
    }
    const rating = parseFloat(formData.rating);
    if (rating < 0 || rating > 5) {
      return 'Rating must be between 0 and 5';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0,
      category: formData.category,
      description: formData.description.trim(),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews) || 0,
      isFeatured: formData.isFeatured,
      inStock: (parseInt(formData.quantity) || 0) > 0,
      image: mode === 'edit' ? product?.image || null : null,
    };

    try {
      let result: string | boolean | null = null;
      
      if (mode === 'add') {
        result = await addProduct(productData, selectedImage || undefined);
      } else if (product) {
        result = await updateProduct(product.id.toString(), productData, selectedImage || undefined);
      }

      if (result) {
        setShowSuccess(true);
        setTimeout(() => {
          const productId = typeof result === 'string' ? result : product!.id.toString();
          onSuccess?.(productId);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-rose-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-rose-200 dark:border-rose-700 sticky top-0 bg-white dark:bg-rose-900 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {mode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-4 m-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 dark:text-green-200">
                Product {mode === 'add' ? 'added' : 'updated'} successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Details */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price and Quantity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        disabled={loading}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        disabled={loading}
                        min="0"
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                        Rating (0-5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        disabled={loading}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                        Reviews Count
                      </label>
                      <input
                        type="number"
                        name="reviews"
                        value={formData.reviews}
                        onChange={handleInputChange}
                        disabled={loading}
                        min="0"
                        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={loading}
                      rows={4}
                      className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white dark:bg-rose-800 text-rose-900 dark:text-rose-100 disabled:opacity-50 resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="rounded border-rose-300 disabled:opacity-50"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-rose-900 dark:text-rose-100">
                      Mark as Featured Product
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                    Product Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    currentImage={mode === 'edit' ? product?.image : null}
                    onImageSelect={setSelectedImage}
                    uploading={uploading}
                    disabled={loading}
                  />
                </CardContent>
              </Card>

              {/* Stock Status Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                    Status Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-700 dark:text-rose-300">Stock Status:</span>
                    <Badge 
                      variant={parseInt(formData.quantity) > 0 ? "default" : "destructive"}
                      className={parseInt(formData.quantity) > 0 ? "bg-green-500" : ""}
                    >
                      {parseInt(formData.quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-700 dark:text-rose-300">Featured:</span>
                    <Badge variant={formData.isFeatured ? "default" : "secondary"}>
                      {formData.isFeatured ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {parseInt(formData.quantity) > 0 && parseInt(formData.quantity) <= 5 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-rose-700 dark:text-rose-300">Warning:</span>
                      <Badge variant="destructive" className="bg-orange-500">
                        Low Stock
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 border-t border-rose-200 dark:border-rose-700 flex justify-end gap-3 bg-gray-50 dark:bg-rose-900/20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading || uploading || showSuccess}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white min-w-[120px]"
            >
              {loading || uploading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'add' ? 'Add Product' : 'Update Product'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};