// components/forms/AddressAutocompleteInput.tsx
'use client'

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useGoogleMaps } from '../../../lib/hooks/useGoogleMaps';

export interface AddressComponents {
  fullAddress: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

interface Suggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressAutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (addressComponents: AddressComponents) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AddressAutocompleteInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  onAddressSelect,
  required = false, 
  placeholder = '',
  className = '',
  disabled = false
}: AddressAutocompleteInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const isMountedRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { isLoaded, loadError } = useGoogleMaps({ libraries: ['places'] });
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize services when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || disabled) return;

    try {
      serviceRef.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
    } catch (error) {
      console.error('Error initializing Google Places services:', error);
    }
  }, [isLoaded, disabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Memoized search function to prevent recreation
  const searchPlaces = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (!serviceRef.current || !query.trim() || query.length < 3 || !isMountedRef.current) {
        if (isMountedRef.current) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        return;
      }

      if (isMountedRef.current) {
        setIsLoadingSuggestions(true);
      }

      serviceRef.current.getPlacePredictions(
        {
          input: query,
          types: ['address'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (!isMountedRef.current) return;
          
          setIsLoadingSuggestions(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions: Suggestion[] = predictions.map(prediction => ({
              place_id: prediction.place_id,
              description: prediction.description,
              structured_formatting: {
                main_text: prediction.structured_formatting?.main_text || prediction.description,
                secondary_text: prediction.structured_formatting?.secondary_text || ''
              }
            }));
            
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }, 300);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    searchPlaces(newValue);
  }, [onChange, searchPlaces]);

  // Handle suggestion selection
  const selectSuggestion = useCallback((suggestion: Suggestion) => {
    if (!placesServiceRef.current || !isMountedRef.current) return;

    onChange(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Get detailed place information
    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ['address_components', 'formatted_address', 'geometry']
      },
      (place, status) => {
        if (!isMountedRef.current) return;
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (!place.address_components || !place.formatted_address) {
            console.warn('Incomplete place data received');
            return;
          }

          const addressComponents: AddressComponents = {
            fullAddress: place.formatted_address,
            streetNumber: '',
            streetName: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            coordinates: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : undefined
          };

          // Parse address components
          place.address_components.forEach((component: google.maps.places.AddressComponent) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              addressComponents.streetNumber = component.long_name;
            }
            if (types.includes('route')) {
              addressComponents.streetName = component.long_name;
            }
            if (types.includes('locality') || types.includes('sublocality_level_1')) {
              addressComponents.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              addressComponents.state = component.short_name;
            }
            if (types.includes('postal_code')) {
              addressComponents.zipCode = component.long_name;
            }
            if (types.includes('country')) {
              addressComponents.country = component.long_name;
            }
          });

          // Call the address select callback
          if (onAddressSelect) {
            onAddressSelect(addressComponents);
          }
        }
      }
    );
  }, [onChange, onAddressSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        if (isMountedRef.current) {
          setSuggestions([]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, selectSuggestion]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (isMountedRef.current) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (suggestions.length > 0 && isMountedRef.current) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // Memoize the input element to prevent unnecessary re-renders
  const inputElement = useMemo(() => (
    <input
      ref={inputRef}
      type="text"
      value={value || ''}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled || (!isLoaded && !loadError)}
      className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
      required={required}
      autoComplete="street-address"
    />
  ), [value, handleInputChange, handleKeyDown, handleBlur, handleFocus, placeholder, disabled, isLoaded, loadError, required]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {inputElement}
        
        {/* Loading spinner */}
        {(isLoadingSuggestions || (!isLoaded && !loadError)) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-rose-800 border border-rose-200 dark:border-rose-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className={`px-4 py-3 cursor-pointer border-b border-rose-100 dark:border-rose-700 last:border-b-0 ${
                  index === selectedIndex
                    ? 'bg-pink-50 dark:bg-pink-900/20'
                    : 'hover:bg-rose-50 dark:hover:bg-rose-700/20'
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-rose-900 dark:text-rose-100">
                    {suggestion.structured_formatting.main_text}
                  </span>
                  {suggestion.structured_formatting.secondary_text && (
                    <span className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                      {suggestion.structured_formatting.secondary_text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Status messages */}
      {!isLoaded && !loadError && (
        <p className="text-xs text-rose-500 mt-1">Loading address suggestions...</p>
      )}
      
      {loadError && (
        <p className="text-xs text-red-500 mt-1">
          {loadError}. You can still enter your address manually.
        </p>
      )}
      
      {isLoaded && !disabled && value && value.length > 0 && value.length < 3 && (
        <p className="text-xs text-rose-400 mt-1">
          Type at least 3 characters to see suggestions
        </p>
      )}
    </div>
  );
});

AddressAutocompleteInput.displayName = 'AddressAutocompleteInput';

export default AddressAutocompleteInput;