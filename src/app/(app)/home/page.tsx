'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { OrderCard } from '@/components/order/OrderCard';
import { ShoppingBag, MessageCircle, Store, ChevronDown, Bell, Scissors, Camera, ArrowRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import { BoutiqueDrawer } from '@/components/home/BoutiqueDrawer';
import { BASE_URL, URL_CUSTOMER_PORTAL_SHOP, URL_CUSTOMER_STORE_CATALOGUE } from '@/lib/env';
import api from '@/lib/api';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';
import { useShopStore } from '@/store/shopStore';
import { Button } from '@/components/ui/Button';

const formatImageUrl = (urlStr: string) => {
  if (!urlStr) return null;
  // If it's already an absolute URL (including localhost), return as-is
  // Local uploads (localhost:3021/uploads/...) must be served from the local backend
  if (urlStr.startsWith('http')) return urlStr;
  // Relative path — prepend the API domain
  const apiDomain = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-stage.sewvee.com';
  const cleanUrl = urlStr.startsWith('/') ? urlStr.slice(1) : urlStr;
  return `${apiDomain}/${cleanUrl}`;
};

function SafeImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return <div className="w-full h-full bg-gray-200" />;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
    />
  );
}



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
  
  const handleCta = (e: any) => {
    e.stopPropagation();
    if (activeBanner.cta_action_value) {
      window.open(activeBanner.cta_action_value, '_blank');
    }
  };

  return (
    <div
      style={{ backgroundColor: activeBanner.bg_color || '#4F46E5' }}
      className="w-full flex items-center justify-between px-4 md:px-6 py-2 gap-3 transition-all duration-500 cursor-pointer overflow-hidden"
      onClick={handleCta}
    >
      <div style={{ color: activeBanner.text_color || '#FFFFFF' }} className="flex items-center gap-2 flex-1 min-w-0 text-[12px] font-semibold h-[24px]">
        {strips.length > 1 && (
          <div className="flex gap-1 mr-1 flex-shrink-0 z-10 p-1 rounded">
            {strips.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === i ? 'bg-white opacity-100 scale-110' : 'bg-white opacity-40 hover:opacity-60'}`}
              />
            ))}
          </div>
        )}
        
        {/* Container for text */}
        <div className="flex-1 h-full flex items-center relative overflow-hidden group">
           {activeBanner.is_scrollable ? (
              <div className="absolute whitespace-nowrap animate-[marquee_15s_linear_infinite] group-hover:[animation-play-state:paused]">
                 {activeBanner.title}
                 <span className="inline-block w-10"></span>
                 {activeBanner.title}
              </div>
           ) : (
              <p className="truncate absolute w-full pr-4">{activeBanner.title}</p>
           )}
        </div>
      </div>
      
      {/* Call to Action Button */}
      {activeBanner.cta_label && (
        <button 
           className="bg-white text-black px-3 py-1 rounded-full text-[10px] uppercase font-bold shrink-0 transition-transform hover:scale-105 shadow-sm"
           onClick={handleCta}
           style={{ color: activeBanner.bg_color || '#000' }}
        >
           {activeBanner.cta_label}
        </button>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />

          </div>
  );
}

function InlineBanners({ banners }: { banners: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate banners to create infinite loop illusion, but ONLY if there's more than 1 banner
  const displayBanners = banners.length > 1 ? [...banners, ...banners, ...banners, ...banners] : banners;

  useEffect(() => {
    if (!scrollRef.current || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const el = scrollRef.current;
        const bannerElement = el.children[0] as HTMLElement;
        const scrollDistance = bannerElement ? bannerElement.offsetWidth + 16 : el.clientWidth;
        
        // The width of one complete set of original banners
        const singleSetWidth = scrollDistance * banners.length;
        
        // If we've scrolled past the first set, jump back silently
        if (el.scrollLeft >= singleSetWidth) {
          el.scrollLeft = el.scrollLeft - singleSetWidth;
          // Force reflow
          void el.offsetHeight;
        }

        // Now do the smooth scroll for the next slide
        el.scrollTo({ left: el.scrollLeft + scrollDistance, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="mt-4 px-5 mb-4">
      {/* Removed scroll-smooth class so JS can perform instant jumps */}
      <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar">
        {displayBanners.map((banner, idx) => {
          const imgUrl = banner.image_url || banner.mobile_image_url;
          return (
            <div 
              key={idx} 
              className={`shrink-0 h-[160px] rounded-[16px] overflow-hidden bg-gray-200 relative border border-gray-200 shadow-sm cursor-pointer ${
                banners.length > 1 ? 'snap-center w-[90%] md:w-[400px]' : 'w-full'
              }`}
              onClick={() => banner.cta_action_value && window.open(banner.cta_action_value, '_blank')}
            >
              <SafeImage 
                src={formatImageUrl(imgUrl) || imgUrl} 
                alt={banner.title || 'Banner'} 
                className="w-full h-full object-cover" 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const { orders, loading, cancelOrder, refreshOrders } = useOrdersStore();
  const { boutiques, selectedBoutiqueId, setSelectedBoutiqueId, fetchBoutiques } = useBoutiquesStore();
  const { showToast } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [banners, setBanners] = useState<any[]>([]);
  const [featuredShop, setFeaturedShop] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [dismissedPopup, setDismissedPopup] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<number | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    // Check localStorage for previously dismissed banner and welcome popup
    if (typeof window !== 'undefined') {
      const dismissedId = localStorage.getItem('sewvee_dismissed_popup');
      if (dismissedId) {
        setDismissedBannerId(parseInt(dismissedId, 10));
      }
      
      const seenWelcome = localStorage.getItem('sewvee_welcome_seen');
      if (!seenWelcome) {
        setShowWelcomePopup(true);
      }
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('selectBoutique') === 'true') {
      // If there is a welcome popup, wait for it to close. If not, open immediately.
      if (!showWelcomePopup) {
        setDrawerOpen(true);
        router.replace('/home');
      }
    }
  }, [searchParams, router, showWelcomePopup]);

  useEffect(() => {
    // Automatically open the boutique selection drawer if no boutique is selected,
    // they have boutiques to choose from, and the welcome popup is NOT currently showing.
    if (selectedBoutiqueId === null && boutiques.length > 0 && !showWelcomePopup) {
      // Add a slight delay for a smooth transition after the popup closes
      const timer = setTimeout(() => {
        setDrawerOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedBoutiqueId, boutiques.length, showWelcomePopup]);
  const { addToCart } = useShopStore();
  
  const [cancelling, setCancelling] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchBoutiques();
    if (user?.mobile) refreshOrders(user.mobile);
  }, [user?.mobile, refreshOrders, fetchBoutiques]);

  useEffect(() => {
    api.get('marketing/banners?platform=WEB&target_app=CUSTOMER_APP')
      .then(res => {
        const data = res.data;
        if (data.banners) setBanners(data.banners);
        else if (Array.isArray(data)) setBanners(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        let allItems: any[] = [];
        
        // Fetch Sewvee Originals
        const originalsRes = await fetch(URL_CUSTOMER_STORE_CATALOGUE).then(r => r.json()).catch(() => null);
        if (originalsRes && Array.isArray(originalsRes.products)) {
          allItems = [...allItems, ...originalsRes.products];
        } else if (originalsRes && Array.isArray(originalsRes.data)) {
          allItems = [...allItems, ...originalsRes.data];
        } else if (Array.isArray(originalsRes)) {
          allItems = [...allItems, ...originalsRes];
        }

        // Fetch My Boutiques
        if (selectedBoutiqueId) {
          const boutiqueRes = await fetch(`${URL_CUSTOMER_PORTAL_SHOP}?companyId=${selectedBoutiqueId}&limit=10`).then(r => r.json()).catch(() => null);
          if (boutiqueRes && Array.isArray(boutiqueRes.data)) {
            allItems = [...allItems, ...boutiqueRes.data];
          } else if (Array.isArray(boutiqueRes)) {
            allItems = [...allItems, ...boutiqueRes];
          }
        }

        // Shuffle the combined array
        allItems.sort(() => 0.5 - Math.random());
        
        // Limit to 5
        setFeaturedShop(allItems.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    }
    fetchFeatured();
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

        {/* INLINE BANNERS */}
        <InlineBanners banners={banners.filter(b => b.type === "INLINE")} />

        {/* QUICK ACTIONS */}
        <div className="px-5 mt-6">
          <h2 className="text-[18px] font-bold text-[#0F172A] font-inter mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/stitching" className="flex flex-col items-center p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-2">
                <Scissors className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <span className="text-[13px] font-bold text-[#0F172A]">Stitching</span>
              <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-tight">Online stitching</span>
            </Link>
            <Link href="/shop" className="flex flex-col items-center p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-5 h-5 text-[#D97706]" />
              </div>
              <span className="text-[13px] font-bold text-[#0F172A]">Readymade</span>
              <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-tight">Shop readymades</span>
            </Link>
            <Link href="/gallery" className="flex flex-col items-center p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-2">
                <Camera className="w-5 h-5 text-[#059669]" />
              </div>
              <span className="text-[13px] font-bold text-[#0F172A]">My Designs</span>
              <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-tight">View my designs</span>
            </Link>
          </div>
        </div>

        {/* FEATURED IN SHOP */}
        {featuredShop.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 px-5">
              <h2 className="text-[18px] font-bold text-[#0F172A] font-inter">Featured in Shop</h2>
              <Link href="/shop" className="text-[13px] font-bold text-[#4F46E5] flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 px-5">
              {featuredShop.map(item => (
                <button key={item.id} onClick={() => setSelectedProduct(item)} className="snap-start shrink-0 w-[140px] bg-white rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-left block">
                  <div className="h-[140px] bg-gray-50 relative rounded-t-[16px] overflow-hidden">
                    {item.image_url ? (
                      <SafeImage 
                        src={formatImageUrl(item.image_url.split(',')[0]) || ''} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag className="w-8 h-8" /></div>
                    )}
                  </div>
                  <div className="p-3 pt-2">
                    <p className="text-[12px] font-bold text-[#0F172A] truncate mb-1">{item.name}</p>
                    <p className="text-[13px] font-bold text-[#5B43EE]">₹{item.selling_price || item.price}</p>
                  </div>
                </button>
              ))}

              {/* View All Card */}
              <Link href="/shop" className="snap-start shrink-0 w-[140px] bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center group hover:bg-[#F1F5F9] transition-colors">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <p className="text-[13px] font-bold text-[#0F172A]">View All</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Explore Shop</p>
              </Link>
              <div className="shrink-0 w-5" />
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

      {/* Product Details Modal */}
      <BottomSheet
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || 'Product Details'}
      >
        {selectedProduct && (
          <div className="pb-safe">
            <div className="w-full h-[220px] bg-gray-50 rounded-[16px] mb-5 overflow-hidden relative shadow-sm border border-gray-100">
              {selectedProduct.image_url ? (
                <img src={formatImageUrl(selectedProduct.image_url.split(',')[0]) || undefined} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>
            
            <p className="text-[11px] font-bold text-[#5B43EE] uppercase tracking-wider mb-1.5">
              {selectedProduct.readymade_category?.name || selectedProduct.category_name || 'CATEGORY'}
            </p>
            
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-[18px] font-bold text-[#0F172A] pr-4 leading-tight">{selectedProduct.name}</h2>
              <span className="text-[18px] font-bold text-[#5B43EE] whitespace-nowrap">
                ₹{Number(selectedProduct.selling_price || selectedProduct.price).toFixed(2)}
              </span>
            </div>
            
            <h3 className="text-[14px] font-bold text-[#0F172A] mb-1.5">Description</h3>
            <p className="text-[14px] text-[#64748B] mb-6 leading-relaxed">
              {selectedProduct.description || 'No description available.'}
            </p>
            
            <div className="pt-5 border-t border-gray-100">
              <Button 
                onClick={(e) => { 
                  addToCart(selectedProduct); 
                  showToast(`${selectedProduct.name} added to cart`, 'success');
                  setSelectedProduct(null); 
                }} 
                className="w-full py-4 rounded-xl font-bold text-[15px] bg-[#5B43EE] text-white hover:bg-[#4f39ce]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Welcome Popup Banner */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden relative shadow-2xl flex flex-col items-center">
            <button 
              onClick={() => {
                setShowWelcomePopup(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('sewvee_welcome_seen', 'true');
                }
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div 
              className="w-full cursor-pointer max-h-[70vh] overflow-y-auto no-scrollbar"
              onClick={() => {
                setShowWelcomePopup(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('sewvee_welcome_seen', 'true');
                }
              }}
            >
              <SafeImage src="/welcome_banner.png" alt="Welcome" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Promotional Popup Banner */}
      {banners.find(b => b.type === "POPUP" && b.id !== dismissedBannerId) && !dismissedPopup && !showWelcomePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            {banners.find(b => b.type === "POPUP")?.is_dismissible && (
              <button 
                onClick={() => {
                setDismissedPopup(true);
                const popup = banners.find(b => b.type === "POPUP");
                if (popup && typeof window !== 'undefined') {
                  localStorage.setItem('sewvee_dismissed_popup', popup.id.toString());
                  setDismissedBannerId(popup.id);
                }
              }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
            
            {(() => {
              const popup = banners.find(b => b.type === "POPUP");
              const imgUrl = popup.image_url || popup.mobile_image_url;
              return (
                <div 
                  className="w-full cursor-pointer max-h-[70vh] overflow-y-auto no-scrollbar"
                  onClick={() => {
                    if (popup.cta_action_value) {
                      window.open(popup.cta_action_value.startsWith('http') ? popup.cta_action_value : `https://${popup.cta_action_value}`, '_blank');
                    }
                  }}
                >
                  {imgUrl ? (
                    <SafeImage src={formatImageUrl(imgUrl) || imgUrl} alt={popup.title || 'Promotion'} className="w-full h-auto object-contain bg-gray-100" />
                  ) : (
                    <div className="p-8 text-center bg-gray-50">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{popup.title}</h3>
                      {popup.body && <p className="text-gray-500">{popup.body}</p>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
