import { create } from 'zustand';
import api from '@/lib/api';

interface ChatStore {
  threads: any[];
  unreadCount: number;
  loading: boolean;
  fetchThreads: (phone: string) => Promise<void>;
  markAsRead: (orderId: number) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: [],
  unreadCount: 0,
  loading: false,
  fetchThreads: async (phone: string) => {
    set({ loading: true });
    try {
      const res = await api.get('/customer-portal/chat/threads', { params: { phone } });
      const data = res.data?.data || res.data || [];
      const threads = Array.isArray(data) ? data : [];
      const unreadCount = threads.reduce((acc: number, t: any) => acc + (t.unread_count || 0), 0);
      set({ threads, unreadCount, loading: false });
    } catch (error) {
      console.error('Failed to fetch threads:', error);
      set({ loading: false });
    }
  },
  markAsRead: (orderId: number) => {
    set(state => {
      const newThreads = state.threads.map(t => 
        t.order_id === orderId ? { ...t, unread_count: 0 } : t
      );
      const unreadCount = newThreads.reduce((acc: number, t: any) => acc + (t.unread_count || 0), 0);
      return { threads: newThreads, unreadCount };
    });
  }
}));
