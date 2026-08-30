import re
with open('/Users/bhuvan/Documents/Bhuvan/Products/sewvee-business-web/src/app/dashboard/orders/CreateOrderDrawer.tsx', 'r') as f:
    content = f.read()

# Fix Blouse Instructions / Comments heading
content = content.replace(
    'className="text-base font-semibold text-slate-800"',
    'className="text-[13px] font-bold text-slate-800"'
)

# Fix Customer Voice Instructions heading
content = content.replace(
    'className="text-base font-semibold text-orange-900"',
    'className="text-[13px] font-bold text-orange-900"'
)

with open('/Users/bhuvan/Documents/Bhuvan/Products/sewvee-business-web/src/app/dashboard/orders/CreateOrderDrawer.tsx', 'w') as f:
    f.write(content)
