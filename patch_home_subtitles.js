const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/home/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<span className="text-[12px] font-bold text-[#0F172A] text-center leading-tight">Online<br/>Stitching</span>',
  '<span className="text-[13px] font-bold text-[#0F172A]">Stitching</span>\n              <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-tight">Online stitching</span>'
);

code = code.replace(
  '<span className="text-[12px] font-bold text-[#0F172A] text-center leading-tight">Shop<br/>Ready-to-Wear</span>',
  '<span className="text-[13px] font-bold text-[#0F172A]">Readymade</span>\n              <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-tight">Shop readymades</span>'
);

code = code.replace(
  '<span className="text-[12px] font-bold text-[#0F172A] text-center leading-tight">My<br/>Designs</span>',
  '<span className="text-[13px] font-bold text-[#0F172A]">My Designs</span>\n              <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-tight">View my designs</span>'
);

fs.writeFileSync(file, code);
console.log("Patched home labels with subtitles");
