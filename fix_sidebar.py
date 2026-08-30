import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Platform-Admin/components/layout/Sidebar.tsx'
with open(path, 'r') as f:
    content = f.read()

if 'UsersIcon' not in content[:content.find('}')]: # Only look in the imports area
    content = content.replace('UserGroupIcon,', 'UserGroupIcon,\n  UsersIcon,', 1)

with open(path, 'w') as f:
    f.write(content)
