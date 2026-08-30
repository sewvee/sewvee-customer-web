const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const drawerContent = `      {/* OUTFIT CONFIGURATION DRAWER */}
      <BottomSheet open={!!editingOutfitId} onClose={() => setEditingOutfitId(null)}>
        <div className="p-2 pb-24 max-h-[85vh] overflow-y-auto">
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
                    className={\`w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 transition-all \${
                      isRecording
                        ? 'border-red-400 bg-red-50 text-red-500'
                        : 'border-dashed border-[#CBD5E1] bg-white text-[#5B43EE] hover:border-[#5B43EE]'
                    }\`}
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
                    className={\`w-full p-3 text-left flex flex-col rounded-xl border transition-colors \${formData.measurement_option === o ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}\`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={\`font-bold text-[13px] \${formData.measurement_option === o ? 'text-[#5B43EE]' : 'text-[#475569]'}\`}>{o}</span>
                      {formData.measurement_option === o && <CheckCircle className="w-4 h-4 text-[#5B43EE]" />}
                    </div>
                    
                    {o === 'Use Previous Measurements' && formData.measurement_option === 'Use Previous Measurements' && (
                      <span className="text-[11px] text-[#5B43EE] mt-1.5 font-semibold bg-white px-2 py-1 rounded-lg border border-[#5B43EE]/20 inline-block">
                        {(() => {
                          if (!formData.selected_past_order_id) return 'Tap to select an order...';
                          const selectedOrder = pastStitchingOrders.find(po => po.id.toString() === formData.selected_past_order_id);
                          return \`Selected: \${selectedOrder ? (selectedOrder.billNo || \\\`ORD-\\\${selectedOrder.id}\\\`) : formData.selected_past_order_id} (Tap to change)\`;
                        })()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
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
`;

const insertTarget = `{/* MEASUREMENT DRAWER */}`;
content = content.replace(insertTarget, drawerContent + '\n\n      ' + insertTarget);

fs.writeFileSync(file, content);
console.log('Drawer inserted');
