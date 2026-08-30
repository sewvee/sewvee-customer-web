const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<h3 className="text-[14.5px] font-semibold text-[#334155] truncate">',
  '<h3 className={`text-[14.5px] truncate ${t.unread_count > 0 ? \'font-bold text-[#0F172A]\' : \'font-medium text-[#475569]\'}`}>'
);

code = code.replace(
  '<span className="text-[12px] text-gray-400 whitespace-nowrap ml-2">',
  '<span className={`text-[12px] whitespace-nowrap ml-2 ${t.unread_count > 0 ? \'text-[#5B43EE] font-medium\' : \'text-gray-400\'}`}>'
);

code = code.replace(
  '<p className={`text-[13px] truncate ${t.unread_count ? \'text-[#0F172A] font-medium\' : \'text-gray-500\'}`}>',
  '<p className={`text-[13px] truncate ${t.unread_count > 0 ? \'text-[#1E293B] font-semibold\' : \'text-[#64748B]\'}`}>'
);

fs.writeFileSync(file, code);
console.log("Patched chat list unread styles");
