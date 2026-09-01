'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { User, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { 
  URL_CUSTOMER_REGISTER, 
  URL_LOCATION_COUNTRIES, 
  URL_LOCATION_STATES, 
  URL_LOCATION_CITIES 
} from '@/lib/env';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Location state
  const [statesList, setStatesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');

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

  // Fetch States on Mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        const countriesRes = await api.get(URL_LOCATION_COUNTRIES);
        if (countriesRes.data?.data?.length > 0) {
          // Specifically find India, fallback to 101 if not found by name
          const india = countriesRes.data.data.find((c: any) => c.countryName === 'India' || c.iso === 'IND');
          const defaultCountryId = india ? india.countryId : countriesRes.data.data[0].countryId;
          
          const statesRes = await api.get(`${URL_LOCATION_STATES}?countryId=${defaultCountryId}`);
          setStatesList(statesRes.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch location data", error);
      }
    };
    initLocation();
  }, []);

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStateId(val);
    setCityId('');
    setCitiesList([]);
    setValidationError('');
    if (val) {
      try {
        const res = await api.get(`${URL_LOCATION_CITIES}?stateId=${val}`);
        setCitiesList(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch cities", error);
      }
    }
  };

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

    if (!stateId) return setValidationError('Please select a state');
    if (!cityId) return setValidationError('Please select a city');

    setStep(2);
  };

  const handleSignup = async () => {
    setValidationError('');
    
    if (pin.length !== 4) return setValidationError('Please enter a 4-digit PIN');
    if (pin !== confirmPin) return setValidationError('PINs do not match');

    setIsLoading(true);
    
    try {
      const cleanedPhone = phone.replace(/[^0-9]/g, '');
      const stateName = statesList.find(s => String(s.stateId) === stateId)?.stateName || '';
      const cityName = citiesList.find(c => String(c.cityId) === cityId)?.cityName || '';

      await api.post(URL_CUSTOMER_REGISTER, {
        name: name.trim(),
        mobile: cleanedPhone,
        email: email.trim(),
        pin: pin,
        state: stateName,
        city: cityName
      });
      
      // Auto login after successful signup
      await login(cleanedPhone, pin);
      
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
                <Phone className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setValidationError(''); }}
                  maxLength={10}
                  placeholder="10-digit number"
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

            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  State
                </label>
                <div className="flex items-center h-12 px-3 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all relative">
                  <select
                    value={stateId}
                    onChange={handleStateChange}
                    className="w-full h-full bg-transparent text-[14px] font-medium text-slate-900 outline-none appearance-none pr-6 cursor-pointer z-10 relative"
                  >
                    <option value="" disabled className="text-slate-400">Select</option>
                    {statesList.map(s => (
                      <option key={s.stateId} value={s.stateId}>{s.stateName}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  City
                </label>
                <div className="flex items-center h-12 px-3 rounded-xl border border-slate-200 bg-white focus-within:border-[#5B43EE] transition-all relative">
                  <select
                    value={cityId}
                    onChange={(e) => { setCityId(e.target.value); setValidationError(''); }}
                    disabled={!stateId || citiesList.length === 0}
                    className="w-full h-full bg-transparent text-[14px] font-medium text-slate-900 outline-none appearance-none pr-6 cursor-pointer z-10 relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled className="text-slate-400">Select</option>
                    {citiesList.map(c => (
                      <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
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
