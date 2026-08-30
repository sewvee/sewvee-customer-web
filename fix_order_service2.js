const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/order/order.service.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'await this.triggerPhotoRequestMessage(orderId || savedOrder.id, outfit.id, userId, manager);',
  'await this.triggerPhotoRequestMessage(order.id, outfit.id, userId, manager);'
);

fs.writeFileSync(file, code);
