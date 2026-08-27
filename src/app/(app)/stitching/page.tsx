'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { ArrowLeft, ChevronRight, CheckCircle, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { URL_ORDERS } from '@/lib/env';

export default function StitchingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedBoutiqueId } = useBoutiquesStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    measurement_option: 'Standard Size',
    delivery_date: '',
  });

  const categories = ['Blouse', 'Kurta / Kurti', 'Lehenga', 'Suit / Salwar', 'Dress / Gown', 'Pants / Trousers', 'Other'];
  const measurementOptions = ['Standard Size', 'Use Previous Measurements', 'I will provide later', 'Take measurements at store'];

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const res = await fetch(URL_ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify({
          order_type: 'STITCHING_REQUEST',
          customer_mobile: user?.mobile,
          company_id: selectedBoutiqueId,
          details: formData
        })
      });
      if (res.ok) {
        router.push('/home');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col">
      <div className="flex items-center px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <button onClick={handlePrev} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <h1 className="text-[18px] font-bold text-[#0F172A] font-inter ml-4">
          New Stitching Request
        </h1>
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-24">
        <div className="mb-6 flex items-center justify-between px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${s === step ? 'bg-[#5B43EE] text-white' : s < step ? 'bg-[#10B981] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
                {s < step ? <CheckCircle size={12} /> : s}
              </div>
              <div className="h-1 bg-gray-200 w-full mt-2 relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-[#10B981] transition-all ${s < step ? 'w-full' : 'w-0'}`} />
              </div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Select Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, category: c })}
                  className={`p-4 text-left rounded-xl border ${formData.category === c ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}`}
                >
                  <span className={`font-bold text-[14px] ${formData.category === c ? 'text-[#5B43EE]' : 'text-[#475569]'}`}>{c}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Upload References</h2>
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-white p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-[#64748B]" />
              </div>
              <p className="text-[14px] font-bold text-[#0F172A] mb-1">Upload Design Photos</p>
              <p className="text-[12px] text-[#94A3B8] text-center mb-4">You can skip this if you don't have any references yet.</p>
              <button className="px-6 py-2.5 bg-[#F8FAFC] text-[#5B43EE] font-bold rounded-xl border border-[#E2E8F0] text-[13px]">
                Select Images
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Description</h2>
            <textarea
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-4 text-[14px] min-h-[160px] outline-none focus:border-[#5B43EE]"
              placeholder="Describe your design, specific requirements, fabric details, etc..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Measurement Option</h2>
            <div className="space-y-3">
              {measurementOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => setFormData({ ...formData, measurement_option: o })}
                  className={`w-full p-4 text-left rounded-xl border ${formData.measurement_option === o ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}`}
                >
                  <span className={`font-bold text-[15px] ${formData.measurement_option === o ? 'text-[#5B43EE]' : 'text-[#475569]'}`}>{o}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Expected Delivery Date</h2>
            <input
              type="date"
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-4 text-[15px] font-bold outline-none focus:border-[#5B43EE]"
              value={formData.delivery_date}
              onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
            />
            <p className="text-[12px] text-[#64748B] mt-3">
              Note: The boutique will confirm the final delivery date after reviewing your request.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-10">
        <button
          onClick={step === 5 ? handleSubmit : handleNext}
          disabled={loading || (step === 1 && !formData.category)}
          className="w-full py-4 bg-[#5B43EE] text-white rounded-[14px] font-bold text-[15px] flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             step === 5 ? 'Submit Request' : 'Continue'
          )}
        </button>
      </div>
    </div>
  );
}
