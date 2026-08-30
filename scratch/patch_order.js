const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Hide Payments Tab if STITCHING_REQUEST
const tabsOld = `<div className="flex w-full -mb-[1px]">
            <button onClick={() => setActiveTab('details')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Details</button>
            <button onClick={() => setActiveTab('payments')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Payments</button>
          </div>`;

const tabsNew = `<div className="flex w-full -mb-[1px]">
            <button onClick={() => setActiveTab('details')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'details' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Details</button>
            {order.order_type !== 'STITCHING_REQUEST' && (
              <button onClick={() => setActiveTab('payments')} className={\`flex-1 pb-3 text-[14px] font-bold outline-none border-b-2 \${activeTab === 'payments' ? 'text-[#5B43EE] border-[#5B43EE]' : 'text-[#64748B] border-transparent'}\`}>Payments</button>
            )}
          </div>`;

content = content.replace(tabsOld, tabsNew);


// 2. Outfit Details Replacement
const outfitDetailsRegex = /\{\/\* OUTFIT DETAILS \*\/\}.*?(?=\{\/\* STITCHING SPECIFICATIONS \*\/)/s;

const newOutfitDetails = `{/* OUTFIT DETAILS */}
                {order.order_type === 'STITCHING_REQUEST' ? (() => {
                  const parseNotes = (notes) => {
                    if (!notes) return {};
                    const result = {};
                    const extract = (key, nextKey) => {
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
                    result['Category'] = extract('Category', 'Outfit Name');
                    result['Outfit Name'] = extract('Outfit Name', 'Description');
                    result['Description'] = extract('Description', 'Measurement');
                    result['Measurement'] = extract('Measurement', 'Expected Date');
                    result['Expected Date'] = extract('Expected Date');
                    return result;
                  };
                  const parsed = parseNotes(activeOutfit.customer_notes || '');
                  
                  return (
                    <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <div className="flex items-center">
                          <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                          <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">OUTFIT DETAILS</h2>
                        </div>
                        <button className="text-[10px] font-bold text-red-500 uppercase tracking-wide px-2 py-1 bg-red-50 rounded-md border border-red-100 active:bg-red-100">Cancel Outfit</button>
                      </div>
                      <div className="p-4 grid grid-cols-1 gap-y-4">
                        {Object.entries(parsed).filter(([k,v]) => v).map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">{k}</span>
                            <span className="text-[13px] font-bold text-[#0F172A] font-inter whitespace-pre-wrap">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })() : (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide">OUTFIT DETAILS</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">ORDER TYPE</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter">{order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER' : 'STITCHING'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">URGENCY</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter uppercase">{activeOutfit.urgency || order.urgency || 'NORMAL'}</span>
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
                
                `;

content = content.replace(outfitDetailsRegex, newOutfitDetails);

// 3. Hide STITCHING SPECIFICATIONS if STITCHING_REQUEST
const specRegex = /\{\/\* STITCHING SPECIFICATIONS \*\/\}.*?(?=\{\/\* DESIGN PHOTOS & SKETCHES \*\/)/s;
const oldSpec = content.match(specRegex)[0];
const newSpec = `{/* STITCHING SPECIFICATIONS */}
                {order.order_type !== 'STITCHING_REQUEST' && (
${oldSpec.replace('{/* STITCHING SPECIFICATIONS */}', '')}
                )}
                `;
content = content.replace(specRegex, newSpec);

// 4. Update DESIGN PHOTOS & SKETCHES to support Audio
const photoRegex = /<div className="grid grid-cols-2 gap-3">.*?<\/div>/s;
const oldPhotos = content.match(photoRegex)[0];
const newPhotos = `<div className="grid grid-cols-2 gap-3">
                        {activeOutfit.photos.map((photo: any, index: number) => {
                          const url = photo.file_url || photo.url || photo.image || photo;
                          const isAudio = url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note');
                          
                          if (isAudio) {
                            return (
                              <div key={index} className="col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Mic className="w-4 h-4 text-[#5B43EE]" />
                                  <span className="text-[12px] font-bold text-[#0F172A]">Voice Note</span>
                                </div>
                                <audio controls src={url} className="w-full h-8" />
                              </div>
                            );
                          }

                          return (
                          <div 
                            key={index}
                            onClick={() => { setViewerImage(url); setViewerOpen(true); }}
                            className="aspect-square rounded-xl border border-[#E2E8F0] overflow-hidden bg-gray-50 relative group cursor-pointer"
                          >
                            <img 
                              src={url} 
                              alt={\`Design Reference \${index + 1}\`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        )})}
                      </div>`;
content = content.replace(oldPhotos, newPhotos);


// 5. Add "Cancel Entire Request" at the very bottom of the page (below details block)
const detailsEnd = `              </div>
            )}
          </>
        )}
      </div>`;

const newDetailsEnd = `              </div>
            )}
            
            {/* ENTIRE ORDER ACTIONS */}
            {order.order_type === 'STITCHING_REQUEST' && (
              <div className="mt-4 mb-8">
                <button className="w-full py-4 rounded-xl border-2 border-red-100 text-red-500 font-bold text-[14px] bg-red-50 active:bg-red-100 flex justify-center items-center gap-2">
                  <X size={18} />
                  Cancel Entire Request
                </button>
              </div>
            )}
          </>
        )}
      </div>`;
content = content.replace(detailsEnd, newDetailsEnd);


fs.writeFileSync(file, content);
console.log('Order patch done');
