import { create } from 'zustand';
import { User } from '@/types/api'; // Import our User type

// Define the shape of our store's state and actions
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void; // Action to check auth state on app load
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  token: null,
  user: null,
  isAuthenticated: false,

  // --- Actions ---

  // Action to perform on successful login
  login: (token, user) => {
    // Store the token in localStorage for persistence across browser refreshes
    localStorage.setItem('authToken', token);
    // Update the state
    set({ token, user, isAuthenticated: true });
  },

  // Action to perform on logout
  logout: () => {
    // Remove the token from localStorage
    localStorage.removeItem('authToken');
    // Reset the state to its initial values
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Action to update user info (e.g., after editing a profile)
  setUser: (user) => set({ user }),

  // Action to run when the application first loads
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        // If a token is found, we assume the user is logged in.
        // A full implementation would decode the token to get user info here.
        // For now, we'll just set the token and isAuthenticated status.
        // We'll fetch the user profile separately.
        set({ token, isAuthenticated: true });
      }
    }
  },
}));