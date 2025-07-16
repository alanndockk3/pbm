// lib/profile/useUserAddresses.ts
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

export interface UserAddress {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  type: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Convert Firestore address to checkout format
export const mapFirestoreToCheckout = (address: UserAddress): CheckoutAddress => ({
  firstName: address.firstName,
  lastName: address.lastName,
  phone: address.phone,
  address1: address.addressLine1,
  address2: address.addressLine2 || '',
  city: address.city,
  state: address.state,
  zipCode: address.zipCode,
  country: address.country === 'United States' ? 'US' : address.country,
});

// Convert checkout format back to Firestore format
export const mapCheckoutToFirestore = (address: CheckoutAddress): Partial<UserAddress> => ({
  firstName: address.firstName,
  lastName: address.lastName,
  phone: address.phone,
  addressLine1: address.address1,
  addressLine2: address.address2 || '',
  city: address.city,
  state: address.state,
  zipCode: address.zipCode,
  country: address.country === 'US' ? 'United States' : address.country,
});

export const useUserAddresses = (userId: string | null) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      return;
    }

    const fetchAddresses = async () => {
      setLoading(true);
      setError(null);

      try {
        const addressesRef = collection(db, 'users', userId, 'addresses');
        const q = query(addressesRef, orderBy('isDefault', 'desc'), orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const userAddresses: UserAddress[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserAddress[];

        setAddresses(userAddresses);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load saved addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);

  return {
    addresses,
    loading,
    error,
    refetch: () => {
      if (userId) {
        // Re-trigger the effect
        setAddresses([]);
      }
    }
  };
};