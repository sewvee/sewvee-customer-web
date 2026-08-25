'use client';
import { useState, useCallback, useEffect } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, ShoppingBag, Shirt, Calendar, Scissors, Image as ImageIcon, Download, Camera, Palette, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { URL_ORDER_INVOICE_DOWNLOAD, URL_CUSTOMER_PORTAL_ORDERS, URL_UPLOAD } from '@/lib/env';
import { CollageMaker } from '@/components/CollageMaker';
import CustomerRequestsTab from '@/components/order/CustomerRequestsTab';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { orders } = useOrdersStore();
  const { user } = useAuthStore();
  const fetchOrders = useOrdersStore(s => s.fetchOrders);
  
  const order = orders.find((o) => o.id === id);

  const [activeTab, setActiveTab] = useState<'details' | 'requests' | 'payments'>('details');
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
  const [collageOpen, setCollageOpen] = useState(false);
  const [activeOutfitForCollage, setActiveOutfitForCollage] = useState<any | null>(null);
  
  const [pendingPhotos, setPendingPhotos] = useState<Record<string, string[]>>({});
  const [submittingOutfitId, setSubmittingOutfitId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.mobile && orders.length === 0) {
      fetchOrders(user.mobile);
    }
  }, [user, orders.length, fetchOrders]);

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
  
  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <>
    <div className={`min-h-screen bg-white ${activeTab === 'requests' ? 'pb-0' : 'pb-24'}`}>
      {/* Navbar */}
      <div className="flex flex-col pt-4 pb-2 border-b border-gray-100 bg-white">
        <div className="flex items-center px-4 mb-4">
          <Link href="/home" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </Link>
          <div className="flex-1 pl-4">
            <h1 className="text-[18px] font-bold text-[#0F172A] font-inter">
              {displayId}
            </h1>
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">{order.order_type === 'SALE_ORDER' ? 'SALE ORDER' : 'CUSTOM STITCHING'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full">
          <button onClick={() => setActiveTab('details')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 ${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>Details</button>
          <button onClick={() => setActiveTab('requests')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 flex items-center justify-center ${activeTab === 'requests' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>
            Requests
            {order?.has_unread_messages ? <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-red-500"></span> : null}
          </button>
          <button onClick={() => setActiveTab('payments')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 ${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>Payments</button>
        </div>
      </div>

      <div className={`bg-[#F8FAFC] min-h-[calc(100vh-140px)] flex flex-col ${activeTab === 'requests' ? '' : 'px-4 py-6'}`}>
        {activeTab === 'requests' && <CustomerRequestsTab order={order} />}
        
        
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide px-1">Order Billing Summary</h2>
            
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
              {outfits.map((outfit: any, idx: number) => {
                const outfitName = outfit.outfit_name || outfit.name || 'Outfit';
                return (
                  <div key={'billing-' + (outfit.id || idx)} className="pb-4">
                    <p className="text-[11px] font-bold text-[#5B43EE] px-4 pt-4 pb-2 uppercase tracking-wide">
                      {outfitName}
                    </p>
                    
                    {order.order_type === 'SALE_ORDER' ? (
                      <div className="flex justify-between items-center px-4 mb-2">
                        <span className="text-[13px] font-medium text-[#475569]">Readymade (x{outfit.quantity || 1})</span>
                        <span className="text-[13px] font-bold text-[#0F172A]">₹{Number(outfit.totalAmount || outfit.total_amount || outfit.price || 0).toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        {(outfit.services || []).map((service: any, sIdx: number) => (
                          <div key={'srv-' + sIdx} className="flex justify-between items-center px-4 mb-2">
                            <div className="flex items-center">
                              <Scissors className="w-3 h-3 text-[#94A3B8] mr-2" />
                              <span className="text-[13px] font-medium text-[#475569]">{service.service_name || service.name || 'Stitching'}</span>
                            </div>
                            <span className="text-[13px] font-bold text-[#0F172A]">₹{Number(service.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                        {(!outfit.services || outfit.services.length === 0) && (
                          <div className="flex justify-between items-center px-4 mb-2">
                            <div className="flex items-center">
                              <Scissors className="w-3 h-3 text-[#94A3B8] mr-2" />
                              <span className="text-[13px] font-medium text-[#475569]">Stitching</span>
                            </div>
                            <span className="text-[13px] font-bold text-[#0F172A]">₹{Number(outfit.totalAmount || outfit.total_amount || outfit.price || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {(outfit.items || []).filter((i: any) => i.item_type === 'MATERIAL').map((mat: any, mIdx: number) => (
                          <div key={'mat-' + mIdx} className="flex justify-between items-center px-4 mb-2">
                            <span className="text-[13px] font-medium text-[#475569] pl-5">{mat.material_name || mat.name || 'Material'}</span>
                            <span className="text-[13px] font-bold text-[#0F172A]">₹{Number(mat.total_amount || mat.amount || mat.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}

              <div className="h-[1px] bg-[#F1F5F9] w-full" />
              
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-[13px] font-bold text-[#0F172A]">TOTAL BILLING</span>
                <span className="text-[13px] font-bold text-[#0F172A]">₹{Number(order.totalAmount || order.total || order.total_amount || 0).toFixed(2)}</span>
              </div>
              
              <div className="h-[1px] bg-[#F1F5F9] w-full" />

              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-[13px] font-medium text-[#64748B]">Advance / Paid Amount</span>
                <span className="text-[13px] font-bold text-[#10B981]">₹{Number(order.advanceAmount || order.advance || order.paid_amount || 0).toFixed(2)}</span>
              </div>

              <div className="h-[1px] bg-[#F1F5F9] w-full" />

              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-[13px] font-bold text-[#EF4444]">DUE BALANCE</span>
                <span className="text-[15px] font-bold text-[#EF4444]">₹{Number((order.totalAmount || order.total || order.total_amount || 0) - (order.advanceAmount || order.advance || order.paid_amount || 0)).toFixed(2)}</span>
              </div>
            </div>

            <a
              href={order.id ? `${process.env.NEXT_PUBLIC_API_URL || 'https://api.sewvee.com'}/mobile/customer-portal/orders/${order.id}/invoice` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white text-[#0F172A] font-bold py-3.5 px-4 rounded-[12px] border border-[#E2E8F0] shadow-sm outline-none"
            >
              <Download className="w-4 h-4" />
              <span className="text-[14px]">Download Invoice</span>
            </a>

            {((order.payments && order.payments.length > 0)) && (
              <div className="mt-6 space-y-4">
                <h2 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide px-1">Transaction Logs</h2>
                <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                  {order.payments.map((payment: any, pIdx: number) => (
                    <div key={'payment-' + pIdx} className={`p-4 ${pIdx !== order.payments.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[15px] font-bold text-[#0F172A]">₹{Number(payment.amount).toFixed(2)}</span>
                        <div className="bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#C7D2FE]">
                          <span className="text-[10px] font-bold text-[#4F46E5] uppercase">{payment.payment_mode || 'PAID'}</span>
                        </div>
                      </div>
                      <span className="text-[12px] font-medium text-[#64748B]">
                        Date: {new Date(payment.payment_date || payment.createdAt || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {payment.transaction_id && (
                        <p className="text-[11px] font-medium text-[#94A3B8] mt-1">Txn ID: {payment.transaction_id}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {activeTab === 'details' && (
          <>
            {outfits.length > 0 && (
              <div className="flex overflow-x-auto gap-2 mb-6 hide-scrollbar">
                {outfits.map((o: any, idx: number) => (
                  <button
                    key={o.id || idx}
                    onClick={() => setActiveOutfitIndex(idx)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border ${activeOutfitIndex === idx ? 'bg-[#5B43EE] text-white border-[#5B43EE]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
                  >
                    Outfit {idx + 1}: {o.type || o.name || 'Item'}
                  </button>
                ))}
              </div>
            )}

            {activeOutfit && (
              <div className="mb-6">
                {/* OUTFIT DETAILS */}
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">OUTFIT DETAILS</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">ORDER TYPE</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter">STITCHING</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">URGENCY</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter uppercase">{activeOutfit.urgency || order.urgency || 'NORMAL'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">TRIAL DATE</span>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                          {activeOutfit.trialDate ? new Date(activeOutfit.trialDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">DELIVERY DATE</span>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                          {activeOutfit.deliveryDate ? new Date(activeOutfit.deliveryDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A')}
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
                    {activeOutfit.stitching && activeOutfit.stitching.length > 0 ? activeOutfit.stitching.map((stitch: any, sIdx: number) => (
                      <div key={stitch.id || sIdx} className={`flex justify-between items-center px-4 py-3 border-b border-[#F1F5F9] ${sIdx === activeOutfit.stitching.length - 1 ? 'border-b-0' : ''}`}>
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
                      <div className="flex justify-center items-center py-6">
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
                    {activeOutfit.photos && activeOutfit.photos.filter((p:any)=>p.category==='REFERENCE').length > 0 ? (
                      activeOutfit.photos.filter((p:any)=>p.category==='REFERENCE').map((photo: any, pIdx: number) => (
                        <div key={photo.id || pIdx} className="w-[80px] h-[100px] rounded-[10px] overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
                          <img src={photo.file_url || photo.url} alt="Design" className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic font-inter w-full py-4 text-center">
                        No photos uploaded by boutique.
                      </p>
                    )}
                  </div>
                </div>

                {/* PHOTO UPLOAD (IF REQUESTED) */}
                {activeOutfit.requestedPhotosFromClient && (
                  <div className="bg-orange-50 rounded-[16px] border border-orange-200 p-4 mb-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <Camera className="w-4 h-4 text-orange-600 mr-2" />
                      <h3 className="text-[12px] font-bold text-orange-800 uppercase tracking-wide">REFERENCE PHOTO NEEDED</h3>
                    </div>
                    <p className="text-[13px] text-orange-700 font-medium mb-4 leading-relaxed">
                      Your boutique is requesting reference design photos. Use the Collage Maker to combine multiple photos or upload a single photo.
                    </p>
                    
                    {/* Show pending photos here */}
                    {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length > 0 && (
                      <div className="flex gap-3 overflow-x-auto mb-4 pb-2">
                        {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).map((url, idx) => (
                          <div key={idx} className="relative w-[72px] h-[72px] shrink-0">
                             <img src={url} alt="Pending" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                             <button 
                               onClick={() => setPendingPhotos(prev => { const n = {...prev}; n[activeOutfit.id || activeOutfit.order_outfit_id].splice(idx,1); return n; })}
                               className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-md">
                               <X size={12} className="text-white" />
                             </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setActiveOutfitForCollage(activeOutfit); setCollageOpen(true); }}
                        className="flex-1 py-3 bg-[#5B43EE] rounded-xl flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Palette size={16} className="text-white" />
                        <span className="text-sm font-bold text-white">
                          {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length > 0 ? "Add More" : "Open Collage Maker"}
                        </span>
                      </button>
                      
                      {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length > 0 && (
                        <button
                          onClick={async () => {
                            const oId = activeOutfit.id || activeOutfit.order_outfit_id;
                            setSubmittingOutfitId(oId);
                            try {
                              const urls = pendingPhotos[oId] || [];
                              for (const u of urls) {
                                await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/outfits/${oId}/requests`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sewvee_customer_token')}` },
                                  body: JSON.stringify({ attachment_url: u, message: 'Uploaded via Customer Web', phone: user?.mobile ?? '' })
                                });
                              }
                              setPendingPhotos(prev => { const n={...prev}; delete n[oId]; return n; });
                              fetchOrders(user?.mobile ?? '');
                            } catch(e) {
                              console.error(e);
                            } finally {
                              setSubmittingOutfitId(null);
                            }
                          }}
                          className="flex-1 py-3 bg-[#10B981] rounded-xl flex items-center justify-center gap-2 shadow-sm"
                        >
                          {submittingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id) ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="text-sm font-bold text-white">Confirm Photos</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* BOUTIQUE NOTES */}
                {activeOutfit.notes && (
                  <div className="bg-[#FEF3C7] rounded-[12px] p-4 mb-4 border border-[#FDE68A]">
                    <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">BOUTIQUE NOTES</p>
                    <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed">{activeOutfit.notes}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>

    <CollageMaker
      open={collageOpen}
      onClose={() => { setCollageOpen(false); setActiveOutfitForCollage(null); }}
      onSave={async (dataUrl: string) => {
        if (!activeOutfitForCollage || !dataUrl) return;
        const token = localStorage.getItem('sewvee_customer_token') ?? '';
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `collage_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const formData = new FormData();
          formData.append('file', file);
          formData.append('key_name', 'order_photos');

          const uploadRes = await fetch(URL_UPLOAD, {
            method: 'POST',
            headers: { Authorization: formattedToken },
            body: formData,
          });
          const uploadJson = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);

          const fileUrl: string = uploadJson.file_url ?? uploadJson.data?.file_url ?? uploadJson.data?.full_url ?? uploadJson.data?.url ?? uploadJson.full_url ?? uploadJson.url ?? '';
          if (!fileUrl) throw new Error('No URL returned from upload server');

          const outfitId = activeOutfitForCollage.id || activeOutfitForCollage.order_outfit_id;
          
          setPendingPhotos(prev => ({
            ...prev,
            [outfitId]: [...(prev[outfitId] || []), fileUrl]
          }));

        } catch (e) {
          console.error('Failed to submit collage:', e);
        }
        setCollageOpen(false);
        setActiveOutfitForCollage(null);
      }}
    />
    </>
  );
}
