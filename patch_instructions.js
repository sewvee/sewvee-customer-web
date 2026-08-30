const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `<p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed whitespace-pre-wrap">{activeOutfit.notes}</p>`;
const newCode = `<p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed whitespace-pre-wrap">{String(activeOutfit.notes || '').replace(/\\[CUSTOMER_CANCELLED\\]/g, '').trim()}</p>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched instructions");
