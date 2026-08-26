'use client';
import { useOrdersStore } from '@/store/ordersStore';
import { ArrowLeft, Clock, CheckCircle, Package, Scissors, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PhotoUploadSection } from '@/components/order/PhotoUploadSection';
import { URL_ORDER_INVOICE_DOWNLOAD, URL_ORDER_TAILORING_COPY_DOWNLOAD } from '@/lib/env';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { orders } = useOrdersStore();
  
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="p-4 pt-6 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/home" className="text-[#5B43EE] font-bold mt-4 block">Return Home</Link>
      </div>
    );
  }

  const isStitching = order.order_type !== 'SALE_ORDER' && order.source !== 'send order request';
  const displayId = order.billNo ?? order.id;
  const items = order.outfits ?? order.items ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/home" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Order #{displayId}</h1>
            <p className="text-xs text-gray-500 font-medium">
              {new Date(order.date ?? order.createdAt ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="p-4 space-y-6 mt-2">
        {/* Boutique Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Boutique Details</h2>
          <p className="text-lg font-bold text-gray-900">{order.companyName ?? 'Boutique'}</p>
          <p className="text-sm text-gray-500 mt-1">{order.companyPhone}</p>
          {order.companyAddress && <p className="text-sm text-gray-500 mt-1">{order.companyAddress}</p>}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-5">Order Status</h2>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />
            
            <div className="relative">
              <div className="absolute -left-[30px] w-6 h-6 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-white">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">Order Placed</h3>
            </div>
            
            {order.status === 'Processing' || order.status === 'Ready' || order.status === 'Completed' || order.status === 'Delivered' ? (
              <div className="relative">
                <div className="absolute -left-[30px] w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white">
                  <Scissors className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Processing</h3>
              </div>
            ) : null}

            {order.status === 'Ready' || order.status === 'Completed' || order.status === 'Delivered' ? (
              <div className="relative">
                <div className="absolute -left-[30px] w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center ring-4 ring-white">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Ready for Pickup/Delivery</h3>
              </div>
            ) : null}
            
            {order.status === 'Delivered' || order.status === 'Completed' ? (
              <div className="relative">
                <div className="absolute -left-[30px] w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-white">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Delivered</h3>
              </div>
            ) : order.status === 'Cancelled' ? (
               <div className="relative">
                <div className="absolute -left-[30px] w-6 h-6 rounded-full bg-red-500 flex items-center justify-center ring-4 ring-white">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-red-600">Cancelled</h3>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -left-[30px] w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-white">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-400">Delivery</h3>
                {order.deliveryDate && <p className="text-xs text-gray-500 mt-1">Expected: {new Date(order.deliveryDate).toLocaleDateString()}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Items & Uploads */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Items</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <PhotoUploadSection
                key={item.id}
                orderId={order.id}
                outfitId={item.id}
                outfitName={item.name ?? item.type ?? 'Item'}
                existingPhotos={item.photos}
              />
            ))}
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <a
            href={URL_ORDER_INVOICE_DOWNLOAD(order.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#EEF2FF] text-[#5B43EE] font-bold py-3 px-4 rounded-xl"
          >
            <FileText className="w-5 h-5" />
            Download Invoice
          </a>
        </div>
      </div>
    </div>
  );
}
