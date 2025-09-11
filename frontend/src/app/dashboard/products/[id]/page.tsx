'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star,
  Package,
  ShoppingCart,
  Loader2,
  Home,
  ChevronRight,
  ShieldCheck,
  Truck,
  Lock
} from "lucide-react";
import { useProductStore, type StripeProduct, formatPrice } from '../../../../../lib/product/useProductStore';
import { useAuthStore } from '../../../../../lib/auth/useAuthStore';
import { useWishlistStore, useIsInWishlist, useIsItemLoading } from '../../../../../lib/profile/useWishListStore';
import { useCartStore } from '../../../../../lib/profile/useCartStore';

export default function DashboardProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const { user } = useAuthStore();
  const { getProductById, initializeProducts } = useProductStore();
  const { toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const isInWishlist = useIsInWishlist(productId);
  const isWishlistLoading = useIsItemLoading(productId);
  
  const [product, setProduct] = useState<StripeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

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

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.uid) {
      return;
    }

    try {
      await toggleWishlist(user.uid, productId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user?.uid || !product) return;

    try {
      setAddingToCart(true);
      
      const cartProduct = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.images?.[0] || product.image || null,
        priceId: product.defaultPrice?.id || null,
        category: product.category,
        description: product.description,
        inStock: product.inStock,
        quantity: 1
      };
      
      await addToCart(user.uid, cartProduct, 1);
      
      setRecentlyAdded(true);
      setTimeout(() => setRecentlyAdded(false), 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
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
            onClick={() => router.push('/dashboard/products')}
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
  const productQuantity = product.quantity ?? 0;
  const productRating = product.rating ?? 0;
  const productReviews = product.reviews ?? 0;
  const productCategory = product.category ?? 'Uncategorized';
  const isProductInStock = product.inStock ?? true;
  const isProductFeatured = product.isFeatured ?? false;
  const productDescription = product.description ?? '';

  // Get formatted price (handles both legacy and Stripe pricing)
  const formattedPrice = product.defaultPrice 
    ? formatPrice(product.defaultPrice.unit_amount, product.defaultPrice.currency)
    : `${productPrice.toFixed(2)}`;

  // Handle images - prefer the first image from images array, then fallback to image field
  const productImages = product.images || [];
  const hasImages = productImages.length > 0;
  const currentImage = hasImages ? productImages[selectedImageIndex] : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      {/* Breadcrumb Navigation (aligned to content width) */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center text-sm text-rose-600 dark:text-rose-400">
            <button
              onClick={() => router.push('/dashboard/products')}
              className="inline-flex items-center gap-1 hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Products
            </button>
            <ChevronRight className="w-4 h-4 mx-2 opacity-60" />
            <span className="text-rose-900 dark:text-rose-100 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="container mx-auto px-4 pb-6">
        <div className="max-w-6xl mx-auto">


          {/* Product Images and Info Section - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Image Only */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-lg">
                {hasImages ? (
                  <img 
                    src={currentImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
                    <Package className="w-24 h-24 text-pink-500 opacity-50" />
                  </div>
                )}
              </div>
            </div>

                        {/* Right Column - Product Details with Thumbnails */}
            <div className="flex flex-col justify-end">
              <div className="space-y-4">
                {/* Thumbnail Images - Moved to top of details container */}
                {hasImages && productImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex 
                            ? 'border-pink-500 shadow-lg' 
                            : 'border-transparent hover:border-pink-300'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {/* Category and Featured Badge */}
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                    {productCategory}
                  </Badge>
                  {isProductFeatured && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Product Name */}
                <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                  {product.name}
                </h1>

                {/* Rating and Price Row */}
                <div className="flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(productRating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-rose-600 dark:text-rose-400">
                      {productRating.toFixed(1)} ({productReviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                    {formattedPrice}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  {!isProductInStock && (
                    <Badge className="bg-red-500 text-white px-3 py-1 text-sm">
                      Out of Stock
                    </Badge>
                  )}
                   
                  {productQuantity <= 5 && isProductInStock && productQuantity > 0 && (
                    <Badge className="bg-orange-500 text-white px-3 py-1 text-sm">
                      Low Stock: Only {productQuantity} left
                    </Badge>
                  )}

                  {isProductInStock && productQuantity > 5 && (
                    <Badge className="bg-green-500 text-white px-3 py-1 text-sm">
                      In Stock
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-2">
                    Description
                  </h3>
                  <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                    {productDescription || 'No description available for this product.'}
                  </p>
                </div>

                {/* Highlights / Trust indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-rose-900/30 border border-rose-200/70 dark:border-rose-800 px-3 py-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-rose-700 dark:text-rose-300">Handmade Quality</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-rose-900/30 border border-rose-200/70 dark:border-rose-800 px-3 py-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs text-rose-700 dark:text-rose-300">Ships 3-5 days</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-rose-900/30 border border-rose-200/70 dark:border-rose-800 px-3 py-2">
                    <Lock className="w-4 h-4 text-pink-600" />
                    <span className="text-xs text-rose-700 dark:text-rose-300">Secure checkout</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <Button
                      className={`flex-1 text-base py-3 ${
                        !isProductInStock
                          ? "opacity-50 cursor-not-allowed bg-gray-400"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      } text-white`}
                      onClick={handleAddToCart}
                      disabled={!isProductInStock || addingToCart}
                    >
                      {!isProductInStock ? (
                        'Out of Stock'
                      ) : addingToCart ? (
                        'Adding...'
                      ) : recentlyAdded ? (
                        'Added to Cart!'
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleHeartClick}
                      disabled={isWishlistLoading}
                      className={`px-4 py-3 border-2 ${
                        isInWishlist 
                          ? "text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20" 
                          : "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist && "fill-current"}`} />
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/cart')}
                      className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 py-2 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Cart
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/wishlist')}
                      className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 py-2 text-sm"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      View Wishlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
