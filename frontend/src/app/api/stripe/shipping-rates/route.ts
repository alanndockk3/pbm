import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe configuration is missing' },
        { status: 500 }
      );
    }

    // List shipping rates from Stripe
    const shippingRates = await stripe.shippingRates.list({
      active: active === 'true' ? true : undefined,
      limit: 100
    });

    // If no shipping rates exist, return empty array
    if (shippingRates.data.length === 0) {
      console.log('No shipping rates found in Stripe');
      return NextResponse.json({
        success: true,
        shippingRates: []
      });
    }

    // Transform the existing shipping rates to match the expected interface
    const transformedRates = shippingRates.data.map(rate => ({
      id: rate.id,
      active: rate.active,
      amount: rate.fixed_amount?.amount || 0,
      currency: rate.fixed_amount?.currency || 'usd',
      displayName: rate.display_name,
      deliveryEstimate: rate.delivery_estimate ? {
        minimum: {
          unit: rate.delivery_estimate.minimum?.unit || 'business_day',
          value: rate.delivery_estimate.minimum?.value || 1
        },
        maximum: {
          unit: rate.delivery_estimate.maximum?.unit || 'business_day',
          value: rate.delivery_estimate.maximum?.value || 7
        }
      } : null,
      type: rate.type,
      taxBehavior: rate.tax_behavior,
      metadata: rate.metadata || {}
    }));

    return NextResponse.json({
      success: true,
      shippingRates: transformedRates
    });

  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
}
