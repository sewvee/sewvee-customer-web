import { create } from 'zustand';
import type { Order } from '@/types';
import { URL_CUSTOMER_PORTAL_ORDERS } from '@/lib/env';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchOrders: (phone: string) => Promise<void>;
  refreshOrders: (phone: string) => Promise<void>;
  cancelOrder: (orderId: string, token: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchOrders: async (phone: string) => {
    const { lastFetched, orders } = get();
    // Cache for 60 seconds
    if (lastFetched && orders.length > 0 && Date.now() - lastFetched < 60_000) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        `${URL_CUSTOMER_PORTAL_ORDERS}?phone=${phone}&limit=100`,
      );
      const json = await res.json();
      if (json.success) {
        set({ orders: json.data ?? [], loading: false, lastFetched: Date.now() });
      } else {
        set({ loading: false, error: json.message ?? 'Failed to load orders' });
      }
    } catch {
      set({ loading: false, error: 'Network error. Pull to refresh.' });
    }
  },

  refreshOrders: async (phone: string) => {
    set({ lastFetched: null });
    await get().fetchOrders(phone);
  },

  cancelOrder: async (orderId: string, token: string) => {
    const { URL_ORDER_STATUS } = await import('@/lib/env');
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const res = await fetch(URL_ORDER_STATUS(orderId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedToken,
      },
      body: JSON.stringify({ status_id: 4 }),
    });
    if (!res.ok) throw new Error('Failed to cancel order');
  },
}));
