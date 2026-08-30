const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('{/* STEP 2: UPLOAD PHOTOS');
const endIndex = content.indexOf('<div className="fixed bottom-0');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const newContent = `        {/* STEP 2: OUTFIT CHECKLIST */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-1">Configure Outfits</h2>
            <p className="text-[13px] text-[#64748B] mb-5">Tap each outfit to provide design references, details, and measurements.</p>
            
            <div className="flex flex-col gap-3">
              {outfits.map((outfit) => (
                <button
                  key={outfit.id}
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
                  className={\`w-full p-4 rounded-xl border flex items-center justify-between transition-colors \${outfit.isConfigured ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-[#CBD5E1] bg-white'}\`}
                >
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${outfit.isConfigured ? 'bg-[#DCFCE7]' : 'bg-[#F1F5F9]'}\`}>
                      {outfit.isConfigured ? <CheckCircle className="w-5 h-5 text-[#22C55E]" /> : <span className="text-[14px] font-bold text-[#64748B]">{outfits.indexOf(outfit) + 1}</span>}
                    </div>
                    <div className="text-left">
                      <p className={\`font-bold text-[15px] \${outfit.isConfigured ? 'text-[#166534]' : 'text-[#0F172A]'}\`}>{outfit.name}</p>
                      <p className={\`text-[12px] mt-0.5 \${outfit.isConfigured ? 'text-[#15803D]' : 'text-[#94A3B8]'}\`}>
                        {outfit.isConfigured ? 'Configured • Tap to edit' : 'Tap to add details'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={\`w-5 h-5 \${outfit.isConfigured ? 'text-[#22C55E]' : 'text-[#CBD5E1]'}\`} />
                </button>
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
              <span className={\`text-[15px] font-bold \${deliveryDate ? 'text-[#0F172A]' : 'text-[#94A3B8]'}\`}>
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
                          className={\`p-1 rounded-md \${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}\`}
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
                    const dateStr = \`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
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
                        className={\`w-8 h-8 mx-auto rounded-md flex items-center justify-center text-[13px] font-medium transition-colors \${
                          isSelected ? 'bg-[#5B43EE] text-white' : 
                          isPast ? 'text-gray-300 cursor-not-allowed' : 'text-[#0F172A] hover:bg-gray-100'
                        }\`}
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
                    setDeliveryDate(\`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`); 
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
`;

content = content.substring(0, startIndex) + newContent + content.substring(endIndex);
fs.writeFileSync(file, content);
