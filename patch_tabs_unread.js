const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'outfit_name: string;',
  'outfit_name: string;\n  is_read_by_customer?: boolean;'
);

const oldMap = `const oid = outf.id || outf.order_outfit_id;
              const isActive = String(contextOutfitId) === String(oid);
              return (
                <button
                  key={oid}
                  onClick={() => setContextOutfitId(String(oid))}
                  className={\`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 \${
                    isActive 
                      ? 'bg-[#5B43EE] text-white shadow-sm' 
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }\`}
                >
                  {outf.name || outf.outfit_type || 'Outfit'}
                </button>
              );`;

const newMap = `const oid = outf.id || outf.order_outfit_id;
              const isActive = String(contextOutfitId) === String(oid);
              const hasUnread = messages.some(m => String(m.order_outfit_id) === String(oid) && m.sender_type !== 'CUSTOMER' && !m.is_read_by_customer);
              return (
                <button
                  key={oid}
                  onClick={() => setContextOutfitId(String(oid))}
                  className={\`relative px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 \${
                    isActive 
                      ? 'bg-[#5B43EE] text-white shadow-sm' 
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }\`}
                >
                  {outf.name || outf.outfit_type || 'Outfit'}
                  {hasUnread && !isActive && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
              );`;

code = code.replace(oldMap, newMap);
fs.writeFileSync(file, code);
console.log("Added unread dot to tabs");
