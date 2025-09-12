import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received');
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    console.log('✅ Webhook signature verified, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'product.created':
        await handleProductCreated(event.data.object as Stripe.Product);
        break;
      
      case 'product.updated':
        await handleProductUpdated(event.data.object as Stripe.Product);
        break;
      
      case 'product.deleted':
        await handleProductDeleted(event.data.object as Stripe.Product);
        break;
      
      case 'price.created':
        await handlePriceCreated(event.data.object as Stripe.Price);
        break;
      
      case 'price.updated':
        await handlePriceUpdated(event.data.object as Stripe.Price);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      

      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleProductCreated(product: Stripe.Product) {
  try {
    // Get the default price for this product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 1,
    });

    const defaultPrice = prices.data[0];

    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      images: product.images,
      metadata: product.metadata,
      defaultPrice: defaultPrice ? {
        id: defaultPrice.id,
        unit_amount: defaultPrice.unit_amount,
        currency: defaultPrice.currency,
      } : null,
      category: product.metadata?.category || '',
      quantity: parseInt(product.metadata?.quantity || '0'),
      rating: parseFloat(product.metadata?.rating || '0'),
      reviews: parseInt(product.metadata?.reviews || '0'),
      inStock: product.metadata?.inStock !== 'false',
      isFeatured: product.metadata?.isFeatured === 'true',
      price: defaultPrice ? defaultPrice.unit_amount! / 100 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = getFirestore();
    const productRef = db.collection('products').doc(product.id);
    await productRef.set(productData);

    console.log('Product created in Firebase:', product.id);
  } catch (error) {
    console.error('Error handling product.created:', error);
  }
}

async function handleProductUpdated(product: Stripe.Product) {
  try {
    // Get the default price for this product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 1,
    });

    const defaultPrice = prices.data[0];

    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      images: product.images,
      metadata: product.metadata,
      defaultPrice: defaultPrice ? {
        id: defaultPrice.id,
        unit_amount: defaultPrice.unit_amount,
        currency: defaultPrice.currency,
      } : null,
      category: product.metadata?.category || '',
      quantity: parseInt(product.metadata?.quantity || '0'),
      rating: parseFloat(product.metadata?.rating || '0'),
      reviews: parseInt(product.metadata?.reviews || '0'),
      inStock: product.metadata?.inStock !== 'false',
      isFeatured: product.metadata?.isFeatured === 'true',
      price: defaultPrice ? defaultPrice.unit_amount! / 100 : 0,
      updatedAt: new Date().toISOString(),
    };

    const db = getFirestore();
    const productRef = db.collection('products').doc(product.id);
    await productRef.set(productData, { merge: true });

    console.log('Product updated in Firebase:', product.id);
  } catch (error) {
    console.error('Error handling product.updated:', error);
  }
}

async function handleProductDeleted(product: Stripe.Product) {
  try {
    const db = getFirestore();
    const productRef = db.collection('products').doc(product.id);
    await productRef.delete();

    console.log('Product deleted from Firebase:', product.id);
  } catch (error) {
    console.error('Error handling product.deleted:', error);
  }
}

async function handlePriceCreated(price: Stripe.Price) {
  try {
    if (price.product && typeof price.product === 'string') {
      const db = getFirestore();
      const productRef = db.collection('products').doc(price.product);
      await productRef.set({
        defaultPrice: {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        },
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log('Price created and product updated in Firebase:', price.id);
    }
  } catch (error) {
    console.error('Error handling price.created:', error);
  }
}

async function handlePriceUpdated(price: Stripe.Price) {
  try {
    if (price.product && typeof price.product === 'string') {
      const db = getFirestore();
      const productRef = db.collection('products').doc(price.product);
      await productRef.set({
        defaultPrice: {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        },
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log('Price updated and product updated in Firebase:', price.id);
    }
  } catch (error) {
    console.error('Error handling price.updated:', error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    
    // Extract metadata from the session
    const metadata = session.metadata;
    
    if (!metadata || !metadata.userId) {
      console.error('No user ID found in session metadata. Metadata:', metadata);
      return;
    }

    const userId = metadata.userId;
    
    // Parse order items from metadata
    let orderItems = [];
    try {
      if (metadata.itemSummary) {
        const itemSummary = JSON.parse(metadata.itemSummary);
        // Convert item summary back to full order item format
        orderItems = itemSummary.map((item: any) => ({
          ...item,
          image: null, // Image URLs are not stored in metadata to stay under 500 chars
          id: item.productId
        }));
      }
    } catch (error) {
      console.error('Error parsing item summary from metadata:', error);
    }

    // Get shipping address from session - check multiple possible locations
    const shippingAddress = (session as any).shipping || 
                           (session as any).shipping_details || 
                           (session as any).collected_information?.shipping_details;
    
    
    // Don't return early if shipping address is missing - we can still create the order

    // Calculate totals from Stripe data (includes automatic tax calculation)
    const subtotal = (session.amount_subtotal || 0) / 100;
    const shipping = ((session as any).shipping_cost?.amount_total || 0) / 100;
    const tax = (session.total_details?.amount_tax || 0) / 100;
    const total = (session.amount_total || 0) / 100;

    // Determine order status based on payment intent status
    let orderStatus = 'pending';
    let statusNote = 'Order created via Stripe webhook';
    let paymentIntentStatus: string = session.payment_status;
    
    // Try to get more detailed payment status from payment intent
    if (session.payment_intent) {
      try {
        const db = getFirestore();
        const paymentRef = db.collection('users').doc(userId).collection('payments').doc(session.payment_intent as string);
        const paymentDoc = await paymentRef.get();
        
        if (paymentDoc.exists) {
          const paymentData = paymentDoc.data();
          paymentIntentStatus = paymentData?.status || session.payment_status;
        } 
      } catch (error) {
        console.warn('Error fetching payment intent from user collection:', error);
      }
    }
    
    // Determine order status based on payment intent status
    if (paymentIntentStatus === 'succeeded') {
      orderStatus = 'confirmed';
      statusNote = 'Payment successful - order confirmed';
    } else if (paymentIntentStatus === 'requires_payment_method' || paymentIntentStatus === 'requires_confirmation') {
      orderStatus = 'pending';
      statusNote = 'Payment pending - awaiting payment method';
    } else if (paymentIntentStatus === 'requires_action') {
      orderStatus = 'pending';
      statusNote = 'Payment requires additional action';
    } else if (paymentIntentStatus === 'processing') {
      orderStatus = 'pending';
      statusNote = 'Payment processing';
    } else if (paymentIntentStatus === 'canceled') {
      orderStatus = 'canceled';
      statusNote = 'Payment canceled';
    } else if (session.payment_status === 'paid') {
      orderStatus = 'confirmed';
      statusNote = 'Payment successful - order confirmed';
    } else if (session.payment_status === 'unpaid') {
      orderStatus = 'pending';
      statusNote = 'Payment pending - order awaiting payment';
    } else if (session.payment_status === 'no_payment_required') {
      orderStatus = 'confirmed';
      statusNote = 'No payment required - order confirmed';
    }


    // Create order document
    const orderData = {
      id: session.id,
      customerId: userId,
      customerEmail: (session as any).customer_details?.email || metadata.customerEmail,
      customerName: (session as any).customer_details?.name || metadata.customerName,
      items: orderItems,
      shippingAddress: {
        firstName: shippingAddress?.name?.split(' ')[0] || (session as any).customer_details?.name?.split(' ')[0] || metadata.shippingFirstName || '',
        lastName: shippingAddress?.name?.split(' ').slice(1).join(' ') || (session as any).customer_details?.name?.split(' ').slice(1).join(' ') || metadata.shippingLastName || '',
        phone: (session as any).customer_details?.phone || metadata.shippingPhone || '',
        address1: shippingAddress?.address?.line1 || (session as any).customer_details?.address?.line1 || metadata.shippingAddress1 || '',
        address2: shippingAddress?.address?.line2 || (session as any).customer_details?.address?.line2 || metadata.shippingAddress2 || '',
        city: shippingAddress?.address?.city || (session as any).customer_details?.address?.city || metadata.shippingCity || '',
        state: shippingAddress?.address?.state || (session as any).customer_details?.address?.state || metadata.shippingState || '',
        zipCode: shippingAddress?.address?.postal_code || (session as any).customer_details?.address?.postal_code || metadata.shippingZip || '',
        country: shippingAddress?.address?.country || (session as any).customer_details?.address?.country || metadata.shippingCountry || 'US',
        email: (session as any).customer_details?.email || metadata.customerEmail || '',
      },
      shippingMethod: metadata.shippingMethod || 'Standard Shipping',
      estimatedDelivery: (() => {
        // Calculate proper estimated delivery date
        const deliveryDays = metadata.estimatedDeliveryDays 
          ? parseInt(metadata.estimatedDeliveryDays.split('-')[1] || '7')
          : 7;
        return new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString();
      })(),
      paymentMethod: 'Stripe Checkout',
      paymentIntentId: session.payment_intent as string,
      totals: {
        subtotal,
        shipping,
        tax,
        total
      },
      status: orderStatus,
      orderStatus: 'processing',
      paymentStatus: session.payment_status,
      paymentIntentStatus: paymentIntentStatus,
      statusHistory: [
        {
          status: orderStatus,
          timestamp: new Date().toISOString(),
          note: statusNote,
          updatedBy: 'system'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Store Stripe session data for reference
      stripeSessionId: session.id,
      stripeCustomerId: session.customer as string,
      // Store automatic tax calculation details
      taxCalculation: {
        automatic: true,
        amount: tax,
        currency: session.currency,
        taxBreakdown: (session.total_details?.breakdown as any)?.tax_reasons || []
      }
    };
    
    try {
      const db = getFirestore();
      
      // Create order in user's orders collection
      const orderRef = db.collection('users').doc(userId).collection('orders').doc(session.id);
      await orderRef.set(orderData);
      // Also create in global orders collection for admin access
      const globalOrderRef = db.collection('orders').doc(session.id);
      await globalOrderRef.set(orderData);
    } catch (firebaseError) {
      console.error('Firebase error creating order:', firebaseError);
      throw firebaseError;
    }
    
    // TODO: Send confirmation email, update inventory, etc.
    
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
  }
}


