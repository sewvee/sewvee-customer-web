'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';


const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+65', flag: '🇸🇬' },
  { code: '+61', flag: '🇦🇺' },
  { code: '+93', flag: '🇦🇫' },
  { code: '+355', flag: '🇦🇱' },
  { code: '+213', flag: '🇩🇿' },
  { code: '+376', flag: '🇦🇩' },
  { code: '+244', flag: '🇦🇴' },
  { code: '+54', flag: '🇦🇷' },
  { code: '+374', flag: '🇦🇲' },
  { code: '+43', flag: '🇦🇹' },
  { code: '+994', flag: '🇦🇿' },
  { code: '+973', flag: '🇧🇭' },
  { code: '+880', flag: '🇧🇩' },
  { code: '+375', flag: '🇧🇾' },
  { code: '+32', flag: '🇧🇪' },
  { code: '+501', flag: '🇧🇿' },
  { code: '+229', flag: '🇧🇯' },
  { code: '+975', flag: '🇧🇹' },
  { code: '+591', flag: '🇧🇴' },
  { code: '+387', flag: '🇧🇦' },
  { code: '+267', flag: '🇧🇼' },
  { code: '+55', flag: '🇧🇷' },
  { code: '+359', flag: '🇧🇬' },
  { code: '+226', flag: '🇧🇫' },
  { code: '+257', flag: '🇧🇮' },
  { code: '+855', flag: '🇰🇭' },
  { code: '+237', flag: '🇨🇲' },
  { code: '+238', flag: '🇨🇻' },
  { code: '+236', flag: '🇨🇫' },
  { code: '+235', flag: '🇹🇩' },
  { code: '+56', flag: '🇨🇱' },
  { code: '+86', flag: '🇨🇳' },
  { code: '+57', flag: '🇨🇴' },
  { code: '+269', flag: '🇰🇲' },
  { code: '+242', flag: '🇨🇬' },
  { code: '+243', flag: '🇨🇩' },
  { code: '+506', flag: '🇨🇷' },
  { code: '+385', flag: '🇭🇷' },
  { code: '+53', flag: '🇨🇺' },
  { code: '+357', flag: '🇨🇾' },
  { code: '+420', flag: '🇨🇿' },
  { code: '+45', flag: '🇩🇰' },
  { code: '+253', flag: '🇩🇯' },
  { code: '+1809', flag: '🇩🇴' },
  { code: '+593', flag: '🇪🇨' },
  { code: '+20', flag: '🇪🇬' },
  { code: '+503', flag: '🇸🇻' },
  { code: '+240', flag: '🇬🇶' },
  { code: '+291', flag: '🇪🇷' },
  { code: '+372', flag: '🇪🇪' },
  { code: '+251', flag: '🇪🇹' },
  { code: '+679', flag: '🇫🇯' },
  { code: '+358', flag: '🇫🇮' },
  { code: '+33', flag: '🇫🇷' },
  { code: '+241', flag: '🇬🇦' },
  { code: '+220', flag: '🇬🇲' },
  { code: '+995', flag: '🇬🇪' },
  { code: '+49', flag: '🇩🇪' },
  { code: '+233', flag: '🇬🇭' },
  { code: '+30', flag: '🇬🇷' },
  { code: '+502', flag: '🇬🇹' },
  { code: '+224', flag: '🇬🇳' },
  { code: '+245', flag: '🇬🇼' },
  { code: '+592', flag: '🇬🇾' },
  { code: '+509', flag: '🇭🇹' },
  { code: '+504', flag: '🇭🇳' },
  { code: '+36', flag: '🇭🇺' },
  { code: '+354', flag: '🇮🇸' },
  { code: '+62', flag: '🇮🇩' },
  { code: '+98', flag: '🇮🇷' },
  { code: '+964', flag: '🇮🇶' },
  { code: '+353', flag: '🇮🇪' },
  { code: '+972', flag: '🇮🇱' },
  { code: '+39', flag: '🇮🇹' },
  { code: '+225', flag: '🇨🇮' },
  { code: '+1876', flag: '🇯🇲' },
  { code: '+81', flag: '🇯🇵' },
  { code: '+962', flag: '🇯🇴' },
  { code: '+7', flag: '🇰🇿' },
  { code: '+254', flag: '🇰🇪' },
  { code: '+686', flag: '🇰🇮' },
  { code: '+965', flag: '🇰🇼' },
  { code: '+996', flag: '🇰🇬' },
  { code: '+856', flag: '🇱🇦' },
  { code: '+371', flag: '🇱🇻' },
  { code: '+961', flag: '🇱🇧' },
  { code: '+266', flag: '🇱🇸' },
  { code: '+231', flag: '🇱🇷' },
  { code: '+218', flag: '🇱🇾' },
  { code: '+423', flag: '🇱🇮' },
  { code: '+370', flag: '🇱🇹' },
  { code: '+352', flag: '🇱🇺' },
  { code: '+261', flag: '🇲🇬' },
  { code: '+265', flag: '🇲🇼' },
  { code: '+60', flag: '🇲🇾' },
  { code: '+960', flag: '🇲🇻' },
  { code: '+223', flag: '🇲🇱' },
  { code: '+356', flag: '🇲🇹' },
  { code: '+692', flag: '🇲🇭' },
  { code: '+222', flag: '🇲🇷' },
  { code: '+230', flag: '🇲🇺' },
  { code: '+52', flag: '🇲🇽' },
  { code: '+691', flag: '🇫🇲' },
  { code: '+373', flag: '🇲🇩' },
  { code: '+377', flag: '🇲🇨' },
  { code: '+976', flag: '🇲🇳' },
  { code: '+382', flag: '🇲🇪' },
  { code: '+212', flag: '🇲🇦' },
  { code: '+258', flag: '🇲🇿' },
  { code: '+95', flag: '🇲🇲' },
  { code: '+264', flag: '🇳🇦' },
  { code: '+674', flag: '🇳🇷' },
  { code: '+977', flag: '🇳🇵' },
  { code: '+31', flag: '🇳🇱' },
  { code: '+64', flag: '🇳🇿' },
  { code: '+505', flag: '🇳🇮' },
  { code: '+227', flag: '🇳🇪' },
  { code: '+234', flag: '🇳🇬' },
  { code: '+850', flag: '🇰🇵' },
  { code: '+389', flag: '🇲🇰' },
  { code: '+47', flag: '🇳🇴' },
  { code: '+968', flag: '🇴🇲' },
  { code: '+92', flag: '🇵🇰' },
  { code: '+680', flag: '🇵🇼' },
  { code: '+507', flag: '🇵🇦' },
  { code: '+675', flag: '🇵🇬' },
  { code: '+595', flag: '🇵🇾' },
  { code: '+51', flag: '🇵🇪' },
  { code: '+63', flag: '🇵🇭' },
  { code: '+48', flag: '🇵🇱' },
  { code: '+351', flag: '🇵🇹' },
  { code: '+974', flag: '🇶🇦' },
  { code: '+40', flag: '🇷🇴' },
  { code: '+250', flag: '🇷🇼' },
  { code: '+1869', flag: '🇰🇳' },
  { code: '+1758', flag: '🇱🇨' },
  { code: '+1784', flag: '🇻🇨' },
  { code: '+685', flag: '🇼🇸' },
  { code: '+378', flag: '🇸🇲' },
  { code: '+239', flag: '🇸🇹' },
  { code: '+966', flag: '🇸🇦' },
  { code: '+221', flag: '🇸🇳' },
  { code: '+381', flag: '🇷🇸' },
  { code: '+248', flag: '🇸🇨' },
  { code: '+232', flag: '🇸🇱' },
  { code: '+421', flag: '🇸🇰' },
  { code: '+386', flag: '🇸🇮' },
  { code: '+677', flag: '🇸🇧' },
  { code: '+252', flag: '🇸🇴' },
  { code: '+27', flag: '🇿🇦' },
  { code: '+82', flag: '🇰🇷' },
  { code: '+211', flag: '🇸🇸' },
  { code: '+34', flag: '🇪🇸' },
  { code: '+94', flag: '🇱🇰' },
  { code: '+249', flag: '🇸🇩' },
  { code: '+597', flag: '🇸🇷' },
  { code: '+268', flag: '🇸🇿' },
  { code: '+46', flag: '🇸🇪' },
  { code: '+41', flag: '🇨🇭' },
  { code: '+963', flag: '🇸🇾' },
  { code: '+886', flag: '🇹🇼' },
  { code: '+992', flag: '🇹🇯' },
  { code: '+255', flag: '🇹🇿' },
  { code: '+66', flag: '🇹🇭' },
  { code: '+228', flag: '🇹🇬' },
  { code: '+676', flag: '🇹🇴' },
  { code: '+1868', flag: '🇹🇹' },
  { code: '+216', flag: '🇹🇳' },
  { code: '+90', flag: '🇹🇷' },
  { code: '+993', flag: '🇹🇲' },
  { code: '+688', flag: '🇹🇻' },
  { code: '+256', flag: '🇺🇬' },
  { code: '+380', flag: '🇺🇦' },
  { code: '+598', flag: '🇺🇾' },
  { code: '+998', flag: '🇺🇿' },
  { code: '+678', flag: '🇻🇺' },
  { code: '+379', flag: '🇻🇦' },
  { code: '+58', flag: '🇻🇪' },
  { code: '+84', flag: '🇻🇳' },
  { code: '+967', flag: '🇾🇪' },
  { code: '+260', flag: '🇿🇲' },
  { code: '+263', flag: '🇿🇼' }
];

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
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

    await login(countryCode === '+91' ? cleaned : countryCode + cleaned, pin);
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
              <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="shrink-0 min-w-[80px] bg-transparent text-[14px] font-medium text-slate-900 outline-none mr-2 pr-1 cursor-pointer"
                >
                  {COUNTRY_CODES.map((c: any) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <div className="w-[1px] h-5 bg-slate-200 mr-2"></div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, ''));
                  setValidationError('');
                  clearError();
                }}
                maxLength={15}
                placeholder="Mobile number"
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

          <div className="flex justify-end mb-5 -mt-2">
            <button type="button" onClick={() => router.push('/forgot-pin')} className="text-[13px] text-[#5B43EE] font-medium hover:underline focus:outline-none">
              Forgot PIN?
            </button>
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
