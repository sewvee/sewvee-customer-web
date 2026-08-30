const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(\!user\?\.mobile \|\| \!orderId\) return;/g,
  'if (!orderId) { setLoading(false); return; }'
);

code = code.replace(
  /params: \{ phone: user\.mobile \}/g,
  '/* no params needed */'
);

fs.writeFileSync(file, code);
console.log("Fixed");
