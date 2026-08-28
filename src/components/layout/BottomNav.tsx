'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { useEffect } from 'react';
import { LayoutGrid, ClipboardList, ShoppingBag, User, MessageCircle } from 'lucide-react';

const TABS = [
  { href: '/home', label: 'Home', Icon: LayoutGrid },
  { href: '/orders', label: 'Orders', Icon: ClipboardList },
  { href: '/chat', label: 'Chat', Icon: MessageCircle },
  { href: '/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/profile', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const { unreadCount, fetchThreads } = useChatStore();
  const cart = useShopStore(s => s.cart);
  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  useEffect(() => {
    if (user?.mobile) {
      fetchThreads(user.mobile);
    }
  }, [user?.mobile, fetchThreads]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1E293B] border-t border-[#334155] safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
            >
              <div
                className={`px-3 py-1.5 rounded-full transition-all ${
                  active ? 'bg-[#5B43EE]' : 'bg-transparent'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={active ? 'text-white' : 'text-slate-400'}
                  />
                  {href === '/chat' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {href === '/shop' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-white">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  active ? 'text-white' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
