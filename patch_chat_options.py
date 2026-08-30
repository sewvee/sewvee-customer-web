import re

with open('src/app/(app)/chat/page.tsx', 'r') as f:
    content = f.read()

# Add MoreVertical to imports
if "MoreVertical" not in content:
    content = content.replace("ShoppingBag } from 'lucide-react';", "ShoppingBag, MoreVertical, Pin, Star, CheckCircle } from 'lucide-react';")

# Add state
if "const [selectedThreadForOptions" not in content:
    content = content.replace("const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false);", "const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false);\n  const [selectedThreadForOptions, setSelectedThreadForOptions] = useState<any>(null);")

# Add 3 dots icon next to time
old_time = """                    <span className={`text-[12px] whitespace-nowrap ml-2 ${t.unread_count > 0 ? 'text-[#5B43EE] font-medium' : 'text-gray-400'}`}>
                      {formatTime(t.latest_message_timestamp)}
                    </span>
                  </div>"""

new_time = """                    <div className="flex items-center ml-2 shrink-0">
                      <span className={`text-[12px] whitespace-nowrap mr-1 ${t.unread_count > 0 ? 'text-[#5B43EE] font-medium' : 'text-gray-400'}`}>
                        {formatTime(t.latest_message_timestamp)}
                      </span>
                      <button 
                        onClick={(e) => { e.preventDefault(); setSelectedThreadForOptions(t); }}
                        className="p-1 -mr-1 rounded-full hover:bg-gray-100 text-gray-400"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>"""
content = content.replace(old_time, new_time)

# Add BottomSheet for options at the end
options_sheet = """
      {/* Thread Options Drawer */}
      <BottomSheet open={!!selectedThreadForOptions} onClose={() => setSelectedThreadForOptions(null)}>
        <div className="p-2 pb-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
              {selectedThreadForOptions?.profile_icon_url ? (
                <img src={selectedThreadForOptions.profile_icon_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0F172A]">{selectedThreadForOptions?.boutique_name}</h3>
              <p className="text-[12px] text-gray-500">#{selectedThreadForOptions?.order_number}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button onClick={() => setSelectedThreadForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Mark as {selectedThreadForOptions?.unread_count ? 'read' : 'unread'}</span>
            </button>
            <button onClick={() => setSelectedThreadForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <Pin className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Pin chat</span>
            </button>
            <button onClick={() => setSelectedThreadForOptions(null)} className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <Star className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-[15px] font-medium text-gray-700">Add to favorites</span>
            </button>
          </div>
        </div>
      </BottomSheet>
"""

idx = content.rfind("    </div>\n  );\n}")
if idx != -1:
    content = content[:idx] + options_sheet + content[idx:]

with open('src/app/(app)/chat/page.tsx', 'w') as f:
    f.write(content)

