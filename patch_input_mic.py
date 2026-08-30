import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

old_button = """        <button 
          onClick={handleSend}
          disabled={!inputText.trim() || !contextOutfitId || sending}
          className="p-3 bg-[#5B43EE] text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors shrink-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
        </button>"""

new_button = """        {inputText.trim() ? (
          <button 
            onClick={handleSend}
            disabled={!contextOutfitId || sending}
            className="p-3 bg-[#5B43EE] text-white rounded-full disabled:opacity-50 transition-colors shrink-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        ) : (
          <button 
            disabled={!contextOutfitId || sending}
            className="p-3 bg-[#5B43EE] text-white rounded-full disabled:opacity-50 transition-colors shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}"""

content = content.replace(old_button, new_button)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
