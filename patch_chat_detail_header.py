import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

if "import Link from 'next/link';" not in content:
    content = content.replace("import { ChevronLeft, ShoppingBag, Send, Image as ImageIcon } from 'lucide-react';", "import { ChevronLeft, ShoppingBag, Send, Image as ImageIcon, MoreVertical } from 'lucide-react';\nimport Link from 'next/link';")

old_header = """        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-bold text-white truncate">{headerTitle}</h1>
          {headerSubtitle && <p className="text-[12px] text-indigo-200 truncate">{headerSubtitle}</p>}
        </div>
      </div>"""

new_header = """        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-bold text-white truncate">{headerTitle}</h1>
          {headerSubtitle && <p className="text-[12px] text-indigo-200 truncate">{headerSubtitle}</p>}
        </div>
        <Link 
          href={`/orders/${orderId}`}
          className="ml-2 flex items-center justify-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[11px] font-bold text-white transition-colors whitespace-nowrap"
        >
          View Order
        </Link>
      </div>"""

content = content.replace(old_header, new_header)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

