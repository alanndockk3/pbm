// utils/adminUtils.js
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../client/firebaseConfig';

/**
 * Utility function to make a user an admin
 * You can run this in the browser console or create a temporary admin page
 */
export const makeUserAdmin = async (userEmail: string) => {
  try {
    // First, you need to find the user by email
    // Since Firestore doesn't allow querying by email directly in this setup,
    // you'll need the user's UID. Here's an alternative approach:
    console.log(`To make ${userEmail} an admin, you need their UID.`);
    console.log('You can find the UID in the Firebase Console under Authentication.');
    console.log('Then call: makeUserAdminByUID(uid)');
  } catch (error) {
    console.error('Error making user admin:', error);
  }
};

/**
 * Make a user admin by their UID
 */
export const makeUserAdminByUID = async (uid: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    
    // Check if user document exists
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    // Update the user's role to admin
    await updateDoc(userDocRef, {
      role: 'admin',
      updatedAt: new Date()
    });
    
    console.log(`User ${uid} has been made an admin`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

/**
 * Remove admin role from a user
 */
export const removeAdminRole = async (uid: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    
    await updateDoc(userDocRef, {
      role: 'customer',
      updatedAt: new Date()
    });
    
    console.log(`Admin role removed from user ${uid}`);
    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
};

/**
 * Check if a user is admin
 */
export const isUserAdmin = async (uid: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Console helper functions
if (typeof window !== 'undefined') {
  // Make functions available in browser console for development
  (window as any).makeUserAdminByUID = makeUserAdminByUID;
  (window as any).removeAdminRole = removeAdminRole;
  (window as any).isUserAdmin = isUserAdmin;
}