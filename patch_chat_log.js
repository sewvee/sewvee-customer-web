const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'async function loadChat() {',
  'console.log("LOAD CHAT CALLED", { userMobile: user?.mobile, orderId });\n    async function loadChat() {'
);

code = code.replace(
  'setLoading(false);',
  'console.log("SETTING LOADING FALSE");\n        setLoading(false);'
);

fs.writeFileSync(file, code);
console.log("Patched");
