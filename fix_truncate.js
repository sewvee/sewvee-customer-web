const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<span className="truncate">{t.boutique_name}</span>',
  '<span className="truncate block">{t.boutique_name}</span>'
);

fs.writeFileSync(file, code);
console.log("Fixed truncate");
