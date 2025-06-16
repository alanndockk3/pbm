import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../client/firebaseConfig';

// Profile data interface
export interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  profilePicture?: string;
  preferences: {
    newsletter: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  statistics: {
    totalOrders: number;
    wishlistCount: number;
    reviewsGiven: number;
    memberSince: string;
  };
  addresses: Array<{
    id: string;
    type: 'shipping' | 'billing';
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

// Profile store state interface
interface ProfileStore {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<ProfileData>) => Promise<boolean>;
  updatePreferences: (userId: string, preferences: Partial<ProfileData['preferences']>) => Promise<boolean>;
  updateStatistics: (userId: string, stats: Partial<ProfileData['statistics']>) => Promise<boolean>;
  addAddress: (userId: string, address: Omit<ProfileData['addresses'][0], 'id'>) => Promise<boolean>;
  updateAddress: (userId: string, addressId: string, updates: Partial<ProfileData['addresses'][0]>) => Promise<boolean>;
  removeAddress: (userId: string, addressId: string) => Promise<boolean>;
  setDefaultAddress: (userId: string, addressId: string) => Promise<boolean>;
  uploadProfilePicture: (userId: string, file: File) => Promise<boolean>;
  clearProfile: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to clean data for Firestore (removes undefined values)
const cleanDataForFirestore = (data: any): any => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null && !Array.isArray(cleaned[key])) {
      cleaned[key] = cleanDataForFirestore(cleaned[key]);
    }
  });
  return cleaned;
};

// Default profile data
const createDefaultProfile = (email: string, displayName: string): ProfileData => ({
  displayName: displayName || '',
  email: email || '',
  phone: '',
  dateOfBirth: '',
  bio: '',
  // Don't include profilePicture if undefined
  preferences: {
    newsletter: true,
    orderUpdates: true,
    promotions: false,
  },
  statistics: {
    totalOrders: 0,
    wishlistCount: 0,
    reviewsGiven: 0,
    memberSince: new Date().toISOString(),
  },
  addresses: [],
});

// Firebase helper functions - using 'users' collection
const getProfileRef = (userId: string) => doc(db, 'users', userId);
const getAddressesRef = (userId: string) => collection(db, 'users', userId, 'addresses');

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      initializeProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const profileRef = getProfileRef(userId);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            // Load existing profile from Firebase
            const profileData = profileSnap.data() as ProfileData;
            
            // Load addresses separately
            const addressesRef = getAddressesRef(userId);
            const addressesSnap = await getDocs(addressesRef);
            const addresses = addressesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as ProfileData['addresses'];
            
            const completeProfile = {
              ...profileData,
              addresses
            };
            
            set({ profile: completeProfile, isLoading: false });
          } else {
            // Create default profile if none exists
            const defaultProfile = createDefaultProfile('', '');
            
            // Clean data before saving to Firestore
            const cleanedProfile = cleanDataForFirestore({
              ...defaultProfile,
              addresses: undefined // Don't include addresses in main doc
            });
            
            // Save default profile to Firebase
            await setDoc(profileRef, cleanedProfile);
            
            set({ profile: defaultProfile, isLoading: false });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Profile initialization error:', error);
        }
      },

      updateProfile: async (userId: string, updates: Partial<ProfileData>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          const profileRef = getProfileRef(userId);
          
          // Separate addresses from other updates
          const { addresses, ...profileUpdates } = updates;
          
          // Clean data before updating Firestore
          const cleanedUpdates = cleanDataForFirestore(profileUpdates);
          
          // Update main profile document
          await updateDoc(profileRef, cleanedUpdates);
          
          // Merge updates with current profile
          const updatedProfile = {
            ...currentProfile,
            ...updates,
            // Merge nested objects properly
            preferences: updates.preferences 
              ? { ...currentProfile.preferences, ...updates.preferences }
              : currentProfile.preferences,
            statistics: updates.statistics
              ? { ...currentProfile.statistics, ...updates.statistics }
              : currentProfile.statistics,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Profile update error:', error);
          return false;
        }
      },

      updatePreferences: async (userId: string, preferences: Partial<ProfileData['preferences']>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          const profileRef = getProfileRef(userId);
          
          const updatedPreferences = {
            ...currentProfile.preferences,
            ...preferences,
          };

          await updateDoc(profileRef, { preferences: updatedPreferences });

          const updatedProfile = {
            ...currentProfile,
            preferences: updatedPreferences,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Preferences update error:', error);
          return false;
        }
      },

      updateStatistics: async (userId: string, stats: Partial<ProfileData['statistics']>) => {
        try {
          const currentProfile = get().profile;
          if (!currentProfile) return false;

          const profileRef = getProfileRef(userId);
          
          const updatedStatistics = {
            ...currentProfile.statistics,
            ...stats,
          };

          await updateDoc(profileRef, { statistics: updatedStatistics });

          const updatedProfile = {
            ...currentProfile,
            statistics: updatedStatistics,
          };

          set({ profile: updatedProfile });
          return true;
        } catch (error) {
          console.error('Statistics update error:', error);
          return false;
        }
      },

      addAddress: async (userId: string, address: Omit<ProfileData['addresses'][0], 'id'>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          const addressesRef = getAddressesRef(userId);
          
          // If this is the first address or marked as default, handle defaults
          let addressToAdd = { ...address };
          if (currentProfile.addresses.length === 0 || address.isDefault) {
            // If setting as default, update existing addresses to not be default
            if (address.isDefault && currentProfile.addresses.length > 0) {
              const batch = [];
              for (const existingAddr of currentProfile.addresses) {
                if (existingAddr.isDefault) {
                  const existingAddrRef = doc(addressesRef, existingAddr.id);
                  batch.push(updateDoc(existingAddrRef, { isDefault: false }));
                }
              }
              await Promise.all(batch);
            }
            addressToAdd.isDefault = true;
          }

          // Add new address to Firebase
          const docRef = await addDoc(addressesRef, addressToAdd);
          
          const newAddress = {
            id: docRef.id,
            ...addressToAdd,
          };

          // Update local state
          const updatedAddresses = [...currentProfile.addresses, newAddress];
          
          // If setting as default, update other addresses locally
          if (newAddress.isDefault) {
            updatedAddresses.forEach(addr => {
              if (addr.id !== newAddress.id) {
                addr.isDefault = false;
              }
            });
          }

          const updatedProfile = {
            ...currentProfile,
            addresses: updatedAddresses,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add address';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Address add error:', error);
          return false;
        }
      },

      updateAddress: async (userId: string, addressId: string, updates: Partial<ProfileData['addresses'][0]>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          const addressesRef = getAddressesRef(userId);
          const addressRef = doc(addressesRef, addressId);
          
          // If setting as default, update other addresses first
          if (updates.isDefault) {
            const batch = [];
            for (const addr of currentProfile.addresses) {
              if (addr.id !== addressId && addr.isDefault) {
                const otherAddrRef = doc(addressesRef, addr.id);
                batch.push(updateDoc(otherAddrRef, { isDefault: false }));
              }
            }
            if (batch.length > 0) {
              await Promise.all(batch);
            }
          }

          // Update the target address
          await updateDoc(addressRef, updates);

          // Update local state
          const updatedAddresses = currentProfile.addresses.map(addr => {
            if (addr.id === addressId) {
              return { ...addr, ...updates };
            } else if (updates.isDefault) {
              return { ...addr, isDefault: false };
            }
            return addr;
          });

          const updatedProfile = {
            ...currentProfile,
            addresses: updatedAddresses,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update address';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Address update error:', error);
          return false;
        }
      },

      removeAddress: async (userId: string, addressId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          const addressesRef = getAddressesRef(userId);
          const addressRef = doc(addressesRef, addressId);
          
          // Delete from Firebase
          await deleteDoc(addressRef);

          // Update local state
          const addressToRemove = currentProfile.addresses.find(addr => addr.id === addressId);
          const updatedAddresses = currentProfile.addresses.filter(addr => addr.id !== addressId);

          // If we removed the default address, make the first remaining one default
          if (addressToRemove?.isDefault && updatedAddresses.length > 0) {
            updatedAddresses[0].isDefault = true;
            const firstAddrRef = doc(addressesRef, updatedAddresses[0].id);
            await updateDoc(firstAddrRef, { isDefault: true });
          }

          const updatedProfile = {
            ...currentProfile,
            addresses: updatedAddresses,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove address';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Address remove error:', error);
          return false;
        }
      },

      setDefaultAddress: async (userId: string, addressId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          const addressesRef = getAddressesRef(userId);
          
          // Update all addresses in Firebase
          const batch = [];
          for (const addr of currentProfile.addresses) {
            const addrRef = doc(addressesRef, addr.id);
            batch.push(updateDoc(addrRef, { isDefault: addr.id === addressId }));
          }
          
          await Promise.all(batch);

          // Update local state
          const updatedAddresses = currentProfile.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
          }));

          const updatedProfile = {
            ...currentProfile,
            addresses: updatedAddresses,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to set default address';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Set default address error:', error);
          return false;
        }
      },

      uploadProfilePicture: async (userId: string, file: File) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentProfile = get().profile;
          if (!currentProfile) {
            throw new Error('No profile found');
          }

          // Delete old profile picture if it exists
          if (currentProfile.profilePicture) {
            try {
              const oldImageRef = ref(storage, `users/${userId}/profile-picture`);
              await deleteObject(oldImageRef);
            } catch (error) {
              // Old image might not exist, continue
              console.log('Old image not found, continuing...');
            }
          }

          // Upload new profile picture
          const imageRef = ref(storage, `users/${userId}/profile-picture`);
          const uploadResult = await uploadBytes(imageRef, file);
          const downloadURL = await getDownloadURL(uploadResult.ref);

          // Update profile in Firebase
          const profileRef = getProfileRef(userId);
          await updateDoc(profileRef, { profilePicture: downloadURL });

          // Update local state
          const updatedProfile = {
            ...currentProfile,
            profilePicture: downloadURL,
          };

          set({ profile: updatedProfile, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          console.error('Profile picture upload error:', error);
          return false;
        }
      },

      clearProfile: () => {
        set({ profile: null, error: null, isLoading: false });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

// Convenience hooks for specific profile data
export const useProfile = () => useProfileStore(state => state.profile);
export const useProfileLoading = () => useProfileStore(state => state.isLoading);
export const useProfileError = () => useProfileStore(state => state.error);
export const useProfileStatistics = () => useProfileStore(state => state.profile?.statistics);
export const useProfileAddresses = () => useProfileStore(state => state.profile?.addresses || []);
export const useProfilePreferences = () => useProfileStore(state => state.profile?.preferences);