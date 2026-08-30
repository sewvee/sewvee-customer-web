const fs = require('fs');
const file = 'src/app/(app)/shop/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix cartTotal calculation
code = code.replace(
  'const cartTotal = cart.reduce((acc, c) => acc + (Number(c.price) * (c.quantity || 1)), 0);',
  'const cartTotal = cart.reduce((acc, c) => acc + (Number(c.selling_price || c.price || 0) * (c.quantity || 1)), 0);'
);

// 2. Fix cart item rendering
code = code.replace(
  '<p className="text-[#5B43EE] font-bold text-sm mt-1">₹{item.price}</p>',
  '<p className="text-[#5B43EE] font-bold text-sm mt-1">₹{item.selling_price || item.price}</p>'
);

fs.writeFileSync(file, code);
console.log('Successfully patched shop price bug!');
