'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MessageSquarePlus, ShoppingBag, MoreVertical, Pin, Star, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useChatStore } from '@/store/chatStore';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface ChatThread {
  order_id: number;
  order_number: string;
  order_type: string;
  boutique_id: number;
  boutique_name: string;
  profile_icon_url: string | null;
  latest_message_text: string | null;
  latest_message_attachment: string | null;
  latest_message_timestamp: string;
  unread_count?: number;
}

export default function ChatListPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
    const { threads, loading, fetchThreads } = useChatStore();

  // New Chat Bottom Sheet State
  const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false);
  const [selectedThreadForOptions, setSelectedThreadForOptions] = useState<any>(null);
  const { orders, refreshOrders } = useOrdersStore();

  useEffect(() => {
    if (user?.mobile) {
      fetchThreads(user.mobile);
    }
  }, [user?.mobile, fetchThreads]);

  // Always refresh on mount — ensures outfit counts reflect latest admin changes
  useEffect(() => {
    if (user?.mobile) {
      refreshOrders(user.mobile);
    }
  }, [user?.mobile, refreshOrders]);

  const formatTime = (isoStr: string) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col relative">
      {/* Header */}
      <div className="bg-[#5B43EE] pt-12 pb-4 px-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => router.back()} className="mr-3">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[18px] font-bold text-white font-inter">Chats</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white pb-20">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-[3px] border-[#5B43EE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-6">
            <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-[16px] font-bold text-gray-500 font-inter mb-1">No chats yet</p>
            <p className="text-[14px] text-center">
              When you message about an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((t) => (
              <Link 
                key={t.order_id} 
                href={'/chat/' + t.order_id}
                className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-[50px] h-[50px] rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {t.profile_icon_url ? (
                    <img src={t.profile_icon_url} alt={t.boutique_name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-indigo-400" />
                  )}
                </div>
                
                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className={`text-[14.5px] truncate ${t.unread_count > 0 ? 'font-bold text-[#0F172A]' : 'font-medium text-[#475569]'}`}>
                        {t.boutique_name}
                      </h3>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        t.order_number?.startsWith('ENQ-')
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        #{t.order_number}
                      </span>
                    </div>
                    <div className="flex items-center ml-2 shrink-0">
                      <span className={`text-[12px] whitespace-nowrap mr-1 ${t.unread_count > 0 ? 'text-[#5B43EE] font-medium' : 'text-gray-400'}`}>
                        {formatTime(t.latest_message_timestamp)}
                      </span>
                      <button 
                        onClick={(e) => { e.preventDefault(); setSelectedThreadForOptions(t); }}
                        className="p-1 -mr-1 rounded-full hover:bg-gray-100 text-gray-400"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className={`text-[13px] truncate ${t.unread_count > 0 ? 'text-[#1E293B] font-semibold' : 'text-[#64748B]'}`}>
                       {(() => {
                         const txt = t.latest_message_text;
                         if (txt && txt.includes('[ACTION_REQUIRED: PHOTO_REQUEST]')) return '📸 Please upload reference photos';
                         if (txt && txt.includes('[ACTION_REQUIRED: FEEDBACK]')) return '⭐ We would love your feedback on this order!';
                         if (t.latest_message_attachment) return txt ? txt : '📷 Image';
                         return txt || 'Started a conversation';
                       })()}
                    </p>
                    {t.unread_count ? (
                      <span className="bg-[#5B43EE] text-white text-[11px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full ml-2 shrink-0">
                        {t.unread_count}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for New Chat */}
      <button 
        onClick={() => setNewChatDrawerOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#5B43EE] rounded-full shadow-[0_4px_14px_rgba(91,67,238,0.4)] flex items-center justify-center z-10 hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageSquarePlus className="w-6 h-6 text-white" />
      </button>

      {/* New Chat Selection Drawer */}
      <BottomSheet open={newChatDrawerOpen} onClose={() => setNewChatDrawerOpen(false)}>
        <div className="p-2 pb-6">
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="text-[18px] font-bold text-[#0F172A]">New Chat</h3>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[14px] text-gray-400">You don't have any active orders.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto px-2">
              {orders.map(o => {
                const orderType = (o as any).order_type || '';
                const typeLabel = orderType === 'TAILORING' || orderType === 'STITCHING_REQUEST' ? 'Stitching' : orderType === 'SALE_ORDER' ? 'Readymade' : 'Pre-order';
                const typeColor = typeLabel === 'Stitching' ? 'bg-purple-50 text-purple-700' : typeLabel === 'Readymade' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700';
                return (
                  <button
                    key={o.id}
                    onClick={() => { router.push('/chat/' + o.id); setNewChatDrawerOpen(false); }}
                    className="w-full text-left px-4 py-3.5 bg-white hover:bg-[#F8FAFC] rounded-2xl flex items-center transition-colors border border-[#E2E8F0] hover:border-[#5B43EE]/30 hover:shadow-sm"
                  >
                    <div className="w-11 h-11 bg-[#EEF2FF] rounded-full flex items-center justify-center mr-3 shrink-0">
                      <ShoppingBag className="w-5 h-5 text-[#5B43EE]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-bold text-[#0F172A]">{o.order_number || o.billNo || ('Order #' + o.id)}</span>
                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + typeColor}>{typeLabel}</span>
                      </div>
                      <span className="text-[12px] text-[#64748B] truncate block">{o.boutiqueName || 'Boutique'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Thread Options Drawer */}
      <BottomSheet open={!!selectedThreadForOptions} onClose={() => setSelectedThreadForOptions(null)}>
        <div className="p-2 pb-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
              {selectedThreadForOptions?.profile_icon_url ? (
                <img src={selectedThreadForOptions.profile_icon_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0F172A]">{selectedThreadForOptions?.boutique_name}</h3>
              <p className="text-[12px] text-gray-500">#{selectedThreadForOptions?.order_number}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button onClick={() => setSelectedThreadForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Mark as {selectedThreadForOptions?.unread_count ? 'read' : 'unread'}</span>
            </button>
            <button onClick={() => setSelectedThreadForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <Pin className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Pin chat</span>
            </button>
            <button onClick={() => setSelectedThreadForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <Star className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Add to favorites</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
