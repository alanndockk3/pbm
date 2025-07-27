// Alternative approach - remove apiVersion to use default
// src/app/api/stripe/create-payment-intent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe without specifying apiVersion (uses default)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', customerInfo, orderDetails } = await request.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName: customerInfo?.name || '',
        customerEmail: customerInfo?.email || '',
        orderItems: JSON.stringify(orderDetails?.items || []),
        shippingMethod: orderDetails?.shippingMethod || '',
        subtotal: orderDetails?.subtotal?.toString() || '',
        shipping: orderDetails?.shipping?.toString() || '',
        tax: orderDetails?.tax?.toString() || '',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe Payment Intent API is working',
    timestamp: new Date().toISOString()
  });
}