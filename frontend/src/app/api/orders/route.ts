import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    
    // Query orders from Firebase using Admin SDK
    const db = getFirestore();
    const ordersRef = db.collection('users').doc(userId).collection('orders');
    const querySnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
