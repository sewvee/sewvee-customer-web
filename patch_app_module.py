import re

path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/app.module.ts'
with open(path, 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { AdminCustomerModule } from './admin/customer/admin-customer.module';\n"
content = import_stmt + content

# Add to imports array
content = re.sub(r'imports: \[\n', r'imports: [\n    AdminCustomerModule,\n', content)

with open(path, 'w') as f:
    f.write(content)
