'use client';
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Send, Store, Image as ImageIcon, Loader2, MessageCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';

interface ChatMessage {
  id: number;
  order_id: number;
  order_outfit_id: number;
  sender_type: 'CUSTOMER' | 'BUSINESS';
  message: string | null;
  attachment_url: string | null;
  created_at: string;
  order_number: string;
  outfit_name: string;
}

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueId = parseInt(params.boutiqueId as string);
  const user = useAuthStore(s => s.user);
  
  // Orders logic for the dropdown
  const { orders, fetchOrders } = useOrdersStore();
  const [contextSelected, setContextSelected] = useState<string>(''); // format: "orderId_outfitId"
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [boutiqueName, setBoutiqueName] = useState('Boutique Chat');
  const [loading, setLoading] = useState(true);
  
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);

  // Filter orders to only this boutique
  const boutiqueOrders = orders.filter(o => Number(o.boutiqueId || (o as any).company_id) === boutiqueId);

  useEffect(() => {
    if (user?.mobile && orders.length === 0) fetchOrders(user.mobile);
  }, [user, orders.length, fetchOrders]);

  useEffect(() => {
    async function loadChat() {
      if (!user?.mobile || !boutiqueId) return;
      try {
        const res = await api.get(`/customer-portal/chat/${boutiqueId}/messages`, {
          params: { phone: user.mobile }
        });
        const data = res.data?.data || res.data;
        setMessages(Array.isArray(data) ? data : []);
        
        // Try to derive the boutique name from our local orders list if possible
        const orderMatch = orders.find(o => Number(o.boutiqueId || (o as any).company_id) === boutiqueId);
        if (orderMatch && orderMatch.boutiqueName) {
          setBoutiqueName(orderMatch.boutiqueName);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [boutiqueId, user?.mobile, orders]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set default context if available
  useEffect(() => {
    if (!contextSelected && boutiqueOrders.length > 0) {
      const firstOrder = boutiqueOrders[0];
      const outfits = firstOrder.outfits || firstOrder.items || [];
      if (outfits.length > 0) {
        const outf = outfits[0] as any;
        setContextSelected(`${firstOrder.id}_${outf.id || outf.order_outfit_id}`);
      }
    }
  }, [boutiqueOrders, contextSelected]);

  const handleSend = async () => {
    if (!inputText.trim() || !contextSelected || sending) return;
    
    const [orderId, outfitId] = contextSelected.split('_');
    setSending(true);
    
    try {
      const res = await api.post(`/customer-portal/orders/${orderId}/outfits/${outfitId}/requests`, {
        message: inputText.trim()
      });
      
      const newMsg = res.data?.data || res.data;
      
      // Optimistically append (or refetch). Let's append manually to be fast.
      const order = boutiqueOrders.find(o => o.id.toString() === orderId);
      const outfit = (order?.outfits || order?.items || []).find((o: any) => (o.id || o.order_outfit_id)?.toString() === outfitId) as any;
      
      const chatMsg: ChatMessage = {
        id: newMsg.id || Date.now(),
        order_id: parseInt(orderId),
        order_outfit_id: parseInt(outfitId),
        sender_type: 'CUSTOMER',
        message: inputText.trim(),
        attachment_url: null,
        created_at: new Date().toISOString(),
        order_number: order?.order_number || '',
        outfit_name: outfit?.name || 'Outfit'
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

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="bg-[#5B43EE] pt-12 pb-4 px-4 flex items-center shadow-sm shrink-0 z-10">
        <button onClick={() => router.back()} className="mr-3">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="w-[36px] h-[36px] bg-white/20 rounded-full flex items-center justify-center mr-3">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-bold text-white truncate">{boutiqueName}</h1>
          <p className="text-[12px] text-indigo-200">Tap to view info</p>
        </div>
      </div>

      {/* Context Selector */}
      {boutiqueOrders.length > 0 && (
        <div className="bg-white px-4 py-2 border-b border-gray-200 shrink-0 shadow-sm z-10 flex items-center gap-2">
          <span className="text-[12px] font-bold text-gray-500 uppercase shrink-0">Topic:</span>
          <select 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-[13px] py-1.5 px-2 outline-none text-[#0F172A] font-medium"
            value={contextSelected}
            onChange={e => setContextSelected(e.target.value)}
          >
            {boutiqueOrders.map(order => {
              const outfits = order.outfits || order.items || [];
              return outfits.map((outf: any) => {
                const oid = outf.id || outf.order_outfit_id;
                return (
                  <option key={`${order.id}_${oid}`} value={`${order.id}_${oid}`}>
                    {order.order_number} - {outf.name || 'Outfit'}
                  </option>
                );
              });
            })}
          </select>
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
          messages.map((msg, idx) => {
            const isCustomer = msg.sender_type === 'CUSTOMER';
            const showContext = idx === 0 || messages[idx-1].order_outfit_id !== msg.order_outfit_id;
            
            return (
              <div key={msg.id} className="flex flex-col">
                {showContext && (
                  <div className="flex justify-center mb-3 mt-2">
                    <span className="bg-white border border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {msg.order_number} • {msg.outfit_name}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
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
                      <p className={`text-[14px] leading-relaxed ${isCustomer ? 'text-white' : 'text-[#334155]'}`}>
                        {msg.message}
                      </p>
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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
            placeholder={contextSelected ? "Type a message..." : "Select a topic first..."}
            disabled={!contextSelected || sending}
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
        <button 
          onClick={handleSend}
          disabled={!inputText.trim() || !contextSelected || sending}
          className="p-3 bg-[#5B43EE] text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors shrink-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
