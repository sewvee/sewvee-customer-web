const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const termsText = selectedBoutique?.terms_and_conditions;',
  'const termsText = selectedBoutique?.terms_and_conditions || "MOCK TERMS FOR TESTING: If you see this, the UI works but the backend returned null.";'
);

fs.writeFileSync(file, content);
console.log('patched mock terms');
