'use client';
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Send, ShoppingBag, Image as ImageIcon, Loader2, MessageCircle, MoreVertical, Mic, Edit2, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { BottomSheet } from '@/components/ui/BottomSheet';

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
  if (msgText && msgText.startsWith("Category:")) {
    try {
      const lines = msgText.split("\n");
      const category = lines.find(l => l.startsWith("Category:"))?.replace("Category:", "").trim() || "";
      const description = lines.find(l => l.startsWith("Description:"))?.replace("Description:", "").trim() || "";
      const measurement = lines.find(l => l.startsWith("Measurement:"))?.replace("Measurement:", "").trim() || "";
      const delivery = lines.find(l => l.startsWith("Delivery Date:"))?.replace("Delivery Date:", "").trim() || "";

      return (
        <div className="flex flex-col gap-2 mt-1 mb-1 w-full min-w-[200px]">
          <div className={`rounded-md p-2.5 shadow-sm text-[13.5px] ${isCustomer ? 'bg-white/10' : 'bg-indigo-50/50 border border-indigo-100'}`}>
            {category && <div className={`font-bold mb-1 ${isCustomer ? 'text-white' : 'text-[#5B43EE]'}`}>{category}</div>}
            {description && <div className={`leading-snug italic mb-2 ${isCustomer ? 'text-indigo-100' : 'text-slate-700'}`}>"{description}"</div>}
            <div className={`flex flex-col gap-1 text-[12.5px] border-t pt-1.5 ${isCustomer ? 'text-indigo-50 border-white/20' : 'text-slate-600 border-[#5B43EE]/10'}`}>
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Measurements:</span>
                <span className="text-right">{measurement}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Expected By:</span>
                <span className="text-right">{delivery}</span>
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
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const user = useAuthStore(s => s.user);
  
  const { orders, fetchOrders } = useOrdersStore();
  const order = orders.find(o => String(o.id) === orderId);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedMessageForOptions, setSelectedMessageForOptions] = useState<any>(null);
  
  // Topic selection if the order has multiple outfits
  const [contextOutfitId, setContextOutfitId] = useState<string>('');
  
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch Orders if missing
  useEffect(() => {
    if (user?.mobile && (!order || orders.length === 0)) {
      useOrdersStore.getState().refreshOrders(user.mobile);
    }
  }, [user, orders.length, fetchOrders]);

  // Default topic selection
  useEffect(() => {
    if (order && !contextOutfitId) {
      const outfits = order.outfits || order.items || [];
      if (outfits.length > 0) {
        const outf = outfits[0] as any;
        setContextOutfitId((outf.id || outf.order_outfit_id)?.toString() || '');
      }
    }
  }, [order, contextOutfitId]);

  // Load chat messages for this order
  useEffect(() => {
    console.log("LOAD CHAT CALLED", { userMobile: user?.mobile, orderId });
    async function loadChat() {
      if (!orderId) { setLoading(false); return; }
      try {
        const res = await api.get(`/customer-portal/orders/${orderId}/requests`, {
          /* no params needed */
        });
        const data = res.data?.data || res.data;
        setMessages(Array.isArray(data) ? data : []);
        
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        console.log("SETTING LOADING FALSE");
        setLoading(false);
      }
    }
    loadChat();
  }, [orderId, user?.mobile]);

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

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const displayId = order ? (order.order_number || order.billNo || order.id) : orderId;
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
          href={`/orders/${orderId}`}
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
                    <div className={`max-w-full rounded-2xl px-4 py-2.5 shadow-sm ${
                    isCustomer 
                      ? 'bg-[#5B43EE] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-[#0F172A] rounded-tl-sm'
                  }`}>
                    {msg.attachment_url && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black/5">
                        <img src={msg.attachment_url} alt="Attachment" className="w-full h-auto object-cover max-h-[200px]" />
                      </div>
                    )}
                    {msg.message && (
                      <div className={`text-[14px] leading-relaxed ${isCustomer ? 'text-white' : 'text-[#334155]'}`}>
                        {renderMessageContent(msg.message, isCustomer)}
                      </div>
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                  {isCustomer && (
                    <button 
                      onClick={() => setSelectedMessageForOptions(msg)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all shrink-0"
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
      <div className="bg-white border-t border-gray-200 p-3 shrink-0 flex items-end gap-2 pb-safe">
        <button className="p-3 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shrink-0">
          <ImageIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl flex items-end overflow-hidden">
          <textarea 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={((order?.outfits?.length ?? 0) > 1 || (order?.items?.length ?? 0) > 1) && !contextOutfitId ? "Select a topic first..." : "Type a message..."}
            disabled={!contextOutfitId || sending}
            rows={1}
            className="w-full max-h-[100px] min-h-[44px] bg-transparent resize-none outline-none py-3 px-4 text-[14px] text-[#0F172A] disabled:opacity-50"
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
    </div>
  );
}
