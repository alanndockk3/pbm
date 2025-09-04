import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Missing',
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Missing',
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Configured' : 'Missing',
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Configured' : 'Missing',
    };

    return NextResponse.json({
      success: true,
      config,
      message: 'Environment variables check complete'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}
