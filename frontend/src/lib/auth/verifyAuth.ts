import { NextRequest } from 'next/server';
import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  // Check if required environment variables are present
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Firebase Admin SDK environment variables are missing');
    console.error('Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to your .env.local file');
    throw new Error('Firebase Admin SDK configuration missing');
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email: string;
    role?: string;
  };
}

export async function verifyAuth(request: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await auth().verifyIdToken(token);
    
    // Add user info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'user',
    };
    
    return authenticatedRequest;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedRequest> {
  const authenticatedRequest = await verifyAuth(request);
  
  // Check if user has admin role in Firestore
  if (!authenticatedRequest.user?.uid) {
    throw new Error('User ID not found');
  }
  
  const db = getFirestore();
  const userDoc = await db.collection('users').doc(authenticatedRequest.user.uid).get();
  
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  console.log('Admin access granted to:', authenticatedRequest.user?.email);
  return authenticatedRequest;
}
