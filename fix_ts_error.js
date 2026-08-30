const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /order\?\.outfits\?\.length > 1 \|\| order\?\.items\?\.length > 1/g,
  '(order?.outfits?.length ?? 0) > 1 || (order?.items?.length ?? 0) > 1'
);

fs.writeFileSync(file, code);
console.log("Fixed TS");
