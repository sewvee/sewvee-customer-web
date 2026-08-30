const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const pendingJSX = `                    {/* PENDING PHOTOS (UNCONFIRMED) */}
                    {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length > 0 && (
                      <div className="w-full mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-amber-700 font-inter uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Pending Uploads
                          </p>
                          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length} to confirm
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).map((pUrl: string, idx: number) => (
                            <div key={idx} className="relative rounded-lg overflow-hidden border border-amber-300 shadow-sm group">
                              <img src={getImageUrl(pUrl)} className="w-full h-28 object-cover" />
                              <button
                                onClick={() => {
                                  setPendingPhotos(prev => {
                                    const next = { ...prev };
                                    const oId = activeOutfit.id || activeOutfit.order_outfit_id;
                                    if (next[oId]) {
                                      next[oId] = next[oId].filter((_, i) => i !== idx);
                                      if (next[oId].length === 0) delete next[oId];
                                    }
                                    return next;
                                  });
                                }}
                                className="absolute top-1.5 right-1.5 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm active:scale-95"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.preventDefault(); setActiveOutfitForCollage(activeOutfit); setCollageOpen(true); }}
                            className="flex-1 py-2.5 bg-white text-amber-600 border border-amber-300 text-[13px] font-bold rounded-lg shadow-sm"
                          >
                            Add More
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOutfitForConfirm(activeOutfit);
                              setConfirmDrawerVisible(true);
                            }}
                            className="flex-[2] py-2.5 bg-amber-500 text-white text-[13px] font-bold rounded-lg shadow-sm"
                          >
                            Confirm Photos
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* COLLAGE MAKER UPLOAD BUTTON (only if NO pending photos) */}
                    {!(pendingPhotos[activeOutfit.id || activeOutfit.order_outfit_id] || []).length && (
                      <button
                        onClick={(e) => { e.preventDefault(); setActiveOutfitForCollage(activeOutfit); setCollageOpen(true); }}
                        className={\`mt-3 w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-90 \${(activeOutfit.requestedPhotosFromClient || activeOutfit.requested_photos_from_client) ? 'bg-[#DC2626] animate-pulse' : 'bg-[#5B43EE]'}\`}
                      >
                        <Camera size={16} className="text-white" />
                        <span className="text-[14px] font-bold text-white font-inter tracking-wide">
                          {(activeOutfit.requestedPhotosFromClient || activeOutfit.requested_photos_from_client) ? 'Upload Photo Needed' : 'Upload Reference Photo'}
                        </span>
                      </button>
                    )}`;

const targetCode = `                    {/* COLLAGE MAKER UPLOAD BUTTON */}
                    <button
                      onClick={(e) => { e.preventDefault(); setActiveOutfitForCollage(activeOutfit); setCollageOpen(true); }}
                      className={\`mt-3 w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-90 \${(activeOutfit.requestedPhotosFromClient || activeOutfit.requested_photos_from_client) ? 'bg-[#DC2626] animate-pulse' : 'bg-[#5B43EE]'}\`}
                    >
                      <Camera size={16} className="text-white" />
                      <span className="text-[14px] font-bold text-white font-inter tracking-wide">
                        {(activeOutfit.requestedPhotosFromClient || activeOutfit.requested_photos_from_client) ? 'Upload Photo Needed' : 'Upload Reference Photo'}
                      </span>
                    </button>`;

if (code.includes(targetCode)) {
  code = code.replace(targetCode, pendingJSX);
  fs.writeFileSync(file, code);
  console.log('Replaced successfully');
} else {
  console.log('Target code not found');
}
