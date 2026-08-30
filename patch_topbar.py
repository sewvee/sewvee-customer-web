import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Platform-Admin/components/layout/Topbar.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add isCustomersList
if 'const isCustomersList = pathname === "/customers";' not in content:
    content = content.replace(
        'const isClientsList = pathname === "/clients";',
        'const isClientsList = pathname === "/clients";\n  const isCustomersList = pathname === "/customers";'
    )

content = content.replace(
    'isClientsList || isClientDetail || isSubscriptionsFromDashboard',
    'isCustomersList || isClientsList || isClientDetail || isSubscriptionsFromDashboard'
)

# Update breadcrumb strings
content = content.replace(
    'isClientsList\n                ? "Clients"',
    'isCustomersList\n                ? "Customers"\n              : isClientsList\n                ? "Clients"'
)
content = content.replace(
    'isClientsList\n              ? "Here you can manage clients"',
    'isCustomersList\n              ? "Here you can view all customer signups and their lifetime order history."\n              : isClientsList\n              ? "Here you can manage clients"'
)

with open(path, 'w') as f:
    f.write(content)
