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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <img src="/logo.png" alt="Sewvee Logo" className="w-32 h-32 object-contain mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sewvee Customer</h1>
        <p className="text-gray-500 mb-10 text-[17px]">
          Enter your phone number to track orders, share designs, and shop
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-8 text-left">
            <label className="block text-[18px] font-semibold text-gray-900 mb-2">
              Phone Number<span className="text-red-500"> *</span>
            </label>
            <div className="flex items-center h-14 px-4 rounded-xl border border-gray-200 bg-white focus-within:border-[#5B43EE] focus-within:ring-1 focus-within:ring-[#5B43EE] transition-all">
              <span className="text-gray-500 mr-3 font-medium text-lg">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, ''));
                  setValidationError('');
                  clearError();
                }}
                maxLength={10}
                placeholder="10 Digit Mobile Number"
                className="flex-1 bg-transparent text-lg font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
                disabled={loading}
              />
            </div>
            {(validationError || error) && (
              <p className="text-red-500 text-sm font-semibold mt-2 ml-1">
                {validationError || error}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Login →
          </Button>
        </form>
      </div>
    </div>
  );
}
