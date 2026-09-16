'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { URL_CUSTOMER_FORGOT_PIN } from '@/lib/env';

export default function ForgotPinPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(URL_CUSTOMER_FORGOT_PIN, { email });
      if (res.data?.success) {
        // Pass email to reset-pin page
        router.push(`/reset-pin?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.data?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/login_bg.png)' }} />
      <div className="absolute inset-0 z-0 bg-black/15" />

      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 bg-white p-8 rounded-[24px] shadow-2xl border border-gray-100">
        <div className="w-full flex justify-start mb-4">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 transition flex items-center justify-center p-1 rounded-full hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>
        
        <img src="/logo.png" alt="Sewvee Logo" className="w-32 h-12 object-contain mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset PIN</h1>
        <p className="text-gray-500 mb-8 text-[14px] leading-relaxed">
          Enter your registered email to receive an OTP
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6 text-left">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
              Email Address
            </label>
            <div className={`flex items-center h-14 px-4 rounded-xl border bg-white transition-all ${error ? 'border-red-500' : 'border-slate-200 focus-within:border-[#5B43EE]'}`}>
              <svg className="w-5 h-5 text-slate-400 mr-3 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm font-semibold mt-2 ml-1 text-center">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold">
            Send Verification Email
          </Button>
        </form>
      </div>
    </div>
  );
}
