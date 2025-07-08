// lib/hooks/useGoogleMaps.ts
'use client'

import { useState, useEffect, useRef } from 'react';

interface UseGoogleMapsOptions {
  libraries?: string[];
  version?: string;
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: string | null;
}

// Global state to track loading status across all instances
let globalIsLoading = false;
let globalIsLoaded = false;
let globalLoadError: string | null = null;
let loadPromise: Promise<void> | null = null;

export const useGoogleMaps = (
  options: UseGoogleMapsOptions = {}
): UseGoogleMapsReturn => {
  const { libraries = ['places'], version = 'weekly' } = options;
  const [state, setState] = useState({
    isLoaded: globalIsLoaded,
    loadError: globalLoadError,
  });
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Serialize options to prevent dependency changes
  const optionsKey = `${libraries.join(',')}-${version}`;

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // If already loaded, update state immediately
    if (globalIsLoaded) {
      if (isMountedRef.current) {
        setState({ isLoaded: true, loadError: null });
      }
      return;
    }

    // If there was a previous load error, return it
    if (globalLoadError) {
      if (isMountedRef.current) {
        setState({ isLoaded: false, loadError: globalLoadError });
      }
      return;
    }

    // Check if Google Maps is already available
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      globalIsLoaded = true;
      if (isMountedRef.current) {
        setState({ isLoaded: true, loadError: null });
      }
      return;
    }

    // If currently loading, wait for the existing promise
    if (globalIsLoading && loadPromise) {
      loadPromise
        .then(() => {
          if (isMountedRef.current) {
            setState({ isLoaded: globalIsLoaded, loadError: globalLoadError });
          }
        })
        .catch(() => {
          if (isMountedRef.current) {
            setState({ isLoaded: false, loadError: globalLoadError });
          }
        });
      return;
    }

    // Don't load on server side
    if (typeof window === 'undefined') {
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      globalIsLoading = true;
      const checkLoaded = () => {
        if (window.google?.maps?.places) {
          globalIsLoaded = true;
          globalIsLoading = false;
          if (isMountedRef.current) {
            setState({ isLoaded: true, loadError: null });
          }
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Get API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      const error = 'Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.';
      globalLoadError = error;
      if (isMountedRef.current) {
        setState({ isLoaded: false, loadError: error });
      }
      return;
    }

    // Start loading
    globalIsLoading = true;
    
    loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}&v=${version}&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Create global callback
      (window as any).initGoogleMaps = () => {
        // Wait a bit for Google Maps to fully initialize
        setTimeout(() => {
          if (window.google?.maps?.places) {
            globalIsLoaded = true;
            globalIsLoading = false;
            if (isMountedRef.current) {
              setState({ isLoaded: true, loadError: null });
            }
            resolve();
          } else {
            const error = 'Google Maps API loaded but Places library not available';
            globalLoadError = error;
            globalIsLoading = false;
            if (isMountedRef.current) {
              setState({ isLoaded: false, loadError: error });
            }
            reject(new Error(error));
          }
        }, 100);
      };

      script.onerror = () => {
        const error = 'Failed to load Google Maps API. Please check your API key and internet connection.';
        globalLoadError = error;
        globalIsLoading = false;
        if (isMountedRef.current) {
          setState({ isLoaded: false, loadError: error });
        }
        reject(new Error(error));
      };

      document.head.appendChild(script);
    });

  }, [optionsKey]); // Only depend on serialized options

  return state;
};