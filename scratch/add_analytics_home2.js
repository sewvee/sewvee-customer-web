const fs = require('fs');
const file = 'src/app/(app)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `                  addToCart(selectedProduct); 
                  showToast(\`\${selectedProduct.name} added to cart\`, 'success');
                  setSelectedProduct(null);`;
                  
const newCode = `                  addToCart(selectedProduct); 
                  showToast(\`\${selectedProduct.name} added to cart\`, 'success');
                  logEvent('add_to_cart', selectedProduct.id?.toString(), selectedProduct.name, { price: selectedProduct.selling_price || selectedProduct.price, source: 'home_featured' });
                  setSelectedProduct(null);`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content);
console.log('patched add to cart analytics');
