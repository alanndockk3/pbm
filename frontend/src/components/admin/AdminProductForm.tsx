// components/admin/AdminProductForm.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Save, Upload, AlertCircle, Image as ImageIcon, Trash2 } from "lucide-react";
import { useStripeAdminStore } from '../../../lib/admin/useStripeAdminStore';
import type { StripeProduct } from '../../../lib/product/useProductStore';
import { doc, updateDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../client/firebaseConfig';

interface AdminProductFormProps {
  product?: StripeProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  quantity: string;
  rating: string;
  reviews: string;
  inStock: boolean;
  isFeatured: boolean;
  images: string[];
}

export function AdminProductForm({
  product,
  isOpen,
  onClose,
  onSuccess,
  mode
}: AdminProductFormProps) {
  const { 
    loading, 
    error, 
    createProduct,
    updateProductMetadata,
    clearError,
    updateProduct
  } = useStripeAdminStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '0',
    rating: '0',
    reviews: '0',
    inStock: true,
    isFeatured: false,
    images: [],
  });

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      const metadata = product.metadata || {};
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || (product.defaultPrice?.unit_amount ? (product.defaultPrice.unit_amount / 100).toString() : ''),
        category: metadata.category || product.category || '',
        quantity: metadata.quantity || product.quantity?.toString() || '0',
        rating: metadata.rating || product.rating?.toString() || '0',
        reviews: metadata.reviews || product.reviews?.toString() || '0',
        inStock: metadata.inStock === 'true' || product.inStock !== false,
        isFeatured: metadata.isFeatured === 'true' || product.isFeatured || false,
        images: product.images || [],
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        quantity: '0',
        rating: '0',
        reviews: '0',
        inStock: true,
        isFeatured: false,
        images: [],
      });
    }
  }, [product]);

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // File upload handler
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

                 // Upload to Firebase Storage
         const { uploadProductImage } = useStripeAdminStore.getState();
         const imageUrl = await uploadProductImage(file, product?.id);
        
        if (!imageUrl) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return imageUrl;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Add new images to existing ones
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = async (index: number) => {
    const imageToRemove = formData.images[index];
    
    // If this is an existing product and the image is from Firebase Storage, delete it
    if (product?.id && imageToRemove && imageToRemove.includes('firebase')) {
      try {
        const { deleteProductImages } = useStripeAdminStore.getState();
        await deleteProductImages([imageToRemove]);
        
        // Also remove from Firestore images array
        const docRef = doc(db, 'products', product.id);
        await updateDoc(docRef, {
          images: arrayRemove(imageToRemove),
          updated: serverTimestamp(),
        });
        console.log('Image removed from product in Firestore');
      } catch (error) {
        console.error('Error removing image from product:', error);
        // Continue with local removal even if Firestore update fails
      }
    }
    
    // Remove from local state
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Add image URL manually
  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'add') {
      // Create new product
      if (!formData.name || !formData.description || !formData.price) {
        alert('Name, description, and price are required');
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        isFeatured: formData.isFeatured,
        inStock: formData.inStock,
        images: formData.images,
      };

      const success = await createProduct(productData);
      
      if (success) {
        onSuccess();
      }
    } else if (product) {
      // Edit existing product
      if (!formData.name || !formData.description || !formData.price) {
        alert('Name, description, and price are required');
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        isFeatured: formData.isFeatured,
        inStock: formData.inStock,
        images: formData.images,
      };

      // Update product in Stripe first (this will trigger webhook to update Firebase)
      const success = await updateProduct(product.id, productData);
      
      if (success) {
        onSuccess();
      }
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-rose-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl text-rose-900 dark:text-rose-100">
            {mode === 'add' ? 'Add Product' : 'Edit Product'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-rose-600 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Product Info (for edit mode) */}
          {mode === 'edit' && product && (
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">ID: {product.id.slice(0, 12)}...</Badge>
                <Badge variant={product.active ? "default" : "secondary"}>
                  {product.active ? 'Active' : 'Inactive'}
                </Badge>
                {product.defaultPrice && (
                  <Badge variant="outline">
                    ${(product.defaultPrice.unit_amount / 100).toFixed(2)}
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {product.description}
                </p>
              )}
            </div>
          )}



          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Images Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300">
                Product Images
              </label>
              
              {/* Image Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragOver
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-rose-300 dark:border-rose-700 hover:border-pink-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-rose-700 dark:text-rose-300">
                      Drag and drop images here, or click to select
                    </p>
                    <p className="text-sm text-rose-500 dark:text-rose-500">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose Files'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addImageUrl}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      Add URL
                    </Button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                                             <Button
                         type="button"
                         variant="destructive"
                         size="sm"
                         onClick={() => {
                           removeImage(index).catch(console.error);
                         }}
                         className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                       >
                         <Trash2 className="w-3 h-3" />
                       </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter product description"
                rows={3}
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Price (USD) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., Handmade Jewelry"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Quantity in Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Reviews */}
              <div>
                <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                  Number of Reviews
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reviews}
                  onChange={(e) => handleInputChange('reviews', e.target.value)}
                  className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Switch Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    In Stock
                  </label>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Toggle if this product is currently available for purchase
                  </p>
                </div>
                <Switch
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    Featured Product
                  </label>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Featured products are highlighted on your homepage
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                disabled={loading || uploading}
              >
                {loading ? (
                  'Saving...'
                ) : uploading ? (
                  'Uploading Images...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'add' ? 'Add Product' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}