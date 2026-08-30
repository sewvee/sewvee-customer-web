import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Platform-Admin/components/layout/Sidebar.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add Customers right after Clients
content = content.replace(
    '{ label: "Clients", href: "/clients", icon: UserGroupIcon, module: "Manage Clients", action: "client_list" },',
    '{ label: "Clients", href: "/clients", icon: UserGroupIcon, module: "Manage Clients", action: "client_list" },\n  { label: "Customers", href: "/customers", icon: UsersIcon, module: "Manage Clients", action: "client_list" },'
)

# We need to make sure UsersIcon is imported from @heroicons/react/24/outline
if 'UsersIcon' not in content:
    content = content.replace('UserGroupIcon,', 'UserGroupIcon,\n  UsersIcon,')

with open(path, 'w') as f:
    f.write(content)
