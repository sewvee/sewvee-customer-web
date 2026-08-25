'use client';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { orders } = useOrdersStore();

  const initials = (user?.name || 'C').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const allOrders = orders || [];
  const totalCompleted = allOrders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s === 'delivered' || s === 'completed';
  }).length;

  const totalActive = allOrders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'completed' && s !== 'cancelled';
  }).length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen px-4 pt-6 pb-24">
      {/* Combined Profile + Stats Card */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] flex flex-col items-center pt-6 pb-5 px-4 mb-3">
        {/* Avatar & Info */}
        <div className="w-[60px] h-[60px] rounded-full bg-[#7C3AED] flex items-center justify-center mb-2.5">
          <span className="text-[20px] font-bold text-white font-inter">{initials}</span>
        </div>
        <h2 className="text-[17px] font-bold text-[#0F172A] font-inter mb-1">
          {user?.name || 'Customer'}
        </h2>
        <p className="text-[13px] text-[#94A3B8] font-inter mb-2.5">
          {user?.mobile || 'No phone'}
        </p>
        <div className="bg-[#F0F4FF] px-3 py-1 rounded-[20px] border border-[#E0E7FF] mb-4.5">
          <span className="text-[11px] font-semibold text-[#4F46E5] font-inter">
            Sewvee Customer
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#F1F5F9] mb-4" />

        {/* All Orders Stats */}
        <h3 className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.6px] font-inter self-start mb-3.5">
          My Orders
        </h3>
        <div className="flex items-center w-full">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[22px] font-bold text-[#4F46E5] font-inter">{allOrders.length}</span>
            <span className="text-[11px] text-[#94A3B8] font-inter mt-0.5">Total</span>
          </div>
          <div className="w-[1px] h-8 bg-[#E2E8F0]" />
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[22px] font-bold text-[#F59E0B] font-inter">{totalActive}</span>
            <span className="text-[11px] text-[#94A3B8] font-inter mt-0.5">Active</span>
          </div>
          <div className="w-[1px] h-8 bg-[#E2E8F0]" />
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[22px] font-bold text-[#10B981] font-inter">{totalCompleted}</span>
            <span className="text-[11px] text-[#94A3B8] font-inter mt-0.5">Done</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-[14px] border border-[#E2E8F0] mb-5 overflow-hidden">
        <Link href="/profile/settings" className="flex items-center px-4 py-3.5 active:bg-gray-50">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0F172A] font-inter mb-0.5">My Profile</p>
            <p className="text-[12px] text-[#94A3B8] font-inter">Name, email, phone & PIN settings</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        </Link>
        <div className="h-[1px] bg-[#F1F5F9] mx-4" />

        <Link href="/orders" className="flex items-center px-4 py-3.5 active:bg-gray-50">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0F172A] font-inter mb-0.5">My Orders</p>
            <p className="text-[12px] text-[#94A3B8] font-inter">View all your online orders</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        </Link>
        <div className="h-[1px] bg-[#F1F5F9] mx-4" />
        <Link href="/shop" className="flex items-center px-4 py-3.5 active:bg-gray-50">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0F172A] font-inter mb-0.5">Shop Readymades</p>
            <p className="text-[12px] text-[#94A3B8] font-inter">Browse & order from boutiques</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        </Link>
      </div>

      {/* Sign Out */}
      <button 
        onClick={() => logout()}
        className="w-full flex justify-center items-center h-[46px] rounded-[12px] border border-[#FCA5A5] bg-[#FFF5F5] active:bg-[#FEE2E2]"
      >
        <LogOut className="w-4 h-4 text-[#EF4444] mr-1.5" />
        <span className="text-[14px] font-semibold text-[#EF4444] font-inter">Sign Out</span>
      </button>
    </div>
  );
}
