'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { User, Phone, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { URL_CUSTOMER_REGISTER } from '@/lib/env';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { login, token, clearError } = useAuthStore();

  useEffect(() => {
    if (token && !showSuccess) router.replace('/home');
  }, [token, router, showSuccess]);

  const nextStep = () => {
    setValidationError('');
    
    if (!name.trim()) return setValidationError('Please enter your name');
    
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10 || !/^[6-9][0-9]{9}$/.test(cleanedPhone)) {
      return setValidationError('Please enter a valid 10-digit mobile number');
    }
    
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return setValidationError('Please enter a valid email address');
    }

    setStep(2);
  };

  const handleSignup = async () => {
    setValidationError('');
    
    if (pin.length !== 4) return setValidationError('Please enter a 4-digit PIN');
    if (pin !== confirmPin) return setValidationError('PINs do not match');

    setIsLoading(true);
    
    try {
      const cleanedPhone = phone.replace(/[^0-9]/g, '');
      await api.post(URL_CUSTOMER_REGISTER, {
        name: name.trim(),
        mobile: cleanedPhone,
        email: email.trim(),
        pin: pin
      });
      
      // Auto login after successful signup
      await login(cleanedPhone, pin);
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/home');
      }, 2000);
      
    } catch (err: any) {
      setIsLoading(false);
      const message = err.response?.data?.message || err.message || 'Failed to sign up';
      setValidationError(typeof message === 'string' ? message : message[0]);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-100/40 mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>
        
        <div className="z-10 flex flex-col items-center justify-center w-full max-w-sm">
          {/* Animated Success Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }}></div>
            <div className="relative w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight text-center">
            Welcome to Sewvee!
          </h1>
          
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-emerald-100/50 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            <p className="text-slate-600 font-medium text-lg">Setting up your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url(/login_bg.png)' }} 
      />
      <div className="absolute inset-0 z-0 bg-black/15" />

      {/* Card */}
      <div className="w-full max-w-sm flex flex-col relative z-10 bg-white p-8 rounded-[24px] shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo.png" alt="Sewvee Logo" className="w-32 h-12 object-contain mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign Up</h1>
          <p className="text-gray-500 text-[14px] font-medium">
            {step === 1 ? 'Create your Sewvee Customer account' : 'Set up a secure PIN'}
          </p>
        </div>

        {step === 1 ? (
          <div className="w-full">
            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                First Name
              </label>
              <div className="flex items-center h-14 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <User className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setValidationError(''); }}
                  placeholder="Your name"
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                Mobile Number
              </label>
              <div className="flex items-center h-14 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <Phone className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setValidationError(''); }}
                  maxLength={10}
                  placeholder="10-digit number"
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                Email Address
              </label>
              <div className="flex items-center h-14 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <Mail className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setValidationError(''); }}
                  placeholder="Your email"
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {validationError && (
              <p className="text-red-500 text-sm font-semibold mb-4 text-center">
                {validationError}
              </p>
            )}

            <Button onClick={nextStep} fullWidth size="lg" className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold">
              Next Step
            </Button>
            
            <div className="flex flex-row justify-center items-center">
              <span className="text-[13px] text-slate-500 font-medium">Already have an account? </span>
              <button type="button" onClick={() => router.push('/login')} className="text-[13px] text-[#5B43EE] font-semibold ml-1 hover:underline">
                Log in
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                4-Digit PIN
              </label>
              <div className="flex items-center h-14 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/[^0-9]/g, '')); setValidationError(''); }}
                  maxLength={4}
                  placeholder="••••"
                  className="flex-1 bg-transparent text-xl font-medium tracking-[0.5em] text-center text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                Confirm PIN
              </label>
              <div className="flex items-center h-14 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => { setConfirmPin(e.target.value.replace(/[^0-9]/g, '')); setValidationError(''); }}
                  maxLength={4}
                  placeholder="••••"
                  className="flex-1 bg-transparent text-xl font-medium tracking-[0.5em] text-center text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            {validationError && (
              <p className="text-red-500 text-sm font-semibold mb-4 text-center">
                {validationError}
              </p>
            )}

            <Button onClick={handleSignup} loading={isLoading} fullWidth size="lg" className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold">
              Let's get started
            </Button>
            
            <div className="flex flex-row justify-center items-center">
              <button type="button" onClick={() => setStep(1)} className="flex items-center text-[13px] text-slate-500 font-semibold hover:text-[#5B43EE]">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
