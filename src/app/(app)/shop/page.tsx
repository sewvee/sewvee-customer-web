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
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</h3>
                <p className="text-[#5B43EE] font-bold mt-1">₹{p.price}</p>
                <Button size="sm" fullWidth className="mt-3">Add to Cart</Button>
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
              className={`w-full text-left p-4 rounded-xl border ${selectedBoutique?.id === b.id ? 'border-[#5B43EE] bg-indigo-50' : 'border-gray-200 bg-white'}`}
            >
              <p className="font-bold text-gray-900">{b.name}</p>
              {b.address && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{b.address}</p>}
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
