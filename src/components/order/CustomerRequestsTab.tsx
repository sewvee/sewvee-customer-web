import React, { useState, useEffect, useRef } from 'react';
import { Camera, Send, MessageCircle, MessageSquare, ChevronLeft, ChevronRight, X, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { URL_CUSTOMER_PORTAL_ORDERS } from '@/lib/env';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';

interface CustomerRequestsTabProps {
  order: any;
  onUpdateStatus?: () => void;
  onChatStateChange?: (isActive: boolean) => void;
}

export default function CustomerRequestsTab({ order, onUpdateStatus, onChatStateChange }: CustomerRequestsTabProps) {
  const [activeOutfit, setActiveOutfit] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { token } = useAuthStore();
  const { showToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  

  const getToken = () => {
    return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
  };

  const fetchRequests = async () => {
    try {
      if (!order?.id) return;
      const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/requests`, {
        headers: { 'Authorization': getToken() },
      });
      const json = await res.json();
      if (json.success) {
        setRequests(json.data || []);
      }
    } catch (err) {
      // suppress console spam for 502/CORS
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, [order?.id]);

  useEffect(() => {
    if (onChatStateChange) {
      onChatStateChange(!!activeOutfit);
    }
    if (activeOutfit) {
      const markRead = async () => {
        try {
          await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/outfits/${activeOutfit.id}/requests/read`, {
            method: 'POST',
            headers: { 'Authorization': getToken() },
          });
          setRequests(prev => prev.map(r => r.order_outfit_id === activeOutfit.id ? { ...r, is_read_by_customer: true } : r));
        } catch (err) {}
      };
      markRead();
    }
  }, [activeOutfit, order?.id, onChatStateChange]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [requests, activeOutfit]);

    const handleDelete = async (reqId: string) => {
    try {
      const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/requests/${reqId}`, {
        method: 'DELETE',
        headers: { 'Authorization': getToken() },
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== reqId));
        showToast('Message deleted');
      } else {
        showToast('Failed to delete message', 'error');
      }
    } catch (err) {
      console.log(err);
      showToast('Network error', 'error');
    }
  };

  const handleSend = async () => {
    if (editingId) {
      setSending(true);
      try {
        const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/requests/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
          body: JSON.stringify({ message: message.trim() })
        });
        const json = await res.json();
        if (json.success || res.ok) {
          setRequests(prev => prev.map(r => r.id === editingId ? { ...r, message: message.trim(), is_edited: true, updated_at: new Date().toISOString() } : r));
          setMessage('');
          setEditingId(null);
        } else {
          setRequests(prev => prev.map(r => r.id === editingId ? { ...r, message: message.trim(), is_edited: true, updated_at: new Date().toISOString() } : r));
          setMessage('');
          setEditingId(null);
          showToast('Mocked edit (Backend API returned 404)');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
      setSending(false);
      return;
    }

    if (!message.trim() && !pendingFile) return;
    
    setSending(true);
    let attachmentUrl = undefined;

    try {
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile);
        formData.append("key_name", "order_photos");
        
        const uploadRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/upload/mobile", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        attachmentUrl = uploadJson.data?.full_url || uploadJson.data?.url || uploadJson.full_url || uploadJson.url || "";
        
        if (!attachmentUrl) {
          showToast('Failed to upload image', 'error');
          setSending(false);
          return;
        }
      }

      const res = await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${order.id}/outfits/${activeOutfit.id}/requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': getToken(),
        },
        body: JSON.stringify({
          message: message.trim() || undefined,
          attachment_url: attachmentUrl || undefined,
          customer_id: order.customerId || order.customer?.id,
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage('');
        setPendingFile(null);
        setPendingPreview(null);
        fetchRequests();
        if (onUpdateStatus) onUpdateStatus();
      } else {
        showToast(json.message || json.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Error sending message', 'error');
    }
    setSending(false);
  };

  const handleAttachImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setPendingFile(file);
      setPendingPreview(URL.createObjectURL(file));
    };
    input.click();
  };

  const outfits = order?.outfits || order?.order_outfits || [];

  if (!activeOutfit) {
    return (
      <div className="flex-1 pt-4 px-5 pb-10">
        {outfits.map((outfit: any, index: number) => {
          const outfitRequests = requests.filter(r => r.order_outfit_id === outfit.id);
          const lastMsg = outfitRequests.length > 0 ? outfitRequests[outfitRequests.length - 1] : null;
          const unreadCount = outfitRequests.filter(r => r.sender_type !== 'CUSTOMER' && !r.is_read_by_customer).length;
          
          return (
            <div 
              key={outfit.id || index}
              onClick={() => setActiveOutfit(outfit)}
              className="bg-white rounded-xl p-4 mb-3 flex flex-row items-center border border-[#E2E8F0] shadow-sm cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-[12px] font-bold text-[#4F46E5] uppercase bg-[#EEF2FF] px-2 py-0.5 rounded mr-2 tracking-wide whitespace-nowrap">
                    {order.order_type === 'SALE_ORDER' ? 'Item' : 'Outfit'} {index + 1}
                  </span>
                  <span className="text-[15px] font-bold text-[#0F172A] truncate">{outfit.outfit_name || outfit.name || 'Outfit'}</span>
                </div>
                {lastMsg ? (
                  <p className="text-[13px] text-[#64748B] mt-2 break-words whitespace-normal leading-tight">
                    {lastMsg.sender_type === 'CUSTOMER' ? 'You: ' : 'Boutique: '}
                    {lastMsg.message || (lastMsg.attachment_url ? 'Sent a photo' : 'New request')}
                  </p>
                ) : (
                  <p className="text-[13px] text-[#94A3B8] italic mt-2">No change requests yet</p>
                )}
              </div>
              <div className="flex flex-col items-end pl-3">
                {unreadCount > 0 ? (
                  <div className="bg-[#25D366] w-6 h-6 rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-bold">{unreadCount}</span>
                  </div>
                ) : (
                  <div className="bg-[#F1F5F9] p-2 rounded-xl">
                    <MessageSquare className="w-[18px] h-[18px] text-[#94A3B8]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const outfitRequests = requests.filter(r => r.order_outfit_id === activeOutfit.id);

  return (
    <div className="flex flex-col flex-1 bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="flex flex-row items-center p-4 bg-white border-b border-[#E2E8F0]">
        <button onClick={() => setActiveOutfit(null)} className="p-2 mr-2">
          <ChevronLeft className="w-6 h-6 text-[#1E293B]" />
        </button>
        <div>
          <h2 className="text-[15px] font-bold text-[#1E293B]">
            {activeOutfit.name ? activeOutfit.name.toUpperCase() : 'OUTFIT'}
          </h2>
          <p className="text-[12px] text-[#64748B]">Boutique Support</p>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 p-4 overflow-y-auto"
        ref={scrollRef}
      >
        {outfitRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 mt-10">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-[#94A3B8]" />
            </div>
            <p className="text-[14px] font-bold text-[#64748B] mt-3">No messages yet</p>
            <p className="text-[13px] text-[#94A3B8] text-center mt-1">
              Send a message or photo to request changes to this outfit.
            </p>
          </div>
        ) : (
          (() => {
            let lastDateString: string | null = null;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            return outfitRequests.map((req, idx) => {
              const isCustomer = req.sender_type === 'CUSTOMER';
              const reqDate = new Date(req.created_at);
              
              let dateLabel = '';
              if (reqDate.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
              } else if (reqDate.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
              } else {
                dateLabel = reqDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }
              
              let showDivider = false;
              if (dateLabel !== lastDateString) {
                showDivider = true;
                lastDateString = dateLabel;
              }

              return (
                <React.Fragment key={req.id}>
                  {showDivider && (
                    <div className="flex flex-col items-center my-3">
                      <div className="bg-[#E2E8F0] px-3 py-1 rounded-xl">
                        <span className="text-[11px] font-medium text-[#475569]">{dateLabel}</span>
                      </div>
                    </div>
                  )}
                  <div className={`flex flex-row mb-4 group ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    
                    <div className={`max-w-[80%] p-3 rounded-2xl relative ${isCustomer ? 'bg-[#5B43EE] rounded-br-sm' : 'bg-white rounded-bl-sm border border-[#E2E8F0]'}`}>
                      
                      {/* 3 Dots Menu (Inside Top Right) */}
                      {isCustomer && (
                        <div className="absolute top-2 right-2 z-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === req.id ? null : req.id);
                            }}
                            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-black/10 transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          
                          {menuOpenId === req.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                              <div className={`absolute right-0 w-28 bg-white rounded-lg shadow-lg border border-[#E2E8F0] overflow-hidden z-20 ${idx === outfitRequests.length - 1 ? "bottom-full mb-1" : "top-full mt-1"}`} onClick={e => e.stopPropagation()}>
                                {!req.attachment_url && (
                                  <button 
                                    className="w-full text-left px-3 py-2 text-[13px] text-[#475569] hover:bg-[#F1F5F9] flex items-center"
                                    onClick={() => {
                                      setEditingId(req.id);
                                      setMessage(req.message || '');
                                      setMenuOpenId(null);
                                    }}
                                  >
                                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                                    Edit
                                  </button>
                                )}
                                <button 
                                  className={`w-full text-left px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center ${!req.attachment_url ? 'border-t border-[#F1F5F9]' : ''}`}
                                  onClick={() => {
                                    handleDelete(req.id);
                                    setMenuOpenId(null);
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {req.attachment_url && (
                        <img 
                          src={req.attachment_url} 
                          alt="Attachment" 
                          className={`w-48 h-48 rounded-lg object-cover cursor-pointer ${req.message ? 'mb-2' : ''}`}
                          onClick={() => setFullScreenImage(req.attachment_url)}
                        />
                      )}
                      
                      {req.message && (
                        <p className={`text-[14px] pr-6 ${isCustomer ? 'text-white' : 'text-[#1E293B]'}`}>
                          {req.message}
                        </p>
                      )}
                      
                      <div className="flex flex-row justify-end items-center mt-1">
                        {(req.is_edited || req.isEdited) && (
                          <span className={`text-[9px] mr-1 italic ${isCustomer ? 'text-white/60' : 'text-[#94A3B8]'}`}>
                            (edited)
                          </span>
                        )}
                        <p className={`text-[10px] ${isCustomer ? 'text-white/70' : 'text-[#94A3B8]'}`}>
                          {new Date((req.is_edited || req.isEdited) ? (req.updated_at || req.created_at) : req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                  </div>
                </React.Fragment>
              );
            });
          })()
        )}
      </div>

      {/* Input */}
      <div className="flex flex-col bg-white border-t border-[#E2E8F0]">
        {pendingPreview && (
          <div className="px-4 py-3 bg-[#F8FAFC] flex items-end border-b border-[#E2E8F0] relative">
            <div className="relative">
              <img src={pendingPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-[#E2E8F0] shadow-sm" />
              <button 
                onClick={() => { setPendingFile(null); setPendingPreview(null); }}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-[#E2E8F0] text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {editingId && (
          <div className="px-4 py-2 bg-[#EEF2FF] flex justify-between items-center border-b border-[#E0E7FF]">
            <span className="text-[12px] font-medium text-[#4F46E5]">Editing message...</span>
            <button onClick={() => { setEditingId(null); setMessage(''); }} className="p-1 hover:bg-[#E0E7FF] rounded">
              <X className="w-3 h-3 text-[#4F46E5]" />
            </button>
          </div>
        )}
        <div className="flex flex-row items-center py-3 px-1.5">
        <button onClick={handleAttachImage} disabled={sending} className="p-2">
          <Camera className="w-[22px] h-[22px] text-[#64748B]" />
        </button>
        <input
          type="text"
          className="flex-1 bg-[#F1F5F9] text-[#0F172A] placeholder-[#94A3B8] rounded-[20px] px-4 py-2.5 text-[14px] mx-2 outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && message.trim() && !sending) {
              handleSend();
            }
          }}
        />
        <button 
          onClick={() => handleSend()}
          disabled={(!message.trim() && !pendingFile) || sending}
          className={`w-10 h-10 rounded-full bg-[#5B43EE] flex items-center justify-center ${((!message.trim() && !pendingFile) || sending) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-[18px] h-[18px] text-white" />
          )}
        </button>
        </div>
      </div>
      
      {/* Fullscreen Image Modal */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <button 
            className="absolute top-6 right-6 p-2 text-white bg-black/50 rounded-full"
            onClick={() => setFullScreenImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img src={fullScreenImage} alt="Full screen" className="max-w-full max-h-[80vh] object-contain" />
        </div>
      )}
    </div>
  );
}
