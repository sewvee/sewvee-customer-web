import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

export interface Boutique {
  id: number;
  boutique_name: string;
  address: string | null;
  city_name: string | null;
  profile_icon_url: string | null;
}

interface BoutiquesState {
  boutiques: Boutique[];
  selectedBoutiqueId: number | null;
  loading: boolean;
  error: string | null;
  fetchBoutiques: () => Promise<void>;
  setSelectedBoutiqueId: (id: number | null) => void;
}

export const useBoutiquesStore = create<BoutiquesState>()(
  persist(
    (set, get) => ({
      boutiques: [],
      selectedBoutiqueId: null,
      loading: false,
      error: null,

      fetchBoutiques: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get('customer-portal/all-boutiques');
          const data = res.data?.data || res.data;
          const mapped = Array.isArray(data) ? data.map((b: any) => ({ ...b, boutique_name: b.boutique_name || b.name })) : [];
          set({ boutiques: mapped, loading: false });
        } catch (err: any) {
          set({ loading: false, error: err.message || 'Failed to fetch boutiques' });
        }
      },

      setSelectedBoutiqueId: (id: number | null) => set({ selectedBoutiqueId: id }),
    }),
    {
      name: 'sewvee_customer_boutiques',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedBoutiqueId: state.selectedBoutiqueId }),
    }
  )
);
