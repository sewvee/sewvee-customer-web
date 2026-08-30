const fs = require('fs');
const file = 'src/app/(app)/shop/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/Number\(c\.price\)/g, 'Number(c.selling_price || c.price || 0)');

fs.writeFileSync(file, code);
console.log('Successfully patched shop payload prices!');
