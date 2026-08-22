'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { OrderCard } from '@/components/order/OrderCard';
import { ShoppingBag, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { orders, loading, refreshOrders, cancelOrder } = useOrdersStore();
  const { showToast } = useToast();
  
  const [cancelling, setCancelling] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (user?.mobile) refreshOrders(user.mobile);
  }, [user?.mobile, refreshOrders]);

  const requestedOrders = orders.filter((o) => {
    const orderMobile = (o.customerMobile ?? o.customer?.whatsappNumber ?? o.customer?.mobile ?? '').replace(/[^0-9]/g, '').slice(-10);
    const targetMobile = user?.mobile.replace(/[^0-9]/g, '').slice(-10);
    return orderMobile === targetMobile && (o.order_type === 'SALE_ORDER' || o.source === 'send order request');
  });

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
    <div className="min-h-screen bg-[#F5F3FF] pb-20">
      <div className="flex items-center justify-between px-4 h-14 bg-[#F5F3FF] border-b border-[#E2E8F0]">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-start">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-[18px] font-bold text-gray-900 font-inter">My Orders (Online)</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 pb-10">
        {loading && requestedOrders.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-[#5B43EE] animate-spin" />
          </div>
        ) : requestedOrders.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-6 mt-10">
            <ShoppingBag className="w-12 h-12 text-[#CBD5E1] mb-4" />
            <p className="text-[18px] font-bold text-gray-900 mb-2 font-inter">No Orders Yet</p>
            <p className="text-[14px] font-medium text-gray-500 text-center font-inter">
              Your online readymade orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requestedOrders.map((item) => {
              const statusStr = (item.status || '').toUpperCase();
              const isCancelled = statusStr === 'CANCELLED' || String(item.status) === '4';
              const isDelivered = statusStr === 'DELIVERED' || String(item.status) === '5';
              const isProcessing = statusStr === 'IN_PROGRESS' || statusStr === 'PROCESSING' || String(item.status) === '2';
              
              let displayStatus = 'Pending';
              let badgeColor = 'bg-[#FEF3C7]';
              let textColor = 'text-[#D97706]';
              
              if (isCancelled) {
                displayStatus = 'Cancelled';
                badgeColor = 'bg-[#FEE2E2]';
                textColor = 'text-[#EF4444]';
              } else if (isDelivered) {
                displayStatus = 'Delivered';
                badgeColor = 'bg-[#DCFCE7]';
                textColor = 'text-[#22C55E]';
              } else if (isProcessing) {
                displayStatus = 'Processing';
                badgeColor = 'bg-[#DBEAFE]';
                textColor = 'text-[#2563EB]';
              }

              const canCancel = !isCancelled && !isDelivered;

              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#E2E8F0]">
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-[#F1F5F9]">
                    <div>
                      <p className="text-[15px] font-bold text-gray-900 mb-1 font-inter">{item.boutiqueName || 'Boutique'}</p>
                      <div className="flex items-center mt-1">
                        <span className="font-medium text-[13px] text-[#5B43EE] font-inter">
                          {item.billNo || item.order_number || (item.order_type === 'SALE_ORDER' ? `INV-${item.id}` : `ORD-${item.id}`)}
                        </span>
                        <span className="font-medium text-[13px] text-[#94A3B8] mx-1.5 font-inter">|</span>
                        <span className="font-medium text-[12px] text-gray-500 font-inter">
                          {new Date(item.date || item.createdAt || new Date()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`${badgeColor} px-2.5 py-1 rounded-xl`}>
                      <span className={`text-[12px] font-bold ${textColor} font-inter`}>{displayStatus}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    {(item.items || []).map((itm: any, idx: number) => (
                      <div key={`item-${idx}`} className="flex items-center mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-gray-500 mr-2" />
                        <span className="flex-1 text-[13px] font-medium text-gray-900 font-inter">
                          {itm.name || 'Ready-Made Item'}{itm.qty && itm.qty > 1 ? ` (x${itm.qty})` : ''}
                        </span>
                      </div>
                    ))}
                    {(item.outfits || []).map((outfit: any, idx: number) => (
                      <div key={`outfit-${idx}`} className="flex items-center mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-gray-500 mr-2" />
                        <span className="flex-1 text-[13px] font-medium text-gray-900 font-inter">
                          {outfit.name || 'Ready-Made Item'}{outfit.quantity && outfit.quantity > 1 ? ` (x${outfit.quantity})` : ''}
                        </span>
                        <span className="text-[13px] font-semibold text-gray-900 font-inter">
                          ₹{outfit.totalAmount || outfit.price || 0}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#F1F5F9]">
                    <span className="text-[15px] font-bold text-gray-900 font-inter">
                      Total: ₹{item.totalAmount || item.total_amount || 0}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => setOrderToCancel(item.id)}
                        disabled={cancelling}
                        className={`flex items-center bg-[#FEF2F2] px-3 py-1.5 rounded-lg border border-[#FECACA] ${cancelling ? 'opacity-50' : ''}`}
                      >
                        <XCircle className="w-4 h-4 text-[#EF4444] mr-1.5" />
                        <span className="text-[12px] font-bold text-[#EF4444] font-inter">
                          {cancelling && orderToCancel === item.id ? 'Cancelling...' : 'Cancel Request'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
