const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove Tabs entirely if STITCHING_REQUEST
const tabsOld = `<div className="flex w-full -mb-[1px]">
            <button onClick={() => setActiveTab('details')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Details</button>
            {order.order_type !== 'STITCHING_REQUEST' && (
              <button onClick={() => setActiveTab('payments')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Payments</button>
            )}
          </div>`;

const tabsNew = `{order.order_type !== 'STITCHING_REQUEST' && (
          <div className="flex w-full -mb-[1px]">
            <button onClick={() => setActiveTab('details')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Details</button>
            <button onClick={() => setActiveTab('payments')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Payments</button>
          </div>
          )}`;
content = content.replace(tabsOld, tabsNew);


// Replace entire Details section for STITCHING_REQUEST
const detailsRegex = /\{\/\* OUTFIT DETAILS \*\/\}.*?(?=\{\/\* BOUTIQUE NOTES \*\/)/s;
const oldDetails = content.match(detailsRegex)[0];

const newDetails = `{/* OUTFIT DETAILS */}
                {order.order_type === 'STITCHING_REQUEST' ? (() => {
                  const od = (order as any).details || {};
                  
                  // Extract text details
                  const getDetails = () => {
                    const d: any = {};
                    const cat = activeOutfit.category || activeOutfit.type || activeOutfit.name || od.category;
                    if (cat) d['Category'] = cat.replace('Stitching Request - ', '');
                    
                    if (activeOutfit.name) d['Outfit Name'] = activeOutfit.name.replace('Stitching Request - ', '');
                    
                    const desc = activeOutfit.customer_notes || activeOutfit.notes || activeOutfit.description || activeOutfit.customer_instructions || od.description;
                    if (desc) d['Description / Notes'] = desc;
                    
                    const meas = activeOutfit.measurement_option || activeOutfit.measurement || od.measurement_option;
                    if (meas) d['Measurement'] = meas;
                    
                    const del = activeOutfit.deliveryDate || activeOutfit.expected_date || od.delivery_date || order.deliveryDate;
                    if (del) d['Expected Date'] = new Date(del).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
                    
                    return d;
                  };
                  
                  const parseNotes = (notes: string) => {
                    if (!notes || !notes.includes('Category:')) return getDetails();
                    const result: any = {};
                    const extract = (key: string, nextKey?: string) => {
                      const k = key + ':';
                      const s = notes.indexOf(k);
                      if (s === -1) return '';
                      const start = s + k.length;
                      if (nextKey) {
                        const e = notes.indexOf('\\n' + nextKey + ':', start);
                        if (e === -1) return notes.substring(start).trim();
                        return notes.substring(start, e).trim();
                      }
                      return notes.substring(start).trim();
                    };
                    result['Category'] = extract('Category', 'Outfit Name') || extract('Category', 'Description');
                    result['Outfit Name'] = extract('Outfit Name', 'Description');
                    result['Description'] = extract('Description', 'Measurement');
                    result['Measurement'] = extract('Measurement', 'Expected Date');
                    result['Expected Date'] = extract('Expected Date');
                    return result;
                  };
                  
                  const parsed = (activeOutfit.customer_notes && activeOutfit.customer_notes.includes('Category:')) 
                    ? parseNotes(activeOutfit.customer_notes) 
                    : getDetails();
                    
                  // Extract Photos & Audio
                  const oldPhotos = od.photos || []; 
                  const newPhotos = activeOutfit.photos || []; 
                  const allPhotosRaw = [...oldPhotos, ...newPhotos];
                  
                  const allPhotoUrls = allPhotosRaw.map((p: any) => typeof p === 'string' ? p : (p.file_url || p.url || p.image)).filter(Boolean);
                  
                  const audioUrls = allPhotoUrls.filter((url: string) => url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note'));
                  const imageUrls = allPhotoUrls.filter((url: string) => !audioUrls.includes(url));
                  
                  return (
                    <div className="bg-white rounded-[16px] overflow-hidden mb-6 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <div className="flex items-center">
                          <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                          <h2 className="text-[12px] font-bold text-[#0F172A] tracking-wide uppercase">Request Summary</h2>
                        </div>
                        <button className="text-[10px] font-bold text-red-500 uppercase tracking-wide px-2.5 py-1.5 bg-red-50 rounded-md border border-red-100 active:bg-red-200 transition-colors">Cancel Outfit</button>
                      </div>
                      
                      <div className="divide-y divide-[#F1F5F9]">
                        {Object.entries(parsed).filter(([k,v]) => v).map(([k, v]) => (
                          <div key={k} className="p-4 flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">{k}</span>
                            <span className="text-[14px] font-medium text-[#0F172A] whitespace-pre-wrap leading-relaxed">{String(v)}</span>
                          </div>
                        ))}
                        
                        {audioUrls.length > 0 && (
                          <div className="p-4 flex flex-col gap-2.5">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                              <Mic className="w-3.5 h-3.5 text-[#5B43EE]" /> Voice Notes
                            </span>
                            <div className="flex flex-col gap-2">
                              {audioUrls.map((url: string, i: number) => (
                                <audio key={i} controls src={url} className="w-full h-9 rounded-lg" />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {imageUrls.length > 0 && (
                          <div className="p-4 flex flex-col gap-3">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[#5B43EE]" /> Reference Photos
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              {imageUrls.map((url: string, i: number) => (
                                <div key={i} onClick={() => { setViewerImage(url); setViewerOpen(true); }} className="aspect-square rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] relative group cursor-pointer shadow-sm">
                                  <img src={url} alt="Reference" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {audioUrls.length === 0 && imageUrls.length === 0 && (
                          <div className="p-4 flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Reference Media</span>
                            <span className="text-[13px] text-[#64748B] italic">No photos or voice notes provided.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">OUTFIT DETAILS</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">ORDER TYPE</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter">{order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER' : 'STITCHING'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">URGENCY</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter uppercase">{activeOutfit.urgency || (order as any).urgency || 'NORMAL'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">TRIAL DATE</span>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                          {activeOutfit.trialDate ? new Date(activeOutfit.trialDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">DELIVERY DATE</span>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                          {activeOutfit.deliveryDate ? new Date(activeOutfit.deliveryDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                )}
                
                {/* STITCHING SPECIFICATIONS */}
                {order.order_type !== 'STITCHING_REQUEST' && (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Scissors className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">STITCHING SPECIFICATIONS</h2>
                  </div>
                  <div className="p-4">
                    {activeOutfit.stitchingOptions && activeOutfit.stitchingOptions.length > 0 ? (
                      <div className="space-y-3">
                        {activeOutfit.stitchingOptions.map((opt: any, index: number) => (
                          <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                            <span className="text-[13px] font-medium text-[#475569]">{opt.name}</span>
                            <span className="text-[13px] font-bold text-[#0F172A] text-right ml-4">{opt.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic font-inter w-full py-4 text-center">
                        No stitching specifications provided.
                      </p>
                    )}
                  </div>
                </div>
                )}
                
                {/* DESIGN PHOTOS & SKETCHES */}
                {order.order_type !== 'STITCHING_REQUEST' && (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <ImageIcon className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">DESIGN PHOTOS & SKETCHES</h2>
                  </div>
                  <div className="flex flex-col p-4 gap-3">
                    {activeOutfit.photos && activeOutfit.photos.length > 0 ? (
                      activeOutfit.photos.map((photo: any, pIdx: number) => {
                        const url = photo.file_url || photo.url || photo.image || photo;
                        const isAudio = typeof url === 'string' && (url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note'));
                        
                        if (isAudio) {
                          return (
                            <div key={pIdx} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex flex-col gap-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Mic className="w-4 h-4 text-[#5B43EE]" />
                                <span className="text-[12px] font-bold text-[#0F172A]">Voice Note</span>
                              </div>
                              <audio controls src={url} className="w-full h-8" />
                            </div>
                          );
                        }

                        return (
                          <div key={pIdx} className="w-full h-[200px] rounded-[10px] overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
                            <img src={url} alt="Design" className="w-full h-full object-contain" />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic font-inter w-full py-4 text-center">
                        No photos provided.
                      </p>
                    )}
                  </div>
                </div>
                )}
                `;
content = content.replace(oldDetails, newDetails);
fs.writeFileSync(file, content);
console.log('Unified Details View Patched');
