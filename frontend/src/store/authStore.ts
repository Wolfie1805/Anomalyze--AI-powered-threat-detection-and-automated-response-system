import { create } from 'zustand';
import { User, LoginCredentials } from '../types';
import { login, logout, fetchCurrentUser } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  logoutUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  loginUser: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const data = await login(credentials);
      localStorage.setItem('anomalyze_token', data.access_token);
      const user = await fetchCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Login failed', isLoading: false });
      throw err;
    }
  },

  logoutUser: async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('anomalyze_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('anomalyze_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false, user: null });
      return;
    }
    try {
      set({ isLoading: true });
      const user = await fetchCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('anomalyze_token');
      set({ isAuthenticated: false, isLoading: false, user: null });
    }
  }
}));