// lib/stores/useAddressStore.ts
import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../client/firebaseConfig';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AddressFormData = Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;

export const initialAddressForm: AddressFormData = {
  type: 'home',
  isDefault: false,
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  phone: ''
};

interface AddressStore {
  // State
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  editingId: string | null;
  
  // Form state
  addForm: AddressFormData;
  editForms: Record<string, AddressFormData>;
  
  // Actions
  loadAddresses: (userId: string) => Promise<void>;
  addAddress: (userId: string) => Promise<boolean>;
  updateAddress: (userId: string, addressId: string) => Promise<boolean>;
  deleteAddress: (userId: string, addressId: string) => Promise<boolean>;
  setDefaultAddress: (userId: string, addressId: string) => Promise<boolean>;
  
  // Form actions
  setAddForm: (data: Partial<AddressFormData>) => void;
  resetAddForm: () => void;
  setEditForm: (addressId: string, data: Partial<AddressFormData>) => void;
  resetEditForm: (addressId: string) => void;
  startEditing: (address: Address) => void;
  stopEditing: () => void;
  
  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  // Initial state
  addresses: [],
  isLoading: false,
  error: null,
  editingId: null,
  addForm: { ...initialAddressForm },
  editForms: {},

  // Get addresses subcollection reference
  getAddressesRef: (userId: string) => collection(db, 'users', userId, 'addresses'),

  // Load addresses
  loadAddresses: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');
      const snapshot = await getDocs(addressesRef);
      
      const addressList: Address[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Address;
      });
      
      // Sort: default first, then by creation date (newest first)
      addressList.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      set({ addresses: addressList, isLoading: false });
    } catch (error) {
      console.error('Error loading addresses:', error);
      set({ error: 'Failed to load addresses', isLoading: false });
    }
  },

  // Add new address
  addAddress: async (userId: string) => {
    const { addForm, addresses } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');
      
      // If setting as default or first address, update others
      if (addForm.isDefault || addresses.length === 0) {
        const batch = writeBatch(db);
        addresses.forEach(addr => {
          const addrRef = doc(addressesRef, addr.id);
          batch.update(addrRef, { isDefault: false, updatedAt: Timestamp.now() });
        });
        if (addresses.length > 0) {
          await batch.commit();
        }
      }

      // Add new address
      await addDoc(addressesRef, {
        ...addForm,
        isDefault: addForm.isDefault || addresses.length === 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      // Reset form and reload
      set({ addForm: { ...initialAddressForm }, isLoading: false });
      await get().loadAddresses(userId);
      
      return true;
    } catch (error) {
      console.error('Error adding address:', error);
      set({ error: 'Failed to add address', isLoading: false });
      return false;
    }
  },

  // Update existing address
  updateAddress: async (userId: string, addressId: string) => {
    const { editForms, addresses } = get();
    const formData = editForms[addressId];
    
    if (!formData) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');

      // If setting as default, update all other addresses
      if (formData.isDefault) {
        const batch = writeBatch(db);
        addresses.forEach(addr => {
          if (addr.id !== addressId) {
            const addrRef = doc(addressesRef, addr.id);
            batch.update(addrRef, { isDefault: false, updatedAt: Timestamp.now() });
          }
        });
        await batch.commit();
      }

      // Update the specific address
      const addressRef = doc(addressesRef, addressId);
      await updateDoc(addressRef, {
        ...formData,
        updatedAt: Timestamp.now(),
      });
      
      // Clear editing state and reload
      set(state => {
        const { [addressId]: removed, ...restEditForms } = state.editForms;
        return {
          editingId: null,
          editForms: restEditForms,
          isLoading: false
        };
      });
      
      await get().loadAddresses(userId);
      
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      set({ error: 'Failed to update address', isLoading: false });
      return false;
    }
  },

  // Delete address
  deleteAddress: async (userId: string, addressId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');
      await deleteDoc(doc(addressesRef, addressId));
      
      set({ isLoading: false });
      await get().loadAddresses(userId);
      
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      set({ error: 'Failed to delete address', isLoading: false });
      return false;
    }
  },

  // Set address as default
  setDefaultAddress: async (userId: string, addressId: string) => {
    const { addresses } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const addressesRef = collection(db, 'users', userId, 'addresses');
      
      const batch = writeBatch(db);
      addresses.forEach(addr => {
        const addrRef = doc(addressesRef, addr.id);
        batch.update(addrRef, { 
          isDefault: addr.id === addressId,
          updatedAt: Timestamp.now()
        });
      });
      await batch.commit();
      
      set({ isLoading: false });
      await get().loadAddresses(userId);
      
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      set({ error: 'Failed to update default address', isLoading: false });
      return false;
    }
  },

  // Form actions
  setAddForm: (data: Partial<AddressFormData>) => {
    set(state => ({
      addForm: { ...state.addForm, ...data }
    }));
  },

  resetAddForm: () => {
    set({ addForm: { ...initialAddressForm } });
  },

  setEditForm: (addressId: string, data: Partial<AddressFormData>) => {
    set(state => ({
      editForms: {
        ...state.editForms,
        [addressId]: { ...state.editForms[addressId], ...data }
      }
    }));
  },

  resetEditForm: (addressId: string) => {
    set(state => {
      const { [addressId]: removed, ...rest } = state.editForms;
      return { editForms: rest };
    });
  },

  startEditing: (address: Address) => {
    const editForm: AddressFormData = {
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || ''
    };
    
    set(state => ({
      editingId: address.id,
      editForms: { ...state.editForms, [address.id]: editForm }
    }));
  },

  stopEditing: () => {
    set({ editingId: null });
  },

  // Utility actions
  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));