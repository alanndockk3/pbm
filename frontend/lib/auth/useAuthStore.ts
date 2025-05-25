import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../client/firebaseConfig';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initializeAuth: () => {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      set({ 
        user, 
        loading: false,
        initialized: true 
      });
    });
  },

  signup: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null });
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: fullName,
      });

      // Save user information to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        fullName: fullName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
        // Add any additional user fields you want to store
        role: 'customer', // Default role
        preferences: {
          newsletter: true,
          notifications: true
        }
      });

      // Update the local state with the user info
      set({ 
        user: {
          ...user,
          displayName: fullName
        } as User,
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

      set({ 
        user,
        loading: false,
        error: null 
      });

      console.log('User logged in successfully:', user.uid);
      
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

  setUser: (user: User | null) => {
    set({ user });
  },
}));