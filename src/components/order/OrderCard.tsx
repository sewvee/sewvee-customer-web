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

  return (
    <Link href={href ?? `/orders/${order.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-[#5B43EE] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#5B43EE] uppercase tracking-wide">
                {isStitching ? 'Custom Stitching' : 'Readymade'}
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 truncate">#{displayId}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(order.date ?? order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={order.status} />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {hasPendingPhoto && (
          <div className="mt-3 flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2">
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
