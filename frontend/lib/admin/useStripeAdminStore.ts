// lib/admin/useStripeAdminStore.ts
import { create } from 'zustand';
import { 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../../client/firebaseConfig';
import type { StripeProduct } from '../product/useProductStore';

interface StripeAdminState {
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Actions for Stripe products
  createProduct: (productData: CreateProductData) => Promise<boolean>;
  updateProduct: (id: string, productData: UpdateProductData) => Promise<boolean>;
  updateProductMetadata: (id: string, metadata: Record<string, any>) => Promise<boolean>;
  toggleProductActive: (product: StripeProduct) => Promise<boolean>;
  toggleProductFeatured: (product: StripeProduct) => Promise<boolean>;
  deleteProduct: (id: string, imageUrls?: string[]) => Promise<boolean>;
  uploadProductImage: (file: File, productId?: string) => Promise<string | null>;
  deleteProductImages: (imageUrls: string[]) => Promise<boolean>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  inStock: boolean;
  images: string[];
}

interface UpdateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  inStock: boolean;
  images: string[];
}

export const useStripeAdminStore = create<StripeAdminState>((set, get) => ({
  loading: false,
  uploading: false,
  error: null,

  createProduct: async (productData) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);

      // Get current user's auth token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // Filter out any base64 images and only use Firebase Storage URLs
      const validImages = productData.images.filter(img => 
        img.startsWith('https://') && img.includes('firebase')
      );

      const productDataWithValidImages = {
        ...productData,
        images: validImages
      };

      console.log('Creating product with images:', validImages);

      const response = await fetch('/api/stripe/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(productDataWithValidImages),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Product created successfully:', result.product);
        return true;
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to create product');
      return false;
    } finally {
      setLoading(false);
    }
  },

  updateProduct: async (id, productData) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);

      // Get current user's auth token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`/api/stripe/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product in Stripe');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Product updated successfully in Stripe:', id);
        return true;
      } else {
        throw new Error('Failed to update product in Stripe');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
      return false;
    } finally {
      setLoading(false);
    }
  },

  updateProductMetadata: async (id, metadata) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        metadata,
        updated: serverTimestamp(),
      });

      console.log('Product metadata updated successfully:', id);
      return true;
    } catch (error) {
      console.error('Error updating product metadata:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
      return false;
    } finally {
      setLoading(false);
    }
  },

  toggleProductActive: async (product) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'products', product.id);
      const newActiveState = !product.active;
      
      await updateDoc(docRef, {
        active: newActiveState,
        updated: serverTimestamp(),
      });

      console.log(`Product ${newActiveState ? 'activated' : 'deactivated'}:`, product.id);
      return true;
    } catch (error) {
      console.error('Error toggling product active state:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product status');
      return false;
    } finally {
      setLoading(false);
    }
  },

  toggleProductFeatured: async (product) => {
    const { setLoading, setError, updateProductMetadata } = get();
    
    try {
      const currentMetadata = product.metadata || {};
      const newFeaturedState = !(currentMetadata.isFeatured === 'true' || product.isFeatured);
      
      const updatedMetadata = {
        ...currentMetadata,
        isFeatured: newFeaturedState.toString(),
      };

      const success = await updateProductMetadata(product.id, updatedMetadata);
      
      if (success) {
        console.log(`Product ${newFeaturedState ? 'added to' : 'removed from'} featured:`, product.id);
      }
      
      return success;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update featured status');
      return false;
    }
  },

  deleteProduct: async (id, imageUrls = []) => {
    const { setLoading, setError, deleteProductImages } = get();
    
    try {
      setLoading(true);
      setError(null);

      // Delete associated images first if they exist
      if (imageUrls.length > 0) {
        await deleteProductImages(imageUrls);
      }

      // Get current user's auth token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // Delete product from Stripe (this will trigger webhook to delete from Firebase)
      const response = await fetch(`/api/stripe/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product from Stripe');
      }

      const result = await response.json();
      
      if (result.success) {
        if (result.action === 'deactivated') {
          console.log('Product deactivated in Stripe successfully:', id);
          // Firebase update will happen via webhook
        } else {
          console.log('Product deleted from Stripe successfully:', id);
          // Firebase deletion will happen via webhook
        }
        return true;
      } else {
        throw new Error('Failed to delete product from Stripe');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  },

  uploadProductImage: async (file, productId) => {
    const { setUploading, setError } = get();
    
    try {
      setUploading(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image file size must be less than 5MB');
      }

      // Create unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // For existing products, store directly in their folder
      // For new products, use a temporary path
      const imagePath = productId 
        ? `products/${productId}/${filename}`
        : `products/temp/${filename}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('Image uploaded successfully:', downloadURL);

      // If this is for an existing product, update the product's images array in Firestore
      if (productId) {
        try {
          const docRef = doc(db, 'products', productId);
          await updateDoc(docRef, {
            images: arrayUnion(downloadURL),
            updated: serverTimestamp(),
          });
          console.log('Product images array updated in Firestore');
        } catch (firestoreError) {
          console.warn('Failed to update product images in Firestore:', firestoreError);
          // Don't fail the upload if Firestore update fails
        }
      }

      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  },

  deleteProductImages: async (imageUrls) => {
    try {
      const deletionPromises = imageUrls.map(async (imageUrl) => {
        if (!imageUrl || !imageUrl.includes('firebase')) {
          return true; // Not a Firebase image, skip deletion
        }

        try {
          // Extract path from Firebase URL
          const url = new URL(imageUrl);
          const pathname = url.pathname;
          const pathMatch = pathname.match(/\/o\/(.+?)\?/);
          
          if (!pathMatch) {
            console.warn('Could not extract path from image URL:', imageUrl);
            return false;
          }

          const imagePath = decodeURIComponent(pathMatch[1]);
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
          
          console.log('Image deleted successfully:', imagePath);
          return true;
        } catch (error) {
          console.error('Error deleting individual image:', error);
          return false;
        }
      });

      const results = await Promise.allSettled(deletionPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      console.log(`Deleted ${successful} of ${imageUrls.length} images`);
      return successful > 0;
    } catch (error) {
      console.error('Error deleting images:', error);
      return false;
    }
  },

  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));