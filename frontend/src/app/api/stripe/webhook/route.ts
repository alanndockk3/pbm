// Alternative approach - remove apiVersion to use default
// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// You'll get this from your Stripe Dashboard → Webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Only verify webhook signature if we have the secret
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
      console.warn('⚠️ Webhook signature verification skipped (no STRIPE_WEBHOOK_SECRET)');
    }
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment succeeded:', paymentIntent.id);
        
        // Extract metadata
        const metadata = paymentIntent.metadata;
        console.log('📋 Order details:', {
          customer: metadata.customerName,
          email: metadata.customerEmail,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        });
        
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', failedPayment.id);
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        console.log('🚫 Payment canceled:', canceledPayment.id);
        break;

      default:
        console.log(`🔄 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}