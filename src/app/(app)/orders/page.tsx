'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { OrderCard } from '@/components/order/OrderCard';
import { Loader2, XCircle } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { orders, loading, refreshOrders, cancelOrder } = useOrdersStore();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'stitching' | 'readymade'>('stitching');
  const [cancelling, setCancelling] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (user?.mobile) refreshOrders(user.mobile);
  }, [user?.mobile, refreshOrders]);

  // Filter orders by phone number to ensure they belong to this customer
  const myOrders = orders.filter((o) => {
    const orderMobile = (o.customerMobile ?? o.customer?.whatsappNumber ?? o.customer?.mobile ?? '').replace(/[^0-9]/g, '').slice(-10);
    const targetMobile = user?.mobile?.replace(/[^0-9]/g, '').slice(-10);
    return orderMobile === targetMobile;
  });

  // Separate by tabs
  const stitchingOrders = myOrders.filter(o => {
    // Hide inquiries that have been converted to orders
    if (o.order_type === 'STITCHING_REQUEST' && (o as any).order_notes?.includes('CONVERTED_TO_')) {
      return false;
    }
    return o.order_type === 'TAILORING' || o.order_type === 'STITCHING_REQUEST';
  });
  const readymadeOrders = myOrders.filter(o => o.order_type === 'SALE_ORDER');

  const currentList = activeTab === 'stitching' ? stitchingOrders : readymadeOrders;

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
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="flex flex-col px-4 pt-8 pb-3 bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-gray-900 font-inter mb-4">My Orders</h1>
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('stitching')}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${
              activeTab === 'stitching' ? 'bg-white text-[#5B43EE] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Stitching
          </button>
          <button
            onClick={() => setActiveTab('readymade')}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${
              activeTab === 'readymade' ? 'bg-white text-[#5B43EE] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Readymade
          </button>
        </div>
      </div>

      <div className="p-4 pb-10">
        {loading && myOrders.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-[#5B43EE] animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-6 mt-10">
            <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl opacity-50">📋</span>
            </div>
            <p className="text-[18px] font-bold text-gray-900 mb-2 font-inter">No Orders Found</p>
            <p className="text-[14px] font-medium text-gray-500 text-center font-inter">
              You don&apos;t have any {activeTab} orders right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((item) => {
              const statusStr = (item.status || '').toUpperCase();
              const isCancelled = statusStr === 'CANCELLED' || String(item.status) === '4';
              const isDelivered = statusStr === 'DELIVERED' || String(item.status) === '5';
              const canCancel = !isCancelled && !isDelivered && (item.source === 'send order request' || item.order_type === 'STITCHING_REQUEST' || item.source === 'ONLINE');
              
              return (
                <OrderCard 
                  key={item.id} 
                  order={item} 
                  onCancel={canCancel ? () => setOrderToCancel(item.id.toString()) : undefined}
                />
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
