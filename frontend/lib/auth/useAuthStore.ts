import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../client/firebaseConfig';

// Extended user interface that includes role and other custom fields
interface ExtendedUser extends User {
  role?: string;
  fullName?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
}

interface AuthState {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: ExtendedUser | null) => void;
  initializeAuth: () => void;
  fetchUserRole: (uid: string) => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  fetchUserRole: async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || 'customer';
      }
      return 'customer';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'customer';
    }
  },

  initializeAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let extendedUser: ExtendedUser = user as ExtendedUser;
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            extendedUser = {
              ...user,
              role: userData.role || 'customer',
              fullName: userData.fullName || user.displayName,
              preferences: userData.preferences || {
                newsletter: true,
                notifications: true
              }
            } as ExtendedUser;
          } else {
            extendedUser.role = 'customer';
          }
          
          set({ 
            user: extendedUser, 
            loading: false,
            initialized: true 
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          const extendedUser: ExtendedUser = {
            ...user,
            role: 'customer'
          } as ExtendedUser;
          
          set({ 
            user: extendedUser, 
            loading: false,
            initialized: true 
          });
        }
      } else {
        set({ 
          user: null, 
          loading: false,
          initialized: true 
        });
      }
    });
  },

  signup: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null });
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      const userDocRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        fullName: fullName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
        role: 'customer', // Default role
        preferences: {
          newsletter: true,
          notifications: true
        }
      };

      await setDoc(userDocRef, userData);

      // Update the local state with the extended user info
      const extendedUser: ExtendedUser = {
        ...user,
        displayName: fullName,
        role: 'customer',
        fullName: fullName,
        preferences: {
          newsletter: true,
          notifications: true
        }
      } as ExtendedUser;

      set({ 
        user: extendedUser,
        loading: false,
        error: null 
      });

      console.log('User created successfully:', user.uid);
      console.log('User document created in Firestore');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred during signup';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'permission-denied':
          errorMessage = 'Unable to save user data. Please try again or contact support.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      set({ 
        loading: false, 
        error: errorMessage,
        user: null 
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch additional user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let extendedUser: ExtendedUser = user as ExtendedUser;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        extendedUser = {
          ...user,
          role: userData.role || 'customer',
          fullName: userData.fullName || user.displayName,
          preferences: userData.preferences || {
            newsletter: true,
            notifications: true
          }
        } as ExtendedUser;
      } else {
        // If no Firestore document exists, set default role
        extendedUser.role = 'customer';
      }

      set({ 
        user: extendedUser,
        loading: false,
        error: null 
      });

      console.log('User logged in successfully:', user.uid);
      console.log('User role:', extendedUser.role);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred during login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      set({ 
        loading: false, 
        error: errorMessage,
        user: null 
      });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    
    try {
      await signOut(auth);
      set({ 
        user: null,
        loading: false,
        error: null 
      });
      
      console.log('User logged out successfully');
      
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ 
        loading: false, 
        error: 'An error occurred during logout' 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: ExtendedUser | null) => {
    set({ user });
  },
}));