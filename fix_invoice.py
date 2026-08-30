import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

# 1. Add lucide imports
content = content.replace(
    "import { ChevronLeft, Send, ShoppingBag, Image as ImageIcon, Loader2, MessageCircle, MoreVertical, Mic, Edit2, Trash2 } from 'lucide-react';",
    "import { ChevronLeft, Send, ShoppingBag, Image as ImageIcon, Loader2, MessageCircle, MoreVertical, Mic, Edit2, Trash2, Download, Receipt } from 'lucide-react';"
)

# 2. Add handleDownloadInvoice function
handle_fn = """
  const handleDownloadInvoice = async (url: string) => {
    try {
      const token = localStorage.getItem('sewvee_customer_token');
      const res = await fetch(url, {
        headers: {
          Authorization: token?.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `Invoice_${displayId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error("Failed to download invoice", e);
    }
  };

"""

content = content.replace("const formatTime = (iso: string) => {", handle_fn + "  const formatTime = (iso: string) => {")


# 3. Replace bubble logic
old_bubble = """                  <div className={`flex items-center gap-2 max-w-[85%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`max-w-full rounded-2xl px-4 py-2.5 shadow-sm ${
                    isCustomer 
                      ? 'bg-[#5B43EE] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-[#0F172A] rounded-tl-sm'
                  }`}>"""

new_bubble = """                  <div className={`flex items-center gap-2 max-w-[85%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.message && msg.message.includes('invoice/receipt here for your reference') && msg.attachment_url ? (
                      <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm mb-1 w-full max-w-[280px]">
                        <div className="bg-indigo-50/50 p-3 border-b border-indigo-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Receipt className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-[13px] font-bold text-indigo-900 leading-tight">Order Invoice</h3>
                              <p className="text-[10px] text-indigo-500 font-medium">#{displayId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white text-[13px] text-slate-600 leading-relaxed border-b border-slate-50">
                          {renderMessageContent(msg.message, isCustomer)}
                        </div>
                        <div className="p-2.5 bg-slate-50 flex justify-end">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              let url = msg.attachment_url as string;
                              if (url.startsWith('/')) {
                                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.sewvee.com';
                                url = `${apiBase}${url}`;
                              }
                              handleDownloadInvoice(url);
                            }}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div className={`max-w-full rounded-2xl px-4 py-2.5 shadow-sm ${
                    isCustomer 
                      ? 'bg-[#5B43EE] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-[#0F172A] rounded-tl-sm'
                  }`}>"""

content = content.replace(old_bubble, new_bubble)

# Need to close the ternary at the end of the bubble
old_end = """                      </div>
                    )}
                  </div>"""

new_end = """                      </div>
                    )}
                  </div>
                  )}"""
content = content.replace(old_end, new_end)


with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
