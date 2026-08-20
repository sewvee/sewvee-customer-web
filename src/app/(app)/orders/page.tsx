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
    <div className="p-4 pt-6 pb-20 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/home" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Requested Orders</h1>
      </div>

      {loading && requestedOrders.length === 0 ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 text-[#5B43EE] animate-spin" />
        </div>
      ) : requestedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm mt-10">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-1">No Orders Found</p>
          <p className="text-sm text-gray-500 mb-6">You haven't requested any readymade orders yet.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-[#5B43EE] text-white text-sm font-bold px-6 py-3 rounded-xl">
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requestedOrders.map((order) => (
            <div key={order.id} className="relative">
              <OrderCard order={order} />
              {order.status === 'Pending' && (
                <button
                  onClick={() => setOrderToCancel(order.id)}
                  className="absolute top-4 right-10 p-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                  title="Cancel Order"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomSheet
        open={!!orderToCancel}
        onClose={() => setOrderToCancel(null)}
        title="Cancel Order"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">Are you sure you want to cancel this order?</p>
          <p className="text-sm text-gray-500 mb-8">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setOrderToCancel(null)}>
              No, keep it
            </Button>
            <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>
              Yes, cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
