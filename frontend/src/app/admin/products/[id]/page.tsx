'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X
} from "lucide-react";
import { useProductStore, type StripeProduct, formatPrice } from '../../../../../lib/product/useProductStore';
import { useAuthStore } from '../../../../../lib/auth/useAuthStore';
import { useStripeAdminStore } from '../../../../../lib/admin/useStripeAdminStore';
import { ProductImageManager } from '../../../../components/admin/ProductImageManager';
import { BasicProductInfo } from '../../../../components/admin/BasicProductInfo';
import { ProductStatusManager } from '../../../../components/admin/ProductStatusManager';
import { DeleteProductModal } from '../../../../components/admin/DeleteProductModal';


export default function AdminProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const { user } = useAuthStore();
  const { getProductById, initializeProducts } = useProductStore();
  const { 
    toggleProductActive, 
    toggleProductFeatured, 
    deleteProduct,
    updateProduct,
    loading: adminLoading,
    error: adminError,
    clearError
  } = useStripeAdminStore();
  
  const [product, setProduct] = useState<StripeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    inStock: true,
    isFeatured: false,
    active: true
  });
  const [dragActive, setDragActive] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await initializeProducts();
        const foundProduct = getProductById(productId);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, initializeProducts, getProductById]);

  // Auth check
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleToggleActive = async () => {
    if (!product) return;
    
    const success = await toggleProductActive(product);
    if (success) {
      setSuccessMessage(`Product ${product.active ? 'deactivated' : 'activated'} successfully!`);
      // Refresh product data
      const updatedProduct = getProductById(productId);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    }
  };

  const handleToggleFeatured = async () => {
    if (!product) return;
    
    const success = await toggleProductFeatured(product);
    if (success) {
      const isFeatured = product.metadata?.isFeatured === 'true' || product.isFeatured;
      setSuccessMessage(`Product ${isFeatured ? 'removed from' : 'added to'} featured successfully!`);
      // Refresh product data
      const updatedProduct = getProductById(productId);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    const confirmMessage = `Are you sure you want to delete "${product.name}"? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      const imageUrls = product.images || (product.image ? [product.image] : []);
      const success = await deleteProduct(product.id, imageUrls);
      
      if (success) {
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      }
    }
  };



  const handleDeleteConfirm = () => {
    if (deleteConfirmText.toLowerCase() === 'confirm') {
      handleDeleteProduct();
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const startEditing = () => {
    if (!product) return;
    setIsEditing(true);
    
    // Get the current price - prefer defaultPrice.unit_amount, then fallback to price field
    let currentPrice = '';
    if (product.defaultPrice?.unit_amount) {
      currentPrice = (product.defaultPrice.unit_amount / 100).toString();
    } else if (product.price) {
      currentPrice = product.price.toString();
    }
    
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: currentPrice,
      quantity: product.quantity?.toString() || '',
      inStock: product.inStock ?? true,
      isFeatured: product.metadata?.isFeatured === 'true' || product.isFeatured || false,
      active: product.active ?? true
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      quantity: '',
      inStock: true,
      isFeatured: false,
      active: true
    });
  };

  const saveChanges = async () => {
    if (!product) return;
    
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price) {
        setSuccessMessage('Name, description, and price are required');
        return;
      }

      // Show loading spinner
      setUpdating(true);

      // Prepare product data for Stripe update
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        rating: 0, // Default values for required fields
        reviews: 0,
        isFeatured: formData.isFeatured,
        inStock: formData.inStock,
        images: product.images || []
      };

      // Update product in Stripe
      const success = await updateProduct(product.id, productData);
      
             if (success) {
         setSuccessMessage('Product updated successfully! Changes are now visible.');
         setIsEditing(false);
         
         // Immediately update the local product state with form data for instant feedback
         const immediateUpdate = {
           ...product,
           name: formData.name,
           description: formData.description,
           category: formData.category,
           price: parseFloat(formData.price) || 0,
           quantity: parseInt(formData.quantity) || 0,
           inStock: formData.inStock,
           metadata: {
             ...product.metadata,
             isFeatured: formData.isFeatured.toString(),
             category: formData.category,
             quantity: formData.quantity.toString()
           }
         };
         setProduct(immediateUpdate);
         
         // Background refresh - no need to show loading states to user
         setTimeout(async () => {
           try {
             await initializeProducts();
             const updatedProduct = getProductById(productId);
             if (updatedProduct) {
               setProduct(updatedProduct);
             }
           } catch (error) {
             console.error('Background refresh failed:', error);
           }
         }, 2000); // Wait 2 seconds then refresh in background
      } else {
        setSuccessMessage('Failed to update product. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      setSuccessMessage('Failed to update product. Please try again.');
    } finally {
      // Hide loading spinner
      setUpdating(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSuccessMessage('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSuccessMessage('Image file size must be less than 5MB');
        return;
      }

      if (!product) {
        setSuccessMessage('Product not found. Cannot upload image.');
        return;
      }

      // Upload the image using the store
      const { uploadProductImage } = useStripeAdminStore.getState();
      const imageUrl = await uploadProductImage(file, product.id);
      
      if (imageUrl) {
        // Add the new image to the product's images array
        const updatedImages = [...(product.images || []), imageUrl];
        const updatedProduct = { ...product, images: updatedImages };
        setProduct(updatedProduct);
        
        // Select the new image
        setSelectedImageIndex(updatedImages.length - 1);
        
        setSuccessMessage('Image uploaded successfully!');
      } else {
        setSuccessMessage('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSuccessMessage('Failed to upload image. Please try again.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return;
    
    const file = e.dataTransfer.files[0];
    await handleFileSelect(file);
  };

  const removeImage = (index: number) => {
    if (!product) return;
    
    const updatedImages = [...(product.images || [])];
    updatedImages.splice(index, 1);
    
    const updatedProduct = { ...product, images: updatedImages };
    setProduct(updatedProduct);
    
    // Update selected image index if needed
    if (updatedImages.length === 0) {
      setSelectedImageIndex(0);
    } else if (selectedImageIndex >= updatedImages.length) {
      setSelectedImageIndex(updatedImages.length - 1);
    }
    
    setSuccessMessage('Image removed successfully!');
  };

  const handleFormDataChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">Loading Product</h2>
          <p className="text-rose-600 dark:text-rose-400">Fetching product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-2">Product Not Found</h2>
          <p className="text-rose-600 dark:text-rose-400 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Button
            onClick={() => router.push('/admin/products')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Get safe values for all properties
  const productPrice = product.price ?? 0;

  // Get formatted price (handles both legacy and Stripe pricing)
  const formattedPrice = product.defaultPrice 
    ? formatPrice(product.defaultPrice.unit_amount, product.defaultPrice.currency)
    : `${productPrice.toFixed(2)}`;

  // Handle images - prefer the first image from images array, then fallback to image field
  const productImages = product.images || [];
  const hasImages = productImages.length > 0;
  const currentImage = hasImages && selectedImageIndex < productImages.length 
    ? productImages[selectedImageIndex] 
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
             {/* Header with Breadcrumbs */}
       <div className="container mx-auto px-4 py-4">
                   {/* Loading and Success Messages */}
          {updating && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Updating product and syncing data...</span>
            </div>
          )}
          
          {successMessage && !updating && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{successMessage}</span>
              {successMessage.includes('successfully') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setLoading(true);
                    await initializeProducts();
                    const refreshedProduct = getProductById(productId);
                    if (refreshedProduct) {
                      setProduct(refreshedProduct);
                      setSuccessMessage('Data refreshed successfully!');
                    }
                    setLoading(false);
                  }}
                  className="ml-2 text-green-600 hover:bg-green-200"
                >
                  <Loader2 className="w-4 h-4 mr-1" />
                  Refresh Data
                </Button>
              )}
            </div>
          )}
          
          <div className="mb-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-rose-600 dark:text-rose-400 mb-4">
            <button
              onClick={() => router.push('/admin')}
              disabled={updating}
              className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Admin
            </button>
            <span>/</span>
            <button
              onClick={() => router.push('/admin/products')}
              disabled={updating}
              className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Products
            </button>
            <span>/</span>
            <span className="text-rose-900 dark:text-rose-100 font-medium">
              {product.name}
            </span>
          </nav>
          
                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
             {/* Product Details Header Container */}
             <div className="flex-shrink-0">
               <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                 Product Details
               </h1>
               <p className="text-rose-600 dark:text-rose-400">
                 Manage and configure product settings
               </p>
             </div>
             
             {/* Action Buttons Container */}
             <div className="flex flex-wrap gap-3">
               {!isEditing ? (
                 <div className="flex gap-3">
                   <Button
                     onClick={startEditing}
                     className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                   >
                     <Edit className="w-4 h-4 mr-2" />
                     Edit Product
                   </Button>
                   
                   <Button
                     variant="outline"
                     onClick={() => setShowDeleteConfirm(true)}
                     disabled={adminLoading}
                     className="border-red-300 text-red-700 hover:bg-red-50 border-2"
                   >
                     <Trash2 className="w-4 h-4 mr-2" />
                     Delete
                   </Button>
                 </div>
               ) : (
                 <div className="flex gap-3">
                   <Button
                     onClick={saveChanges}
                     disabled={updating}
                     className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {updating ? (
                       <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         Updating...
                       </>
                     ) : (
                       <>
                         <Save className="w-4 h-4 mr-2" />
                         Save Changes
                       </>
                     )}
                   </Button>
                   
                   <Button
                     variant="outline"
                     onClick={cancelEditing}
                     disabled={updating}
                     className="border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <X className="w-4 h-4 mr-2" />
                     Cancel
                   </Button>
                   
                   <Button
                     variant="outline"
                     onClick={() => setShowDeleteConfirm(true)}
                     disabled={adminLoading}
                     className="border-red-300 text-red-700 hover:bg-red-50 border-2"
                   >
                     <Trash2 className="w-4 h-4 mr-2" />
                     Delete
                   </Button>
                 </div>
               )}
             </div>
           </div>
                 </div>

         {/* Error Messages */}
         {adminError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {adminError}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-700 hover:bg-red-200"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Product Detail Section */}
      <section className="container mx-auto px-4 pb-6">
                 <div className="max-w-6xl mx-auto relative">
           {/* Product Images and Info Section - Three Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                         {/* Left Column - Product Images */}
             <ProductImageManager
               productImages={productImages}
               selectedImageIndex={selectedImageIndex}
               currentImage={currentImage}
               hasImages={hasImages}
               dragActive={dragActive}
               isEditing={isEditing}
               onImageSelect={setSelectedImageIndex}
               onImageRemove={removeImage}
               onDrag={handleDrag}
               onDrop={handleDrop}
               onFileSelect={handleFileSelect}
               productName={product.name}
             />

            {/* Middle Column - Basic Product Info */}
            <BasicProductInfo
              product={product}
              formData={formData}
              isEditing={isEditing}
              onFormDataChange={handleFormDataChange}
              formattedPrice={formattedPrice}
            />

            {/* Right Column - Status and Metadata */}
            <ProductStatusManager
              product={product}
              formData={formData}
              isEditing={isEditing}
              onFormDataChange={handleFormDataChange}
            />
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={showDeleteConfirm}
        productName={product.name}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmText('');
        }}
      />
    </div>
  );
}
