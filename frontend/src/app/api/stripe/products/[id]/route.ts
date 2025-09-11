import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdmin } from '../../../../../lib/auth/verifyAuth';
import { adminRateLimit } from '../../../../../lib/middleware/rateLimit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    // Try to get product from Firebase first (faster)
    const db = getFirestore();
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (productDoc.exists) {
      const productData = productDoc.data();
      return NextResponse.json({
        success: true,
        ...productData
      });
    }
    
    // Fallback to Stripe if not found in Firebase
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price']
    });
    
    return NextResponse.json({
      success: true,
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      images: product.images,
      metadata: product.metadata,
      category: product.metadata?.category || '',
      quantity: parseInt(product.metadata?.quantity || '0'),
      rating: parseFloat(product.metadata?.rating || '0'),
      reviews: parseInt(product.metadata?.reviews || '0'),
      inStock: product.metadata?.inStock !== 'false',
      isFeatured: product.metadata?.isFeatured === 'true',
      price: product.default_price ? (product.default_price as any).unit_amount / 100 : 0,
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await requireAdmin(request);
    console.log('Admin product update request from:', authenticatedRequest.user?.email);

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

    const { id: productId } = await params;
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

    console.log('Updating product with data:', { productId, name, description, price, category });

    // Validate required fields
    if (!name || !price || !description) {
      return NextResponse.json(
        { error: 'Name, price, and description are required' },
        { status: 400 }
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

    try {
      // Update product in Stripe
      console.log('Updating Stripe product...');
      const updatedProduct = await stripe.products.update(productId, {
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

      console.log('Stripe product updated:', updatedProduct.id);

      // Check if price needs to be updated
      const currentPrices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 1,
      });

      const currentPrice = currentPrices.data[0];
      const newPriceAmount = Math.round(parseFloat(price) * 100); // Convert to cents

      if (!currentPrice || currentPrice.unit_amount !== newPriceAmount) {
        console.log('Price change detected:', {
          currentPrice: currentPrice?.unit_amount ? currentPrice.unit_amount / 100 : 'none',
          newPrice: newPriceAmount / 100,
          productId
        });

        // Deactivate old price if it exists
        if (currentPrice) {
          try {
            await stripe.prices.update(currentPrice.id, { active: false });
            console.log('Old price deactivated:', currentPrice.id);
          } catch (priceUpdateError) {
            console.warn('Failed to deactivate old price:', priceUpdateError);
            // Continue with new price creation even if deactivation fails
          }
        }

        // Create new price
        try {
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: newPriceAmount,
            currency: 'usd',
          });

          console.log('New price created:', newPrice.id);
        } catch (priceCreateError) {
          console.error('Failed to create new price:', priceCreateError);
          throw new Error(`Failed to update product price: ${priceCreateError instanceof Error ? priceCreateError.message : 'Unknown error'}`);
        }
      } else {
        console.log('No price change detected, keeping existing price');
      }

      // The Firebase Stripe extension webhook will automatically sync this to Firebase
      console.log('Product updated in Stripe - Firebase sync will happen via webhook');

      return NextResponse.json({
        success: true,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          active: updatedProduct.active,
          images: updatedProduct.images,
          metadata: updatedProduct.metadata,
          category: category || '',
          quantity: parseInt(quantity) || 0,
          rating: parseFloat(rating) || 0,
          reviews: parseInt(reviews) || 0,
          inStock: inStock !== false,
          isFeatured: isFeatured || false,
          price: parseFloat(price),
        },
      });

    } catch (stripeError: any) {
      console.error('Stripe error updating product:', stripeError);
      
      if (stripeError.message?.includes('No such product')) {
        return NextResponse.json(
          { error: 'Product not found in Stripe' },
          { status: 404 }
        );
      }
      
      throw stripeError;
    }

  } catch (error) {
    console.error('Error updating product:', error);
    
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
    }
    
    return NextResponse.json(
      { error: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await requireAdmin(request);
    console.log('Admin product deletion request from:', authenticatedRequest.user?.email);

    const { id: productId } = await params;

    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe configuration is missing' },
        { status: 500 }
      );
    }

    console.log('Deleting product from Stripe:', productId);

    try {
      // First, try to delete the product directly
      await stripe.products.del(productId);
      console.log('Product deleted from Stripe successfully:', productId);
      console.log('Firebase deletion will happen via webhook');
    } catch (deleteError: any) {
      // If deletion fails due to user-created prices, deactivate the product instead
      if (deleteError.message?.includes('user-created prices')) {
        console.log('Product has user-created prices, deactivating instead of deleting');
        
        await stripe.products.update(productId, {
          active: false,
        });
        
        console.log('Product deactivated in Stripe successfully:', productId);
        console.log('Firebase update will happen via webhook');
        
        return NextResponse.json({
          success: true,
          message: 'Product deactivated successfully (cannot delete products with user-created prices)',
          productId: productId,
          action: 'deactivated'
        });
      } else {
        // Re-throw other errors
        throw deleteError;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId,
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    
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
          { error: 'Product not found in Stripe' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
