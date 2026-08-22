'use client';
import { useOrdersStore } from '@/store/ordersStore';
import { ArrowLeft, ShoppingBag, Shirt, Calendar, Scissors, Image as ImageIcon, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { URL_ORDER_INVOICE_DOWNLOAD } from '@/lib/env';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { orders } = useOrdersStore();
  
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <p className="text-[16px] text-gray-500 font-inter mb-4">Order not found</p>
        <Link href="/home" className="bg-white border border-[#E2E8F0] px-6 py-2 rounded-xl text-[#0F172A] font-bold font-inter">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isSale = order.order_type === 'SALE_ORDER';
  const displayId = order.billNo || order.id;
  const outfits = order.outfits || order.items || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Navbar */}
      <div className="flex items-center px-4 h-14 bg-[#F8FAFC]">
        <Link href="/home" className="w-10 h-10 flex items-center justify-start">
          <ArrowLeft className="w-[22px] h-[22px] text-[#0F172A]" />
        </Link>
        <h1 className="flex-1 text-center text-[17px] font-bold text-[#0F172A] font-inter pr-10">
          {isSale ? 'Invoice' : 'Order'} #{displayId}
        </h1>
      </div>

      <div className="px-4 pb-12">
        {isSale ? (
          <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <ShoppingBag className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
              <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">PURCHASED ITEMS</h2>
            </div>
            <div className="bg-white">
              {outfits.map((outfit: any, index: number) => (
                <div key={outfit.id || index} className={`flex justify-between items-center px-4 py-3 border-b border-[#F1F5F9] ${index === outfits.length - 1 ? 'border-b-0' : ''}`}>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#0F172A] font-inter">
                      {outfit.outfit_name || outfit.name || "Ready-Made Item"} {outfit.quantity ? `(x${outfit.quantity})` : ''}
                    </p>
                  </div>
                  <div className="ml-4">
                    <p className="text-[14px] font-bold text-[#0F172A] font-inter">₹{outfit.totalAmount || outfit.price || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          outfits.map((outfit: any, index: number) => {
            const outfitName = outfit.outfit_name || outfit.name || "Outfit";
            const refPhotos = (outfit.photos || []).filter((p: any) => p.category === 'REFERENCE');
            const hasStitching = outfit.stitching && outfit.stitching.length > 0;

            return (
              <div key={outfit.id || index} className="mb-6">
                {/* OUTFIT TITLE */}
                <div className="flex items-center mb-3">
                  <span className="text-[14px] font-bold text-[#0F172A] font-inter uppercase bg-[#EEF2FF] px-2 py-0.5 rounded text-[#4F46E5] mr-2">Outfit {index + 1}:</span>
                  <span className="text-[15px] font-bold text-[#0F172A] font-inter">{outfitName}</span>
                </div>

                {/* OUTFIT DETAILS Card */}
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">OUTFIT DETAILS</h2>
                  </div>
                  <div className="flex flex-wrap border-b border-[#F1F5F9]">
                    <div className="w-1/2 p-3 border-r border-b border-[#F1F5F9]">
                      <p className="text-[10px] font-bold text-[#94A3B8] font-inter mb-1">ORDER TYPE</p>
                      <p className="text-[13px] font-semibold text-[#0F172A] font-inter">{outfit.orderType || 'Stitching'}</p>
                    </div>
                    <div className="w-1/2 p-3 border-b border-[#F1F5F9]">
                      <p className="text-[10px] font-bold text-[#94A3B8] font-inter mb-1">URGENCY</p>
                      <p className="text-[13px] font-semibold text-[#0F172A] font-inter">{outfit.urgency || 'NORMAL'}</p>
                    </div>
                    <div className="w-1/2 p-3 border-r border-[#F1F5F9]">
                      <p className="text-[10px] font-bold text-[#94A3B8] font-inter mb-1">TRIAL DATE</p>
                      <div className="flex items-center bg-[#F8FAFC] px-2 py-1 rounded-md self-start inline-flex border border-[#F1F5F9]">
                        <Calendar className="w-3 h-3 text-[#5B43EE] mr-1.5" />
                        <span className="text-[11px] font-semibold text-[#0F172A] font-inter">
                          {outfit.trialDate ? new Date(outfit.trialDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="w-1/2 p-3">
                      <p className="text-[10px] font-bold text-[#94A3B8] font-inter mb-1">DELIVERY DATE</p>
                      <div className="flex items-center bg-[#F8FAFC] px-2 py-1 rounded-md self-start inline-flex border border-[#F1F5F9]">
                        <Calendar className="w-3 h-3 text-[#5B43EE] mr-1.5" />
                        <span className="text-[11px] font-semibold text-[#0F172A] font-inter">
                          {outfit.deliveryDate ? new Date(outfit.deliveryDate).toLocaleDateString() : (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STITCHING SPECIFICATIONS */}
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <Scissors className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">STITCHING SPECIFICATIONS</h2>
                  </div>
                  <div>
                    {hasStitching ? outfit.stitching.map((stitch: any, sIdx: number) => (
                      <div key={stitch.id || sIdx} className={`flex justify-between items-center px-4 py-3 border-b border-[#F1F5F9] ${sIdx === outfit.stitching.length - 1 ? 'border-b-0' : ''}`}>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-[#0F172A] font-inter">{(stitch.category?.name || 'STYLE').toUpperCase()}</p>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[13px] font-medium text-[#475569] font-inter">
                            {[stitch.sub_category?.name, stitch.option?.name].filter(Boolean).join(' > ') || 'Custom'}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex justify-center items-center py-4">
                        <p className="text-[13px] text-[#94A3B8] italic font-inter">No stitching specifications provided.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* DESIGN PHOTOS & SKETCHES */}
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <ImageIcon className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">DESIGN PHOTOS & SKETCHES</h2>
                  </div>
                  <div className="flex flex-wrap p-4 gap-3">
                    {refPhotos.length > 0 ? (
                      refPhotos.map((photo: any, pIdx: number) => (
                        <div key={photo.id || pIdx} className="w-[80px] h-[100px] rounded-[10px] overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
                          <img src={photo.file_url || photo.url} alt="Design" className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic font-inter w-full py-2">
                        No photos uploaded by boutique.
                      </p>
                    )}
                  </div>
                </div>

                {/* BOUTIQUE NOTES */}
                {outfit.notes && (
                  <div className="bg-[#FEF3C7] rounded-[12px] p-4 mb-4 border border-[#FDE68A]">
                    <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">BOUTIQUE NOTES</p>
                    <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed">{outfit.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ACCOUNT SUMMARY */}
        <h3 className="text-[13px] font-bold text-[#94A3B8] font-inter tracking-wider mb-3 ml-1 mt-6">ACCOUNT SUMMARY</h3>
        <div className="bg-white rounded-[16px] overflow-hidden mb-6 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              {isSale ? (
                <ShoppingBag className="w-3.5 h-3.5 text-[#94A3B8] mr-2" />
              ) : (
                <Scissors className="w-3.5 h-3.5 text-[#94A3B8] mr-2" />
              )}
              <span className="text-[14px] font-semibold text-[#475569] font-inter">Total Order Value</span>
            </div>
            <span className="text-[15px] font-bold text-[#0F172A] font-inter">₹{order.totalAmount || order.total || 0}</span>
          </div>
          
          <div className="h-[1px] bg-[#F1F5F9] w-full mb-4" />
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-medium text-[#64748B] font-inter">Delivery Method</span>
            <span className="text-[13px] font-bold text-[#5B43EE] font-inter uppercase">
              {order.delivery_method ? String(order.delivery_method).replace('_', ' ') : 'STORE PICKUP'}
            </span>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-medium text-[#64748B] font-inter">Advance / Paid Amount</span>
            <span className="text-[13px] font-semibold text-[#0F172A] font-inter">₹{order.advanceAmount || order.advance || order.paid_amount || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-[#0F172A] font-inter">DUE BALANCE</span>
            <span className="text-[16px] font-bold text-[#EF4444] font-inter">₹{(order.totalAmount || order.total || 0) - (order.advanceAmount || order.advance || order.paid_amount || 0)}</span>
          </div>
        </div>

        {/* INVOICE & TRANSACTIONS */}
        {((order.advanceAmount || order.advance || order.paid_amount || 0) > 0) && (
          <>
            <div className="flex justify-between items-center mb-3 ml-1 mt-6">
              <h3 className="text-[13px] font-bold text-[#94A3B8] font-inter tracking-wider">TRANSACTIONS & INVOICE</h3>
              <a 
                href={URL_ORDER_INVOICE_DOWNLOAD(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:bg-gray-50"
              >
                <Download className="w-3.5 h-3.5 text-[#0F172A] mr-1" />
                <span className="text-[12px] font-bold text-[#0F172A] font-inter">Invoice</span>
              </a>
            </div>

            <div className="bg-white rounded-[16px] overflow-hidden mb-6 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4">
              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  <span className="text-[16px] font-bold text-[#0F172A] font-inter mr-2">₹{order.advanceAmount || order.advance || order.paid_amount || 0}</span>
                  <div className="bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                    <span className="text-[10px] font-bold text-[#166534] font-inter">PAID</span>
                  </div>
                </div>
                <span className="text-[13px] font-medium text-[#64748B] font-inter">
                  Date: {new Date(order.date || order.createdAt || new Date()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
