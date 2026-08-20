'use client';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { LogOut, ShoppingBag, ChevronRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const FAQ_DATA = [
  {
    q: 'How do I upload reference design photos?',
    a: "Go to your Home tab, tap on any active order, and look for outfits showing the 'Reference Design Needed' badge. Tap 'Upload Photo' to select neckline, embroidery, or style ideas directly from your device.",
  },
  {
    q: 'How do I use the Gallery and Collage Maker?',
    a: "Use the 'Gallery' tab to create design folders like 'Neck Designs' or 'Bridal Inspiration'. Tap 'Collage Maker' in the gallery header to combine multiple reference images into a single collage for your boutique.",
  },
  {
    q: 'How do I send my measurement sample garments?',
    a: 'You can ship your best-fitting blouse or salwar suit as a measurement sample to the boutique. Contact your boutique directly — their details appear on each order card.',
  },
  {
    q: 'Who can I contact for orders support?',
    a: 'For design revisions, delivery date changes, or pricing questions, open any active order from the Home tab. The boutique contact details are shown directly in the order for quick access.',
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const orders = useOrdersStore((s) => s.orders);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stitchingOrders = orders.filter((o) => o.order_type !== 'SALE_ORDER');
  const readymadeOrders = orders.filter((o) => o.order_type === 'SALE_ORDER');

  const stitchingCompleted = stitchingOrders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s === 'delivered' || s === 'completed';
  }).length;
  const stitchingPending = stitchingOrders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'completed' && s !== 'cancelled';
  }).length;
  
  const readymadeDelivered = readymadeOrders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s === 'delivered';
  }).length;
  const readymadePending = readymadeOrders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'cancelled';
  }).length;

  return (
    <div className="p-4 pt-6 pb-12 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center">My Profile</h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#5B43EE] flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-white uppercase">
            {user?.name?.charAt(0) ?? 'C'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user?.name ?? 'Customer'}</h2>
        <p className="text-gray-500 font-medium mt-1">+91 {user?.mobile}</p>
        <div className="mt-3 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          <span className="text-xs font-bold text-[#5B43EE] uppercase tracking-wide">
            Sewvee Customer
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Custom Stitching</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#5B43EE]">{stitchingOrders.length}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase mt-1">Total</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#5B43EE]">{stitchingPending}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase mt-1">Active</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#5B43EE]">{stitchingCompleted}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase mt-1">Done</p>
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-6">Online Readymade</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#5B43EE]">{readymadeOrders.length}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase mt-1">Total</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#5B43EE]">{readymadePending}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase mt-1">Active</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-bold text-[#5B43EE]">{readymadeDelivered}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase mt-1">Delivered</p>
          </div>
        </div>
      </div>

      <Link href="/orders" className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform">
        <div className="bg-indigo-50 p-2 rounded-xl">
          <ShoppingBag className="w-5 h-5 text-[#5B43EE]" />
        </div>
        <span className="flex-1 font-semibold text-gray-900">My Orders</span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-900">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {FAQ_DATA.map((faq, i) => (
            <div key={i} className="p-4 bg-white">
              <button
                className="w-full flex items-start justify-between text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-sm text-gray-900 pr-4">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-0.5 ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed animate-in slide-in-from-top-2">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button variant="danger" fullWidth onClick={logout} className="mt-4">
        <LogOut className="w-5 h-5" />
        Logout
      </Button>
    </div>
  );
}
