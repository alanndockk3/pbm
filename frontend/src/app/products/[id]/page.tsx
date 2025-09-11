'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star,
  Package,
  ShoppingCart,
  User,
  Loader2,
  Home,
  ChevronRight,
  ShieldCheck,
  Truck,
  Lock
} from "lucide-react";
import LandingFooter from '@/components/LandingFooter';
import { useProductStore, type StripeProduct } from '../../../../lib/product/useProductStore';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useWishlistStore, useIsInWishlist, useIsItemLoading } from '../../../../lib/profile/useWishListStore';
import { formatPrice } from '../../../../lib/product/useProductStore';
import { LoginModal } from '@/components/login-modal';
import { ComingSoonModal } from '@/components/coming-soon-modal';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const { user } = useAuthStore();
  const { getProductById, initializeProducts } = useProductStore();
  const { toggleWishlist } = useWishlistStore();
  const isInWishlist = useIsInWishlist(productId);
  const isWishlistLoading = useIsItemLoading(productId);
  
  const [product, setProduct] = useState<StripeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize products if not already done
        await initializeProducts();
        
        // Get the specific product
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
      setIsLoginOpen(true);
      return;
    }

    try {
      await toggleWishlist(user.uid, productId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handlePurchaseClick = () => {
    if (!user) {
      setIsSignupOpen(true);
      return;
    }
    
    // Navigate to dashboard cart for authenticated users
    router.push('/dashboard/cart');
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
            onClick={() => router.push('/products')}
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
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">PBM</h1>
            <p className="text-xs text-rose-600 dark:text-rose-300">Pretties by Marg</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => router.push('/dashboard/cart')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setIsSignupOpen(true)}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Breadcrumb Navigation (aligned to content width) */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center text-sm text-rose-600 dark:text-rose-400">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1 hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 opacity-60" />
            <Link 
              href="/products" 
              className="hover:text-rose-800 dark:hover:text-rose-200 transition-colors"
            >
              Products
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 opacity-60" />
            <span className="text-rose-900 dark:text-rose-100 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Product Images */}
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

            {/* Thumbnail Images */}
            {hasImages && productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
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
          </div>

          {/* Product Info - align to bottom similar to dashboard */}
          <div className="flex flex-col justify-end">
            <div className="space-y-4">
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
            <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">
              {formattedPrice}
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {!isProductInStock && (
                <Badge className="bg-red-500 text-white px-3 py-1">
                  Out of Stock
                </Badge>
              )}
              
              {productQuantity <= 5 && isProductInStock && productQuantity > 0 && (
                <Badge className="bg-orange-500 text-white px-3 py-1">
                  Low Stock: Only {productQuantity} left
                </Badge>
              )}

              {isProductInStock && productQuantity > 5 && (
                <Badge className="bg-green-500 text-white px-3 py-1">
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

            {/* Highlights / Trust indicators (no easy returns) */}
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
                    !isProductInStock || !user
                      ? "opacity-50 cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  } text-white`}
                  onClick={handlePurchaseClick}
                  disabled={!isProductInStock || !user}
                >
                  {!isProductInStock ? (
                    'Out of Stock'
                  ) : !user ? (
                    'Sign Up to Purchase'
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

              {!user && (
                <p className="text-sm text-rose-600 dark:text-rose-400 text-center">
                  Sign up or log in to add items to your cart and wishlist
                </p>
              )}
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <ComingSoonModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
        title="New Feature Coming Soon"
        description="We're building an amazing new dashboard experience!"
      />
    </div>
  );
}
