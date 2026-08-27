'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { OrderCard } from '@/components/order/OrderCard';
import { ShoppingBag, MessageCircle, Store, ChevronDown, Bell, Scissors, Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BoutiqueDrawer } from '@/components/home/BoutiqueDrawer';
import { BASE_URL, URL_CUSTOMER_PORTAL_SHOP } from '@/lib/env';
import api from '@/lib/api';

const formatImageUrl = (urlStr: string) => {
  if (!urlStr) return null;
  const rootUrl = BASE_URL.replace('/mobile/', '/');
  let firstUrl = urlStr.split(',')[0].trim();
  if (firstUrl.startsWith('http')) return encodeURI(firstUrl);
  if (firstUrl.startsWith('/')) return encodeURI(rootUrl + firstUrl.substring(1));
  return encodeURI(rootUrl + firstUrl);
};

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { orders, loading, fetchOrders } = useOrdersStore();
  const { boutiques, selectedBoutiqueId, fetchBoutiques, setSelectedBoutiqueId } = useBoutiquesStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredShop, setFeaturedShop] = useState<any[]>([]);

  useEffect(() => {
    if (user?.mobile) fetchOrders(user.mobile);
    fetchBoutiques();
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
      fetch(`${URL_CUSTOMER_PORTAL_SHOP}?companyId=${selectedBoutiqueId}`)
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
    // Default to the most recent order's boutique if none is selected
    if (selectedBoutiqueId === null && orders.length > 0) {
      const recentId = orders[0].boutiqueId || (orders[0] as any).company_id;
      if (recentId) setSelectedBoutiqueId(Number(recentId));
    }
  }, [selectedBoutiqueId, orders, setSelectedBoutiqueId]);

  const selectedBoutique = boutiques.find(b => b.id === selectedBoutiqueId);

  // Filter orders by selected boutique if one is selected
  const displayedOrders = selectedBoutiqueId 
    ? orders.filter(o => Number(o.boutiqueId || (o as any).company_id) === selectedBoutiqueId)
    : orders;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Clean Header with Boutique Selection */}
      <div className="flex items-center px-5 pt-8 pb-4 bg-white border-b border-gray-100">
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
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="w-[44px] h-[44px] bg-[#F8FAFC] rounded-full border border-gray-200 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-gray-500" />
          </Link>
          <Link href="/chat" className="w-[44px] h-[44px] bg-[#F8FAFC] rounded-full border border-gray-200 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
      </div>

      <div className="pb-24">
        {/* BANNERS */}
        {banners.length > 0 && (
          <div className="mt-4 px-5">
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-2">
              {banners.map((banner, idx) => (
                <div key={idx} className="snap-center shrink-0 w-[90%] md:w-[400px] h-[160px] rounded-[16px] overflow-hidden bg-gray-200 relative border border-gray-200">
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
                <div key={item.id} className="snap-start shrink-0 w-[140px] bg-white rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-sm">
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
                </div>
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
              {displayedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
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
    </div>
  );
}
