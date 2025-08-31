import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../../../client/firebaseConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, productData);

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
      updatedAt: serverTimestamp(),
    };

    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, productData, { merge: true });

    console.log('Product updated in Firebase:', product.id);
  } catch (error) {
    console.error('Error handling product.updated:', error);
  }
}

async function handleProductDeleted(product: Stripe.Product) {
  try {
    const productRef = doc(db, 'products', product.id);
    await deleteDoc(productRef);

    console.log('Product deleted from Firebase:', product.id);
  } catch (error) {
    console.error('Error handling product.deleted:', error);
  }
}

async function handlePriceCreated(price: Stripe.Price) {
  try {
    if (price.product && typeof price.product === 'string') {
      const productRef = doc(db, 'products', price.product);
      await setDoc(productRef, {
        defaultPrice: {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        },
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        updatedAt: serverTimestamp(),
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
      const productRef = doc(db, 'products', price.product);
      await setDoc(productRef, {
        defaultPrice: {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        },
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log('Price updated and product updated in Firebase:', price.id);
    }
  } catch (error) {
    console.error('Error handling price.updated:', error);
  }
}
