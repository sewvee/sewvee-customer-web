const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<span className="text-[14px] font-semibold text-[#0F172A] mt-1">{m.value}</span>',
  '<span className="text-[14px] font-semibold text-[#0F172A] mt-1">{typeof m.value === "object" && m.value !== null ? (m.value.value || JSON.stringify(m.value)) : m.value}</span>'
);

fs.writeFileSync(file, code);
console.log("Patched measurement value to handle objects");
