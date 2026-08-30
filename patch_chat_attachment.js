const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `{msg.attachment_url && (() => {
                        const url = msg.attachment_url as string;
                        const isAudio = url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios');
                        const isImage = !isAudio && url.match(/\\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i);
                        if (isAudio) {
                          return (
                            <div className="mb-2">
                              <audio controls src={url} className="w-full h-9 rounded-lg" />
                            </div>
                          );
                        }
                        if (isImage) {
                          return (
                            <div className="mb-2 rounded-xl overflow-hidden bg-black/5">
                              <img src={url} alt="Attachment" className="w-full h-auto object-cover max-h-[200px]" />
                            </div>
                          );
                        }
                        // Document / other file
                        return (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 text-[13px] font-semibold underline">
                            📎 Attachment
                          </a>
                        );
                      })()}`;

const newCode = `{msg.attachment_url && (() => {
                        let url = msg.attachment_url as string;
                        if (url.startsWith('/')) {
                          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.sewvee.com';
                          url = \`\${apiBase}\${url}\`;
                        }
                        const isAudio = url.match(/\\.(webm|mp3|m4a|wav|ogg|aac)$/i) || url.includes('voice_note') || url.includes('order_audios');
                        const isImage = !isAudio && url.match(/\\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i);
                        if (isAudio) {
                          return (
                            <div className="mb-2">
                              <audio controls src={url} className="w-full h-9 rounded-lg" />
                            </div>
                          );
                        }
                        if (isImage) {
                          return (
                            <div className="mb-2 rounded-xl overflow-hidden bg-black/5">
                              <img src={url} alt="Attachment" className="w-full h-auto object-cover max-h-[200px]" />
                            </div>
                          );
                        }
                        
                        // Document / other file
                        const isInvoice = url.toLowerCase().includes('invoice');
                        
                        return (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={\`mb-3 mt-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-[14px] font-bold shadow-sm transition-all active:scale-[0.98] \${
                              isCustomer 
                                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' 
                                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]'
                            }\`}
                          >
                            {isInvoice ? (
                              <>
                                <span className={\`flex items-center justify-center rounded-lg w-8 h-8 \${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}\`}>📄</span>
                                View Invoice
                              </>
                            ) : (
                              <>
                                <span className={\`flex items-center justify-center rounded-lg w-8 h-8 \${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}\`}>📎</span>
                                View Attachment
                              </>
                            )}
                          </a>
                        );
                      })()}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched chat attachment design and URL logic");
