with open('src/app/(app)/orders/[id]/page.tsx', 'r') as f:
    content = f.read()

old = """                              const isAudio = url && (url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios'));
                              const isImage = url && !isAudio;
                              const isSystemMsg = req.message && req.message.includes('[ACTION_REQUIRED');"""

new = """                              const isAudio = url && (url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios'));
                              const isDoc = url && (url.match(/\\.(pdf|doc|docx|txt)$/i) || url.includes('invoice/pdf'));
                              const isImage = url && !isAudio && !isDoc;
                              const isSystemMsg = req.message && req.message.includes('[ACTION_REQUIRED');"""

content = content.replace(old, new)

old_image = """                                    {/* Photo */}
                                    {isImage && (
                                      <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                                        <img src={getImageUrl(url)} alt="Attachment" className="w-full max-h-[220px] object-cover block" />
                                      </div>
                                    )}"""

new_image = """                                    {/* Photo */}
                                    {isImage && (
                                      <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                                        <img src={getImageUrl(url)} alt="Attachment" className="w-full max-h-[220px] object-cover block" />
                                      </div>
                                    )}

                                    {/* Document / Invoice */}
                                    {isDoc && (
                                      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#F1F5F9]" onClick={() => window.open(getImageUrl(url), '_blank')}>
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">📄</div>
                                          <div>
                                            <p className="text-[13px] font-bold text-[#0F172A]">{url.includes('invoice') ? 'Order Invoice' : 'Document'}</p>
                                            <p className="text-[11px] text-[#64748B]">Tap to view</p>
                                          </div>
                                        </div>
                                        <div className="text-indigo-600 text-[11px] font-bold uppercase tracking-wide">Open</div>
                                      </div>
                                    )}"""

content = content.replace(old_image, new_image)

with open('src/app/(app)/orders/[id]/page.tsx', 'w') as f:
    f.write(content)
print("Doc patch applied")
