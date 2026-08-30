const fs = require('fs');
const file = 'src/app/(app)/shop/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCompanyId = "company_id: shopMode === 'BOUTIQUE' ? selectedBoutiqueId : undefined,";
const oldDirect = "is_sewvee_direct: shopMode === 'DIRECT',";

const newCompanyId = "company_id: cart[0]?._company_id !== 'DIRECT' ? (cart[0]?._company_id || selectedBoutiqueId) : undefined,";
const newDirect = "is_sewvee_direct: cart[0]?._company_id === 'DIRECT' || (cart[0]?._company_id === undefined && shopMode === 'DIRECT'),";

if (code.includes(oldCompanyId)) {
  code = code.replace(oldCompanyId, newCompanyId);
  code = code.replace(oldDirect, newDirect);
  fs.writeFileSync(file, code);
  console.log('Successfully patched shop checkout to use cart item origin');
} else {
  console.log('Could not find oldCompanyId in shop/page.tsx');
}
