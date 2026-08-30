import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

# Add Link import
if "import Link from 'next/link';" not in content:
    content = content.replace("import { useRouter, useParams } from 'next/navigation';", "import { useRouter, useParams } from 'next/navigation';\nimport Link from 'next/link';")

# Add BottomSheet import
if "import { BottomSheet }" not in content:
    content = content.replace("import { useOrdersStore } from '@/store/ordersStore';", "import { useOrdersStore } from '@/store/ordersStore';\nimport { BottomSheet } from '@/components/ui/BottomSheet';")


with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)

