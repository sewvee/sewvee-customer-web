import Link from 'next/link';
import { Clock, AlertCircle } from 'lucide-react';
import type { Order } from '@/types';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface OrderCardProps {
  order: Order;
  href?: string;
  hasPendingPhoto?: boolean;
}

export function OrderCard({ order, href, hasPendingPhoto = false }: OrderCardProps) {
  const isSale = order.order_type === 'SALE_ORDER';
  const orderLabel = order.billNo || (isSale ? `INV-${order.id}` : `ORD-${order.id}`);
  
  const outfits = order.outfits || order.items || [];
  const deliveryDate = outfits.find((o) => o.deliveryDate)?.deliveryDate;
  const typeLabel = isSale ? 'READY-MADE' : 'STITCHING';
  
  const total = order.totalAmount || order.total || (Number(order.advance || order.paid_amount || 0) + Number(order.balance || order.balance_amount || 0));
  const advance = Number(order.advanceAmount || order.advance || order.paid_amount || 0);
  const due = Number(order.balance || order.balance_amount || 0) || (total - advance);

  const isPendingPhoto = hasPendingPhoto || (!isSale && order.status !== 'Cancelled' && order.status !== 'Delivered' && outfits.some(
    (outfit: any) =>
      !!(outfit.requestedPhotosFromClient || outfit.requested_photos_from_client)
  ));

  return (
    <Link
      href={href ?? `/orders/${order.id}`}
      className="block bg-white rounded-xl p-3 mb-2.5 shadow-[0_2px_8px_rgba(99,102,241,0.05)] border border-[#F1F5F9] active:scale-[0.99] transition-transform"
    >
        {/* Row 1: Boutique name (left), Date (right) */}
        <div className="flex justify-between items-center mb-3">
          {order.boutiqueName ? (
            <div className="flex flex-1 items-center overflow-hidden">
              <p className="text-[15px] font-bold text-[#1E293B] truncate font-inter">
                {order.boutiqueName}
              </p>
              {order.has_unread_messages && (
                <div className="ml-2 bg-red-50 px-1.5 py-0.5 rounded flex items-center shrink-0 border border-red-100">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                  <span className="text-red-600 text-[10px] font-medium font-inter whitespace-nowrap">New message</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex items-center bg-[#F8FAFC] px-2 py-1 rounded-md border border-[#F1F5F9]">
            <Clock className="w-3 h-3 text-[#64748B] mr-1" />
            <span className="text-[11px] font-medium text-[#475569] font-inter">
              {deliveryDate ? formatDate(deliveryDate) : formatDate(order.date ?? order.createdAt)}
            </span>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="h-[1px] bg-[#E2E8F0] mb-3" />

        {/* Row 2: 4 columns with vertical dividers */}
        <div className="flex items-center justify-between">
          {/* Col 1: Order No */}
          <div className="flex-1 items-start">
            <p className="text-[10px] text-[#64748B] font-medium font-inter mb-1">Order No</p>
            <p className="text-[13px] text-[#1E293B] font-bold font-inter">{orderLabel}</p>
          </div>
          
          <div className="w-[1px] self-stretch bg-[#E2E8F0] mx-1.5" />
          
          {/* Col 2: Type */}
          <div className="flex-1 flex flex-col items-center">
            <p className="text-[10px] text-[#64748B] font-medium font-inter mb-1">Type</p>
            <p className={`text-[11px] font-bold font-inter ${isSale ? 'text-[#4338CA]' : 'text-[#D97706]'}`}>{typeLabel}</p>
          </div>

          <div className="w-[1px] self-stretch bg-[#E2E8F0] mx-1.5" />

          {/* Col 3: Total Amount */}
          <div className="flex-1 flex flex-col items-center">
            <p className="text-[10px] text-[#64748B] font-medium font-inter mb-1">Total Amount</p>
            <p className="text-[13px] text-[#1E293B] font-bold font-inter">₹{total}</p>
          </div>

          <div className="w-[1px] self-stretch bg-[#E2E8F0] mx-1.5" />

          {/* Col 4: Due */}
          <div className="flex-1 flex flex-col items-end">
            <p className="text-[10px] text-[#64748B] font-medium font-inter mb-1">Due</p>
            <p className="text-[13px] text-[#EF4444] font-bold font-inter">₹{due}</p>
          </div>
        </div>

        {/* PHOTO NEEDED Alert */}
        {isPendingPhoto && (
          <div className="mt-3.5 w-full flex items-center justify-center bg-[#FEF2F2] px-3 py-2 rounded-lg border border-[#FECACA] shadow-[0_4px_12px_rgba(249,115,22,0.1)]">
            <AlertCircle className="w-3.5 h-3.5 text-[#DC2626] mr-1.5" />
            <span className="text-[12px] font-bold text-[#DC2626] font-inter tracking-wide uppercase">Photo Needed</span>
          </div>
        )}
    </Link>
  );
}
