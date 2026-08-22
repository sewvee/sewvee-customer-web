'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { URL_CUSTOMER_PORTAL_SHOP, URL_CUSTOMER_PORTAL_ORDERS } from '@/lib/env';
import { ShoppingBag, MapPin, Store, ChevronDown } from 'lucide-react';
import type { Product, Boutique } from '@/types';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';

export default function ShopPage() {
  const { user, token } = useAuthStore();
  const { orders } = useOrdersStore();
  const { showToast } = useToast();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isBoutiqueModalOpen, setBoutiqueModalOpen] = useState(false);

  // Extract boutiques from past orders
  useEffect(() => {
    const bMap = new Map<string, Boutique>();
    orders.forEach((o) => {
      if (o.boutiqueId && o.boutiqueName) {
        bMap.set(o.boutiqueId, {
          id: o.boutiqueId,
          name: o.boutiqueName,
          phone: o.companyPhone,
          address: o.companyAddress,
        });
      }
    });
    const bList = Array.from(bMap.values());
    setBoutiques(bList);
    if (bList.length > 0 && !selectedBoutique) {
      setSelectedBoutique(bList[0]);
    }
  }, [orders, selectedBoutique]);

  useEffect(() => {
    if (selectedBoutique) {
      fetchProducts(selectedBoutique.id);
    }
  }, [selectedBoutique]);

  const fetchProducts = async (companyId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${URL_CUSTOMER_PORTAL_SHOP}?companyId=${companyId}`);
      const json = await res.json();
      if (json.success) setProducts(json.data ?? []);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setBoutiqueModalOpen(true)}
          className="flex items-center gap-2 max-w-[80%]"
        >
          <div className="bg-indigo-50 p-2 rounded-full">
            <Store className="w-5 h-5 text-[#5B43EE]" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shopping At</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-gray-900 truncate">
                {selectedBoutique?.name ?? 'Select Boutique'}
              </p>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-[#5B43EE] border-t-transparent animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-900">No products available</p>
            <p className="text-gray-500 mt-1">This boutique hasn't added any readymades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-[20px] overflow-hidden border border-[#F1F5F9] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="h-[160px] bg-[#F8FAFC] relative">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-[#94A3B8] font-medium uppercase font-inter">{p.category || 'Readymade'}</p>
                  <h3 className="text-[14px] font-bold text-[#0F172A] line-clamp-1 font-inter">{p.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[14px] text-[#5B43EE] font-bold font-inter">₹{p.price}</p>
                    <button className="bg-[#F5F3FF] py-1.5 px-3 rounded-[16px] border border-[#EDE9FE]">
                      <span className="text-[11px] text-[#5B43EE] font-bold font-inter">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet
        open={isBoutiqueModalOpen}
        onClose={() => setBoutiqueModalOpen(false)}
        title="Select Boutique"
      >
        <div className="space-y-3">
          {boutiques.map((b) => (
            <button
              key={b.id}
              onClick={() => { setSelectedBoutique(b); setBoutiqueModalOpen(false); }}
              className={`w-full flex items-center p-4 rounded-2xl border mb-3 ${selectedBoutique?.id === b.id ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}
            >
              <Store className={`w-5 h-5 mr-3 ${selectedBoutique?.id === b.id ? 'text-[#5B43EE]' : 'text-[#94A3B8]'}`} />
              <p className={`flex-1 text-left text-[15px] font-inter ${selectedBoutique?.id === b.id ? 'text-[#5B43EE] font-bold' : 'text-[#0F172A] font-semibold'}`}>
                {b.name}
              </p>
              {selectedBoutique?.id === b.id && (
                <div className="w-5 h-5 rounded-full bg-[#5B43EE] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </button>
          ))}
          {boutiques.length === 0 && (
            <p className="text-center text-gray-500 py-4">No boutiques found in your order history.</p>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
