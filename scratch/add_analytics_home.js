const fs = require('fs');
const file = 'src/app/(app)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { logEvent }")) {
  content = content.replace("import api from '@/lib/api';", "import api from '@/lib/api';\nimport { logEvent } from '@/lib/analytics';");
}

content = content.replace(
  /onClick=\{\(\) => setSelectedProduct\(item\)\}/g,
  "onClick={() => { setSelectedProduct(item); logEvent('view_item', item.id?.toString(), item.name, { price: item.selling_price || item.price, source: 'home_featured' }); }}"
);

content = content.replace(
  /onClick=\{\(\) => \{\n\s*addToCart\(\{ \.\.\.selectedProduct, cartId: Date\.now\(\)\.toString\(\) \}\);\n\s*showToast\('Added to cart', 'success'\);\n\s*setSelectedProduct\(null\); \n\s*\}\}/g,
  "onClick={() => {\n                  addToCart({ ...selectedProduct, cartId: Date.now().toString() });\n                  showToast('Added to cart', 'success');\n                  logEvent('add_to_cart', selectedProduct.id?.toString(), selectedProduct.name, { price: selectedProduct.selling_price || selectedProduct.price, source: 'home_featured' });\n                  setSelectedProduct(null); \n                }}"
);

fs.writeFileSync(file, content);
console.log('patched home analytics');
