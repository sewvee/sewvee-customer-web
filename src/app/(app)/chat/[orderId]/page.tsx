'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, Send, ShoppingBag, Image as ImageIcon, Loader2, MessageCircle, MoreVertical, Mic, Edit2, Trash2, Download, Receipt, Paperclip, Camera, Smile } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { URL_UPLOAD } from '@/lib/env';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CollageMaker } from '@/components/CollageMaker';
import { FeedbackModal } from '@/components/FeedbackModal';
import { useToast } from '@/hooks/useToast';

interface ChatMessage {
  id: number;
  order_id: number | string;
  order_outfit_id: number;
  sender_type: 'CUSTOMER' | 'BUSINESS';
  message: string | null;
  attachment_url: string | null;
  created_at: string;
  order_number: string;
  outfit_name: string;
  is_read_by_customer?: boolean;
}


function renderMessageContent(msgText: string, isCustomer: boolean) {
  if (msgText && msgText.startsWith("⭐ Feedback Submitted!")) {
    try {
      const lines = msgText.split("\n");
      const ratingsStr = lines[1] || ""; // e.g., "Stitching: 5★ | Staff: 4★ | Overall: 4★"
      const commentsStr = lines.slice(2).join("\n").replace("Comments: ", "").trim();

      const parseRating = (section: string) => {
        const match = section.match(/(\d+)★/);
        return match ? parseInt(match[1]) : 0;
      };

      const parts = ratingsStr.split("|").map(s => s.trim());
      const stitching = parts.find(p => p.startsWith("Stitching:")) ? parseRating(parts.find(p => p.startsWith("Stitching:"))!) : 0;
      const staff = parts.find(p => p.startsWith("Staff:")) ? parseRating(parts.find(p => p.startsWith("Staff:"))!) : 0;
      const overall = parts.find(p => p.startsWith("Overall:")) ? parseRating(parts.find(p => p.startsWith("Overall:"))!) : 0;

      const StarRow = ({ label, count }: { label: string, count: number }) => (
        <div className="flex items-center justify-between py-1">
          <span className={`text-[12.5px] font-medium ${isCustomer ? 'text-indigo-50' : 'text-slate-600'}`}>{label}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-[13px] ${s <= count ? 'text-yellow-400' : 'text-black/10'}`}>★</span>
            ))}
          </div>
        </div>
      );

      return (
        <div className={`flex flex-col w-full min-w-[220px] rounded-xl p-3 shadow-sm border ${isCustomer ? 'bg-white/10 border-white/20' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className={`flex items-center gap-2 mb-2 font-bold ${isCustomer ? 'text-white' : 'text-emerald-700'}`}>
            <span className="text-lg">⭐</span> Feedback Received
          </div>
          <div className="flex flex-col gap-0.5">
            <StarRow label="Stitching Quality" count={stitching} />
            <StarRow label="Staff Behavior" count={staff} />
            <StarRow label="Overall Experience" count={overall} />
          </div>
          {commentsStr && (
            <div className={`mt-3 pt-2.5 border-t text-[13px] leading-relaxed italic ${isCustomer ? 'border-white/20 text-indigo-100' : 'border-emerald-200/50 text-emerald-800'}`}>
              "{commentsStr}"
            </div>
          )}
        </div>
      );
    } catch (e) {
      // fallback to default text
    }
  }

  if (msgText && msgText.startsWith("Category:")) {
    try {
      const lines = msgText.split("\n");
      const category = lines.find(l => l.startsWith("Category:"))?.replace("Category:", "").trim() || "";
      const description = lines.find(l => l.startsWith("Description:"))?.replace("Description:", "").trim() || "";
      const measurement = lines.find(l => l.startsWith("Measurement:"))?.replace("Measurement:", "").trim() || "";
      const delivery = lines.find(l => l.startsWith("Delivery Date:"))?.replace("Delivery Date:", "").trim() || lines.find(l => l.startsWith("Expected Date:"))?.replace("Expected Date:", "").trim() || "";

      return (
        <div className="flex flex-col gap-2 mt-1 mb-1 w-full min-w-[200px]">
          <div className={`rounded-md p-2.5 shadow-sm text-[13.5px] ${isCustomer ? 'bg-white/10' : 'bg-indigo-50/50 border border-indigo-100'}`}>
            {category && <div className={`font-bold mb-1 ${isCustomer ? 'text-white' : 'text-[#5B43EE]'}`}>{category}</div>}
            {description && <div className={`leading-snug italic mb-2 ${isCustomer ? 'text-indigo-100' : 'text-slate-700'}`}>"{description}"</div>}
            <div className={`flex flex-col gap-1 text-[12.5px] border-t pt-1.5 ${isCustomer ? 'text-indigo-50 border-white/20' : 'text-slate-600 border-[#5B43EE]/10'}`}>
              <div className="flex justify-between gap-4">
                <span className="font-semibold shrink-0">Measurements:</span>
                <span className="text-right whitespace-pre-wrap">{measurement}</span>
              </div>
              <div className="flex justify-between gap-4 mt-2">
                <span className="font-semibold shrink-0">Expected By:</span>
                <span className="text-right whitespace-pre-wrap">{delivery}</span>
              </div>
            </div>
          </div>
        </div>
      );
    } catch(e) {}
  }
  return msgText;
}


function formatDateGroup(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChatDetailPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const user = useAuthStore(s => s.user);
  
  const { orders } = useOrdersStore();
  const storeOrder = orders.find(o => String(o.id) === orderId);
  const [freshOrder, setFreshOrder] = useState<any>(null);
  const order = freshOrder || storeOrder;
  const isCancelled = String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [collageMakerOutfitId, setCollageMakerOutfitId] = useState<number | null>(null);
  const [feedbackOutfitId, setFeedbackOutfitId] = useState<number | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedMessageForOptions, setSelectedMessageForOptions] = useState<any>(null);
  
  // Topic selection if the order has multiple outfits
  const [contextOutfitId, setContextOutfitId] = useState<string>('');
  
  const endRef = useRef<HTMLDivElement>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contextOutfitId) return;
    setShowAttachMenu(false);
    setSending(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key_name', 'order_photos');
      
      const uploadRes = await fetch(URL_UPLOAD, {
        method: 'POST',
        headers: { Authorization: formattedToken },
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      console.log('[UPLOAD] Response:', uploadRes.status, JSON.stringify(uploadJson));
      if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);
      
      const fileUrl = (uploadJson.data?.full_url || uploadJson.data?.url || uploadJson.file_url || uploadJson.data?.file_url || uploadJson.full_url || uploadJson.url || '');
      
      if (fileUrl) {
        await api.post(`/customer-portal/orders/${orderId}/outfits/${contextOutfitId}/requests`, {
          message: 'Uploaded Photo',
          attachment_url: fileUrl
        });
        loadChat();
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      console.error('Failed to upload file', err);
      alert("Failed to upload photo. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSending(false);
      e.target.value = '';
    }
  };

  // Default topic selection — runs whenever order data arrives (store or fresh)
  useEffect(() => {
    if (order && !contextOutfitId) {
      const outfits = order.outfits || order.items || [];
      if (outfits.length > 0) {
        const outf = outfits[0] as any;
        setContextOutfitId((outf.id || outf.order_outfit_id)?.toString() || '');
      }
    }
  }, [order, contextOutfitId]);

  // Load chat messages + fresh order data in one shot.
  // Using the orders list API so we always get the latest outfit count regardless of
  // the Zustand store cache (avoids missing tabs when admin adds outfits).
  const loadChat = useCallback(async () => {
    if (!orderId) { setLoading(false); return; }
    try {
      const [chatRes, ordersListRes] = await Promise.all([
        api.get(`/customer-portal/orders/${orderId}/requests`),
        api.get(`/customer-portal/orders`, { params: { limit: 100 } }),
      ]);
      const data = chatRes.data?.data || chatRes.data;
      setMessages(Array.isArray(data) ? data : []);
      // Pick the fresh order from the list so outfit tabs always reflect current state
      const allOrders = ordersListRes.data?.data || ordersListRes.data || [];
      const found = Array.isArray(allOrders) ? allOrders.find((o: any) => String(o.id) === String(orderId)) : null;
      if (found) {
        setFreshOrder(found);
        // Also update the Zustand store so other pages (order detail, home) benefit
        useOrdersStore.setState(s => ({
          orders: s.orders.map(o => String(o.id) === String(orderId) ? { ...o, ...found } : o),
          lastFetched: Date.now(),
        }));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      console.log("SETTING LOADING FALSE");
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    console.log("LOAD CHAT CALLED", { userMobile: user?.mobile, orderId });
    loadChat();
  }, [loadChat, user?.mobile]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(() => {
    if (!contextOutfitId || !orderId || messages.length === 0) return;
    
    const unreadMessages = messages.filter(m => 
      String(m.order_outfit_id) === String(contextOutfitId) && 
      m.sender_type !== 'CUSTOMER' && 
      !m.is_read_by_customer
    );
    
    if (unreadMessages.length > 0) {
      // Mark local state as read immediately
      setMessages(prev => prev.map(m => 
        (String(m.order_outfit_id) === String(contextOutfitId) && m.sender_type !== 'CUSTOMER')
          ? { ...m, is_read_by_customer: true } 
          : m
      ));
      
      // Call API
      api.post(`/customer-portal/orders/${orderId}/outfits/${contextOutfitId}/requests/read`)
        .catch(err => console.error('Failed to mark read', err));
    }
  }, [contextOutfitId, messages.length, orderId]);


  const handleSend = async () => {
    if (!inputText.trim() || !contextOutfitId || sending) return;
    
    setSending(true);
    try {
      const res = await api.post(`/customer-portal/orders/${orderId}/outfits/${contextOutfitId}/requests`, {
        message: inputText.trim()
      });
      
      const outfit = (order?.outfits || order?.items || []).find((o: any) => (o.id || o.order_outfit_id)?.toString() === contextOutfitId) as any;
      
      const chatMsg: ChatMessage = {
        id: Date.now(),
        order_id: orderId,
        order_outfit_id: parseInt(contextOutfitId),
        sender_type: 'CUSTOMER',
        message: inputText.trim(),
        attachment_url: null,
        created_at: new Date().toISOString(),
        order_number: order?.order_number || '',
        outfit_name: outfit?.name || outfit?.outfit_type || 'Outfit'
      };
      
      setMessages(prev => [...prev, chatMsg]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  
  const handleDownloadInvoice = async (url: string) => {
    try {
      // If the backend returned the boutique's invoice URL, rewrite it to the customer portal URL
      let fetchUrl = url;
      if (fetchUrl.includes('/mobile/orders/') && fetchUrl.includes('/invoice')) {
        // Strip the pdf suffix and query params since the customer portal endpoint is just /orders/:id/invoice
        fetchUrl = fetchUrl.replace('/mobile/orders/', '/mobile/customer-portal/orders/').split('/pdf')[0].split('?')[0];
      }

      const token = localStorage.getItem('sewvee_customer_token');
      const res = await fetch(fetchUrl, {
        headers: {
          Authorization: token?.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `Invoice_${displayId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error("Failed to download invoice", e);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  let displayId = order ? (order.order_number || order.billNo || order.id) : orderId;
  let targetOrderId = orderId;
  
  if ((order as any)?.order_notes?.startsWith('CONVERTED_TO_')) {
    const parts = ((order as any)?.order_notes || '').split('_');
    if (parts.length >= 3) {
      const convertedId = parts[2];
      targetOrderId = convertedId;
      const convertedOrder = orders.find(o => String(o.id) === convertedId);
      if (convertedOrder) {
        displayId = convertedOrder.order_number || convertedOrder.billNo || convertedOrder.id;
      } else {
        displayId = `Converted (${convertedId})`;
      }
    }
  }

  const headerTitle = order ? `${displayId}` : `Order #${orderId}`;
  const headerSubtitle = order?.boutiqueName || '';
  const outfits = order?.outfits || order?.items || [];

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="bg-[#5B43EE] pt-12 pb-4 px-4 flex items-center shadow-sm shrink-0 z-10">
        <button onClick={() => router.back()} className="mr-3">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="w-[36px] h-[36px] bg-white/20 rounded-full flex items-center justify-center mr-3">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-bold text-white truncate">{headerTitle}</h1>
          {headerSubtitle && <p className="text-[12px] text-indigo-200 truncate">{headerSubtitle}</p>}
        </div>
        <Link 
          href={`/orders/${targetOrderId}`}
          className="ml-2 flex items-center justify-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[11px] font-bold text-white transition-colors whitespace-nowrap"
        >
          View Order
        </Link>
      </div>

      {/* Context Selector */}
      {outfits.length > 0 && (
        <div className="bg-white border-b border-gray-200 shrink-0 shadow-sm z-10">
          <div className="overflow-x-auto hide-scrollbar flex items-center gap-2 px-4 py-2.5">
            {outfits.map((outf: any) => {
              const oid = outf.id || outf.order_outfit_id;
              const isActive = String(contextOutfitId) === String(oid);
              const hasUnread = messages.some(m => String(m.order_outfit_id) === String(oid) && m.sender_type !== 'CUSTOMER' && !m.is_read_by_customer);
              return (
                <button
                  key={oid}
                  onClick={() => setContextOutfitId(String(oid))}
                  className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive 
                      ? 'bg-[#5B43EE] text-white shadow-sm' 
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {outf.name || outf.outfit_type || 'Outfit'}
                  {hasUnread && !isActive && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#5B43EE] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-[14px] text-center max-w-[250px]">
              No messages yet. Send a message to start chatting!
            </p>
          </div>
        ) : (
          (() => {
            const filteredMessages = contextOutfitId ? messages.filter(m => String(m.order_outfit_id) === String(contextOutfitId)) : messages;
            return filteredMessages.map((msg, idx) => {
              const isCustomer = msg.sender_type === 'CUSTOMER';
              const showDate = idx === 0 || new Date(filteredMessages[idx-1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
              
              return (
                <div key={msg.id} className="flex flex-col">
                {showDate && (
                  <div className="flex justify-center mb-3 mt-2">
                    <span className="bg-white border border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {formatDateGroup(msg.created_at)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-2 group w-full`}>
                  <div className={`flex items-center gap-2 max-w-[85%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.message && msg.message.includes('invoice/receipt here for your reference') && msg.attachment_url ? (
                      <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm mb-1 w-full max-w-[280px]">
                        <div className="bg-indigo-50/50 p-3 border-b border-indigo-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Receipt className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-[13px] font-bold text-indigo-900 leading-tight">Order Invoice</h3>
                              <p className="text-[10px] text-indigo-500 font-medium">#{displayId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white text-[13px] text-slate-600 leading-relaxed border-b border-slate-50">
                          {renderMessageContent(msg.message, isCustomer)}
                        </div>
                        <div className="p-2.5 bg-slate-50 flex justify-end">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              let url = msg.attachment_url as string;
                              if (url.startsWith('/')) {
                                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.sewvee.com';
                                url = `${apiBase}${url}`;
                              }
                              handleDownloadInvoice(url);
                            }}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div className={`max-w-full rounded-2xl px-4 py-2.5 shadow-sm ${
                    isCustomer 
                      ? 'bg-[#5B43EE] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-[#0F172A] rounded-tl-sm'
                  }`}>
                    {msg.attachment_url && (() => {
                        let url = msg.attachment_url as string;
                        if (url.startsWith('/')) {
                          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.sewvee.com';
                          url = `${apiBase}${url}`;
                        }
                        const cleanUrl = url.split('?')[0];
                        const isAudio = cleanUrl.match(/\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios');
                        const isImage = !isAudio && cleanUrl.match(/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i);
                        if (isAudio) {
                          return (
                            <div className="mb-2">
                              <audio controls src={url} className="w-full min-w-[240px] h-9 rounded-lg" />
                            </div>
                          );
                        }
                        if (isImage) {
                          return (
                            <div className="mb-2 rounded-xl overflow-hidden bg-black/5">
                              <img src={url} alt="Attachment" className="w-full h-auto object-cover max-h-[200px]" />
                            </div>
                          );
                        }
                        
                        // Document / other file
                        const isInvoice = url.toLowerCase().includes('invoice');
                        
                        return (
                          <button 
                            onClick={(e) => { e.preventDefault(); handleDownloadInvoice(url); }}
                            className={`w-full mb-3 mt-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-[14px] font-bold shadow-sm transition-all active:scale-[0.98] ${
                              isCustomer 
                                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' 
                                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]'
                            }`}
                          >
                            {isInvoice ? (
                              <>
                                <span className={`flex items-center justify-center rounded-lg w-8 h-8 ${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}`}>📄</span>
                                Download Invoice
                              </>
                            ) : (
                              <>
                                <span className={`flex items-center justify-center rounded-lg w-8 h-8 ${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}`}>📎</span>
                                Download Attachment
                              </>
                            )}
                          </button>
                        );
                      })()}
                    {msg.message && msg.message.includes('[ACTION_REQUIRED: FEEDBACK]') ? (() => {
                      const hasReviewedAfter = filteredMessages.some(m => 
                        m.order_outfit_id === msg.order_outfit_id && 
                        m.sender_type === 'CUSTOMER' && 
                        m.message && m.message.includes('Feedback Submitted') &&
                        new Date(m.created_at) > new Date(msg.created_at)
                      );
                      
                      if (hasReviewedAfter) {
                        return (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-emerald-600 text-xl">✓</span>
                            </div>
                            <h4 className="font-bold text-emerald-900 text-[15px] mb-1">Feedback Sent</h4>
                            <p className="text-emerald-800 text-[13.5px] leading-snug">
                              Thank you for providing your feedback!
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400"></div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-indigo-600 text-xl">⭐</span>
                        </div>
                        <h4 className="font-bold text-indigo-900 text-[15px] mb-1">⭐ Feedback Requested</h4>
                        <p className="text-indigo-800 text-[13.5px] leading-snug mb-4">
                          We'd love to hear about your experience! Please leave your feedback.
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFeedbackOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 mb-3"
                        >
                          Leave Feedback
                        </button>
                        
                        {order?.googleReviewLink && (
                          <div className="mt-4 pt-4 border-t border-indigo-200/60 text-center">
                            <h5 className="font-bold text-indigo-900 text-[14px] mb-1">Support us on Google!</h5>
                            <p className="text-indigo-700 text-[12px] leading-snug mb-3">
                              If you enjoyed our service, a Google review would mean the world to us.
                            </p>
                            <a 
                              href={order.googleReviewLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl shadow-sm transition active:scale-[0.98]"
                            >
                              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-4 h-4" />
                              Write a Google Review
                            </a>
                          </div>
                        )}
                      </div>
                      );
                    })() : msg.message && msg.message.includes('[ACTION_REQUIRED: PHOTO_REQUEST]') ? (() => {
                      const hasUploadedAfter = filteredMessages.some(m => 
                        m.order_outfit_id === msg.order_outfit_id && 
                        m.sender_type === 'CUSTOMER' && 
                        m.attachment_url && 
                        new Date(m.created_at) > new Date(msg.created_at)
                      );
                      
                      if (hasUploadedAfter) {
                        return (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-emerald-600 text-xl">✓</span>
                            </div>
                            <h4 className="font-bold text-emerald-900 text-[15px] mb-1">Photos Sent</h4>
                            <p className="text-emerald-800 text-[13.5px] leading-snug">
                              You have uploaded the requested photos.
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-900 text-[15px] mb-1">📸 Photos Requested</h4>
                        <p className="text-orange-800 text-[13.5px] leading-snug mb-4">
                          Your boutique needs reference photos for this outfit. Please upload them so they can get started!
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollageMakerOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5" />
                          Upload Reference Photos
                        </button>
                      </div>
                      );
                    })() : msg.message && (
                      <div className={`text-[14px] leading-relaxed ${isCustomer ? 'text-white' : 'text-[#334155]'}`}>
                        {renderMessageContent(msg.message, isCustomer)}
                      </div>
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                  )}
                  {isCustomer && (
                    <button 
                      onClick={() => setSelectedMessageForOptions(msg)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all shrink-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                  </div>
                </div>
              </div>
            );
            })
          })()
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      {isCancelled ? (
        <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex flex-col items-center justify-center gap-1 pb-safe bg-red-50/30">
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Inquiry Cancelled
          </span>
          <p className="text-sm text-slate-500 font-medium">This inquiry is closed and cannot receive new messages.</p>
        </div>
      ) : (
        <div className="shrink-0 flex flex-col bg-white border-t border-gray-200 pb-safe relative">
          {(() => {
             const allOutfits = order?.outfits || order?.items || [];
             const outfitsNeedingPhotos = contextOutfitId 
               ? allOutfits.filter((o:any) => (String(o.id) === String(contextOutfitId) || String(o.order_outfit_id) === String(contextOutfitId)) && (o.requestedPhotosFromClient === true || o.requested_photos_from_client === true))
               : allOutfits.filter((o:any) => (o.requestedPhotosFromClient === true || o.requested_photos_from_client === true));
             
             if (outfitsNeedingPhotos.length > 0) {
                const targetOutfitId = outfitsNeedingPhotos[0].id || outfitsNeedingPhotos[0].order_outfit_id;
                return (
                  <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2.5">
                       <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                         <ImageIcon className="w-4 h-4 text-orange-600" />
                       </div>
                       <div>
                         <p className="text-[13px] font-bold text-orange-900">Action Required</p>
                         <p className="text-[11px] text-orange-700 font-medium">Please upload reference photos.</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setCollageMakerOutfitId(targetOutfitId)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-bold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
                    >
                      Upload Photos
                    </button>
                  </div>
                );
             }
             return null;
          })()}
          <div className="p-3 flex items-end gap-2 relative">
        {showAttachMenu && (
          <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)}></div>
          <div className="absolute bottom-16 left-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 flex flex-col gap-1 z-50 min-w-[160px]">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left text-sm font-semibold text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Camera className="w-4 h-4 text-blue-600" />
              </div>
              Camera
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left text-sm font-semibold text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-purple-600" />
              </div>
              Gallery
            </button>
            <button 
              onClick={() => { setShowAttachMenu(false); setCollageMakerOutfitId(Number(contextOutfitId)); }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left text-sm font-semibold text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
              </div>
              Collage Maker
            </button>
          </div>
          </>
        )}
        
        {/* Hidden File Inputs */}
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleSingleFileUpload} />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleSingleFileUpload} />
        
        <button 
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          disabled={!contextOutfitId || sending}
          className={`p-3 rounded-full transition-colors shrink-0 ${!contextOutfitId || sending ? 'text-gray-300 bg-gray-50' : (showAttachMenu ? 'text-white bg-[#5B43EE] shadow-md' : 'text-gray-400 bg-gray-50 hover:bg-gray-100')}`}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl flex items-end overflow-visible relative">
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!contextOutfitId || sending}
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50" ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setInputText(prev => prev + emojiObject.emoji);
                  setShowEmojiPicker(false);
                }}
                theme={Theme.LIGHT}
                emojiStyle={EmojiStyle.APPLE}
              />
            </div>
          )}
          <textarea 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={((order?.outfits?.length ?? 0) > 1 || (order?.items?.length ?? 0) > 1) && !contextOutfitId ? "Select a topic first..." : "Type a message..."}
            disabled={!contextOutfitId || sending}
            rows={1}
            className="w-full max-h-[100px] min-h-[44px] bg-transparent resize-none outline-none py-3 pr-4 text-[14px] text-[#0F172A] disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        {inputText.trim() ? (
          <button 
            onClick={handleSend}
            disabled={!contextOutfitId || sending}
            className="p-3 bg-[#5B43EE] text-white rounded-full disabled:opacity-50 transition-colors shrink-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        ) : (
          <button 
            disabled={!contextOutfitId || sending}
            className="p-3 bg-[#5B43EE] text-white rounded-full disabled:opacity-50 transition-colors shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
      </div>
      )}

      {/* Message Options Drawer */}
      <BottomSheet open={!!selectedMessageForOptions} onClose={() => setSelectedMessageForOptions(null)}>
        <div className="p-2 pb-6">
          <div className="px-4 mb-4">
            <p className="text-[14px] text-gray-500 truncate">"{selectedMessageForOptions?.message}"</p>
          </div>
          <div className="space-y-1">
            <button onClick={() => setSelectedMessageForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <Edit2 className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Edit message</span>
            </button>
            <button onClick={() => setSelectedMessageForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-red-50 rounded-xl transition-colors text-left">
              <Trash2 className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-[15px] font-medium text-red-600">Delete message</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    
      <FeedbackModal
        isOpen={!!feedbackOutfitId}
        onClose={() => setFeedbackOutfitId(null)}
        isSubmitting={submittingFeedback}
        onSubmit={async (feedbackData) => {
          if (!feedbackOutfitId) return;
          setSubmittingFeedback(true);
          try {
            // 1. Store structured feedback in order.feedback JSONB (the real data store)
            await api.post(`/customer-portal/orders/${orderId}/outfits/${feedbackOutfitId}/feedback`, feedbackData);

            // 2. Also drop a human-readable summary into the chat so the boutique sees it
            const ratingMsg = `⭐ Feedback Submitted!\nStitching: ${feedbackData.stitchingRating}★ | Staff: ${feedbackData.staffRating}★ | Overall: ${feedbackData.boutiqueRating}★${feedbackData.comments ? `\nComments: ${feedbackData.comments}` : ''}`;
            await api.post(`/customer-portal/orders/${orderId}/outfits/${feedbackOutfitId}/requests`, {
              message: ratingMsg
            });

            setFeedbackOutfitId(null);
            showToast('Feedback submitted! Thank you!', 'success');
            loadChat();
          } catch (e) {
            showToast('Failed to submit feedback. Please try again.', 'error');
          } finally {
            setSubmittingFeedback(false);
          }
        }}
      />

      <CollageMaker 
        open={!!collageMakerOutfitId} 
        onClose={() => setCollageMakerOutfitId(null)}
        onSave={async (url: string) => {
          const blob = await (await fetch(url)).blob();
          const token = localStorage.getItem('sewvee_customer_token') ?? '';
          const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          const formData = new FormData();
          formData.append('file', new File([blob], `collage_${Date.now()}.jpg`, { type: 'image/jpeg' }));
          formData.append('key_name', 'order_photos');
          try {
            const uploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: formData,
            });
            const uploadJson = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(`Upload failed`);
            
            const fileUrl = (uploadJson.data?.full_url || uploadJson.data?.url || uploadJson.file_url || uploadJson.data?.file_url || uploadJson.full_url || uploadJson.url || '');
            
            if (fileUrl) {
              await api.post(`/customer-portal/orders/${orderId}/outfits/${collageMakerOutfitId}/requests`, {
                message: 'Uploaded Photos',
                attachment_url: fileUrl
              });
              setCollageMakerOutfitId(null);
              loadChat();
            } else {
              throw new Error('No URL returned');
            }
          } catch (e) {
            console.error('Failed to upload collage', e);
            alert("Failed to upload photos. Please try again.");
          }
        }}
      />
    </div>
  );
  
}
