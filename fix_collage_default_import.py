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

    content = content.replace("import CollageMaker from '@/components/CollageMaker';", "import { CollageMaker } from '@/components/CollageMaker';")

    with open(filepath, 'w') as f:
        f.write(content)

