with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()
    
content = content.replace("import { useEffect, useState, useRef } from 'react';", "import { useEffect, useState, useRef, useCallback } from 'react';")

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

print("Patch applied")
