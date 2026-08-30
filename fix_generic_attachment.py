import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

old_link = """                        return (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`mb-3 mt-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-[14px] font-bold shadow-sm transition-all active:scale-[0.98] ${
                              isCustomer 
                                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' 
                                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]'
                            }`}
                          >
                            {isInvoice ? (
                              <>
                                <span className={`flex items-center justify-center rounded-lg w-8 h-8 ${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}`}>📄</span>
                                View Invoice
                              </>
                            ) : (
                              <>
                                <span className={`flex items-center justify-center rounded-lg w-8 h-8 ${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}`}>📎</span>
                                View Attachment
                              </>
                            )}
                          </a>
                        );"""

new_link = """                        return (
                          <button 
                            onClick={(e) => { e.preventDefault(); handleDownloadInvoice(url); }}
                            className={`w-full mb-3 mt-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-[14px] font-bold shadow-sm transition-all active:scale-[0.98] ${
                              isCustomer 
                                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' 
                                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]'
                            }`}
                          >
                            {isInvoice ? (
                              <>
                                <span className={`flex items-center justify-center rounded-lg w-8 h-8 ${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}`}>📄</span>
                                Download Invoice
                              </>
                            ) : (
                              <>
                                <span className={`flex items-center justify-center rounded-lg w-8 h-8 ${isCustomer ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-200'}`}>📎</span>
                                Download Attachment
                              </>
                            )}
                          </button>
                        );"""

content = content.replace(old_link, new_link)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
