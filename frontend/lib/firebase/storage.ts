// lib/firebase/storage.ts
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../client/firebaseConfig';

/**
 * Get download URL from Firebase Storage reference
 * @param path - The path to the file in Firebase Storage (e.g., 'products/image1.jpeg')
 * @returns Promise<string> - The download URL
 */
export const getStorageUrl = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

/**
 * Get multiple storage URLs at once
 * @param paths - Array of paths to files in Firebase Storage
 * @returns Promise<string[]> - Array of download URLs
 */
export const getMultipleStorageUrls = async (paths: string[]): Promise<string[]> => {
  try {
    const urlPromises = paths.map(path => getStorageUrl(path));
    const urls = await Promise.all(urlPromises);
    return urls;
  } catch (error) {
    console.error('Error getting multiple download URLs:', error);
    throw error;
  }
};

/**
 * Create a Firebase Storage reference path
 * @param folder - The folder name (e.g., 'products')
 * @param filename - The filename (e.g., 'image1.jpeg')
 * @returns string - The full path
 */
export const createStoragePath = (folder: string, filename: string): string => {
  return `${folder}/${filename}`;
};

/**
 * Get storage URL with fallback
 * @param path - The path to the file in Firebase Storage
 * @param fallback - Fallback URL or null if no image should be shown
 * @returns Promise<string | null>
 */
export const getStorageUrlWithFallback = async (
  path: string | null, 
  fallback: string | null = null
): Promise<string | null> => {
  if (!path) return fallback;
  
  try {
    return await getStorageUrl(path);
  } catch (error) {
    console.warn(`Failed to load image from path: ${path}`, error);
    return fallback;
  }
};