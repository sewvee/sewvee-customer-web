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
    api.get('marketing/banners?platform=WEB')
      .then(res => {
        const data = res.data;
        if (data.banners) setBanners(data.banners);
        else if (Array.isArray(data)) setBanners(data);
      })
      .catch(console.error);
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
        {banners.filter(b => b.type === "STRIP").length > 0 && (
          <div 
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold"
            style={{ 
              backgroundColor: banners.filter(b => b.type === "STRIP")[0].bg_color || '#4F46E5',
              color: banners.filter(b => b.type === "STRIP")[0].text_color || '#FFFFFF'
            }}
          >
            <p className="truncate flex-1 pr-4">{banners.filter(b => b.type === "STRIP")[0].title}</p>
          </div>
        )}

        {/* INLINE BANNERS */}
        {banners.filter(b => b.type === "INLINE").length > 0 && (
          <div className="mt-4 px-5">
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-2">
              {banners.filter(b => b.type === "INLINE").map((banner, idx) => (
                <div key={idx} className="snap-center shrink-0 w-[90%] md:w-[400px] h-[160px] rounded-[16px] overflow-hidden bg-gray-200 relative border border-gray-200 shadow-sm cursor-pointer" onClick={() => banner.cta_action_value && window.open(banner.cta_action_value, '_blank')}>
                  <img src={formatImageUrl(banner.image_url) || banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="px-5 mt-6">
          <h2 className="text-[18px] font-bold text-[#0F172A] font-inter mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/stitching" className="flex flex-col items-center p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-2">
                <Scissors className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <span className="text-[12px] font-bold text-[#0F172A]">Stitching</span>
            </Link>
            <Link href="/shop" className="flex flex-col items-center p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-5 h-5 text-[#D97706]" />
              </div>
              <span className="text-[12px] font-bold text-[#0F172A]">Readymade</span>
            </Link>
            <Link href="/gallery" className="flex flex-col items-center p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-2">
                <Camera className="w-5 h-5 text-[#059669]" />
              </div>
              <span className="text-[12px] font-bold text-[#0F172A]">My Designs</span>
            </Link>
          </div>
        </div>

        {/* FEATURED IN SHOP */}
        {featuredShop.length > 0 && (
          <div className="mt-8 px-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[18px] font-bold text-[#0F172A] font-inter">Featured in Shop</h2>
              <Link href="/shop" className="text-[13px] font-bold text-[#4F46E5] flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-2">
              {featuredShop.map(item => (
                <Link key={item.id} href="/shop" className="snap-start shrink-0 w-[140px] bg-white rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-sm block">
                  <div className="h-[140px] bg-gray-100 relative">
                    {item.image_url ? (
                      <img src={formatImageUrl(item.image_url) || ''} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] font-bold text-[#0F172A] truncate mb-1">{item.name}</p>
                    <p className="text-[13px] font-bold text-[#5B43EE]">₹{item.selling_price || item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS SECTION */}
        <div className="px-5 mt-8">
          <h2 className="text-[18px] font-bold text-[#0F172A] font-inter mb-4">Your Active Orders</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-[3px] border-[#5B43EE] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayedOrders.length > 0 ? (
            <div className="space-y-[10px]">
              {displayedOrders.map((order) => {
                const statusStr = (order.status || '').toUpperCase();
                const isCancelled = statusStr === 'CANCELLED' || String(order.status) === '4';
                const isDelivered = statusStr === 'DELIVERED' || String(order.status) === '5';
                const canCancel = !isCancelled && !isDelivered && (order.source === 'send order request' || order.order_type === 'STITCHING_REQUEST' || order.source === 'ONLINE');
                
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancel={canCancel ? () => setOrderToCancel(order.id.toString()) : undefined}
                  />
                );
              })}
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
