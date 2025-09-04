import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from 'firebase-admin';
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

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await auth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const requestBody = await request.json();
    
    const {
      line_items,
      shipping_address_collection,
      shipping_options,
      metadata,
      customer_email,
      success_url,
      cancel_url,
      phone_number_collection,
      consent_collection,
      allow_promotion_codes
    } = requestBody;

    // Validate required fields
    if (!line_items || line_items.length === 0) {
      return NextResponse.json(
        { error: 'Line items are required' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session with automatic tax calculation
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      billing_address_collection: 'required',
      
      // Use only shipping_address_collection (removed deprecated collect_shipping_address)
      shipping_address_collection: shipping_address_collection || {
        allowed_countries: ['US']
      },
      
      line_items,
      
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true
      },

      // Add shipping options if provided
      ...(shipping_options && shipping_options.length > 0 && {
        shipping_options
      }),

      // Add promotional codes if enabled
      ...(allow_promotion_codes && { allow_promotion_codes: true }),

      // Add phone number collection if enabled
      ...(phone_number_collection && phone_number_collection.enabled && {
        phone_number_collection
      }),

      // Add consent collection if enabled
      ...(consent_collection && consent_collection.terms_of_service && {
        consent_collection
      }),

      // URLs
      success_url: success_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/checkout/cancelled`,

      // Customer email
      customer_email,

      // Metadata
      metadata: {
        ...metadata,
        userId,
        created_at: new Date().toISOString()
      },

      // Payment method types
      payment_method_types: ['card', 'link'],
    });

    console.log('Stripe checkout session created:', session.id);

    

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      session
    });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: error.type,
          code: error.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
