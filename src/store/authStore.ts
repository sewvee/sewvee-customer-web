import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';
import { URL_CUSTOMER_LOGIN, URL_CUSTOMER_PORTAL_ORDERS } from '@/lib/env';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (phone: string) => Promise<void>;
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

      login: async (phone: string) => {
        set({ loading: true, error: null });
        try {
          // Step 1: Get a proper JWT from the backend
          const res = await api.post(URL_CUSTOMER_LOGIN, { phone });
          const { token, customer } = res.data.data;

          const user: User = {
            id: customer.id,
            name: customer.name,
            mobile: customer.mobile ?? phone,
            role: 'Customer',
            lastLogin: new Date().toISOString(),
          };

          // Persist token for Axios interceptor
          localStorage.setItem('sewvee_customer_token', token);

          set({ user, token, loading: false, error: null });
        } catch (err: unknown) {
          // Fallback: if backend login endpoint doesn't exist yet,
          // try fetching orders to validate the phone and extract name
          try {
            const ordersRes = await fetch(
              `${URL_CUSTOMER_PORTAL_ORDERS}?phone=${phone}&limit=1`,
            );
            const ordersJson = await ordersRes.json();

            if (ordersJson.success && ordersJson.data?.length > 0) {
              const first = ordersJson.data[0];
              const user: User = {
                id: first.customerId ?? `cust_${Date.now()}`,
                name: first.customerName ?? 'Customer',
                mobile: phone,
                role: 'Customer',
                lastLogin: new Date().toISOString(),
              };
              // Use a temporary token placeholder until backend login is ready
              const tempToken = 'customer_demo_token';
              localStorage.setItem('sewvee_customer_token', tempToken);
              set({ user, token: tempToken, loading: false, error: null });
            } else {
              set({
                loading: false,
                error: 'No orders found for this number. Please contact your boutique.',
              });
            }
          } catch {
            set({
              loading: false,
              error: 'Unable to connect. Please check your internet connection.',
            });
          }
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
