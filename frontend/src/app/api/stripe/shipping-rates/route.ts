import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const type = searchParams.get('type');
    
    // Build query parameters for Stripe API
    const listParams: Stripe.ShippingRateListParams = {};
    
    if (active !== null) {
      listParams.active = active === 'true';
    }
    
    if (type) {
      listParams.type = type as 'fixed_amount' | 'percentage';
    }
    
    // Fetch shipping rates from Stripe
    const shippingRates = await stripe.shippingRates.list(listParams);
    
    // Transform the data to be more frontend-friendly
    const transformedRates = shippingRates.data.map(rate => ({
      id: rate.id,
      active: rate.active,
      amount: rate.fixed_amount?.amount ? rate.fixed_amount.amount / 100 : 0, // Convert from cents
      currency: rate.fixed_amount?.currency || 'usd',
      displayName: rate.display_name,
      deliveryEstimate: rate.delivery_estimate ? {
        minimum: {
          unit: rate.delivery_estimate.minimum?.unit,
          value: rate.delivery_estimate.minimum?.value
        },
        maximum: {
          unit: rate.delivery_estimate.maximum?.unit,
          value: rate.delivery_estimate.maximum?.value
        }
      } : null,
      type: rate.type,
      taxBehavior: rate.tax_behavior,
      metadata: rate.metadata
    }));
    
    console.log(`✅ Fetched ${transformedRates.length} shipping rates from Stripe`);
    
    return NextResponse.json({
      success: true,
      shippingRates: transformedRates,
      total: shippingRates.data.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching shipping rates from Stripe:', error);
    
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
      { error: 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to create new shipping rates if needed
    const body = await request.json();
    const { displayName, amount, currency, deliveryEstimate, type, taxBehavior } = body;
    
    // Validate required fields
    if (!displayName || !amount || !currency) {
      return NextResponse.json(
        { error: 'Display name, amount, and currency are required' },
        { status: 400 }
      );
    }
    
    // Create shipping rate in Stripe
    const shippingRate = await stripe.shippingRates.create({
      display_name: displayName,
      type: type || 'fixed_amount',
      fixed_amount: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
      },
      delivery_estimate: deliveryEstimate ? {
        minimum: deliveryEstimate.minimum,
        maximum: deliveryEstimate.maximum
      } : undefined,
      tax_behavior: taxBehavior || 'exclusive',
    });
    
    console.log('✅ Created new shipping rate:', shippingRate.id);
    
    return NextResponse.json({
      success: true,
      shippingRate: {
        id: shippingRate.id,
        displayName: shippingRate.display_name,
        amount: shippingRate.fixed_amount?.amount ? shippingRate.fixed_amount.amount / 100 : 0,
        currency: shippingRate.fixed_amount?.currency,
        active: shippingRate.active
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating shipping rate:', error);
    
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
      { error: 'Failed to create shipping rate' },
      { status: 500 }
    );
  }
}

