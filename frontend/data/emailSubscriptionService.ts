import { db } from '../client/firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  return db && typeof db !== 'undefined';
};

export interface EmailSubscription {
  id?: string;
  email: string;
  subscribedAt: any; // Firestore timestamp
  source: string; // e.g., 'coming-soon-modal'
  status: 'active' | 'unsubscribed';
}

const COLLECTION_NAME = 'emailSubscriptions';

/**
 * Add a new email subscription to Firestore
 */
export const addEmailSubscription = async (email: string, source: string = 'coming-soon-modal'): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      console.error('Firebase is not initialized');
      return {
        success: false,
        message: 'Service is not available. Please try again later.'
      };
    }

    // Validate email
    if (!email || !email.trim()) {
      return {
        success: false,
        message: 'Please enter a valid email address.'
      };
    }

    // Check if email already exists
    const existingQuery = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email.toLowerCase().trim()),
      where('status', '==', 'active')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      return {
        success: false,
        message: 'This email is already subscribed to our notifications.'
      };
    }

    // Add new subscription
    const subscriptionData: Omit<EmailSubscription, 'id'> = {
      email: email.toLowerCase().trim(),
      subscribedAt: serverTimestamp(),
      source,
      status: 'active'
    };

    await addDoc(collection(db, COLLECTION_NAME), subscriptionData);

    return {
      success: true,
      message: 'Successfully subscribed to notifications!'
    };
  } catch (error) {
    console.error('Error adding email subscription:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return {
          success: false,
          message: 'Permission denied. Please contact support.'
        };
      } else if (error.message.includes('network')) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.'
        };
      }
    }
    
    return {
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    };
  }
};

/**
 * Get all active email subscriptions
 */
export const getActiveSubscriptions = async (): Promise<EmailSubscription[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EmailSubscription[];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

/**
 * Check if an email is already subscribed
 */
export const isEmailSubscribed = async (email: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email.toLowerCase().trim()),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
