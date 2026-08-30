const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const photoRegex = /\{\/\* DESIGN PHOTOS & SKETCHES \*\/\}.*?(?=\{\/\* PHOTO UPLOAD \(IF REQUESTED\) \*\/)/s;
const oldPhotos = content.match(photoRegex)[0];

const newPhotos = `{/* DESIGN PHOTOS & SKETCHES */}
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

                `;

content = content.replace(oldPhotos, newPhotos);
fs.writeFileSync(file, content);
console.log('Photos patched');
