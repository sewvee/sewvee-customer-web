'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { OrderCard } from '@/components/order/OrderCard';
import { ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { orders, loading, fetchOrders } = useOrdersStore();

  useEffect(() => {
    if (user?.mobile) fetchOrders(user.mobile);
  }, [user?.mobile, fetchOrders]);

  // Calculate pending photos
  const pendingPhotoOrders = orders.filter((o) => {
    if (o.status === 'Cancelled' || o.status === 'Delivered') return false;
    const items = o.outfits ?? o.items ?? [];
    return items.some(
      (outfit) =>
        (outfit.requestedPhotosFromClient === true || String(outfit.requestedPhotosFromClient) === 'true' || outfit.requestedPhotosFromClient === 1 || String(outfit.requestedPhotosFromClient) === '1') &&
        (!outfit.photos || outfit.photos.filter((p: any) => p.category === 'REFERENCE').length === 0)
    );
  });

  return (
    <div className="bg-[#F5F3FF] min-h-screen">
      {/* Welcome Header */}
      <div className="flex justify-between items-center px-5 pt-8 pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#4F46E5] font-inter">
            Hello, {user?.name?.split(' ')[0] || 'Customer'}!
          </h1>
          <p className="text-[14px] text-[#64748B] font-inter mt-1">Check your custom stitching orders</p>
        </div>
        <Link href="/profile" className="w-[44px] h-[44px] bg-[#EEF2FF] rounded-full border border-[#C7D2FE] flex items-center justify-center">
          <User className="w-5 h-5 text-[#4F46E5]" />
        </Link>
      </div>

      <div className="px-5 pb-24">
        {/* ORDERS SECTION */}
        <h2 className="text-[18px] font-bold text-[#0F172A] font-inter mb-4">Your Active Orders</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-[3px] border-[#5B43EE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-[10px]">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                hasPendingPhoto={pendingPhotoOrders.some((p) => p.id === order.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[16px] px-6 py-10 flex flex-col items-center justify-center border border-[#F1F5F9] shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-4">
            <div className="w-[100px] h-[100px] mb-4">
              {/* Simulate emptyImage from mobile app */}
              <div className="w-full h-full bg-[#E0E7FF] rounded-full flex items-center justify-center">
                 <ShoppingBag className="w-10 h-10 text-[#4338CA]" />
              </div>
            </div>
            <p className="text-[18px] text-[#0F172A] font-bold mb-2 font-inter">No Active Orders</p>
            <p className="text-[13px] text-[#64748B] text-center leading-[20px] font-inter max-w-[280px]">
              When you place an order with your boutique, tracking updates and styling parameters will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
