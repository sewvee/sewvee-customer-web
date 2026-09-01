'use client';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { LogOut, ChevronRight, Package, ShoppingBag, Settings, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { orders } = useOrdersStore();

  const initials = (user?.name || 'C').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const allOrders = orders || [];
  const totalStitching = allOrders.filter((o) => o.order_type !== 'SALE_ORDER').length;
  const totalReadymade = allOrders.filter((o) => o.order_type === 'SALE_ORDER').length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* Header — matches Shop / Orders / Chats */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-20 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="px-4 pt-5 space-y-3">
        {/* Avatar + Info + Stats Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="w-[58px] h-[58px] rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0">
              <span className="text-[22px] font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-gray-900 truncate">{user?.name || 'Customer'}</p>
              <p className="text-[13px] text-gray-400 mt-0.5">{user?.mobile || ''}</p>
              <span className="inline-block mt-1.5 bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Sewvee Customer
              </span>
            </div>
            <Link href="/profile/settings" className="p-2 bg-gray-50 rounded-full">
              <Settings className="w-5 h-5 text-gray-500" />
            </Link>
          </div>

          <div className="h-px bg-gray-100 mx-5" />

          {/* Stats Row */}
          <div className="flex items-stretch divide-x divide-gray-100 px-2 py-4">
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[22px] font-bold text-[#4F46E5]">{allOrders.length}</span>
              <span className="text-[11px] text-gray-400 font-medium">Total</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[22px] font-bold text-[#F59E0B]">{totalStitching}</span>
              <span className="text-[11px] text-gray-400 font-medium">Stitching</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[22px] font-bold text-[#10B981]">{totalReadymade}</span>
              <span className="text-[11px] text-gray-400 font-medium">Readymade</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Link href="/orders" className="flex items-center px-5 py-4 active:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center mr-4 shrink-0">
              <Package className="w-4 h-4 text-[#5B43EE]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-900">My Orders</p>
              <p className="text-[12px] text-gray-400 mt-0.5">View all your orders</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <div className="h-px bg-gray-100 mx-5" />

          <Link href="/shop" className="flex items-center px-5 py-4 active:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center mr-4 shrink-0">
              <ShoppingBag className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-900">Shop Readymades</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Browse & order from boutiques</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <div className="h-px bg-gray-100 mx-5" />

          <Link href="/chat" className="flex items-center px-5 py-4 active:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center mr-4 shrink-0">
              <MessageCircle className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-900">Chats</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Message your boutique</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
          <div className="h-px bg-gray-100 mx-5" />

          <Link href="/profile/settings" className="flex items-center px-5 py-4 active:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center mr-4 shrink-0">
              <Settings className="w-4 h-4 text-[#7C3AED]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-900">Account Settings</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Name, email, phone & PIN</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => logout()}
          className="w-full flex justify-center items-center gap-2 h-12 rounded-2xl border border-red-200 bg-red-50 active:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span className="text-[14px] font-semibold text-red-500">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

