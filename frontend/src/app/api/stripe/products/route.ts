import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdmin } from '../../../../lib/auth/verifyAuth';
import { adminRateLimit } from '../../../../lib/middleware/rateLimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await requireAdmin(request);
    console.log('Admin product creation request from:', authenticatedRequest.user?.email);

    // Apply rate limiting
    const rateLimitResult = adminRateLimit(authenticatedRequest.user?.uid || 'anonymous');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      );
    }

    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe configuration is missing' },
        { status: 500 }
      );
    }

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

    console.log('Creating product with data:', { name, description, price, category });

    // Validate required fields
    if (!name || !price || !description) {
      return NextResponse.json(
        { error: 'Name, price, and description are required' },
        { status: 400 }
      );
    }

    // Create product in Stripe
    console.log('Creating Stripe product...');
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

    console.log('Stripe product created:', stripeProduct.id);

    // Create price in Stripe
    console.log('Creating Stripe price...');
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
      currency: 'usd',
    });

    console.log('Stripe price created:', stripePrice.id);

    // The Firebase Stripe extension webhook will automatically sync this to Firebase
    console.log('Product created in Stripe - Firebase sync will happen via webhook');

    return NextResponse.json({
      success: true,
      product: {
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
      },
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('No valid authorization header') || error.message.includes('Invalid authentication token')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY environment variable.' },
          { status: 500 }
        );
      }
      if (error.message.includes('No such product')) {
        return NextResponse.json(
          { error: 'Product creation failed in Stripe' },
          { status: 500 }
        );
      }
      if (error.message.includes('Firebase')) {
        return NextResponse.json(
          { error: 'Firebase configuration error. Please check your Firebase setup.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}` },
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
