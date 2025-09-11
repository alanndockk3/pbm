import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

    // Get or create Stripe customer for the authenticated user
    const db = getFirestore();
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    
    let stripeCustomerId: string | undefined;
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      stripeCustomerId = userData?.stripeId;
      
      // If user doesn't have a Stripe customer ID, create one
      if (!stripeCustomerId) {
        console.log('Creating new Stripe customer for user:', userId);
        
        const customer = await stripe.customers.create({
          email: decodedToken.email || customer_email,
          name: userData?.fullName || userData?.displayName,
          metadata: {
            firebaseUID: userId,
          },
        });
        
        stripeCustomerId = customer.id;
        
        // Update user document with Stripe customer ID
        await userDocRef.update({
          stripeId: stripeCustomerId,
          stripeLink: `https://dashboard.stripe.com/customers/${stripeCustomerId}`,
          updatedAt: new Date().toISOString(),
        });
        
        console.log('Created Stripe customer:', stripeCustomerId);
      } else {
        console.log('Using existing Stripe customer:', stripeCustomerId);
      }
    } else {
      // User document doesn't exist, create both user doc and Stripe customer
      console.log('User document not found, creating user and Stripe customer');
      
      const customer = await stripe.customers.create({
        email: decodedToken.email || customer_email,
        metadata: {
          firebaseUID: userId,
        },
      });
      
      stripeCustomerId = customer.id;
      
      // Create user document with Stripe info
      await userDocRef.set({
        uid: userId,
        email: decodedToken.email,
        stripeId: stripeCustomerId,
        stripeLink: `https://dashboard.stripe.com/customers/${stripeCustomerId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      console.log('Created user document and Stripe customer:', stripeCustomerId);
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
      
      // Associate with existing Stripe customer
      customer: stripeCustomerId,
      
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true
      },

      // Enable customer updates to save shipping address for tax calculation
      customer_update: {
        shipping: 'auto'
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

      // Remove customer_email since we're using customer ID
      // customer_email is ignored when customer is provided

      // Metadata
      metadata: {
        ...metadata,
        userId,
        stripeCustomerId,
        created_at: new Date().toISOString()
      },

      // Payment method types
      payment_method_types: ['card', 'link'],
    });

    // console.log('Stripe checkout session created:', session.id);
    // console.log('Associated with Stripe customer:', stripeCustomerId);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      customerId: stripeCustomerId,
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
