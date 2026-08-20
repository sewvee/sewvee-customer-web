'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Folder, ShoppingBag, User } from 'lucide-react';

const TABS = [
  { href: '/home', label: 'Home', Icon: LayoutGrid },
  { href: '/gallery', label: 'Gallery', Icon: Folder },
  { href: '/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/profile', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
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
                <Icon
                  size={22}
                  className={active ? 'text-white' : 'text-slate-400'}
                />
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
