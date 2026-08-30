const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `              <h1 className="text-[18px] font-bold text-[#0F172A] font-inter">
                {displayId}
              </h1>`;

const newCode = `              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold text-[#0F172A] font-inter">
                  {displayId}
                </h1>
                {(order?.status?.id === 4 || order?.status?.name === 'CANCELLED') && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-bold tracking-widest uppercase">
                    Cancelled
                  </span>
                )}
              </div>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched customer web header");
