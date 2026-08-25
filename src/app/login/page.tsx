'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, loading, error, token, clearError } = useAuthStore();

  useEffect(() => {
    if (token) router.replace('/home');
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length !== 10 || !/^[6-9][0-9]{9}$/.test(cleaned)) {
      setValidationError('Please enter a valid 10-digit mobile number');
      return;
    }

    await login(cleaned);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url(/login_bg.png)' }} 
      />
      <div className="absolute inset-0 z-0 bg-black/15" />

      {/* Login Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 bg-white p-8 rounded-[24px] shadow-2xl border border-gray-100">
        <img src="/logo.png" alt="Sewvee Logo" className="w-24 h-24 object-contain mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sewvee Customer</h1>
        <p className="text-gray-500 mb-8 text-[15px] leading-relaxed">
          Log in to access your boutique orders
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6 text-left">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
              Mobile Number
            </label>
            <div className={`flex items-center h-14 px-4 rounded-xl border bg-white transition-all ${validationError || error ? 'border-red-500' : 'border-slate-200 focus-within:border-[#5B43EE]'}`}>
              <span className="text-slate-400 mr-2 font-medium text-lg">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, ''));
                  setValidationError('');
                  clearError();
                }}
                maxLength={10}
                placeholder="10-digit number"
                className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                disabled={loading}
              />
            </div>
            {(validationError || error) && (
              <p className="text-red-500 text-sm font-semibold mt-2 ml-1 text-center">
                {validationError || error}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold">
            Continue →
          </Button>
          
          <div className="flex flex-row justify-center items-center">
            <span className="text-[13px] text-slate-500 font-medium">Don't have an account? </span>
            <button type="button" onClick={() => alert('Enter your mobile number and continue to sign up')} className="text-[13px] text-[#5B43EE] font-semibold ml-1 hover:underline">
              Sign up now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
