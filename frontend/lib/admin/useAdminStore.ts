// lib/admin/useAdminStore.ts
import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../client/firebaseConfig';
import type { Product } from '../../types/product';

interface AdminProduct extends Omit<Product, 'id'> {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface AdminState {
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Actions
  addProduct: (productData: Omit<Product, 'id'>, imageFile?: File) => Promise<string | null>;
  updateProduct: (id: string, updates: Partial<Product>, imageFile?: File) => Promise<boolean>;
  deleteProduct: (id: string, imageUrl?: string | null) => Promise<boolean>;
  uploadImage: (file: File, productId?: string) => Promise<string | null>;
  deleteImage: (imageUrl: string) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  loading: false,
  uploading: false,
  error: null,

  addProduct: async (productData, imageFile) => {
    const { setLoading, setError, uploadImage } = get();
    
    try {
      setLoading(true);
      setError(null);

      let imageUrl: string | null = null;
      
      // Upload image first if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      // Create product document
      const productToAdd: AdminProduct = {
        ...productData,
        image: imageUrl,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, 'products'), productToAdd);
      
      // If we uploaded an image, update it with the proper product ID
      if (imageFile && imageUrl) {
        const newImageUrl = await uploadImage(imageFile, docRef.id);
        if (newImageUrl && newImageUrl !== imageUrl) {
          // Update the document with the new image URL
          await updateDoc(docRef, { image: newImageUrl });
          // Delete the temporary image
          await get().deleteImage(imageUrl);
        }
      }

      console.log('Product added successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product');
      return null;
    } finally {
      setLoading(false);
    }
  },

  updateProduct: async (id, updates, imageFile) => {
    const { setLoading, setError, uploadImage, deleteImage } = get();
    
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'products', id);
      let imageUrl = updates.image;

      // Handle image upload if new file is provided
      if (imageFile) {
        // Delete old image if it exists
        if (updates.image) {
          await deleteImage(updates.image);
        }
        
        // Upload new image
        imageUrl = await uploadImage(imageFile, id);
        if (!imageUrl) {
          throw new Error('Failed to upload new image');
        }
      }

      // Update product document
      const updatedData = {
        ...updates,
        image: imageUrl,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updatedData);
      console.log('Product updated successfully:', id);
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
      return false;
    } finally {
      setLoading(false);
    }
  },

  deleteProduct: async (id, imageUrl) => {
    const { setLoading, setError, deleteImage } = get();
    
    try {
      setLoading(true);
      setError(null);

      // Delete associated image first if it exists
      if (imageUrl) {
        await deleteImage(imageUrl);
      }

      // Delete product document
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      
      console.log('Product deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  },

  uploadImage: async (file, productId) => {
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
      const imagePath = productId 
        ? `products/${productId}/${filename}`
        : `products/temp/${filename}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('Image uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  },

  deleteImage: async (imageUrl) => {
    try {
      if (!imageUrl || !imageUrl.includes('firebase')) {
        return true; // Not a Firebase image, skip deletion
      }

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
      console.error('Error deleting image:', error);
      // Don't throw error for image deletion failures
      return false;
    }
  },

  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));