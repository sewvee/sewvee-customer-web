import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

old_end = """                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>"""

new_end = """                    <div className={`text-[10px] mt-1 text-right ${isCustomer ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                  )}"""

content = content.replace(old_end, new_end)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
