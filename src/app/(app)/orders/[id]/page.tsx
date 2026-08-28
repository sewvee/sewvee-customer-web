'use client';
import { useState, useCallback, useEffect } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, ShoppingBag, Shirt, Calendar, Scissors, Image as ImageIcon, Download, Camera, Palette, X, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { URL_ORDER_INVOICE_DOWNLOAD, URL_CUSTOMER_PORTAL_ORDERS, URL_UPLOAD } from '@/lib/env';
import { CollageMaker } from '@/components/CollageMaker';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { orders } = useOrdersStore();
  const { user } = useAuthStore();
  const fetchOrders = useOrdersStore(s => s.fetchOrders);
  
  const order = orders.find((o) => o.id === id);

  const [activeTab, setActiveTab] = useState<'details' | 'payments'>('details');
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
  const [collageOpen, setCollageOpen] = useState(false);
  const [activeOutfitForCollage, setActiveOutfitForCollage] = useState<any | null>(null);
  const [confirmDrawerVisible, setConfirmDrawerVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedOutfitForConfirm, setSelectedOutfitForConfirm] = useState<any | null>(null);

  const handleConfirmOutfitPhotos = async () => {
    if (!selectedOutfitForConfirm || !order) return;
    const oId = selectedOutfitForConfirm.id || selectedOutfitForConfirm.order_outfit_id;
    setSubmittingOutfitId(oId);
    try {
      const urls = pendingPhotos[oId] || [];
      for (const u of urls) {
        await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id.toString()}/outfits/${oId}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sewvee_customer_token')}` },
          body: JSON.stringify({ attachment_url: u, message: 'Uploaded via Customer Web', phone: user?.mobile ?? '' })
        });
      }
      setPendingPhotos(prev => { const n={...prev}; delete n[oId]; return n; });
      fetchOrders(user?.mobile ?? '');
      setConfirmDrawerVisible(false);
    } catch(e) {
      console.error(e);
    } finally {
      setSubmittingOutfitId(null);
    }
  };
  
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
  
  const rawOutfits = order.outfits || order.items || [];
  const outfits: any[] = [];
  rawOutfits.forEach((o: any) => {
    const qty = o.quantity || 1;
    if (qty > 1) {
      for (let i = 0; i < qty; i++) {
        outfits.push({ ...o, _expandedIndex: i });
      }
    } else {
      outfits.push(o);
    }
  });

  
  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <>
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden">
      {/* Navbar */}
      <div className="flex flex-col pt-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center px-4 mb-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
              <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
            </button>
            <div className="flex-1 pl-4">
              <h1 className="text-[18px] font-bold text-[#0F172A] font-inter">
                {displayId}
              </h1>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">{order.order_type === 'SALE_ORDER' ? 'SALE ORDER' : (order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER INQUIRY' : 'CUSTOM STITCHING')}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex w-full -mb-[1px]">
            <button onClick={() => setActiveTab('details')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 ${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>Details</button>
            <button onClick={() => setActiveTab('payments')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 ${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>Payments</button>
          </div>
        </div>

      {/* Content */}
      <div className="bg-[#F8FAFC] flex-1 flex flex-col px-4 pt-4 overflow-y-auto pb-24">
        
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide px-1">Order Billing Summary</h2>
            
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
              {outfits.map((outfit: any, idx: number) => {
                const outfitName = outfit.outfit_name || outfit.name || 'Outfit';
                const isLast = idx === outfits.length - 1;
                return (
                  <div key={'billing-' + (outfit.id || idx)} className={`pb-3 ${!isLast ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <p className="text-[11px] font-bold text-[#5B43EE] px-4 pt-3 pb-1.5 uppercase tracking-wide">
                      {outfitName}
                    </p>
                    
                    {order.order_type === 'SALE_ORDER' ? (
                      <div className="flex justify-between items-center px-4 mb-2">
                        <span className="text-[13px] font-medium text-[#475569]">Readymade (x{outfit.quantity || 1})</span>
                        <span className="text-[13px] font-bold text-[#0F172A]">₹{Number(outfit.totalAmount || outfit.total_amount || outfit.price || 0).toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          let services = outfit.services || outfit.order_outfit_services || outfit.order_services || [];
                          if (services.length === 0 && outfit.items) {
                            const svcItems = outfit.items.filter((i: any) => i.item_type === 'SERVICE' || (!i.item_type && i.service_id));
                            if (svcItems.length > 0) services = svcItems;
                          }
                          
                          if (services.length > 0) {
                            return services.map((service: any, sIdx: number) => {
                              const sName = service.service_name || service.name || service.service?.name || 'Stitching';
                              const isEmbroidery = sName.toLowerCase().includes('embroidery');
                              const Icon = isEmbroidery ? Palette : Scissors;
                              
                              return (
                                <div key={'srv-' + sIdx} className="flex justify-between items-center px-4 mb-2">
                                  <div className="flex items-center">
                                    <Icon className="w-3 h-3 text-[#94A3B8] mr-2" />
                                    <span className="text-[13px] font-medium text-[#475569]">
                                      {sName}
                                    </span>
                                  </div>
                                  <span className="text-[13px] font-bold text-[#0F172A]">
                                    ₹{Number(service.price || service.amount || service.total_amount || 0).toFixed(2)}
                                  </span>
                                </div>
                              );
                            });
                          } else {
                            return (
                              <div className="flex justify-between items-center px-4 mb-2">
                                <div className="flex items-center">
                                  <Scissors className="w-3 h-3 text-[#94A3B8] mr-2" />
                                  <span className="text-[13px] font-medium text-[#475569]">Stitching</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#0F172A]">
                                  ₹{Number(outfit.totalAmount || outfit.total_amount || outfit.price || 0).toFixed(2)}
                                </span>
                              </div>
                            );
                          }
                        })()}
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

            {(((order as any).payments && (order as any).payments.length > 0)) && (
              <div className="mt-6 space-y-4">
                <h2 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide px-1">Transaction Logs</h2>
                <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                  {(order as any).payments.map((payment: any, pIdx: number) => (
                    <div key={'payment-' + pIdx} className={`p-4 ${pIdx !== (order as any).payments.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[14px] font-bold text-[#0F172A]">₹{Number(payment.amount).toFixed(2)}</span>
                            <div className="bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#C7D2FE]">
                              <span className="text-[10px] font-bold text-[#4F46E5] uppercase">{payment.payment_mode || 'PAID'}</span>
                            </div>
                          </div>
                          <span className="text-[12px] font-medium text-[#64748B] flex items-center">
                            <Calendar className="w-3 h-3 mr-1.5" />
                            {new Date(payment.payment_date || payment.createdAt || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {payment.transaction_id && (
                        <div className="mt-2 bg-[#F8FAFC] rounded-lg p-2 border border-[#F1F5F9]">
                          <p className="text-[11px] font-medium text-[#64748B]">
                            <span className="font-bold text-[#475569]">Txn ID:</span> {payment.transaction_id}
                          </p>
                        </div>
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
              <div className="flex overflow-x-auto gap-2 mb-4 hide-scrollbar min-h-[44px]">
                {outfits.map((o: any, idx: number) => (
                  <button
                    key={o.id || idx}
                    onClick={() => setActiveOutfitIndex(idx)}
                    className={`shrink-0 px-4 h-[38px] inline-flex items-center justify-center rounded-full text-[13px] font-bold border ${activeOutfitIndex === idx ? 'bg-[#5B43EE] text-white border-[#5B43EE]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
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
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">OUTFIT DETAILS</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">ORDER TYPE</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter">{order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER' : 'STITCHING'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">URGENCY</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter uppercase">{activeOutfit.urgency || (order as any).urgency || 'NORMAL'}</span>
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

                
                {order.order_type === 'STITCHING_REQUEST' && activeOutfit.customerNotes && (
                  <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">REQUEST DETAILS</h2>
                    </div>
                    <div className="p-4">
                      <p className="text-[13px] text-[#475569] whitespace-pre-line leading-relaxed font-inter">{activeOutfit.customerNotes}</p>
                    </div>
                  </div>
                )}

                {/* STITCHING SPECIFICATIONS */}
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
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
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
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
                          onClick={() => {
                          setSelectedOutfitForConfirm(activeOutfit);
                          setAgreedToTerms(false);
                          setConfirmDrawerVisible(true);
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
          console.log('[DEBUG] Collage upload response:', uploadJson, '-> Extracted URL:', fileUrl);
          
          if (!fileUrl) throw new Error('No URL returned from upload server');

          const outfitId = activeOutfitForCollage.id || activeOutfitForCollage.order_outfit_id;
          console.log('[DEBUG] Saving to outfitId:', outfitId, 'activeOutfitForCollage:', activeOutfitForCollage);
          
          setPendingPhotos(prev => {
            const nextState = {
              ...prev,
              [outfitId]: [...(prev[outfitId] || []), fileUrl]
            };
            console.log('[DEBUG] pendingPhotos updating from', prev, 'to', nextState);
            return nextState;
          });

          setCollageOpen(false);
          setActiveOutfitForCollage(null);
        } catch (e) {
          console.error('Failed to submit collage:', e);
          throw e; // Rethrow to let CollageMaker catch it and show an error toast
        }
      }}
    />

      {confirmDrawerVisible && selectedOutfitForConfirm && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45" onClick={() => setConfirmDrawerVisible(false)} />
          <div className="relative bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mr-3">
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1E293B] flex-1">Confirm Photos</h3>
              <button onClick={() => setConfirmDrawerVisible(false)} className="p-1">
                <X size={20} color="#64748B" />
              </button>
            </div>

            <p className="text-[14px] font-medium text-[#475569] mb-6 leading-relaxed">
              Are you sure you want to confirm these photos? Once submitted, you cannot change them and they will be sent directly to the boutique for reference.
            </p>

            <button 
              className="flex items-start mb-6 text-left w-full cursor-pointer"
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center shrink-0 mt-0.5 ${agreedToTerms ? 'bg-[#5B43EE] border-[#5B43EE]' : 'border-[#CBD5E1] bg-transparent'}`}>
                {agreedToTerms && <Check size={14} color="#FFF" strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1E293B] mb-1.5">
                  I agree with the terms and conditions
                </p>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">
                  <p className="text-[12px] font-medium text-[#64748B] leading-relaxed whitespace-pre-line">
                    {(order as any)?.company?.invoice_terms || (order as any)?.company?.termsAndConditions || (order as any)?.boutiqueTerms || 'No Refund / No Exchange / No Cancellation\nE & O.E.'}
                  </p>
                </div>
              </div>
            </button>

            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-[15px]"
                onClick={() => setConfirmDrawerVisible(false)}
              >
                Cancel
              </button>
              <button 
                className={`flex-1 py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center ${agreedToTerms ? 'bg-[#5B43EE] text-white' : 'bg-[#94A3B8] text-white opacity-70'}`}
                disabled={!agreedToTerms || submittingOutfitId !== null}
                onClick={handleConfirmOutfitPhotos}
              >
                {submittingOutfitId ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
