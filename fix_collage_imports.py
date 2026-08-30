import re
import glob
import os

files = [
    'src/app/(app)/orders/[id]/page.tsx',
    'src/app/(app)/stitching/page.tsx',
    'src/app/(app)/gallery/page.tsx',
    'src/app/(app)/chat/[orderId]/page.tsx'
]

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace Import
    content = content.replace("import { CollageMakerModal as CollageMaker } from '@/components/chat/CollageMakerModal';", "import CollageMaker from '@/components/CollageMaker';")
    content = content.replace("import { CollageMakerModal } from '@/components/chat/CollageMakerModal';", "import CollageMaker from '@/components/CollageMaker';")
    
    # Replace Component name if it was used as CollageMakerModal
    content = content.replace("<CollageMakerModal", "<CollageMaker")
    
    # In chat page:
    content = content.replace("onSend={async (blob: Blob) => {", "onSave={async (url: string) => {\n        const blob = await (await fetch(url)).blob();")
    content = content.replace("onSend={async (blob) => {", "onSave={async (url: string) => {\n        const blob = await (await fetch(url)).blob();")
    
    # In gallery page:
    content = content.replace("onSend={async () => { setCollageOpen(false); }}", "onSave={async (url: string) => { setCollageOpen(false); }}")

    with open(filepath, 'w') as f:
        f.write(content)

