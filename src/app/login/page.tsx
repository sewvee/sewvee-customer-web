'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [validationError, setValidationError] = useState('');
  const [expanding, setExpanding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, loading, error, token, clearError } = useAuthStore();

  useEffect(() => {
    if (token && !showSuccess) {
      setExpanding(true);
      setTimeout(() => {
        router.push('/home');
      }, 500); // Wait for the booming circle to expand before redirecting
    }
  }, [token, showSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length !== 10 || !/^[6-9][0-9]{9}$/.test(cleaned)) {
      setValidationError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (pin.length !== 4) {
      setValidationError('Please enter a 4-digit PIN');
      return;
    }

    await login(cleaned, pin);
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
        <img src="/logo.png" alt="Sewvee Logo" className="w-32 h-12 object-contain mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sewvee Customer</h1>
        <p className="text-gray-500 mb-8 text-[15px] leading-relaxed">
          Log in to access your boutique orders
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4 text-left">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
              Mobile Number
            </label>
            <div className={`flex items-center h-14 px-4 rounded-xl border bg-white transition-all ${(validationError && !pin) || error ? 'border-red-500' : 'border-slate-200 focus-within:border-[#5B43EE]'}`}>
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
          </div>

          <div className="mb-6 text-left">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
              4-Digit PIN
            </label>
            <div className={`flex items-center h-14 px-4 rounded-xl border bg-white transition-all ${(validationError && pin.length !== 4) || error ? 'border-red-500' : 'border-slate-200 focus-within:border-[#5B43EE]'}`}>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/[^0-9]/g, ''));
                  setValidationError('');
                  clearError();
                }}
                maxLength={4}
                placeholder="••••"
                className="flex-1 bg-transparent text-xl font-medium tracking-[0.5em] text-center text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                disabled={loading}
              />
            </div>
            {(validationError || error) && (
              <p className="text-red-500 text-sm font-semibold mt-2 ml-1 text-center">
                {validationError || error}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold relative overflow-hidden">
            Continue →
          </Button>
          
          <div className="flex flex-row justify-center items-center">
            <span className="text-[13px] text-slate-500 font-medium">Don't have an account? </span>
            <button type="button" onClick={() => router.push('/signup')} className="text-[13px] text-[#5B43EE] font-semibold ml-1 hover:underline">
              Sign up now
            </button>
          </div>
        </form>
      </div>

      {/* Booming Circle Animation */}
      <div 
        className={`fixed inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-300 ${expanding ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
          className="bg-[#FBF6F0] rounded-full transition-transform duration-700 ease-in-out"
          style={{
            width: '100vmax',
            height: '100vmax',
            transform: expanding ? 'scale(2)' : 'scale(0)',
          }}
        />
      </div>
    </div>
  );
}
