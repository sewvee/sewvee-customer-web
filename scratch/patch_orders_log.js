const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const order = orders.find((o) => o.id === id);',
  'const order = orders.find((o) => o.id === id);\n  console.log("ORDER DATA:", JSON.stringify(order, null, 2));'
);
content = content.replace(
  'const rawNotes = activeOutfit.customer_notes || activeOutfit.notes || \'\';',
  'const rawNotes = activeOutfit.customer_notes || activeOutfit.notes || \'\';\n                  console.log("RAW NOTES:", rawNotes);'
);

fs.writeFileSync(file, content);
console.log('patched order log');
