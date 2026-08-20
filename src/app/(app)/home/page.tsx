'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { OrderCard } from '@/components/order/OrderCard';
import { Sparkles, ShoppingBag } from 'lucide-react';
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
        outfit.requestedPhotosFromClient &&
        (!outfit.photos || outfit.photos.filter((p) => p.category === 'REFERENCE').length === 0)
    );
  });

  return (
    <div className="p-4 pt-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {user?.name?.split(' ')[0] ?? 'Customer'}!
        </h1>
        <p className="text-gray-500 mt-1">Check your custom stitching orders</p>
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-[#5B43EE] to-[#7C3AED] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10" />
        <h2 className="text-lg font-bold mb-1 relative">New! Shop Readymades</h2>
        <p className="text-sm text-indigo-100 mb-4 relative max-w-[85%]">
          Explore the latest collections from your boutique and order online.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-white text-[#5B43EE] text-sm font-bold px-4 py-2 rounded-xl"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop Now
        </Link>
      </div>

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Active Orders</h2>
          <Link href="/orders" className="text-sm font-semibold text-[#5B43EE]">
            View All
          </Link>
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-[#5B43EE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-bold mb-1">No active orders</p>
            <p className="text-sm text-gray-500">Your recent orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                hasPendingPhoto={pendingPhotoOrders.some((p) => p.id === order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
