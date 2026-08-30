import re

with open('src/app/(app)/orders/[id]/page.tsx', 'r') as f:
    content = f.read()

old_block = """                        if (isAudio) {
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
                            <img src={getImageUrl(url)} alt="Design" className="w-full h-full object-contain" />
                          </div>
                        );"""

new_block = """                        const isCustomerByAudio = isAudio && photo.duration === 0;
                        const isCustomerByReq = outfitRequests.some((r: any) => r.sender_type === 'CUSTOMER' && (r.attachment_url === url || r.file_url === url));
                        const isBoutiqueByReq = outfitRequests.some((r: any) => r.sender_type === 'BUSINESS' && (r.attachment_url === url || r.file_url === url));
                        
                        // Heuristic fallback: if it's the first audio and there are multiple audios, often customer. Or if not claimed by boutique.
                        const isCustomer = isCustomerByAudio || isCustomerByReq || (!isBoutiqueByReq && pIdx === 0 && activeOutfit.photos.length > 1);

                        if (isAudio) {
                          return (
                            <div key={pIdx} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex flex-col gap-2 relative">
                              <div className="absolute top-2 right-2">
                                {isCustomer ? (
                                  <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-orange-200">Customer</span>
                                ) : (
                                  <span className="bg-[#5B43EE]/10 text-[#5B43EE] px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-[#5B43EE]/20">Boutique</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Mic className="w-4 h-4 text-[#5B43EE]" />
                                <span className="text-[12px] font-bold text-[#0F172A]">Voice Note</span>
                              </div>
                              <audio controls src={url} className="w-full h-8" />
                            </div>
                          );
                        }

                        return (
                          <div key={pIdx} className="w-full rounded-[10px] overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0] relative">
                            <div className="absolute top-2 right-2 z-10 shadow-sm">
                              {isCustomer ? (
                                <span className="bg-orange-100/90 text-orange-800 px-2 py-1 rounded text-[10px] font-black uppercase border border-orange-300 backdrop-blur-sm shadow-sm">Customer</span>
                              ) : (
                                <span className="bg-[#5B43EE]/90 text-white px-2 py-1 rounded text-[10px] font-black uppercase border border-[#5B43EE] backdrop-blur-sm shadow-sm">Boutique</span>
                              )}
                            </div>
                            <img src={getImageUrl(url)} alt="Design" className="w-full h-auto max-h-[300px] object-contain" />
                          </div>
                        );"""

content = content.replace(old_block, new_block)

with open('src/app/(app)/orders/[id]/page.tsx', 'w') as f:
    f.write(content)
