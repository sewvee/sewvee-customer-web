'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { URL_CUSTOMER_RESET_PIN } from '@/lib/env';

function ResetPinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Email is required');
    if (!otp) return setError('OTP is required');
    if (newPin.length !== 4) return setError('New PIN must be 4 digits');

    setLoading(true);
    try {
      const res = await api.post(URL_CUSTOMER_RESET_PIN, { email, otp, newPin });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(res.data?.message || 'Failed to reset PIN');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 bg-white p-8 rounded-[24px] shadow-2xl border border-gray-100">
      {!success && (
        <div className="w-full flex justify-start mb-4">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 transition flex items-center justify-center p-1 rounded-full hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>
      )}
      
      <img src="/logo.png" alt="Sewvee Logo" className="w-32 h-12 object-contain mb-6" />
      
      {success ? (
        <div className="py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">PIN Reset Successful!</h1>
          <p className="text-gray-500 text-[14px]">Redirecting to login...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify & Reset</h1>
          <p className="text-gray-500 mb-6 text-[14px] leading-relaxed">
            Enter the OTP sent to your email and choose a new 4-digit PIN.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4 text-left">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                OTP Verification Code
              </label>
              <div className={`flex items-center h-14 px-4 rounded-xl border bg-white transition-all ${error && !otp ? 'border-red-500' : 'border-slate-200 focus-within:border-[#5B43EE]'}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  placeholder="Enter OTP"
                  className="flex-1 bg-transparent text-[15px] tracking-[0.2em] font-medium text-slate-900 outline-none placeholder:tracking-normal placeholder:text-slate-400 placeholder:font-normal"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-6 text-left">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                New 4-Digit PIN
              </label>
              <div className={`flex items-center h-14 px-4 rounded-xl border bg-white transition-all ${error && newPin.length !== 4 ? 'border-red-500' : 'border-slate-200 focus-within:border-[#5B43EE]'}`}>
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  maxLength={4}
                  placeholder="••••"
                  className="flex-1 bg-transparent text-xl font-medium tracking-[0.5em] text-center text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
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
              Reset PIN
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPinPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/login_bg.png)' }} />
      <div className="absolute inset-0 z-0 bg-black/15" />
      <Suspense fallback={<div className="relative z-10 p-8"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}>
        <ResetPinContent />
      </Suspense>
    </div>
  );
}
