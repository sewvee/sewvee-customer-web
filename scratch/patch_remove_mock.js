const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const termsText = selectedBoutique?.terms_and_conditions || "MOCK TERMS FOR TESTING: If you see this, the UI works but the backend returned null.";',
  'const termsText = selectedBoutique?.terms_and_conditions;'
);

fs.writeFileSync(file, content);
console.log('removed mock terms');
