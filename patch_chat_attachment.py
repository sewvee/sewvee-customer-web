import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { ChevronLeft, Send, ShoppingBag, Image as ImageIcon, Loader2, MessageCircle, MoreVertical, Mic, Edit2, Trash2, Download, Receipt } from 'lucide-react';",
    "import { ChevronLeft, Send, ShoppingBag, Image as ImageIcon, Loader2, MessageCircle, MoreVertical, Mic, Edit2, Trash2, Download, Receipt, Paperclip, Camera } from 'lucide-react';"
)

# 2. Add state and refs inside the component
state_insertion = """  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contextOutfitId) return;
    setShowAttachMenu(false);
    setSending(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key_name', 'chat_attachments');
      
      const uploadRes = await fetch(URL_UPLOAD, {
        method: 'POST',
        headers: { Authorization: formattedToken },
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(`Upload failed`);
      
      const fileUrl = uploadJson.file_url ?? uploadJson.data?.file_url ?? uploadJson.data?.full_url ?? uploadJson.data?.url ?? uploadJson.full_url ?? uploadJson.url ?? '';
      
      if (fileUrl) {
        await api.post(`/customer-portal/orders/${orderId}/outfits/${contextOutfitId}/requests`, {
          message: 'Uploaded Photo',
          attachment_url: fileUrl
        });
        window.location.reload();
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      console.error('Failed to upload file', err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setSending(false);
      // Reset input
      e.target.value = '';
    }
  };
"""
content = content.replace("const endRef = useRef<HTMLDivElement>(null);", "const endRef = useRef<HTMLDivElement>(null);\n" + state_insertion)

# 3. Replace the input area attachment button
old_input_area = """      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0 flex items-end gap-2 pb-safe">
        <button className="p-3 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shrink-0">
          <ImageIcon className="w-5 h-5" />
        </button>"""

new_input_area = """      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0 flex items-end gap-2 pb-safe relative">
        {showAttachMenu && (
          <div className="absolute bottom-16 left-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 flex flex-col gap-1 z-50 min-w-[160px]">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left text-sm font-semibold text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Camera className="w-4 h-4 text-blue-600" />
              </div>
              Camera
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left text-sm font-semibold text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-purple-600" />
              </div>
              Gallery
            </button>
            <button 
              onClick={() => { setShowAttachMenu(false); setCollageMakerOutfitId(Number(contextOutfitId)); }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left text-sm font-semibold text-gray-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
              </div>
              Collage Maker
            </button>
          </div>
        )}
        
        {/* Hidden File Inputs */}
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleSingleFileUpload} />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleSingleFileUpload} />
        
        <button 
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          disabled={!contextOutfitId || sending}
          className={`p-3 rounded-full transition-colors shrink-0 ${!contextOutfitId || sending ? 'text-gray-300 bg-gray-50' : (showAttachMenu ? 'text-white bg-[#5B43EE] shadow-md' : 'text-gray-400 bg-gray-50 hover:bg-gray-100')}`}
        >
          <Paperclip className="w-5 h-5" />
        </button>"""

content = content.replace(old_input_area, new_input_area)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

