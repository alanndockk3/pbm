// components/checkout/OrderReview.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCheckoutStore } from '../../../../lib/checkout/useCheckoutStore';
import { useAuthStore } from '../../../../lib/auth/useAuthStore';
import { useOrderActions } from '../../../../lib/orders/useOrderStore';
import { useCartStore } from '../../../../lib/profile/useCartStore';
import type { OrderItem, OrderTotals, OrderAddress } from '../../../../types/order';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  User,
  Edit,
  Loader2,
  ShoppingCart
} from 'lucide-react';

const PaymentMethodIcon = ({ method }: { method: string }) => {
  switch (method) {
    case 'apple_pay':
      return <div className="w-4 h-4 bg-black rounded text-white flex items-center justify-center text-xs font-bold"></div>;
    case 'google_pay':
      return <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded text-white flex items-center justify-center text-xs font-bold">G</div>;
    case 'stripe_checkout':
      return <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded text-white flex items-center justify-center text-xs font-bold">S</div>;
    default:
      return <CreditCard className="w-4 h-4" />;
  }
};

const formatPaymentMethod = (method: string) => {
  switch (method) {
    case 'apple_pay': return 'Apple Pay';
    case 'google_pay': return 'Google Pay';
    case 'stripe_checkout': return 'Stripe Checkout';
    case 'card': return 'Credit Card';
    default: return 'Credit Card';
  }
};

export const OrderReview = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    shippingAddress, 
    shippingOption, 
    paymentMethod,
    totals, 
    items,
    setStep,
    resetCheckout
  } = useCheckoutStore();
  
  const { createOrder } = useOrderActions();
  const { clearCart } = useCartStore();
  
  const [isConfirming, setIsConfirming] = useState(false);

  const handleEditStep = (step: 1 | 2 | 3 | 4) => {
    setStep(step);
  };

  const handleConfirmOrder = async () => {
    if (!user?.uid) {
      console.error('User not authenticated');
      return;
    }

    setIsConfirming(true);

    try {
      // Convert checkout items to order items
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category || 'Handmade'
      }));

      // Build shipping address
      const orderAddress: OrderAddress = {
        firstName: shippingAddress.firstName || '',
        lastName: shippingAddress.lastName || '',
        email: shippingAddress.email || user.email || '',
        phone: shippingAddress.phone || '',
        address1: shippingAddress.address1 || '',
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode || '',
        country: shippingAddress.country || 'US'
      };

      // Build order totals
      const orderTotals: OrderTotals = {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total
      };

      // Calculate estimated delivery
      const deliveryDays = shippingOption?.estimatedDays 
        ? parseInt(shippingOption.estimatedDays.split('-')[1] || '7')
        : 7;
      const estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();

      // Create the order
      const orderId = await createOrder({
        customerId: user.uid,
        customerEmail: orderAddress.email,
        customerName: `${orderAddress.firstName} ${orderAddress.lastName}`.trim() || user.displayName || 'Customer',
        items: orderItems,
        shippingAddress: orderAddress,
        shippingMethod: shippingOption?.name || 'Standard Shipping',
        estimatedDelivery,
        paymentMethod: formatPaymentMethod(paymentMethod.type || 'card'),
        paymentIntentId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        totals: orderTotals
      });

      console.log('✅ Order created successfully:', orderId);

      // Clear cart after successful order creation
      if (user.uid) {
        await clearCart(user.uid);
      }

      // Reset checkout state
      resetCheckout();

      // Redirect to order details
      router.push(`/dashboard/orders/${orderId}`);

    } catch (error) {
      console.error('Error creating order:', error);
      setIsConfirming(false);
      // You could add error state handling here
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Review Your Order
        </CardTitle>
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          Please review your order details before confirming
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {isConfirming && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-600" />
            <p className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
              Creating Your Order...
            </p>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Please wait while we process your order
            </p>
            <div className="mt-4 w-full bg-rose-200 dark:bg-rose-700 rounded-full h-2 max-w-xs mx-auto">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
            </div>
          </div>
        )}

        {!isConfirming && (
          <>
            {/* Shipping Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStep(1)}
                  className="text-pink-600 hover:text-pink-700 p-1 h-auto"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <p className="font-medium text-rose-900 dark:text-rose-100">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p className="text-rose-700 dark:text-rose-300 text-sm">
                  {shippingAddress.address1}
                  {shippingAddress.address2 && `, ${shippingAddress.address2}`}
                </p>
                <p className="text-rose-700 dark:text-rose-300 text-sm">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p className="text-rose-600 dark:text-rose-400 text-sm">
                  {shippingAddress.email || user?.email}
                </p>
                <p className="text-rose-600 dark:text-rose-400 text-sm">
                  {shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Shipping Method
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStep(2)}
                  className="text-pink-600 hover:text-pink-700 p-1 h-auto"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {shippingOption?.name}
                    </p>
                    <p className="text-rose-600 dark:text-rose-400 text-sm">
                      {shippingOption?.description}
                    </p>
                    <p className="text-rose-600 dark:text-rose-400 text-sm">
                      Estimated delivery: {shippingOption?.estimatedDays} business days
                    </p>
                  </div>
                  <span className="font-medium text-rose-900 dark:text-rose-100">
                    ${shippingOption?.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <PaymentMethodIcon method={paymentMethod.type || 'card'} />
                  Payment Method
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStep(3)}
                  className="text-pink-600 hover:text-pink-700 p-1 h-auto"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-rose-900 dark:text-rose-100">
                    {formatPaymentMethod(paymentMethod.type || 'card')}
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Ready
                  </Badge>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-medium text-rose-900 dark:text-rose-100 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Items ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded flex items-center justify-center">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-pink-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-rose-900 dark:text-rose-100">{item.name}</p>
                      <p className="text-rose-600 dark:text-rose-400 text-sm">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-medium text-rose-900 dark:text-rose-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-rose-200 dark:border-rose-700 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-rose-600 dark:text-rose-400">Subtotal:</span>
                  <span className="text-rose-900 dark:text-rose-100">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-600 dark:text-rose-400">Shipping:</span>
                  <span className="text-rose-900 dark:text-rose-100">${totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-600 dark:text-rose-400">Tax:</span>
                  <span className="text-rose-900 dark:text-rose-100">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-rose-200 dark:border-rose-700">
                  <span className="text-rose-900 dark:text-rose-100">Total:</span>
                  <span className="text-rose-900 dark:text-rose-100">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Confirm Order Button */}
            <Button
              onClick={handleConfirmOrder}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 text-lg font-semibold transition-all duration-300 mt-6"
              disabled={!user?.uid || !shippingOption || !paymentMethod.type}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Complete Order - ${totals.total.toFixed(2)}
            </Button>

            {/* Terms Notice */}
            <div className="text-center text-xs text-rose-500 dark:text-rose-500">
              By completing your order, you agree to our Terms of Service and Privacy Policy
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};