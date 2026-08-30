const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldHeader = `<h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-1.5 min-w-0">
                      <span className="truncate block">{t.boutique_name}</span>
                      <span className="text-gray-400 shrink-0">|</span>
                      <span className="text-[#5B43EE] shrink-0">#{t.order_number}</span>
                    </h3>`;

const newHeader = `<div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-[14.5px] font-semibold text-[#334155] truncate">
                        {t.boutique_name}
                      </h3>
                      <span className={\`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide \${
                        t.order_number?.startsWith('ENQ-')
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }\`}>
                        #{t.order_number}
                      </span>
                    </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync(file, code);
console.log("Patched list title to subtle tag");
