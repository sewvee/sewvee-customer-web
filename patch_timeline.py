with open('src/app/(app)/orders/[id]/page.tsx', 'r') as f:
    content = f.read()

old = '''                {/* CUSTOMER + BOUTIQUE REQUESTS FEED */}
                {order.order_type !== 'STITCHING_REQUEST' && (() => {
                  const activeOutfitId = String(activeOutfit.id || activeOutfit.order_outfit_id || '');
                  const filteredReqs = outfitRequests.filter((r: any) => {
                    if (!activeOutfitId) return true;
                    return String(r.outfit_id || r.order_outfit_id || r.outfitId || '') === activeOutfitId || !r.outfit_id;
                  });
                  return (
                    <>
                      {filteredReqs.length > 0 && (
                        <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <Mic className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                            <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">Notes, Photos & Voice Notes</h2>
                          </div>
                          <div className="flex flex-col p-4 gap-3">
                            {filteredReqs.map((req: any, rIdx: number) => {
                              const isCustomer = req.sender_type === 'CUSTOMER' || req.phone === user?.mobile;
                              const url: string = req.attachment_url || req.file_url || '';
                              const isAudio = url && (url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios'));
                              const isImage = url && !isAudio;

                              return (
                                <div key={req.id || rIdx} className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isCustomer ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#FEF3C7] text-[#B45309]'}`}>
                                      {isCustomer ? 'You' : 'Boutique'}
                                    </span>
                                    <span className="text-[9px] text-[#94A3B8]">
                                      {new Date(req.created_at || req.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  {isAudio && (
                                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
                                      <p className="text-[11px] font-semibold text-[#5B43EE] mb-1.5 flex items-center gap-1"><Mic className="w-3 h-3" /> Voice Note</p>
                                      <audio controls src={getImageUrl(url)} className="w-full h-9 rounded-lg" />
                                    </div>
                                  )}
                                  {isImage && (
                                    <div className="w-full h-[180px] rounded-[10px] overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
                                      <img src={getImageUrl(url)} alt="Attachment" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  {req.message && (
                                    <p className="text-[13px] text-[#1E293B] bg-[#F8FAFC] rounded-xl px-3 py-2 border border-[#F1F5F9]">{req.message}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}'''

new = '''                {/* CUSTOMER + BOUTIQUE REQUESTS FEED — Timeline */}
                {order.order_type !== 'STITCHING_REQUEST' && (() => {
                  const activeOutfitId = String(activeOutfit.id || activeOutfit.order_outfit_id || '');
                  const filteredReqs = outfitRequests.filter((r: any) => {
                    if (!activeOutfitId) return true;
                    return String(r.outfit_id || r.order_outfit_id || r.outfitId || '') === activeOutfitId || !r.outfit_id;
                  });
                  const visibleReqs = filteredReqs.filter((r: any) => {
                    const isSystemOnly = r.message && r.message.includes('[ACTION_REQUIRED') && !r.attachment_url && !r.file_url;
                    return !isSystemOnly;
                  });
                  return (
                    <>
                      {visibleReqs.length > 0 && (
                        <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <Mic className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                            <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">Notes, Photos & Voice Notes</h2>
                          </div>
                          <div className="px-4 pt-5 pb-3">
                            {visibleReqs.map((req: any, rIdx: number) => {
                              const isCustomer = req.sender_type === 'CUSTOMER' || req.phone === user?.mobile;
                              const url: string = req.attachment_url || req.file_url || '';
                              const isAudio = url && (url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios'));
                              const isImage = url && !isAudio;
                              const isSystemMsg = req.message && req.message.includes('[ACTION_REQUIRED');
                              const isLast = rIdx === visibleReqs.length - 1;
                              const timeStr = new Date(req.created_at || req.createdAt || Date.now())
                                .toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                              return (
                                <div key={req.id || rIdx} className="flex gap-3">
                                  {/* Timeline dot + spine */}
                                  <div className="flex flex-col items-center shrink-0 w-8">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm ring-2 ${isCustomer ? 'bg-[#EEF2FF] ring-[#C7D2FE] text-[#4F46E5]' : 'bg-[#FFFBEB] ring-[#FDE68A] text-[#B45309]'}`}>
                                      {isCustomer ? 'Y' : 'B'}
                                    </div>
                                    {!isLast && <div className="w-[2px] flex-1 bg-[#E2E8F0] mt-1" style={{minHeight: 20}} />}
                                  </div>

                                  {/* Right content */}
                                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-5'}`}>
                                    {/* Sender + time */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isCustomer ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
                                        {isCustomer ? 'You' : 'Boutique'}
                                      </span>
                                      <span className="text-[10px] text-[#94A3B8]">{timeStr}</span>
                                    </div>

                                    {/* Voice Note */}
                                    {isAudio && (
                                      <div className={`rounded-2xl p-3 border ${isCustomer ? 'bg-[#EEF2FF] border-[#C7D2FE]' : 'bg-[#FFFBEB] border-[#FDE68A]'}`}>
                                        <p className={`text-[11px] font-semibold mb-2 flex items-center gap-1.5 ${isCustomer ? 'text-[#4F46E5]' : 'text-[#B45309]'}`}>
                                          <Mic className="w-3.5 h-3.5" /> Voice Note
                                        </p>
                                        <audio controls src={getImageUrl(url)} className="w-full h-8 rounded-lg" />
                                      </div>
                                    )}

                                    {/* Photo */}
                                    {isImage && (
                                      <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                                        <img src={getImageUrl(url)} alt="Attachment" className="w-full max-h-[220px] object-cover block" />
                                      </div>
                                    )}

                                    {/* Text note (not system, not a caption under image) */}
                                    {req.message && !isSystemMsg && !isImage && (
                                      <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${isCustomer ? 'bg-[#EEF2FF] text-[#1E293B] border border-[#C7D2FE]' : 'bg-[#FFFBEB] text-[#1E293B] border border-[#FDE68A]'}`}>
                                        {req.message}
                                      </div>
                                    )}

                                    {/* Caption under a photo */}
                                    {isImage && req.message && !isSystemMsg && (
                                      <p className="text-[11px] text-[#64748B] mt-1.5 px-0.5">{req.message}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}'''

if old in content:
    content = content.replace(old, new)
    with open('src/app/(app)/orders/[id]/page.tsx', 'w') as f:
        f.write(content)
    print("Done")
else:
    print("OLD BLOCK NOT FOUND")
