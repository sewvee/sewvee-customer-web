const fs = require('fs');
const path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /throw new import_common\.NotFoundException\('Order not found or unauthorized for phone: ' \+ phone\);/g,
  `throw new Error('Order not found or unauthorized for phone: ' + phone);`
);

fs.writeFileSync(path, code);
