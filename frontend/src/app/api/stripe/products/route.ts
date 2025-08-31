import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../../../client/firebaseConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      quantity,
      rating,
      reviews,
      isFeatured,
      inStock,
      images
    } = body;

    // Validate required fields
    if (!name || !price || !description) {
      return NextResponse.json(
        { error: 'Name, price, and description are required' },
        { status: 400 }
      );
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
      images: images || [],
      metadata: {
        category: category || '',
        quantity: quantity?.toString() || '0',
        rating: rating?.toString() || '0',
        reviews: reviews?.toString() || '0',
        isFeatured: isFeatured?.toString() || 'false',
        inStock: inStock?.toString() || 'true',
      },
    });

    // Create price in Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
      currency: 'usd',
    });

    // Prepare product data for Firebase
    const productData = {
      id: stripeProduct.id,
      name: stripeProduct.name,
      description: stripeProduct.description,
      active: stripeProduct.active,
      images: stripeProduct.images,
      metadata: stripeProduct.metadata,
      defaultPrice: {
        id: stripePrice.id,
        unit_amount: stripePrice.unit_amount,
        currency: stripePrice.currency,
      },
      category: category || '',
      quantity: parseInt(quantity) || 0,
      rating: parseFloat(rating) || 0,
      reviews: parseInt(reviews) || 0,
      inStock: inStock !== false,
      isFeatured: isFeatured || false,
      price: parseFloat(price),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save to Firebase
    const productRef = doc(db, 'products', stripeProduct.id);
    await setDoc(productRef, productData);

    return NextResponse.json({
      success: true,
      product: {
        ...productData,
        id: stripeProduct.id,
      },
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price'],
    });

    return NextResponse.json({
      success: true,
      products: products.data,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
