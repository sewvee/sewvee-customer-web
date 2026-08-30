import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Platform-Admin/app/customers/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add import
content = content.replace(
    'import { showError } from "@/services/toastService";',
    'import { showError } from "@/services/toastService";\nimport { CustomerDetailDrawer } from "./CustomerDetailDrawer";'
)

# Add state
content = content.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);'
)

# Add onRowClick
content = content.replace(
    'getRowId={(row) => row.id}',
    'getRowId={(row) => row.id}\n          onRowClick={(row) => setSelectedCustomerId(row.id)}'
)

# Add Drawer to render tree
content = content.replace(
    '</Card>',
    '</Card>\n      <CustomerDetailDrawer customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />'
)

with open(path, 'w') as f:
    f.write(content)
