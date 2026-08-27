'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { useOrdersStore } from '@/store/ordersStore';
import { ArrowLeft, CheckCircle, UploadCloud, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { URL_ORDERS } from '@/lib/env';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';

export default function StitchingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedBoutiqueId } = useBoutiquesStore();
  const { orders } = useOrdersStore();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 2
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Step 4
  const [measurementDrawerOpen, setMeasurementDrawerOpen] = useState(false);

  // Step 5 - Custom Calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    measurement_option: 'Use Previous Measurements',
    selected_past_order_id: '',
    delivery_date: '',
  });

  const categories = ['Blouse', 'Kurta / Kurti', 'Lehenga', 'Suit / Salwar', 'Dress / Gown', 'Pants / Trousers', 'Other'];
  const measurementOptions = ['Use Previous Measurements', 'I will provide later', 'Take measurements at store'];

  const pastStitchingOrders = useMemo(() => {
    return orders.filter(o => o.order_type === 'TAILORING' || o.order_type === 'STITCHING_REQUEST');
  }, [orders]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newUrls = newFiles.map(f => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        company_id: selectedBoutiqueId,
        details: {
          category: formData.category,
          description: formData.description,
          measurement_option: formData.measurement_option,
          reference_order_id: formData.selected_past_order_id,
          delivery_date: formData.delivery_date
        }
      };

      const res = await fetch(URL_ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Request submitted successfully!', 'success');
        router.push('/orders');
      } else {
        showToast('Failed to submit request', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error submitting request', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Custom Calendar Logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
        {/* PROGRESS BAR */}
        <div className="mb-8 px-4">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#E2E8F0] z-0 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#10B981] z-0 transition-all duration-300 rounded-full" 
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
            {[1, 2, 3, 4, 5].map((s) => {
              const isCompleted = s < step;
              const isActive = s === step;
              return (
                <div 
                  key={s} 
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    isCompleted ? 'bg-[#10B981] text-white' : 
                    isActive ? 'bg-[#5B43EE] text-white' : 
                    'bg-[#E2E8F0] text-[#94A3B8]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-white" strokeWidth={3} /> : s}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: CATEGORY */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Select Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, category: c })}
                  className={`p-4 text-left rounded-xl border transition-colors ${formData.category === c ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}`}
                >
                  <span className={`font-bold text-[14px] ${formData.category === c ? 'text-[#5B43EE]' : 'text-[#475569]'}`}>{c}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: UPLOAD PHOTOS */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Upload References</h2>
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-white p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-7 h-7 text-[#64748B]" />
              </div>
              <p className="text-[15px] font-bold text-[#0F172A] mb-1">Upload Design Photos</p>
              <p className="text-[12px] text-[#94A3B8] mb-5">You can skip this if you don't have any references yet.</p>
              
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-white text-[#5B43EE] font-bold rounded-xl border border-[#5B43EE] text-[13px]"
              >
                Select Images
              </button>
            </div>

            {previewUrls.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DESCRIPTION */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Description</h2>
            <textarea
              className="w-full bg-transparent border border-[#5B43EE] rounded-xl p-4 text-[14px] min-h-[160px] outline-none shadow-[0_0_0_4px_rgba(91,67,238,0.05)] text-[#0F172A]"
              placeholder="Describe your design, specific requirements, fabric details, etc..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        )}

        {/* STEP 4: MEASUREMENT */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Measurement Option</h2>
            <div className="space-y-3">
              {measurementOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => setFormData({ ...formData, measurement_option: o })}
                  className={`w-full p-4 text-left rounded-xl border transition-colors ${formData.measurement_option === o ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}`}
                >
                  <span className={`font-bold text-[14px] ${formData.measurement_option === o ? 'text-[#5B43EE]' : 'text-[#475569]'}`}>{o}</span>
                </button>
              ))}
            </div>

            {formData.measurement_option === 'Use Previous Measurements' && (
              <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[13px] text-indigo-900 mb-3 font-medium">Select a past order to copy its measurements.</p>
                <button 
                  onClick={() => setMeasurementDrawerOpen(true)}
                  className="w-full py-3 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-bold text-[14px]"
                >
                  {formData.selected_past_order_id ? `Selected Order: ${formData.selected_past_order_id}` : 'View Past Orders'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: EXPECTED DELIVERY */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Expected Delivery Date</h2>
            
            <button 
              onClick={() => setShowCalendar(true)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between outline-none"
            >
              <span className={`text-[15px] font-bold ${formData.delivery_date ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                {formData.delivery_date ? new Date(formData.delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'dd/mm/yyyy'}
              </span>
              <CalendarIcon className="w-5 h-5 text-[#64748B]" />
            </button>

            <p className="text-[12px] text-[#64748B] mt-4 font-medium">
              Note: The boutique will confirm the final delivery date after reviewing your request.
            </p>

            {/* CUSTOM CALENDAR POPUP */}
            {showCalendar && (
              <div className="absolute top-[180px] left-5 right-5 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E2E8F0] p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-[#0F172A]">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 rounded-md hover:bg-gray-100">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 rounded-md hover:bg-gray-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <span key={i} className="text-[12px] font-bold text-[#64748B] py-1">{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2 text-center">
                  {days.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = formData.delivery_date === dateStr;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setFormData({ ...formData, delivery_date: dateStr });
                          setShowCalendar(false);
                        }}
                        className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center text-[13px] font-medium transition-colors ${
                          isSelected ? 'bg-[#5B43EE] text-white' : 'text-[#0F172A] hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setFormData({ ...formData, delivery_date: '' }); setShowCalendar(false); }} className="text-[#5B43EE] text-[13px] font-bold">Clear</button>
                  <button onClick={() => { 
                    const today = new Date();
                    setFormData({ ...formData, delivery_date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}` }); 
                    setShowCalendar(false); 
                  }} className="text-[#5B43EE] text-[13px] font-bold">Today</button>
                </div>
              </div>
            )}
            
            {showCalendar && (
              <div className="fixed inset-0 z-10" onClick={() => setShowCalendar(false)} />
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-30">
        <button
          onClick={step === 5 ? handleSubmit : handleNext}
          disabled={loading || (step === 1 && !formData.category) || (step === 5 && !formData.delivery_date)}
          className={`w-full py-4 rounded-[14px] font-bold text-[15px] flex items-center justify-center transition-opacity ${
            step === 5 ? 'bg-[#5B43EE] text-white' : 'bg-[#5B43EE] text-white'
          } disabled:opacity-50`}
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             step === 5 ? 'Submit Request' : 'Continue'
          )}
        </button>
      </div>

      {/* MEASUREMENT DRAWER */}
      <BottomSheet open={measurementDrawerOpen} onClose={() => setMeasurementDrawerOpen(false)}>
        <div className="p-2">
          <h3 className="text-[18px] font-bold text-[#0F172A] mb-4">Select Past Order</h3>
          {pastStitchingOrders.length === 0 ? (
            <p className="text-[14px] text-gray-500 text-center py-6">You have no past stitching orders.</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
              {pastStitchingOrders.map(o => (
                <button 
                  key={o.id}
                  onClick={() => {
                    setFormData({ ...formData, selected_past_order_id: o.id.toString() });
                    setMeasurementDrawerOpen(false);
                  }}
                  className={`w-full p-4 rounded-xl border text-left flex justify-between items-center ${formData.selected_past_order_id === o.id.toString() ? 'border-[#5B43EE] bg-indigo-50' : 'border-gray-200'}`}
                >
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">Order: {o.billNo || `ORD-${o.id}`}</p>
                    <p className="text-[12px] text-gray-500 mt-1">{new Date(o.createdAt || o.date || new Date()).toLocaleDateString()}</p>
                  </div>
                  {formData.selected_past_order_id === o.id.toString() && <CheckCircle className="w-5 h-5 text-[#5B43EE]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
