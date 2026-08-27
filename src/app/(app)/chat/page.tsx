'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface ChatThread {
  boutique_id: number;
  boutique_name: string;
  profile_icon_url: string | null;
  latest_message_text: string | null;
  latest_message_attachment: string | null;
  latest_message_timestamp: string;
}

export default function ChatListPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThreads() {
      if (!user?.mobile) return;
      try {
        const res = await api.get('/customer-portal/chat/threads', {
          params: { phone: user.mobile }
        });
        const data = res.data?.data || res.data;
        setThreads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch chat threads:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchThreads();
  }, [user?.mobile]);

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
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#5B43EE] pt-12 pb-4 px-4 flex items-center shadow-sm shrink-0">
        <button onClick={() => router.back()} className="mr-3">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[18px] font-bold text-white font-inter">Chats</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-[3px] border-[#5B43EE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Store className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-[16px] font-bold text-gray-500 font-inter mb-1">No chats yet</p>
            <p className="text-[14px] text-center max-w-[250px]">
              When you interact with a boutique, your messages will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((t) => (
              <Link 
                key={t.boutique_id} 
                href={`/chat/${t.boutique_id}`}
                className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-[50px] h-[50px] rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {t.profile_icon_url ? (
                    <img src={t.profile_icon_url} alt={t.boutique_name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-6 h-6 text-indigo-400" />
                  )}
                </div>
                
                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-[16px] font-bold text-[#0F172A] truncate">
                      {t.boutique_name}
                    </h3>
                    <span className="text-[12px] text-gray-400 whitespace-nowrap ml-2">
                      {formatTime(t.latest_message_timestamp)}
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-500 truncate">
                    {t.latest_message_text || (t.latest_message_attachment ? '📷 Image' : 'Started a conversation')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
