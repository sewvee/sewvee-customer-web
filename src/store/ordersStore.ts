import { create } from 'zustand';
import type { Order } from '@/types';
import { URL_CUSTOMER_PORTAL_ORDERS } from '@/lib/env';

// How long to consider order data "fresh" — kept short (10s) so that
// admin-side changes (new outfits, edits, cancellations) are immediately
// visible when the customer navigates between pages. This prevents the
// "stale cache" problem where outfit tabs are missing after admin adds one.
const CACHE_TTL_MS = 10_000; // 10 seconds

// Deduplicate in-flight fetches — if a fetch is already in progress, don't
// fire another one. This prevents double-fetching when multiple components
// mount at the same time (e.g. home page + navbar both reading orders).
let inflight: Promise<void> | null = null;

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchOrders: (phone: string) => Promise<void>;
  refreshOrders: (phone: string) => Promise<void>;
  invalidate: () => void;
  cancelOrder: (orderId: string, token: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  lastFetched: null,

  /**
   * Fetch orders, using the short TTL cache to deduplicate rapid sequential
   * calls (e.g. component mounts). Always fetches if cache is expired.
   */
  fetchOrders: async (phone: string) => {
    const { lastFetched, orders } = get();
    if (lastFetched && orders.length > 0 && Date.now() - lastFetched < CACHE_TTL_MS) return;

    // Deduplicate concurrent fetches
    if (inflight) return inflight;

    set({ loading: true, error: null });
    inflight = (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sewvee_customer_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const res = await fetch(
          `${URL_CUSTOMER_PORTAL_ORDERS}?phone=${phone}&limit=100`,
          { headers },
        );
        const json = await res.json();
        if (json.success) {
          set({ orders: json.data ?? [], loading: false, lastFetched: Date.now() });
        } else {
          set({ loading: false, error: json.message ?? 'Failed to load orders' });
        }
      } catch {
        set({ loading: false, error: 'Network error. Pull to refresh.' });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },

  /**
   * Force a fresh fetch ignoring the cache. Call this after any mutation
   * (add outfit, cancel order, upload photo) to keep all views in sync.
   */
  refreshOrders: async (phone: string) => {
    set({ lastFetched: null });
    inflight = null; // cancel dedup so the fresh fetch goes through
    await get().fetchOrders(phone);
  },

  /**
   * Invalidate the cache without fetching (useful when the component will
   * call fetchOrders itself on next mount).
   */
  invalidate: () => {
    set({ lastFetched: null });
    inflight = null;
  },

  cancelOrder: async (orderId: string, token: string) => {
    const { URL_CUSTOMER_PORTAL_ORDER_STATUS } = await import('@/lib/env');
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const res = await fetch(URL_CUSTOMER_PORTAL_ORDER_STATUS(orderId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedToken,
      },
      body: JSON.stringify({ status_id: 4 }),
    });
    if (!res.ok) throw new Error('Failed to cancel order');
    // Invalidate so the next page visit always sees fresh data
    get().invalidate();
  },
}));
