import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';
import { URL_CUSTOMER_LOGIN } from '@/lib/env';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (mobile: string, pin: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (mobile: string, pin: string) => {
        set({ loading: true, error: null });
        try {
          // POST { mobile, pin } matching LoginAppCustomerDto
          const res = await api.post(URL_CUSTOMER_LOGIN, { mobile, pin });
          
          // Depending on if there's a global response interceptor
          const data = res.data.data || res.data;
          const { accessToken, token, customer } = data;
          
          const finalToken = accessToken || token;

          if (!finalToken || !customer) {
            throw new Error('Invalid response from server');
          }

          const user: User = {
            id: customer.id || `cust_${Date.now()}`,
            name: customer.name || 'Customer',
            mobile: customer.mobile ?? mobile,
            role: 'Customer',
            lastLogin: new Date().toISOString(),
          };

          // Persist token for Axios interceptor
          localStorage.setItem('sewvee_customer_token', finalToken);

          set({ user, token: finalToken, loading: false, error: null });
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || 'Invalid mobile number or PIN';
          set({
            loading: false,
            error: typeof message === 'string' ? message : message[0],
          });
        }
      },

      logout: () => {
        localStorage.removeItem('sewvee_customer_token');
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),

      setUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'sewvee_customer_user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
