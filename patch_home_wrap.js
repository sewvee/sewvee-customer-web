const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/home/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<span className="text-[12px] font-bold text-[#0F172A]">Online Stitching</span>',
  '<span className="text-[12px] font-bold text-[#0F172A] text-center leading-tight">Online Stitching</span>'
);

code = code.replace(
  '<span className="text-[12px] font-bold text-[#0F172A]">Ready-to-Wear</span>',
  '<span className="text-[12px] font-bold text-[#0F172A] text-center leading-tight">Ready-to-Wear</span>'
);

code = code.replace(
  '<span className="text-[12px] font-bold text-[#0F172A]">My Designs</span>',
  '<span className="text-[12px] font-bold text-[#0F172A] text-center leading-tight">My Designs</span>'
);

fs.writeFileSync(file, code);
console.log("Patched text-center on home labels");
