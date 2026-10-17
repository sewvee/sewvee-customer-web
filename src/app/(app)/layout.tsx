'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (isClient && !token) {
      router.replace('/signup');
    }
  }, [token, router, isClient]);

  if (!isClient || !token) return null;

  const isMainTab = ['/home', '/orders', '/chat', '/shop', '/profile'].includes(pathname);
  const isShop = pathname === '/shop';

  return (
    <div className={`min-h-[100dvh] ${isShop ? 'h-[100dvh] overflow-hidden pb-16' : (isMainTab ? 'pb-20' : '')} flex flex-col`}>
      <main className={`flex-1 max-w-lg mx-auto w-full bg-[#F8FAFC] ${isShop ? 'h-full flex flex-col overflow-hidden min-h-0' : (isMainTab ? 'min-h-[calc(100vh-5rem)]' : 'min-h-[100dvh]')}`}>
        {children}
      </main>
      {isMainTab && <BottomNav />}
    </div>
  );
}
