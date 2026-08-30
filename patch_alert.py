import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('alert("Failed to upload photo. Please try again.");', 'alert("Failed to upload photo. " + (err instanceof Error ? err.message : String(err)));')

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
