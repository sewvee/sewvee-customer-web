const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<h3 className="text-[15px] font-bold text-[#0F172A] truncate">\n                      {t.order_number}\n                    </h3>',
  '<h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-1.5 min-w-0">\n                      <span className="truncate">{t.boutique_name}</span>\n                      <span className="text-gray-400 shrink-0">|</span>\n                      <span className="text-[#5B43EE] shrink-0">#{t.order_number}</span>\n                    </h3>'
);

code = code.replace(
  '<div className="flex items-center mb-1">\n                     <span className="bg-[#F1F5F9] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">\n                        {t.boutique_name}\n                     </span>\n                  </div>',
  ''
);

fs.writeFileSync(file, code);
console.log("Patched chat list title");
