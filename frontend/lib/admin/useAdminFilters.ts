// hooks/useAdminFilters.ts
import { useMemo } from 'react';
import type { StripeProduct } from '../product/useProductStore';

interface UseAdminFiltersProps {
  products: StripeProduct[];
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
}

export function useAdminFilters({
  products,
  searchTerm,
  selectedCategory,
  sortBy,
}: UseAdminFiltersProps) {
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(
      products
        .map(p => p.metadata?.category || p.category)
        .filter(Boolean)
    )];
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    let filtered = products;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        (product.metadata?.category || product.category || '').toLowerCase().includes(term) ||
        product.id.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        (product.metadata?.category || product.category) === selectedCategory
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': {
          const priceA = a.defaultPrice ? a.defaultPrice.unit_amount / 100 : (a.price || 0);
          const priceB = b.defaultPrice ? b.defaultPrice.unit_amount / 100 : (b.price || 0);
          return priceA - priceB;
        }
        case 'price-high': {
          const priceA = a.defaultPrice ? a.defaultPrice.unit_amount / 100 : (a.price || 0);
          const priceB = b.defaultPrice ? b.defaultPrice.unit_amount / 100 : (b.price || 0);
          return priceB - priceA;
        }
        case 'rating': {
          const ratingA = parseFloat(a.metadata?.rating || '0') || a.rating || 0;
          const ratingB = parseFloat(b.metadata?.rating || '0') || b.rating || 0;
          return ratingB - ratingA;
        }
        case 'stock': {
          const stockA = parseInt(a.metadata?.quantity || '0') || a.quantity || 0;
          const stockB = parseInt(b.metadata?.quantity || '0') || b.quantity || 0;
          return stockB - stockA;
        }
        case 'featured': {
          const featuredA = a.metadata?.isFeatured === 'true' || a.isFeatured || false;
          const featuredB = b.metadata?.isFeatured === 'true' || b.isFeatured || false;
          return (featuredB ? 1 : 0) - (featuredA ? 1 : 0);
        }
        case 'created': {
          // Sort by creation date (newest first)
          const dateA = a.created?.toDate?.() || new Date(0);
          const dateB = b.created?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        }
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy]);

  return {
    filteredProducts,
    categories,
  };
}