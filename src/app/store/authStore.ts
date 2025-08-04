import { create } from 'zustand';
import { User } from '../../types/api';
import { getMe } from '../../services/userService'; // We will create this service next

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => Promise<void>; // Make initialize async
}

// This is a helper to avoid errors during Server-Side Rendering (SSR)
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  token: getToken(),
  user: null,
  isAuthenticated: !!getToken(), // Set initial auth status based on token presence

  // --- Actions ---

  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  initialize: async () => {
    const token = getToken();
    if (token) {
      // If a token exists, we are optimistically authenticated.
      // Now, let's verify the token and fetch the user profile.
      try {
        const userProfile = await getMe();
        // If successful, update the user object in the store
        set({ user: userProfile, isAuthenticated: true });
      } catch (error) {
        // If getMe fails, the token is invalid or expired.
        console.error("Session token is invalid, logging out.", error);
        // Call the logout action from within the store to clean up.
        get().logout();
      }
    } else {
      // Ensure state is clean if no token is found
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));