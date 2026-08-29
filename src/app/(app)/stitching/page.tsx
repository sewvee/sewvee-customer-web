'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { useOrdersStore } from '@/store/ordersStore';
import { ArrowLeft, CheckCircle, UploadCloud, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, ImagePlus, Mic, Square, Trash2 } from 'lucide-react';
import { URL_ORDERS, URL_CUSTOMER_PORTAL_ORDERS, URL_UPLOAD } from '@/lib/env';
// API domain needed to turn relative upload paths into full URLs
const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sewvee.com';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';
import { CollageMaker } from '@/components/CollageMaker';

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
  const [collageOpen, setCollageOpen] = useState(false);
  const [collageDataUrl, setCollageDataUrl] = useState<string | null>(null);

  // Step 3 – Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 4
  const [measurementDrawerOpen, setMeasurementDrawerOpen] = useState(false);
  const [viewingPastOrderId, setViewingPastOrderId] = useState<string | null>(null);

  // Step 5 - Custom Calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [otherCategoryName, setOtherCategoryName] = useState('');
  const [outfits, setOutfits] = useState<any[]>([]);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    measurement_option: 'Use Previous Measurements',
    selected_past_order_id: '',
  });

  const categories = ['Blouse', 'Kurta / Kurti', 'Lehenga', 'Suit / Salwar', 'Dress / Gown', 'Pants / Trousers', 'Other'];
  const measurementOptions = ['Use Previous Measurements', 'I will provide later', 'Take measurements at store'];

  const pastStitchingOrders = useMemo(() => {
    return orders.filter(o => o.order_type === 'TAILORING' || o.order_type === 'STITCHING_REQUEST');
  }, [orders]);

  const handleNext = () => {
    if (step === 1) {
      const newOutfits: any[] = [];
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        for (let i = 0; i < count; i++) {
          const id = `${cat}-${i}`;
          const existing = outfits.find(o => o.id === id);
          if (existing) {
            newOutfits.push(existing);
          } else {
            newOutfits.push({
              id,
              category: cat === 'Other' ? (otherCategoryName.trim() || 'Other') : cat,
              name: cat === 'Other'
                ? `${otherCategoryName.trim() || 'Other'}${count > 1 ? ` ${i + 1}` : ''}`.trim()
                : `${cat}${count > 1 ? ` ${i + 1}` : ''}`.trim(),
              images: [],
              previewUrls: [],
              collageDataUrl: null,
              description: '',
              audioBlob: null,
              audioUrl: null,
              measurement_option: 'Use Previous Measurements',
              selected_past_order_id: '',
              isConfigured: false
            });
          }
        }
      });
      setOutfits(newOutfits);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      showToast('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const outfitUploadedUrls: string[][] = [];

      for (const outfit of outfits) {
        const uploadedUrls: string[] = [];
        
        // Upload images
        for (const file of outfit.images || []) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('key_name', 'order_photos');
          
          const uploadRes = await fetch(URL_UPLOAD, {
            method: 'POST',
            headers: { Authorization: formattedToken },
            body: fd,
          });
          
          if (uploadRes.ok) {
            const json = await uploadRes.json();
            const rawUrl = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
            const url = rawUrl ? (rawUrl.startsWith('/') ? `${API_DOMAIN}${rawUrl}` : rawUrl) : null;
            if (url) uploadedUrls.push(url);
          }
        }

        // Upload collage if created
        if (outfit.collageDataUrl) {
          try {
            const res = await fetch(outfit.collageDataUrl);
            const blob = await res.blob();
            const collageFile = new File([blob], `collage_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const fd = new FormData();
            fd.append('file', collageFile);
            fd.append('key_name', 'order_photos');
            const collageUploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (collageUploadRes.ok) {
              const json = await collageUploadRes.json();
              const rawUrl = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              const url = rawUrl ? (rawUrl.startsWith('/') ? `${API_DOMAIN}${rawUrl}` : rawUrl) : null;
              if (url) uploadedUrls.push(url);
            }
          } catch(e) {
            console.error('Failed to upload collage:', e);
          }
        }

        // Upload voice recording if present
        if (outfit.audioBlob) {
          try {
            const audioFile = new File([outfit.audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
            const fd = new FormData();
            fd.append('file', audioFile);
            fd.append('key_name', 'order_audios');
            const audioUploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (audioUploadRes.ok) {
              const json = await audioUploadRes.json();
              const rawUrl = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              const url = rawUrl ? (rawUrl.startsWith('/') ? `${API_DOMAIN}${rawUrl}` : rawUrl) : null;
              if (url) uploadedUrls.push(url);
            }
          } catch(e) { console.error('Failed to upload voice note:', e); }
        }

        outfitUploadedUrls.push(uploadedUrls);
      }

      // Step 2: Build payload — store ALL data in `notes` as JSON (backend DOES persist this field)
      const payloadOutfits = outfits.map((outfit, idx) => {
        const urls = outfitUploadedUrls[idx] || [];
        
        // Build the precise text string the backend expects for the Boutique Panel card
        const lines = [];
        lines.push(`Category: ${outfit.category}`);
        if (outfit.description) lines.push(`Description: ${outfit.description}`);
        if (outfit.measurement_option) lines.push(`Measurement: ${outfit.measurement_option}`);
        if (deliveryDate) lines.push(`Expected Date: ${deliveryDate}`);
        
        return {
          name: outfit.category,
          quantity: 1,
          total_amount: 0,
          customer_notes: lines.join('\n'),
          photos: urls.map(u => ({ file_url: u })),
          items: [],
        };
      });

      const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        company_id: selectedBoutiqueId,
        outfits: payloadOutfits,
      };

      // Step 3: Create the order
      const res = await fetch(URL_CUSTOMER_PORTAL_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: formattedToken },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        showToast('Failed to submit request', 'error');
        return;
      }

      const resJson = await res.json();
      const createdOrderId = resJson?.data?.id ?? resJson?.id;
      const createdOutfits: any[] = resJson?.data?.outfits ?? resJson?.outfits ?? [];

      // Step 4: Save ALL rich data to localStorage (backend drops this data)
      // This is the only reliable way to persist it for the Order Details view
      if (createdOrderId) {
        const richData = {
          delivery_date: deliveryDate,
          outfit_configs: outfits.map((outfit, idx) => ({
            category: outfit.category,
            name: outfit.name,
            description: outfit.description || '',
            measurement_option: outfit.measurement_option || '',
            selected_past_order_id: outfit.selected_past_order_id || '',
            delivery_date: deliveryDate,
            photo_urls: outfitUploadedUrls[idx] || [],
          })),
        };
        try {
          localStorage.setItem(`sewvee_order_${createdOrderId}`, JSON.stringify(richData));
        } catch(e) { console.error('Failed to save order data to localStorage:', e); }
      }

      // Step 5: Attach uploaded photos to each outfit via /requests endpoint
      if (createdOrderId && createdOutfits.length > 0) {
        for (let i = 0; i < createdOutfits.length; i++) {
          const outfitId = createdOutfits[i]?.id;
          const urls = outfitUploadedUrls[i] || [];
          if (!outfitId || urls.length === 0) continue;
          for (const url of urls) {
            try {
              await fetch(`${URL_CUSTOMER_PORTAL_ORDERS}/${createdOrderId}/outfits/${outfitId}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: formattedToken },
                body: JSON.stringify({ attachment_url: url, message: 'Customer reference photo', phone: user?.mobile ?? '' }),
              });
            } catch(e) { console.error('Failed to attach photo:', e); }
          }
        }
      }

      showToast('Request submitted successfully!', 'success');
      router.push('/orders');
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
        <h1 className="text-[18px] font-bold text-[#0F172A] font-inter ml-4 flex-1">
          New Stitching Request
        </h1>
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X className="w-5 h-5 text-[#64748B]" />
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto pb-24">
        {/* PROGRESS BAR */}
        <div className="mb-8 px-4">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#E2E8F0] z-0 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#10B981] z-0 transition-all duration-300 rounded-full" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            {[1, 2, 3].map((s) => {
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

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-16">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-1">What would you like to stitch?</h2>
            <p className="text-[13px] text-[#64748B] mb-5">Select the number of outfits for each category.</p>
            <div className="flex flex-col gap-3">
              {categories.map((c) => {
                const count = categoryCounts[c] || 0;
                return (
                  <div key={c} className={`rounded-xl border transition-colors ${count > 0 ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}`}>
                    <div className="p-4 flex items-center justify-between">
                      <span className={`font-bold text-[15px] ${count > 0 ? 'text-[#5B43EE]' : 'text-[#475569]'}`}>{c}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setCategoryCounts(prev => ({...prev, [c]: Math.max(0, count - 1)}))} className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[16px] font-bold text-[#475569] leading-none">−</button>
                        <span className="w-4 text-center font-bold text-[15px] text-[#0F172A]">{count}</span>
                        <button onClick={() => setCategoryCounts(prev => ({...prev, [c]: count + 1}))} className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[16px] font-bold text-[#475569] leading-none">+</button>
                      </div>
                    </div>
                    {c === 'Other' && count > 0 && (
                      <div className="px-4 pb-4">
                        <input
                          type="text"
                          value={otherCategoryName}
                          onChange={e => setOtherCategoryName(e.target.value)}
                          placeholder="Enter outfit name (e.g. Jumpsuit)"
                          className="w-full border border-[#C7D2FE] bg-white rounded-xl px-3 py-2.5 text-[14px] font-medium text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#5B43EE]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

                {/* STEP 2: OUTFIT CHECKLIST */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-1">Configure Outfits</h2>
            <p className="text-[13px] text-[#64748B] mb-5">Tap each outfit to provide design references, details, and measurements.</p>
            
            <div className="flex flex-col gap-3">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="relative group">
                  <button
                    onClick={() => {
                       setImages(outfit.images || []);
                       setPreviewUrls(outfit.previewUrls || []);
                       setCollageDataUrl(outfit.collageDataUrl || null);
                       setAudioBlob(outfit.audioBlob || null);
                       setAudioUrl(outfit.audioUrl || null);
                       setFormData({
                         description: outfit.description || '',
                         measurement_option: outfit.measurement_option || 'Use Previous Measurements',
                         selected_past_order_id: outfit.selected_past_order_id || ''
                       });
                       setEditingOutfitId(outfit.id);
                    }}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors pr-12 ${outfit.isConfigured ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-[#CBD5E1] bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${outfit.isConfigured ? 'bg-[#DCFCE7]' : 'bg-[#F1F5F9]'}`}>
                        {outfit.isConfigured ? <CheckCircle className="w-5 h-5 text-[#22C55E]" /> : <span className="text-[14px] font-bold text-[#64748B]">{outfits.indexOf(outfit) + 1}</span>}
                      </div>
                      <div className="text-left">
                        <p className={`font-bold text-[15px] ${outfit.isConfigured ? 'text-[#166534]' : 'text-[#0F172A]'}`}>{outfit.name}</p>
                        <p className={`text-[12px] mt-0.5 ${outfit.isConfigured ? 'text-[#15803D]' : 'text-[#94A3B8]'}`}>
                          {outfit.isConfigured ? 'Configured • Tap to edit' : 'Tap to add details'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${outfit.isConfigured ? 'text-[#22C55E]' : 'text-[#CBD5E1]'}`} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Remove ${outfit.name}?`)) {
                        setOutfits(prev => prev.filter(o => o.id !== outfit.id));
                        setCategoryCounts(prev => ({
                          ...prev,
                          [outfit.category]: Math.max(0, (prev[outfit.category] || 1) - 1)
                        }));
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: EXPECTED DELIVERY */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Expected Delivery Date</h2>
            
            <button 
              onClick={() => setShowCalendar(true)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between outline-none"
            >
              <span className={`text-[15px] font-bold ${deliveryDate ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                {deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'dd/mm/yyyy'}
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
                    {(() => {
                      const now = new Date();
                      const isCurrentMonth = currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear();
                      return (
                        <button 
                          disabled={isCurrentMonth}
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} 
                          className={`p-1 rounded-md ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      );
                    })()}
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
                    const isSelected = deliveryDate === dateStr;
                    
                    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const isPast = cellDate < today;

                    return (
                      <button
                        key={idx}
                        disabled={isPast}
                        onClick={() => {
                          if (isPast) return;
                          setDeliveryDate(dateStr);
                          setShowCalendar(false);
                        }}
                        className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center text-[13px] font-medium transition-colors ${
                          isSelected ? 'bg-[#5B43EE] text-white' : 
                          isPast ? 'text-gray-300 cursor-not-allowed' : 'text-[#0F172A] hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => { setDeliveryDate(''); setShowCalendar(false); }} className="text-[#5B43EE] text-[13px] font-bold">Clear</button>
                  <button onClick={() => { 
                    const today = new Date();
                    setDeliveryDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`); 
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
<div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-30 flex gap-3">
        <button
          onClick={handlePrev}
          className="px-6 py-4 rounded-[14px] font-bold text-[15px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center gap-2 hover:bg-[#E2E8F0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={
            loading || 
            (step === 1 && Object.values(categoryCounts).reduce((a, b) => a + b, 0) === 0) || 
            (step === 2 && (outfits.length === 0 || outfits.some(o => !o.isConfigured))) || 
            (step === 3 && !deliveryDate)
          }
          className={`flex-1 py-4 rounded-[14px] font-bold text-[15px] flex items-center justify-center transition-opacity bg-[#5B43EE] text-white disabled:opacity-50`}
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             step === 3 ? 'Submit Request' : 'Continue'
          )}
        </button>
      </div>

            {/* OUTFIT CONFIGURATION DRAWER */}
      <BottomSheet open={!!editingOutfitId} onClose={() => setEditingOutfitId(null)}>
        <div className="p-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-bold text-[#0F172A]">
              Configure {outfits.find(o => o.id === editingOutfitId)?.name}
            </h3>
          </div>

          <div className="space-y-8">
            {/* SECTION 1: REFERENCE PHOTOS */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0F172A] mb-1">1. Reference Photos</h4>
              <p className="text-[13px] text-[#64748B] mb-4">
                Add your fabric &amp; design inspiration. 1) Collage your saree/outfit material, any embroidery or patterns, and reference images.
              </p>

              {!collageDataUrl ? (
                <button
                  onClick={() => setCollageOpen(true)}
                  className="w-full border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-[#F8FAFC] p-6 flex flex-col items-center justify-center text-center hover:border-[#5B43EE] transition-colors"
                >
                  <div className="w-14 h-14 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-3">
                    <ImagePlus className="w-7 h-7 text-[#5B43EE]" />
                  </div>
                  <p className="text-[15px] font-bold text-[#0F172A] mb-1">Build a Collage</p>
                  <p className="text-[12px] text-[#94A3B8] mb-4 max-w-[220px]">
                    Combine your fabric photos with design references in one image.
                  </p>
                  <span className="px-5 py-2 bg-[#5B43EE] text-white font-bold rounded-xl text-[13px]">
                    Open Collage Maker
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                    <img src={collageDataUrl} alt="Your collage" className="w-full object-cover" />
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => setCollageOpen(true)}
                      className="flex-1 py-2.5 rounded-xl border border-[#5B43EE] text-[#5B43EE] font-bold text-[13px]"
                    >
                      Edit Collage
                    </button>
                    <button
                      onClick={() => setCollageDataUrl(null)}
                      className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 font-bold text-[13px] bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: DESCRIPTION & VOICE */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0F172A] mb-3">2. Description &amp; Voice Note</h4>
              <textarea
                className="w-full bg-transparent border border-[#E2E8F0] focus:border-[#5B43EE] rounded-xl p-4 text-[14px] min-h-[120px] outline-none text-[#0F172A] transition-colors"
                placeholder="Describe your design, specific requirements, fabric details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="mt-3">
                <p className="text-[12px] font-semibold text-[#64748B] mb-2">Or record a voice note</p>
                {!audioUrl ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 transition-all ${
                      isRecording
                        ? 'border-red-400 bg-red-50 text-red-500'
                        : 'border-dashed border-[#CBD5E1] bg-white text-[#5B43EE] hover:border-[#5B43EE]'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold text-[13px]">
                          Recording… {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
                        </span>
                        <Square className="w-3 h-3" />
                        <span className="font-bold text-[12px]">Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span className="font-bold text-[13px]">Record Voice Note</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#EEF2FF] rounded-full flex items-center justify-center shrink-0">
                        <Mic className="w-3.5 h-3.5 text-[#5B43EE]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-bold text-[#0F172A]">Voice Note</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')} recorded
                        </p>
                      </div>
                      <button onClick={discardRecording} className="p-1.5 rounded-full hover:bg-red-50 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: MEASUREMENT */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0F172A] mb-3">3. Measurement Option</h4>
              <div className="space-y-2">
                {measurementOptions.map((o) => (
                  <button
                    key={o}
                    onClick={() => {
                      setFormData({ ...formData, measurement_option: o });
                      if (o === 'Use Previous Measurements') {
                        setMeasurementDrawerOpen(true);
                      }
                    }}
                    className={`w-full p-3 text-left flex flex-col rounded-xl border transition-colors ${formData.measurement_option === o ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-bold text-[13px] ${formData.measurement_option === o ? 'text-[#5B43EE]' : 'text-[#475569]'}`}>{o}</span>
                      {formData.measurement_option === o && <CheckCircle className="w-4 h-4 text-[#5B43EE]" />}
                    </div>
                    
                    {o === 'Use Previous Measurements' && formData.measurement_option === 'Use Previous Measurements' && (
                      <span className="text-[11px] text-[#5B43EE] mt-1.5 font-semibold bg-white px-2 py-1 rounded-lg border border-[#5B43EE]/20 inline-block">
                        {(() => {
                          if (!formData.selected_past_order_id) return 'Tap to select an order...';
                          const selectedOrder = pastStitchingOrders.find(po => po.id.toString() === formData.selected_past_order_id);
                          return `Selected: ${selectedOrder ? (selectedOrder.billNo || '`ORD-${selectedOrder.id}`') : formData.selected_past_order_id} (Tap to change)`;
                        })()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 pb-safe bg-white border-t border-gray-100">
          <button
            onClick={() => {
              // Save buffer back to outfits array
              setOutfits(prev => prev.map(o => {
                if (o.id === editingOutfitId) {
                  return {
                    ...o,
                    images,
                    previewUrls,
                    collageDataUrl,
                    description: formData.description,
                    audioBlob,
                    audioUrl,
                    measurement_option: formData.measurement_option,
                    selected_past_order_id: formData.selected_past_order_id,
                    isConfigured: true // mark as complete
                  };
                }
                return o;
              }));
              setEditingOutfitId(null);
            }}
            disabled={formData.measurement_option === 'Use Previous Measurements' && !formData.selected_past_order_id}
            className="w-full py-3.5 bg-[#5B43EE] text-white rounded-xl font-bold text-[14px] disabled:opacity-50"
          >
            Save &amp; Close
          </button>
        </div>
      </BottomSheet>


      {/* MEASUREMENT DRAWER */}
      <BottomSheet open={measurementDrawerOpen} onClose={() => setMeasurementDrawerOpen(false)}>
        <div className="p-2">
          <h3 className="text-[18px] font-bold text-[#0F172A] mb-4">Select Past Order</h3>
          {pastStitchingOrders.length === 0 ? (
            <p className="text-[14px] text-gray-500 text-center py-6">You have no past stitching orders.</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
              {pastStitchingOrders.map(o => (
                <div key={o.id} className={`w-full p-4 rounded-xl border flex justify-between items-center ${formData.selected_past_order_id === o.id.toString() ? 'border-[#5B43EE] bg-indigo-50' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => {
                      setFormData({ ...formData, selected_past_order_id: o.id.toString() });
                      setMeasurementDrawerOpen(false);
                    }}
                    className="flex-1 text-left flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-[#0F172A]">Order: {o.billNo || `ORD-${o.id}`}</p>
                      <p className="text-[12px] text-gray-500 mt-1">{new Date(o.createdAt || o.date || new Date()).toLocaleDateString()}</p>
                    </div>
                    {formData.selected_past_order_id === o.id.toString() && <CheckCircle className="w-5 h-5 text-[#5B43EE] mr-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingPastOrderId(o.id.toString());
                    }}
                    className="text-[12px] font-bold text-[#5B43EE] bg-[#EEF2FF] px-3 py-1.5 rounded-lg ml-2 shrink-0 border border-[#5B43EE]/20 hover:bg-[#E0E7FF] flex items-center gap-1"
                  >
                    View Order
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      
      {/* Past Order Details Drawer */}
      <BottomSheet open={!!viewingPastOrderId} onClose={() => setViewingPastOrderId(null)} title="Order Details">
        {(() => {
          const o = pastStitchingOrders.find(ord => ord.id.toString() === viewingPastOrderId);
          if (!o) return null;
          const outfits = o.outfits || o.items || [];
          const totalAmount = o.totalAmount || o.total || o.paid_amount || 0;
          
          return (
            <div className="pb-8 px-2 max-h-[80vh] overflow-y-auto">
              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 border border-[#E2E8F0]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Order No</span>
                  <span className="text-[14px] font-bold text-[#0F172A]">{o.billNo || `ORD-${o.id}`}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Date</span>
                  <span className="text-[14px] font-bold text-[#0F172A]">{new Date(o.createdAt || o.date || new Date()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Total Amount</span>
                  <span className="text-[14px] font-bold text-[#5B43EE]">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Status</span>
                  <span className="text-[12px] font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">{o.status || 'Received'}</span>
                </div>
              </div>

              <h4 className="text-[14px] font-bold text-[#0F172A] mb-3 px-1">Outfits ({outfits.length})</h4>
              <div className="space-y-3">
                {outfits.map((outfit: any, idx: number) => (
                  <div key={outfit.id || idx} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <h5 className="text-[14px] font-bold text-[#0F172A] mb-2">{outfit.outfit_type || outfit.name || `Outfit ${idx + 1}`}</h5>
                    {(outfit.measurements || outfit.customer_measurements) && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Measurements</span>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{outfit.measurements || outfit.customer_measurements}</p>
                      </div>
                    )}
                    {(outfit.notes || outfit.customer_notes) && (
                      <div className="mt-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Notes</span>
                        <p className="text-[13px] text-gray-700">{outfit.notes || outfit.customer_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                {outfits.length === 0 && (
                  <p className="text-[13px] text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No outfit details found.</p>
                )}
              </div>
              
              <button
                onClick={() => {
                  setFormData({ ...formData, selected_past_order_id: o.id.toString() });
                  setViewingPastOrderId(null);
                  setMeasurementDrawerOpen(false);
                }}
                className="w-full mt-6 bg-[#5B43EE] hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Use This Order's Measurements
              </button>
            </div>
          );
        })()}
      </BottomSheet>

      {/* COLLAGE MAKER */}
      <CollageMaker
        open={collageOpen}
        onClose={() => setCollageOpen(false)}
        onSave={async (dataUrl: string) => {
          setCollageDataUrl(dataUrl);
          setCollageOpen(false);
        }}
      />
    </div>
  );
}
