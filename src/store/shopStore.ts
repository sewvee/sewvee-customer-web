import { create } from 'zustand';

interface ShopState {
  cart: any[];
  addToCart: (product: any) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(c => c.id === product.id);
    if (existing) {
      return { cart: state.cart.map(c => c.id === product.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c) };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  updateQuantity: (productId, delta) => set((state) => {
    const existing = state.cart.find(c => c.id === productId);
    if (!existing) return state;
    const newQty = (existing.quantity || 1) + delta;
    if (newQty <= 0) {
      return { cart: state.cart.filter(c => c.id !== productId) };
    }
    return { cart: state.cart.map(c => c.id === productId ? { ...c, quantity: newQty } : c) };
  }),
  clearCart: () => set({ cart: [] }),
}));
