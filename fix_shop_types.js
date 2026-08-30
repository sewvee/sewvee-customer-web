import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/app/(app)/shop/page.tsx', 'utf-8');

// fix name error
content = content.replace(
  '(selectedBoutique.boutique_name || selectedBoutique.name)',
  '(selectedBoutique.boutique_name || (selectedBoutique as any).name)'
);

// fix img src error
content = content.replace(
  '<img src={formatImageUrl(item.image_url)} alt={item.name}',
  '<img src={formatImageUrl(item.image_url) || undefined} alt={item.name}'
);
content = content.replace(
  '<img src={formatImageUrl(selectedProduct.image_url)} alt={selectedProduct.name}',
  '<img src={formatImageUrl(selectedProduct.image_url) || undefined} alt={selectedProduct.name}'
);
content = content.replace(
  '<img src={img} alt={p.name}',
  '<img src={img || undefined} alt={p.name}'
);

writeFileSync('src/app/(app)/shop/page.tsx', content);
