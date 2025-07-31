// Updated dashboard page with ProductModal
'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from '@/components/footer';
import Wishlist from '@/components/account/wishlist/Wishlist';
import { ProductModal } from '@/components/product/ProductModal'; // Changed import
import { OrderCard } from '@/components/account/orders/OrderCard';
import { 
  Heart, 
  Sparkles, 
  Gift, 
  User, 
  Package, 
  ShoppingBag,
  LogOut,
  Bell,
  MapPin,
  Plus
} from "lucide-react";
import { useAuthStore } from '../../../lib/auth/useAuthStore';
import { useWishlistStore, useWishlistItems, useWishlistLoading } from '../../../lib/profile/useWishListStore';
import { useProductStore, useProducts } from '../../../lib/product/useProductStore';
import { useUserOrders, useOrderActions } from '../../../lib/orders/useOrderStore';
import type { Product } from '../../../types/product';
import type { StripeProduct } from '../../../lib/product/useProductStore';

// Helper function to convert Product to StripeProduct format
const convertToStripeProduct = (product: Product): StripeProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    images: product.image ? [product.image] : [],
    image: product.image ?? undefined,
    price: product.price,
    quantity: product.quantity,
    rating: product.rating,
    reviews: product.reviews,
    category: product.category,
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    // Add any other StripeProduct specific fields with defaults
    metadata: {},
    active: true,
    defaultPrice: undefined, // Will use legacy price field
  };
};

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Wishlist and product stores
  const { loadWishlist, removeFromWishlist, subscribeToWishlist, toggleWishlist } = useWishlistStore();
  const wishlistProductIds = useWishlistItems();
  const wishlistLoading = useWishlistLoading();
  const { initializeProducts } = useProductStore();
  const allProducts = useProducts();
  
  // Order store - using your existing implementation
  const { orders: userOrders, isLoading: ordersLoading, error: ordersError } = useUserOrders(user?.uid || null);
  const { getOrder } = useOrderActions();
  
  // Calculate order statistics
  const orderCount = userOrders.length;
  const recentOrders = userOrders.slice(0, 3); // Get first 3 orders
  
  // Get actual product objects from wishlist IDs
  const wishlistItems = useMemo(() => {
    return wishlistProductIds
      .map(productId => allProducts.find(product => product.id === productId))
      .filter(Boolean) as Product[];
  }, [wishlistProductIds, allProducts]);

  // Convert selected product to StripeProduct format when needed
  const selectedStripeProduct = useMemo(() => {
    return selectedProduct ? convertToStripeProduct(selectedProduct) : null;
  }, [selectedProduct]);

  // Initialize data on mount
  useEffect(() => {
    if (user?.uid) {
      initializeProducts();
      loadWishlist(user.uid);
      
      const unsubscribeWishlist = subscribeToWishlist(user.uid);
      // Note: useUserOrders hook handles loading orders automatically
      
      return () => {
        unsubscribeWishlist();
      };
    }
  }, [user?.uid, initializeProducts, loadWishlist, subscribeToWishlist]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  // Wishlist handlers with modal logic
  const handleViewWishlistItem = (itemId: string) => {
    console.log('View wishlist item:', itemId);
    const product = wishlistItems.find(item => item.id === itemId);
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleAddToCart = (itemId: string, quantity: number = 1) => {
    console.log('Add to cart:', itemId, 'Quantity:', quantity);
    // Add item to cart logic here
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    console.log('Remove from wishlist:', itemId);
    if (!user?.uid) return;
    
    try {
      await removeFromWishlist(user.uid, itemId);
      // Close modal if the removed item was being viewed
      if (selectedProduct?.id === itemId) {
        setIsModalOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Handle heart click for ProductModal (toggles wishlist)
  const handleHeartClick = async (e: React.MouseEvent) => {
    if (!user?.uid || !selectedProduct) return;
    
    try {
      await toggleWishlist(user.uid, selectedProduct.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Handle purchase click for ProductModal
  const handlePurchaseClick = () => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct.id, 1);
    }
  };

  const handleViewAllWishlist = () => {
    router.push('/dashboard/wishlist');
  };

  const handleViewOrderDetails = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleViewAllOrders = () => {
    router.push('/dashboard/orders');
  };

  // Calculate dashboard stats with real data
  const dashboardStats = {
    orders: orderCount,
    wishlist: wishlistItems.length,
    reviews: 4.8, // This could be calculated from real review data
    customOrders: userOrders.filter(order => 
      order.items.some(item => item.name.toLowerCase().includes('custom'))
    ).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">

      {/* Welcome Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Welcome Back
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-bold text-rose-900 dark:text-rose-100 mb-3">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600">{user?.displayName || 'Beautiful Soul'}</span>!
          </h1>
          
          <p className="text-lg text-rose-700 dark:text-rose-300 max-w-2xl mx-auto">
            Welcome to your personal dashboard. Explore your orders, manage your wishlist, and discover new handmade treasures.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {ordersLoading ? '...' : dashboardStats.orders}
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Orders</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {wishlistLoading ? '...' : dashboardStats.wishlist}
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Wishlist</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-800 dark:to-rose-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">{dashboardStats.reviews}</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Reviews</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {ordersLoading ? '...' : dashboardStats.customOrders}
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Custom Orders</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders - Now with real data */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Recent Orders</CardTitle>
                    <CardDescription className="text-rose-700 dark:text-rose-300">Your latest purchases</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-pink-600 hover:text-pink-700"
                  onClick={handleViewAllOrders}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ordersLoading ? (
                <div className="text-center py-4 text-rose-600 dark:text-rose-400">
                  Loading orders...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="w-12 h-12 text-rose-400 mx-auto mb-2" />
                  <p className="text-rose-600 dark:text-rose-400 text-sm">No orders yet</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    onClick={() => router.push('/dashboard/products')}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onViewDetails={handleViewOrderDetails}
                    isCompact 
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Wishlist Component - Pass real data */}
          <Wishlist 
            items={wishlistItems}
            isCompact={true}
            showActions={false}
            onViewItem={handleViewWishlistItem}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onViewAll={handleViewAllWishlist}
          />

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-800 dark:to-rose-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-rose-900 dark:text-rose-100">Quick Actions</CardTitle>
                  <CardDescription className="text-rose-700 dark:text-rose-300">What would you like to do?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard/products')}
                className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Custom Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300"
              >
                <Gift className="w-4 h-4 mr-2" />
                Gift Cards
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Account Management */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-6">Account Management</h2>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer"
            onClick={() => router.push('/dashboard/profile')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Profile</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Manage your personal information</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm cursor-pointer"
            onClick={() => router.push('/dashboard/addresses')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Addresses</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">Manage shipping addresses</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Product Modal - Updated to use ProductModal */}
      {selectedStripeProduct && (
        <ProductModal
          product={selectedStripeProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onHeartClick={handleHeartClick}
          onPurchaseClick={handlePurchaseClick}
          showQuantity={true}
          purchaseButtonText="Add to Cart"
          disabled={false}
          isInWishlist={true} // Always true since this comes from wishlist
        />
      )}
    </div>
  );
}