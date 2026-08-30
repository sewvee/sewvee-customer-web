const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/order/order.service.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'await this.triggerPhotoRequestMessage(id, outfit.id, userId, manager);',
  'await this.triggerPhotoRequestMessage(orderId || savedOrder.id, outfit.id, userId, manager);'
);

code = code.replace(
  'if (requested) await this.triggerPhotoRequestMessage(outfit.order_id, outfit.id, order.created_by || 1);',
  'if (requested) await this.triggerPhotoRequestMessage(outfit.order_id, outfit.id, 1);'
);

fs.writeFileSync(file, code);
