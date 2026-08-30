import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.module.ts'
with open(path, 'r') as f:
    content = f.read()

# Fix the incorrect import
content = content.replace(', OrderModule]', ']')
content = content.replace('imports: [TypeOrmModule.forFeature([CustomerGalleryFolder, CustomerGalleryImage])]', 'imports: [TypeOrmModule.forFeature([CustomerGalleryFolder, CustomerGalleryImage]), OrderModule]')

with open(path, 'w') as f:
    f.write(content)
