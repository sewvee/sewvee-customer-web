'use client';
import { useToastStore } from '@/hooks/useToast';
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from 'lucide-react';

const STYLES = {
  success: {
    bg: 'bg-[#0F172A]',
    icon: <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 shrink-0" />,
  },
  error: {
    bg: 'bg-[#0F172A]',
    icon: <XCircle className="w-[18px] h-[18px] text-red-400 shrink-0" />,
  },
  info: {
    bg: 'bg-[#0F172A]',
    icon: <Info className="w-[18px] h-[18px] text-sky-400 shrink-0" />,
  },
  warning: {
    bg: 'bg-[#0F172A]',
    icon: <AlertTriangle className="w-[18px] h-[18px] text-amber-400 shrink-0" />,
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 w-max max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const style = STYLES[t.type as keyof typeof STYLES] ?? STYLES.info;
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.18)] ${style.bg} animate-in slide-in-from-top-3 fade-in duration-200`}
          >
            {style.icon}
            <p className="text-[13px] font-semibold text-white whitespace-nowrap">
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-1 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
