'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { User, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { URL_CUSTOMER_REGISTER } from '@/lib/env';

const COUNTRY_CODES = [{ code: "+91", label: "IN", flag: "🇮🇳" }, { code: "+1", label: "US", flag: "🇺🇸" }, { code: "+44", label: "UK", flag: "🇬🇧" }, { code: "+61", label: "AU", flag: "🇦🇺" }, { code: "+971", label: "AE", flag: "🇦🇪" }];
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  


  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expanding, setExpanding] = useState(false);
  
  const { login, token } = useAuthStore();

  useEffect(() => {
    if (token && !showSuccess) {
      setExpanding(true);
      setTimeout(() => {
        router.push('/home');
      }, 500);
    }
  }, [token, showSuccess, router]);



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
        mobile: countryCode === '+91' ? cleanedPhone : countryCode + cleanedPhone,
        email: email.trim(),
        pin: pin,
        state: '',
        city: ''
      });
      
      // Auto login after successful signup
      await login(countryCode === '+91' ? cleanedPhone : countryCode + cleanedPhone, pin);
      
      // No auto-redirect so they have time to read the banner. They will click to continue.
    } catch (err: any) {
      setIsLoading(false);
      const message = err.response?.data?.message || err.message || 'Failed to sign up';
      setValidationError(typeof message === 'string' ? message : message[0]);
    }
  };

  // End of submit handling

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url(/login_bg.png)' }} 
      />
      <div className="absolute inset-0 z-0 bg-black/15" />

      {/* Card */}
      <div className="w-full max-w-sm flex flex-col relative z-10 bg-white p-8 rounded-[24px] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex flex-col items-center text-center mb-8 shrink-0">
          <img src="/logo.png" alt="Sewvee Logo" className="w-32 h-12 object-contain mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {step === 1 ? 'Sign Up' : 'One Last Step'}
          </h1>
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
              <div className="flex items-center h-12 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setValidationError(''); }}
                  placeholder="Your name"
                  className="flex-1 min-w-0 bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                Mobile Number
              </label>
              <div className="flex items-center h-12 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0 hidden sm:block" />
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="shrink-0 min-w-[80px] bg-transparent text-[14px] font-medium text-slate-900 outline-none mr-2 pr-1 cursor-pointer"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <div className="w-[1px] h-5 bg-slate-200 mr-2"></div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setValidationError(''); }}
                  maxLength={15}
                  placeholder="Mobile number"
                  className="flex-1 min-w-0 bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                Email Address
              </label>
              <div className="flex items-center h-12 px-4 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all">
                <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setValidationError(''); }}
                  placeholder="Your email"
                  className="flex-1 min-w-0 bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>



            {validationError && (
              <p className="text-red-500 text-sm font-semibold mb-4 text-center">
                {validationError}
              </p>
            )}

            <Button onClick={nextStep} fullWidth size="lg" className="mb-4 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold">
              Next Step
            </Button>
            
            <div className="flex flex-row justify-center items-center mt-6">
              <span className="text-[13px] text-slate-500 font-medium">Already have an account? </span>
              <button type="button" onClick={() => router.push('/login')} className="text-[13px] text-[#5B43EE] font-semibold ml-1 hover:underline">
                Log in instead
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

            <Button onClick={handleSignup} loading={isLoading} fullWidth size="lg" className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold active:scale-95 transition-transform">
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
      
      {/* Required for hide-scrollbar utility if not defined elsewhere */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

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
