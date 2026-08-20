import Link from 'next/link';
import { ChevronRight, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import type { Order } from '@/types';

function StatusIcon({ status }: { status: string }) {
  if (status === 'Delivered' || status === 'Completed')
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'Cancelled')
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-yellow-500" />;
}

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
  const displayId = order.billNo ?? order.id;
  const isStitching = order.order_type !== 'SALE_ORDER' && order.source !== 'send order request';
  
  // Calculate paid/due if amounts exist
  const total = order.totalAmount ?? 0;
  const advance = order.advanceAmount ?? 0;
  const due = total - advance;

  return (
    <Link href={href ?? `/orders/${order.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-3 active:bg-gray-50 transition-colors">
        
        {/* Top Row: Boutique & Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="bg-gray-100 rounded-md px-2 py-1">
            <p className="text-[10px] font-bold text-gray-600 truncate max-w-[150px]">
              {order.companyName || 'Sewvee Boutique'}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1 border border-gray-100">
            <Clock className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-semibold text-gray-600">
              {formatDate(order.date ?? order.createdAt)}
            </p>
          </div>
        </div>

        {/* Second Row: Order ID & Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{displayId}</p>
            <div className={`px-2 py-0.5 rounded ${isStitching ? 'bg-orange-100' : 'bg-indigo-100'}`}>
              <p className={`text-[9px] font-bold ${isStitching ? 'text-orange-600' : 'text-[#5B43EE]'} uppercase tracking-wide`}>
                {isStitching ? 'STITCHING' : 'READY-MADE'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#5B43EE]" />
        </div>

        {/* Third Row: Payments */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-0.5">Paid</p>
            <p className="text-sm font-bold text-green-500">₹{advance}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium text-gray-500 mb-0.5">Due Balance</p>
            <p className="text-sm font-bold text-red-500">₹{due}</p>
          </div>
        </div>

        {hasPendingPhoto && (
          <div className="mt-3 flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2 border border-orange-100">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium text-orange-700">
              Reference design photo needed
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
