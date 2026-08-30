const fs = require('fs');
const path = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/customer-portal/customer-portal.service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `if (!order.length) {
        throw new Error('Order not found or unauthorized');
      }`,
  `if (!order.length) {
        throw new import_common.NotFoundException('Order not found or unauthorized for phone: ' + phone);
      }`
);

// wait, import_common is not defined, we should use \`@nestjs/common\`
code = code.replace(
  `throw new Error('Order not found or unauthorized');`,
  `throw new Error('Order not found or unauthorized for order: ' + orderId + ' and phone: ' + phone);`
);

fs.writeFileSync(path, code);
