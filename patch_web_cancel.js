const fs = require('fs');

const envFile = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/lib/env.ts';
let envContent = fs.readFileSync(envFile, 'utf8');
envContent = envContent.replace(
  /export const URL_ORDER_STATUS = \(id: string\) => `\$\{URL_ORDERS\}\/\$\{id\}\/status`;/,
  'export const URL_ORDER_STATUS = (id: string) => `${URL_ORDERS}/${id}/status`;\nexport const URL_CUSTOMER_PORTAL_ORDER_STATUS = (id: string) => `${URL_CUSTOMER_PORTAL_ORDERS}/${id}/status`;'
);
fs.writeFileSync(envFile, envContent);

const storeFile = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/store/ordersStore.ts';
let storeContent = fs.readFileSync(storeFile, 'utf8');
storeContent = storeContent.replace(
  /const \{ URL_ORDER_STATUS \} = await import\('@\/lib\/env'\);/,
  "const { URL_CUSTOMER_PORTAL_ORDER_STATUS } = await import('@/lib/env');"
);
storeContent = storeContent.replace(
  /const res = await fetch\(URL_ORDER_STATUS\(orderId\), \{/,
  'const res = await fetch(URL_CUSTOMER_PORTAL_ORDER_STATUS(orderId), {'
);
fs.writeFileSync(storeFile, storeContent);
console.log('Web patched');
