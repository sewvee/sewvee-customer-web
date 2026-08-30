import { readFileSync, writeFileSync } from 'fs';
let content = readFileSync('src/app/(app)/chat/[orderId]/page.tsx', 'utf-8');

content = content.replace(
  'if (user?.mobile && orders.length === 0) fetchOrders(user.mobile);',
  'if (user?.mobile && (!order || orders.length === 0)) {\n      useOrdersStore.getState().refreshOrders(user.mobile);\n    }'
);

writeFileSync('src/app/(app)/chat/[orderId]/page.tsx', content);
