'use client';
import { useState, useCallback, useEffect } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, ShoppingBag, Shirt, Calendar, Scissors, Image as ImageIcon, Download, Camera, Palette, X, AlertCircle, Check, Mic } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { URL_ORDER_INVOICE_DOWNLOAD, URL_CUSTOMER_PORTAL_ORDERS, URL_UPLOAD } from '@/lib/env';
import { CollageMaker } from '@/components/CollageMaker';

export default function OrderDetailPage() {
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    // Ensure the path has a leading slash
    let path = url.startsWith('/') ? url : `/${url}`;
    
    // If the path doesn't start with /uploads/ and the backend is serving from /uploads
    // (e.g. order_photos/file.png), prepend /uploads
    if (!path.startsWith('/uploads/')) {
       path = `/uploads${path}`;
    }
    
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021'}${path}`;
  };

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { orders } = useOrdersStore();
  const { user } = useAuthStore();
  const refreshOrders = useOrdersStore(s => s.refreshOrders);
  
  const order = orders.find((o) => o.id === id);

  const [activeTab, setActiveTab] = useState<'details' | 'payments'>('details');
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
  const [collageOpen, setCollageOpen] = useState(false);
  const [activeOutfitForCollage, setActiveOutfitForCollage] = useState<any | null>(null);
  const [confirmDrawerVisible, setConfirmDrawerVisible] = useState(false);
  const [cancelOutfitDrawerId, setCancelOutfitDrawerId] = useState<string | null>(null);
  const [cancelEntireDrawerVisible, setCancelEntireDrawerVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedOutfitForConfirm, setSelectedOutfitForConfirm] = useState<any | null>(null);
  const [outfitRequests, setOutfitRequests] = useState<any[]>([]);
  const { token } = useAuthStore();

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
      await refreshOrders(user?.mobile ?? '');
      setConfirmDrawerVisible(false);
    } catch(e) {
      console.error(e);
    } finally {
      setSubmittingOutfitId(null);
    }
  };
  
  const [pendingPhotos, setPendingPhotos] = useState<Record<string, string[]>>({});
  const [submittingOutfitId, setSubmittingOutfitId] = useState<string | null>(null);
  const [cancellingEntire, setCancellingEntire] = useState(false);
  const [cancellingOutfitId, setCancellingOutfitId] = useState<string | null>(null);

  const getFormattedToken = () => {
    const t = token || localStorage.getItem('sewvee_customer_token') || '';
    return t.startsWith('Bearer ') ? t : `Bearer ${t}`;
  };

  const handleCancelEntireOrder = async () => {
    if (!order || cancellingEntire) return;
    setCancelEntireDrawerVisible(false);
    setCancellingEntire(true);
    try {
      const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: getFormattedToken() },
        body: JSON.stringify({ status_id: 4 }), // 4 = Cancelled
      });
      if (res.ok) {
        await refreshOrders(user?.mobile ?? '');
        router.back();
      } else {
        alert('Failed to cancel. Please try again.');
      }
    } catch { alert('Network error. Please try again.'); }
    finally { setCancellingEntire(false); }
  };

  const handleCancelOutfit = async (outfitId: string) => {
    if (!order || cancellingOutfitId) return;
    setCancelOutfitDrawerId(null);
    setCancellingOutfitId(outfitId);
    try {
      const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/outfits/${outfitId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: getFormattedToken() },
        body: JSON.stringify({ status_id: 4 }),
      });
      if (res.ok) {
        await refreshOrders(user?.mobile ?? '');
      } else {
        alert('Failed to cancel outfit. Please try again.');
      }
    } catch { alert('Network error. Please try again.'); }
    finally { setCancellingOutfitId(null); }
  };

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!order?.id || downloadingInvoice) return;
    setDownloadingInvoice(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.sewvee.com'}/mobile/customer-portal/orders/${order.id}/invoice`;
      const res = await fetch(url, {
        headers: { Authorization: getFormattedToken() }
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `Invoice_${order.billNo || order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (err) {
      alert('Could not download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    // Always refresh on mount to get latest outfits (bypass 60s cache) — an admin may have added outfits since last load
    if (user?.mobile) {
      useOrdersStore.getState().refreshOrders(user.mobile);
    }
  }, [user]);

  // Fetch outfit requests (customer + boutique messages/photos/voice notes)
  useEffect(() => {
    const fetchOutfitRequests = async () => {
      if (!order?.id) return;
      const formattedToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
      try {
        const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/requests`, {
          headers: { Authorization: formattedToken },
        });
        const json = await res.json();
        if (json.success) setOutfitRequests(json.data || []);
      } catch (e) { /* suppress */ }
    };
    fetchOutfitRequests();
  }, [order?.id, token]);

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

  // Read rich data saved at submission time from localStorage (backend drops this data)
  let localRichData: { delivery_date?: string; outfit_configs?: any[] } = {};
  if (typeof window !== 'undefined' && order.id) {
    try {
      const stored = localStorage.getItem(`sewvee_order_${order.id}`);
      if (stored) localRichData = JSON.parse(stored);
    } catch(e) {}
  }

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
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold text-[#0F172A] font-inter">
                  {displayId}
                </h1>
                {(String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED') && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-bold tracking-widest uppercase">
                    Cancelled
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">{order.order_type === 'SALE_ORDER' ? 'SALE ORDER' : (order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER INQUIRY' : 'CUSTOM STITCHING')}</p>
            </div>
          </div>

          {/* Tabs */}
          {order.order_type !== 'STITCHING_REQUEST' && (
          <div className="flex w-full -mb-[1px]">
            <button onClick={() => setActiveTab('details')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 ${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>Details</button>
            <button onClick={() => setActiveTab('payments')} className={`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 ${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}`}>Payments</button>
          </div>
          )}
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

            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="flex items-center justify-center gap-2 bg-white text-[#0F172A] font-bold py-3.5 px-4 rounded-[12px] border border-[#E2E8F0] shadow-sm outline-none w-full mt-4 disabled:opacity-50"
            >
              {downloadingInvoice ? (
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="text-[14px]">{downloadingInvoice ? 'Downloading...' : 'Download Invoice'}</span>
            </button>

            {(((order as any).payments && (order as any).payments.length > 0)) && (
              <div className="mt-6 space-y-4">
                <h2 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide px-1">Transaction Logs</h2>
                <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                  {(order as any).payments.map((payment: any, pIdx: number) => (
                    <div key={'payment-' + pIdx} className={`p-4 flex items-center justify-between ${pIdx !== (order as any).payments.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-extrabold text-[#0F172A] tracking-tight">₹{Number(payment.amount_paid || payment.amount || 0).toFixed(2)}</span>
                        {(payment.payment_mode || payment.paymentMode) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#5B43EE] uppercase tracking-wider">
                            {payment.payment_mode || payment.paymentMode}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center text-[#64748B]">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[12px] font-medium">
                            {new Date(payment.payment_date || payment.createdAt || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {payment.transaction_id && (
                          <span className="text-[10px] font-medium text-[#94A3B8]">
                            Txn: {payment.transaction_id}
                          </span>
                        )}
                      </div>
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
                {order.order_type === 'STITCHING_REQUEST' ? (() => {
                  // PRIMARY: data saved in localStorage at submission time
                  const localConfig = (localRichData.outfit_configs && localRichData.outfit_configs[activeOutfitIndex]) || null;

                  // FALLBACK: parse from customer_notes text blob (for orders created before this fix)
                  const rawNotes = activeOutfit.customer_notes || activeOutfit.notes || '';
                  const extractField = (label: string) => {
                    const match = rawNotes.match(new RegExp(`${label}:\\s*(.+)`, 'i'));
                    return match ? match[1].trim() : '';
                  };

                  const category = localConfig?.category || extractField('Category') || activeOutfit.name?.replace('Stitching Request - ', '') || '';
                  let description = localConfig?.description || extractField('Description') || '';
                  if (!description && rawNotes && !rawNotes.includes('Category:')) description = rawNotes;
                  if (description) {
                    description = description.replace(/\[CUSTOMER_CANCELLED\]/g, '').trim();
                  }
                  const measurement = localConfig?.measurement_option || extractField('Measurement') || activeOutfit.measurement_option || '';
                  const delivDate = localConfig?.delivery_date || localRichData.delivery_date || extractField('Expected Date') || activeOutfit.deliveryDate || (order as any).deliveryDate || '';

                  // Photos: from localStorage OR from outfit.photos (attached via /requests)
                  const localPhotoUrls: string[] = localConfig?.photo_urls || [];
                  const outfitPhotoUrls: string[] = (activeOutfit.photos || []).map((p: any) =>
                    typeof p === 'string' ? p : (p.file_url || p.url || p.attachment_url || p.image || '')
                  ).filter(Boolean);
                  const allUrls: string[] = [...new Set([...localPhotoUrls, ...outfitPhotoUrls])];
                  
                  const audioUrls = allUrls.filter((url: string) => url.match(/\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note'));
                  const imageUrls = allUrls.filter((url: string) => !audioUrls.includes(url));

                  return (
                    <div className="bg-white rounded-[16px] overflow-hidden mb-6 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <div className="flex items-center">
                          <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                          <h2 className="text-[12px] font-bold text-[#0F172A] tracking-wide uppercase">Request Summary</h2>
                        </div>
                        {!(String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED') && (
                          <button
                            onClick={() => setCancelOutfitDrawerId(activeOutfit.id || activeOutfit.order_outfit_id)}
                            disabled={cancellingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id)}
                            className="text-[10px] font-bold text-red-500 uppercase tracking-wide px-2.5 py-1.5 bg-red-50 rounded-md border border-red-100 active:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {cancellingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id) ? '...' : 'Cancel Outfit'}
                          </button>
                        )}
                      </div>
                      
                      <div className="divide-y divide-[#F1F5F9]">
                        {/* Category */}
                        <div className="p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Category</span>
                          <span className="text-[14px] font-semibold text-[#0F172A]">{category || '—'}</span>
                        </div>

                        {/* Description */}
                        {description ? (
                          <div className="p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Description / Notes</span>
                            <span className="text-[14px] font-medium text-[#0F172A] whitespace-pre-wrap leading-relaxed">{description}</span>
                          </div>
                        ) : null}

                        {/* Measurement */}
                        {measurement ? (
                          <div className="p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Measurement</span>
                            <span className="text-[14px] font-semibold text-[#0F172A]">{measurement}</span>
                          </div>
                        ) : null}

                        {/* Expected Delivery */}
                        {delivDate ? (
                          <div className="p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Expected Delivery</span>
                            <span className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#5B43EE]" />
                              {new Date(delivDate).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'})}
                            </span>
                          </div>
                        ) : null}

                        {/* Voice Notes */}
                        {audioUrls.length > 0 && (
                          <div className="p-4 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                              <Mic className="w-3.5 h-3.5 text-[#5B43EE]" /> Voice Notes
                            </span>
                            {audioUrls.map((url: string, i: number) => (
                              <audio key={i} controls src={getImageUrl(url)} className="w-full h-9 rounded-lg" />
                            ))}
                          </div>
                        )}

                        {/* Reference Photos */}
                        {imageUrls.length > 0 && (
                          <div className="p-4 flex flex-col gap-3">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[#5B43EE]" /> Reference Photos
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {imageUrls.map((url: string, i: number) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC]">
                                  <img src={getImageUrl(url)} alt="Reference" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty state */}
                        {audioUrls.length === 0 && imageUrls.length === 0 && !description && !measurement && (
                          <div className="p-4">
                            <span className="text-[13px] text-[#94A3B8] italic">No additional details provided.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">OUTFIT DETAILS</h2>
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    <div className="p-4 grid grid-cols-2 gap-y-4 divide-x divide-[#F1F5F9]">
                      <div className="flex flex-col pr-4">
                        <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">ORDER TYPE</span>
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter capitalize">{order.order_type === 'STITCHING_REQUEST' ? 'Pre-order' : 'Stitching'}</span>
                      </div>
                      <div className="flex flex-col pl-4">
                        <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">URGENCY</span>
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter capitalize">{activeOutfit.urgency?.toLowerCase() || (order as any).urgency?.toLowerCase() || 'Normal'}</span>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-4 divide-x divide-[#F1F5F9]">
                      <div className="flex flex-col pr-4">
                        <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">TRIAL DATE</span>
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                          <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                            {activeOutfit.trialDate ? new Date(activeOutfit.trialDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col pl-4">
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
                </div>
                )}
                
                {/* STITCHING SPECIFICATIONS */}
                {order.order_type !== 'STITCHING_REQUEST' && (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Scissors className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">STITCHING SPECIFICATIONS</h2>
                  </div>
                  <div className="p-4">
                    {activeOutfit.stitching && activeOutfit.stitching.length > 0 ? (
                      <div className="space-y-3">
                        {activeOutfit.stitching.map((opt: any, index: number) => (
                          <div key={index} className="flex justify-between items-center pb-3 border-b border-[#F1F5F9] last:border-0 last:pb-0">
                            <span className="text-[13px] font-medium text-[#475569]">{opt.category?.name || 'Option'}</span>
                            <span className="text-[13px] font-bold text-[#0F172A] text-right ml-4">{opt.option?.name || '-'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic font-inter w-full py-4 text-center">
                        No stitching specifications provided.
                      </p>
                    )}
                  </div>
                </div>
                )}
                
                {/* CLIENT MEASUREMENTS */}
                {order.order_type !== 'STITCHING_REQUEST' && activeOutfit.measurements && activeOutfit.measurements.length > 0 && (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">MEASUREMENTS</h2>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-[#F1F5F9] border-t border-[#F1F5F9] -mt-[1px]">
                    {activeOutfit.measurements.map((m: any, i: number) => (
                      <div key={i} className="flex flex-col p-4">
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide">
                          {(() => {
                            const label = m.measurement_name || m.measurement?.name || m.name || m.label || m.field_name || '';
                            if (label) return label;
                            // Format snake_case or camelCase valid string keys as fallback
                            const validKey = Object.keys(m).find(k => k !== 'value' && k !== 'id' && k !== 'measurement_id' && m[k] && typeof m[k] === 'string');
                            if (validKey) return validKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                            return `Measurement ${m.measurement_id || m.id || i + 1}`;
                          })()}
                        </span>
                        <span className="text-[14px] font-semibold text-[#0F172A] mt-1">{typeof m.value === "object" && m.value !== null ? (m.value.value || JSON.stringify(m.value)) : m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                )}
                
                {/* DESIGN PHOTOS & SKETCHES */}
                {order.order_type !== 'STITCHING_REQUEST' && (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <ImageIcon className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">DESIGN PHOTOS & SKETCHES</h2>
                  </div>
                  <div className="flex flex-col p-4 gap-3">
                    {activeOutfit.photos && activeOutfit.photos.length > 0 ? (
                      activeOutfit.photos.map((photo: any, pIdx: number) => {
                        const url = photo.file_url || photo.url || photo.image || photo;
                        const isAudio = typeof url === 'string' && (url.match(/\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note'));
                        
                        const isCustomerByAudio = isAudio && photo.duration === 0;
                        const isCustomerByReq = outfitRequests.some((r: any) => r.sender_type === 'CUSTOMER' && (r.attachment_url === url || r.file_url === url));
                        const isBoutiqueByReq = outfitRequests.some((r: any) => r.sender_type === 'BUSINESS' && (r.attachment_url === url || r.file_url === url));
                        
                        // Heuristic fallback: if it's the first audio and there are multiple audios, often customer. Or if not claimed by boutique.
                        const isCustomer = isCustomerByAudio || isCustomerByReq || (!isBoutiqueByReq && pIdx === 0 && activeOutfit.photos.length > 1);

                        if (isAudio) {
                          return (
                            <div key={pIdx} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex flex-col gap-2 relative">
                              <div className="absolute top-2 right-2">
                                {isCustomer ? (
                                  <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-orange-200">Customer</span>
                                ) : (
                                  <span className="bg-[#5B43EE]/10 text-[#5B43EE] px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-[#5B43EE]/20">Boutique</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Mic className="w-4 h-4 text-[#5B43EE]" />
                                <span className="text-[12px] font-bold text-[#0F172A]">Voice Note</span>
                              </div>
                              <audio controls src={getImageUrl(url)} className="w-full h-8" />
                            </div>
                          );
                        }

                        return (
                          <div key={pIdx} className="w-full rounded-[10px] overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0] relative">
                            <div className="absolute top-2 right-2 z-10 shadow-sm">
                              {isCustomer ? (
                                <span className="bg-orange-100/90 text-orange-800 px-2 py-1 rounded text-[10px] font-black uppercase border border-orange-300 backdrop-blur-sm shadow-sm">Customer</span>
                              ) : (
                                <span className="bg-[#5B43EE]/90 text-white px-2 py-1 rounded text-[10px] font-black uppercase border border-[#5B43EE] backdrop-blur-sm shadow-sm">Boutique</span>
                              )}
                            </div>
                            <img src={getImageUrl(url)} alt="Design" className="w-full h-auto max-h-[300px] object-contain" />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic font-inter w-full py-4 text-center">
                        No photos provided.
                      </p>
                    )}
                    
                    {/* PENDING PHOTOS (UNCONFIRMED) */}
                    {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length > 0 && (
                      <div className="w-full mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-amber-700 font-inter uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Pending Uploads
                          </p>
                          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length} to confirm
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).map((pUrl: string, idx: number) => (
                            <div key={idx} className="relative rounded-lg overflow-hidden border border-amber-300 shadow-sm group">
                              <img src={getImageUrl(pUrl)} className="w-full h-28 object-cover" />
                              <button
                                onClick={() => {
                                  setPendingPhotos(prev => {
                                    const next = { ...prev };
                                    const oId = activeOutfit.id || activeOutfit.order_outfit_id;
                                    if (next[oId]) {
                                      next[oId] = next[oId].filter((_, i) => i !== idx);
                                      if (next[oId].length === 0) delete next[oId];
                                    }
                                    return next;
                                  });
                                }}
                                className="absolute top-1.5 right-1.5 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm active:scale-95"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.preventDefault(); setActiveOutfitForCollage(activeOutfit); setCollageOpen(true); }}
                            className="flex-1 py-2.5 bg-white text-amber-600 border border-amber-300 text-[13px] font-bold rounded-lg shadow-sm"
                          >
                            Add More
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOutfitForConfirm(activeOutfit);
                              setConfirmDrawerVisible(true);
                            }}
                            className="flex-[2] py-2.5 bg-amber-500 text-white text-[13px] font-bold rounded-lg shadow-sm"
                          >
                            Confirm Photos
                          </button>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
                )}
                {/* BOUTIQUE NOTES */}
                {activeOutfit.notes && (() => {
                  const text = activeOutfit.notes;
                  if (text.includes('--- Boutique Notes ---')) {
                    const parts = text.split('--- Boutique Notes ---');
                    return (
                      <div className="flex flex-col gap-3 mb-4">
                        {parts[0].trim() && (
                          <div className="bg-[#FEF3C7] rounded-[12px] p-4 border border-[#FDE68A]">
                            <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">CUSTOMER NOTES</p>
                            <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed whitespace-pre-wrap">{parts[0].trim()}</p>
                          </div>
                        )}
                        {parts[1] && parts[1].trim() && (
                          <div className="bg-[#F0FDF4] rounded-[12px] p-4 border border-[#BBF7D0]">
                            <p className="text-[11px] font-bold text-[#166534] font-inter mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> BOUTIQUE NOTES
                            </p>
                            <p className="text-[13px] font-medium text-[#15803D] font-inter leading-relaxed whitespace-pre-wrap">{parts[1].trim()}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="bg-[#FEF3C7] rounded-[12px] p-4 mb-4 border border-[#FDE68A]">
                      <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">INSTRUCTIONS</p>
                      <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed whitespace-pre-wrap">{String(activeOutfit.notes || '').replace(/\[CUSTOMER_CANCELLED\]/g, '').trim()}</p>
                    </div>
                  );
                })()}

                {/* CUSTOMER + BOUTIQUE REQUESTS FEED — Timeline */}
                {order.order_type !== 'STITCHING_REQUEST' && (() => {
                  const activeOutfitId = String(activeOutfit.id || activeOutfit.order_outfit_id || '');
                  const filteredReqs = outfitRequests.filter((r: any) => {
                    if (!activeOutfitId) return true;
                    return String(r.outfit_id || r.order_outfit_id || r.outfitId || '') === activeOutfitId || !r.outfit_id;
                  });
                  const visibleReqs = filteredReqs.filter((r: any) => {
                    const isSystemOnly = r.message && r.message.includes('[ACTION_REQUIRED') && !r.attachment_url && !r.file_url;
                    return !isSystemOnly;
                  });
                  return (
                    <>
                      {visibleReqs.length > 0 && (
                        <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <Mic className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                            <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">Notes, Photos & Voice Notes</h2>
                          </div>
                          <div className="px-4 pt-5 pb-3">
                            {visibleReqs.map((req: any, rIdx: number) => {
                              const isCustomer = req.sender_type === 'CUSTOMER' || req.phone === user?.mobile;
                              const url: string = req.attachment_url || req.file_url || '';
                              const isAudio = url && (url.match(/\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios'));
                              const isDoc = url && (url.match(/\.(pdf|doc|docx|txt)$/i) || url.includes('invoice/pdf'));
                              const isImage = url && !isAudio && !isDoc;
                              const isSystemMsg = req.message && req.message.includes('[ACTION_REQUIRED');
                              const isLast = rIdx === visibleReqs.length - 1;
                              const timeStr = new Date(req.created_at || req.createdAt || Date.now())
                                .toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                              return (
                                <div key={req.id || rIdx} className="flex gap-3">
                                  {/* Timeline dot + spine */}
                                  <div className="flex flex-col items-center shrink-0 w-8">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm ring-2 ${isCustomer ? 'bg-[#EEF2FF] ring-[#C7D2FE] text-[#4F46E5]' : 'bg-[#FFFBEB] ring-[#FDE68A] text-[#B45309]'}`}>
                                      {isCustomer ? 'Y' : 'B'}
                                    </div>
                                    {!isLast && <div className="w-[2px] flex-1 bg-[#E2E8F0] mt-1" style={{minHeight: 20}} />}
                                  </div>

                                  {/* Right content */}
                                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-5'}`}>
                                    {/* Sender + time */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isCustomer ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
                                        {isCustomer ? 'You' : 'Boutique'}
                                      </span>
                                      <span className="text-[10px] text-[#94A3B8]">{timeStr}</span>
                                    </div>

                                    {/* Voice Note */}
                                    {isAudio && (
                                      <div className={`rounded-2xl p-3 border ${isCustomer ? 'bg-[#EEF2FF] border-[#C7D2FE]' : 'bg-[#FFFBEB] border-[#FDE68A]'}`}>
                                        <p className={`text-[11px] font-semibold mb-2 flex items-center gap-1.5 ${isCustomer ? 'text-[#4F46E5]' : 'text-[#B45309]'}`}>
                                          <Mic className="w-3.5 h-3.5" /> Voice Note
                                        </p>
                                        <audio controls src={getImageUrl(url)} className="w-full h-8 rounded-lg" />
                                      </div>
                                    )}

                                    {/* Photo */}
                                    {isImage && (
                                      <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                                        <img src={getImageUrl(url)} alt="Attachment" className="w-full max-h-[220px] object-cover block" />
                                      </div>
                                    )}

                                    {/* Document / Invoice */}
                                    {isDoc && (
                                      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#F1F5F9]" onClick={() => window.open(getImageUrl(url), '_blank')}>
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">📄</div>
                                          <div>
                                            <p className="text-[13px] font-bold text-[#0F172A]">{url.includes('invoice') ? 'Order Invoice' : 'Document'}</p>
                                            <p className="text-[11px] text-[#64748B]">Tap to view</p>
                                          </div>
                                        </div>
                                        <div className="text-indigo-600 text-[11px] font-bold uppercase tracking-wide">Open</div>
                                      </div>
                                    )}

                                    {/* Text note (not system, not a caption under image) */}
                                    {req.message && !isSystemMsg && !isImage && (
                                      <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${isCustomer ? 'bg-[#EEF2FF] text-[#1E293B] border border-[#C7D2FE]' : 'bg-[#FFFBEB] text-[#1E293B] border border-[#FDE68A]'}`}>
                                        {req.message}
                                      </div>
                                    )}

                                    {/* Caption under a photo */}
                                    {isImage && req.message && !isSystemMsg && (
                                      <p className="text-[11px] text-[#64748B] mt-1.5 px-0.5">{req.message}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            
            {/* ENTIRE ORDER ACTIONS */}
            {order.order_type === 'STITCHING_REQUEST' && !(String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED') && (
              <div className="mt-4 mb-8">
                <button
                  onClick={() => setCancelEntireDrawerVisible(true)}
                  disabled={cancellingEntire}
                  className="w-full py-4 rounded-xl border border-red-200 text-red-500 font-bold text-[14px] bg-red-50 active:bg-red-100 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {cancellingEntire ? (
                    <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X size={18} />
                  )}
                  Cancel Entire Request
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    <CollageMaker
      open={collageOpen}
      onClose={() => { setCollageOpen(false); setActiveOutfitForCollage(null); }}
      onSave={async (url: string) => {
        const blob = await (await fetch(url)).blob();
        if (!activeOutfitForCollage || !blob) return;
        const token = localStorage.getItem('sewvee_customer_token') ?? '';
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        try {
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
          
          // Save to pendingPhotos instead of auto-submitting
          setPendingPhotos(prev => {
            const next = { ...prev };
            if (!next[outfitId]) next[outfitId] = [];
            next[outfitId].push(fileUrl);
            return next;
          });

          setCollageOpen(false);
          setActiveOutfitForCollage(null);
        } catch (e) {
          console.error('Failed to submit collage:', e);
          throw e; // Rethrow to let CollageMaker catch it and show an error toast
        }
      }}
    />



      {cancelEntireDrawerVisible && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45 transition-opacity" onClick={() => setCancelEntireDrawerVisible(false)} />
          <div className="relative bg-white rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mr-3">
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1E293B] flex-1">Cancel Entire Request</h3>
              <button onClick={() => setCancelEntireDrawerVisible(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[15px] text-[#475569] mb-6 leading-relaxed font-inter">
              Are you sure you want to cancel this entire order request? All outfits within this request will be cancelled. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-[15px] transition-colors hover:bg-gray-200"
                onClick={() => setCancelEntireDrawerVisible(false)}
              >
                Keep Request
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#EF4444] text-white font-bold text-[15px] transition-opacity hover:opacity-90 flex justify-center items-center gap-2"
                onClick={handleCancelEntireOrder}
                disabled={cancellingEntire}
              >
                {cancellingEntire ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelOutfitDrawerId && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45 transition-opacity" onClick={() => setCancelOutfitDrawerId(null)} />
          <div className="relative bg-white rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mr-3">
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1E293B] flex-1">Cancel Outfit</h3>
              <button onClick={() => setCancelOutfitDrawerId(null)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[15px] text-[#475569] mb-6 leading-relaxed font-inter">
              Are you sure you want to cancel this outfit? This action cannot be undone and the boutique will be notified.
            </p>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-[15px] transition-colors hover:bg-gray-200"
                onClick={() => setCancelOutfitDrawerId(null)}
              >
                Keep Outfit
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#EF4444] text-white font-bold text-[15px] transition-opacity hover:opacity-90 flex justify-center items-center gap-2"
                onClick={() => handleCancelOutfit(cancelOutfitDrawerId)}
                disabled={cancellingOutfitId !== null}
              >
                {cancellingOutfitId ? 'Cancelling...' : 'Cancel Outfit'}
              </button>
            </div>
          </div>
        </div>
      )}

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
