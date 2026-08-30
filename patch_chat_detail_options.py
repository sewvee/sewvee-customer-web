import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

# Add Mic and Edit2, Trash2 to imports
if "Mic" not in content:
    content = content.replace("MoreVertical } from 'lucide-react';", "MoreVertical, Mic, Edit2, Trash2 } from 'lucide-react';")

# Add state
if "const [selectedMessageForOptions" not in content:
    content = content.replace("const [sending, setSending] = useState(false);", "const [sending, setSending] = useState(false);\n  const [selectedMessageForOptions, setSelectedMessageForOptions] = useState<any>(null);")

# Message rendering - wrap the message bubble in a group, and show 3 dots on the side
old_msg = """                <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                  {showSender && !isCustomer && (
                    <span className="text-[11px] font-bold text-gray-400 mb-1 ml-1">{msg.sender_type}</span>
                  )}
                  <div className={`relative px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm ${
                    isCustomer 
                      ? 'bg-[#5B43EE] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-[#0F172A] rounded-tl-sm'
                  }`}>"""

new_msg = """                <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} group w-full`}>
                  {showSender && !isCustomer && (
                    <span className="text-[11px] font-bold text-gray-400 mb-1 ml-1">{msg.sender_type}</span>
                  )}
                  <div className={`flex items-center gap-2 max-w-[85%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                      isCustomer 
                        ? 'bg-[#5B43EE] text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-[#0F172A] rounded-tl-sm'
                    }`}>"""

content = content.replace(old_msg, new_msg)

old_msg_end = """                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>"""

new_msg_end = """                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                  {isCustomer && (
                    <button 
                      onClick={() => setSelectedMessageForOptions(msg)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all shrink-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                  </div>
                </div>"""

content = content.replace(old_msg_end, new_msg_end)


# Input area Mic icon
old_input = """        <button className="p-3 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shrink-0">
          <ImageIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl flex items-end overflow-hidden">"""

new_input = """        <button className="p-3 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shrink-0">
          <ImageIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl flex items-end overflow-hidden">"""

content = content.replace(old_input, new_input)

# Wait, the user wants Mic icon. Let's put Mic instead of Send when input is empty!
old_send = """          <button 
            disabled={!inputText.trim() || sending}
            onClick={handleSend}
            className="p-3 text-white bg-[#5B43EE] hover:bg-indigo-700 transition-colors shrink-0 rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>"""

new_send = """          {inputText.trim() ? (
            <button 
              disabled={sending}
              onClick={handleSend}
              className="p-3 text-white bg-[#5B43EE] hover:bg-indigo-700 transition-colors shrink-0 rounded-full disabled:opacity-50"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button 
              className="p-3 text-white bg-[#5B43EE] hover:bg-indigo-700 transition-colors shrink-0 rounded-full"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}"""

content = content.replace(old_send, new_send)


# BottomSheet for Message Options
options_sheet = """
      {/* Message Options Drawer */}
      <BottomSheet open={!!selectedMessageForOptions} onClose={() => setSelectedMessageForOptions(null)}>
        <div className="p-2 pb-6">
          <div className="px-4 mb-4">
            <p className="text-[14px] text-gray-500 truncate">"{selectedMessageForOptions?.message}"</p>
          </div>
          <div className="space-y-1">
            <button onClick={() => setSelectedMessageForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <Edit2 className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Edit message</span>
            </button>
            <button onClick={() => setSelectedMessageForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-red-50 rounded-xl transition-colors text-left">
              <Trash2 className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-[15px] font-medium text-red-600">Delete message</span>
            </button>
          </div>
        </div>
      </BottomSheet>
"""

idx = content.rfind("    </div>\n  );\n}")
if idx != -1:
    content = content[:idx] + options_sheet + content[idx:]


with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

