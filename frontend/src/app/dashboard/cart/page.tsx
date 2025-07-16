'use client'

import React, { useState } from 'react';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useRouter } from 'next/navigation';
import { 
  useCartStore, 
  useCartItems, 
  useCartLoading, 
  useCartTotalItems, 
  useCartTotalPrice 
} from '../../../../lib/profile/useCartStore';
import { useWishlistStore } from '../../../../lib/profile/useWishListStore';
import type { CartItem } from '../../../../lib/profile/useCartStore';
import Header from '@/components/Header';

// Import all the new components
import { LoginPrompt } from '@/components/account/cart/LoginPrompt';
import { CartPageHeader } from '@/components/account/cart/CartPageHeader';
import { EmptyCartState } from '@/components/account/cart/EmptyCartState';
import { CartItemList } from '@/components/account/cart/CartItemList';
import { OrderSummary } from '@/components/account/cart/OrderSummary';


export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItems = useCartItems();
  const cartLoading = useCartLoading();
  const totalItems = useCartTotalItems();
  const totalPrice = useCartTotalPrice();
  
  const { 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart
  } = useCartStore();
  
  const { toggleWishlist } = useWishlistStore();
  
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

  // Cart operations
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (!user?.uid || newQuantity < 0) return;
    
    setProcessingItems(prev => new Set(prev).add(productId));
    
    try {
      if (newQuantity === 0) {
        await removeFromCart(user.uid, productId);
      } else {
        await updateCartItemQuantity(user.uid, productId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user?.uid) return;
    
    setProcessingItems(prev => new Set(prev).add(productId));
    
    try {
      await removeFromCart(user.uid, productId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleMoveToWishlist = async (item: CartItem) => {
    if (!user?.uid) return;
    
    try {
      await toggleWishlist(user.uid, item.productId);
      await removeFromCart(user.uid, item.productId);
      console.log('Moved to wishlist:', item.name);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
    }
  };

  const handleClearCart = async () => {
    if (!user?.uid) return;
    
    try {
      await clearCart(user.uid);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    const total = subtotal + shipping + tax;
    alert(`Checkout with ${totalItems} items totaling $${total.toFixed(2)}`);

    router.push('/dashboard/checkout');
    
  };

  // Calculations
  const subtotal = totalPrice;
  const shipping = subtotal > 75 ? 0 : 8.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Show login prompt if user not authenticated
  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <Header navigateBack={true} />
      
      <CartPageHeader 
        totalItems={totalItems}
        hasItems={cartItems.length > 0}
        onClearCart={handleClearCart}
      />

      <div className="container mx-auto px-4 pb-12">
        {cartItems.length === 0 ? (
          <EmptyCartState />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <CartItemList
              items={cartItems}
              processingItems={processingItems}
              onQuantityChange={handleQuantityChange}
              onMoveToWishlist={handleMoveToWishlist}
              onRemove={handleRemoveItem}
            />
            
            <OrderSummary
              totalItems={totalItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              cartLoading={cartLoading}
              cartItems={cartItems}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
}