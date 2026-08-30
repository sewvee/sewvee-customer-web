const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/order\.payments/g, '(order as any).payments');
content = content.replace(/order\.urgency/g, '(order as any).urgency');
content = content.replace(/order\?\.company/g, '(order as any)?.company');
content = content.replace(/order\?\.boutiqueTerms/g, '(order as any)?.boutiqueTerms');

fs.writeFileSync(file, content);
console.log('Types fixed');
