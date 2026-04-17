import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, token: null, isLoading: false,
      setAuth: (user, token) => {
        Cookies.set('nexusai_token', token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        set({ user, token, isLoading: false });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      logout: () => { Cookies.remove('nexusai_token'); set({ user: null, token: null }); },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'nexusai-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);
