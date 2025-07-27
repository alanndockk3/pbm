// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasStripePublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    message: 'POST request received',
    receivedData: body,
    timestamp: new Date().toISOString(),
  });
}