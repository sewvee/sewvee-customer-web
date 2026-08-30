const fs = require('fs');
const file = 'src/app/(app)/shop/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Find addToCart
const oldAddToCart = `  const addToCart = (product: any, e: any) => {
    e.stopPropagation();
    storeAddToCart(product);
    showToast(\`\${product.name} added to cart\`, 'success');
  };`;

const newAddToCart = `  const addToCart = (product: any, e: any) => {
    e.stopPropagation();
    storeAddToCart({ ...product, _company_id: shopMode === 'BOUTIQUE' ? selectedBoutiqueId : 'DIRECT' });
    showToast(\`\${product.name} added to cart\`, 'success');
  };`;

if (code.includes(oldAddToCart)) {
  code = code.replace(oldAddToCart, newAddToCart);
  fs.writeFileSync(file, code);
  console.log('Patched addToCart');
} else {
  console.log('Could not find addToCart');
}
