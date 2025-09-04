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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      console.error('Firebase token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    
    // Await params to get the session ID
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`Retrieving Stripe session: ${sessionId} for user: ${userId}`);

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent']
    });

    // Verify that the session belongs to the authenticated user
    if (session.metadata?.userId !== userId) {
      console.error(`Session ${sessionId} does not belong to user ${userId}`);
      return NextResponse.json(
        { error: 'Access denied to this session' },
        { status: 403 }
      );
    }

    console.log(`Session retrieved successfully: ${sessionId}`);

    return NextResponse.json(session);
    
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    
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
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
