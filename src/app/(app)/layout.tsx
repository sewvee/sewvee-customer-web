'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-lg mx-auto bg-[#F5F3FF] min-h-[calc(100vh-5rem)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
