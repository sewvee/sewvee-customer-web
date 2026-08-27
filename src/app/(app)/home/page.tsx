'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { OrderCard } from '@/components/order/OrderCard';
import { ShoppingBag, MessageCircle, Store, ChevronDown, Bell, Scissors, Camera, ArrowRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import { BoutiqueDrawer } from '@/components/home/BoutiqueDrawer';
import { BASE_URL, URL_CUSTOMER_PORTAL_SHOP } from '@/lib/env';
import api from '@/lib/api';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';

const formatImageUrl = (urlStr: string) => {
  if (!urlStr) return null;
  if (urlStr.startsWith('http')) return urlStr;
  return `${BASE_URL.replace('/api/v1/', '')}/${urlStr}`;
};


// ─── Strip Banners Component ────────────────────────────────────────────────────────────
function StripBanners({ strips }: { strips: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (strips.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % strips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [strips.length]);

  if (strips.length === 0) return null;
  const activeBanner = strips[currentIndex];

  return (
    <div
      style={{ backgroundColor: activeBanner.bg_color || '#4F46E5' }}
      className="w-full flex items-center justify-between px-4 md:px-6 py-2.5 gap-3 transition-all duration-500 cursor-pointer"
      onClick={() => activeBanner.cta_action_value && window.open(activeBanner.cta_action_value, '_blank')}
    >
      <div style={{ color: activeBanner.text_color || '#FFFFFF' }} className="flex items-center gap-2 flex-1 min-w-0 text-xs overflow-hidden relative font-semibold">
        {strips.length > 1 && (
          <div className="flex gap-1 mr-1 flex-shrink-0 relative z-10 p-1 rounded">
            {strips.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === i ? 'bg-white opacity-100 scale-110' : 'bg-white opacity-40 hover:opacity-60'}`}
              />
            ))}
          </div>
        )}
        <p className="truncate flex-1 pr-4">{activeBanner.title}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const { orders, loading, fetchOrders, cancelOrder, refreshOrders } = useOrdersStore();
  const { boutiques, selectedBoutiqueId, setSelectedBoutiqueId, fetchBoutiques } = useBoutiquesStore();
  const { showToast } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredShop, setFeaturedShop] = useState<any[]>([]);
  
  const [cancelling, setCancelling] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchBoutiques();
    if (user?.mobile) fetchOrders(user.mobile);
  }, [user?.mobile, fetchOrders, fetchBoutiques]);

  useEffect(() => {
    api.get('marketing/banners?platform=WEB&target_app=CUSTOMER_APP')
      .then(res => {
        const data = res.data;
        console.log("BANNERS FETCHED:", data);
        if (data.banners) setBanners(data.banners);
        else if (Array.isArray(data)) setBanners(data);
      })
      .catch(err => {
        console.error("BANNERS FETCH ERROR:", err);
      });
  }, []);

  useEffect(() => {
    if (selectedBoutiqueId) {
      fetch(`${URL_CUSTOMER_PORTAL_SHOP}?companyId=${selectedBoutiqueId}&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setFeaturedShop(data.data.slice(0, 5));
          } else if (Array.isArray(data)) {
            setFeaturedShop(data.slice(0, 5));
          }
        })
        .catch(console.error);
    } else {
      setFeaturedShop([]);
    }
  }, [selectedBoutiqueId]);

  useEffect(() => {
    if (selectedBoutiqueId === null && orders.length > 0) {
      const recentId = orders[0].boutiqueId || (orders[0] as any).company_id;
      if (recentId) setSelectedBoutiqueId(Number(recentId));
    }
  }, [selectedBoutiqueId, orders, setSelectedBoutiqueId]);

  const selectedBoutique = boutiques.find(b => b.id === selectedBoutiqueId);
  const displayedOrders = selectedBoutiqueId 
    ? orders.filter(o => Number(o.boutiqueId || (o as any).company_id) === selectedBoutiqueId)
    : orders;

  const handleCancel = async () => {
    if (!orderToCancel || !token) return;
    setCancelling(true);
    try {
      await cancelOrder(orderToCancel, token);
      showToast('Order cancelled successfully', 'success');
      setOrderToCancel(null);
      if (user?.mobile) refreshOrders(user.mobile);
    } catch {
      showToast('Failed to cancel order. Try again.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Clean Header with Boutique Selection */}
      <div className="flex items-center px-5 py-4 bg-white border-b border-gray-100">
        <button 
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex items-center text-left"
        >
          <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center shrink-0 mr-3">
            <Store className="w-6 h-6 text-[#4F46E5]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">SHOPPING AT</p>
            <div className="flex items-center">
              <h1 className="text-[18px] font-bold text-[#0F172A] font-inter">
                {selectedBoutique ? selectedBoutique.boutique_name : 'All Boutiques'}
              </h1>
              <ChevronDown className="w-4 h-4 ml-1.5 text-gray-500" />
            </div>
          </div>
        </button>
      </div>

      <div className="pb-24">
        
        {/* STRIP BANNER */}
        <StripBanners strips={banners.filter(b => b.type === "STRIP")} />
            </div>
          ) : (
            <div className="bg-white rounded-[16px] px-6 py-10 flex flex-col items-center justify-center border border-[#F1F5F9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-4">
              <div className="w-[100px] h-[100px] mb-4">
                <div className="w-full h-full bg-[#E0E7FF] rounded-full flex items-center justify-center">
                   <ShoppingBag className="w-10 h-10 text-[#4338CA]" />
                </div>
              </div>
              <p className="text-[18px] text-[#0F172A] font-bold mb-2 font-inter">No Active Orders</p>
              <p className="text-[13px] text-[#64748B] text-center leading-[20px] font-inter max-w-[280px]">
                When you place an order with {selectedBoutique ? selectedBoutique.boutique_name : 'a boutique'}, tracking updates and styling parameters will show up here.
              </p>
            </div>
          )}
        </div>
      </div>

      <BoutiqueDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />

      <BottomSheet
        open={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
      >
        <div className="text-center p-2">
          <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-[#EF4444]" />
          </div>
          <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-inter">Cancel Order</h3>
          <p className="text-[15px] text-gray-500 mb-6 font-inter leading-relaxed">
            Are you sure you want to cancel this order request? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button 
              className="flex-1 py-3.5 rounded-xl bg-[#F3F4F6] text-[#4B5563] font-semibold text-[15px] font-inter"
              onClick={() => setOrderToCancel(null)}
            >
              No, Keep it
            </button>
            <button 
              className="flex-1 py-3.5 rounded-xl bg-[#EF4444] text-white font-semibold text-[15px] font-inter"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
