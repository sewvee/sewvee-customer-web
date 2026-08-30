import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

bad = """                    {msg.message && msg.message.includes('[ACTION_REQUIRED: PHOTO_REQUEST]') ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-900 text-[15px] mb-1">Action Required</h4>
                        <p className="text-orange-800 text-[13.5px] leading-snug mb-4">
                          Boutique owner requested photos to be sent.
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollageMakerOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5" />
                          Upload Photos
                        </button>
                      </div>
                    ) :"""

good = """                    {msg.message && msg.message.includes('[ACTION_REQUIRED: PHOTO_REQUEST]') ? (() => {
                      const hasUploadedAfter = filteredMessages.some(m => 
                        m.order_outfit_id === msg.order_outfit_id && 
                        m.sender_type === 'CUSTOMER' && 
                        m.attachment_url && 
                        new Date(m.created_at) > new Date(msg.created_at)
                      );
                      
                      if (hasUploadedAfter) {
                        return (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-emerald-600 text-xl">✓</span>
                            </div>
                            <h4 className="font-bold text-emerald-900 text-[15px] mb-1">Photos Sent</h4>
                            <p className="text-emerald-800 text-[13.5px] leading-snug">
                              You have uploaded the requested photos.
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ImageIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-900 text-[15px] mb-1">Action Required</h4>
                        <p className="text-orange-800 text-[13.5px] leading-snug mb-4">
                          Boutique owner requested photos to be sent.
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollageMakerOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5" />
                          Upload Photos
                        </button>
                      </div>
                      );
                    })() :"""

content = content.replace(bad, good)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
