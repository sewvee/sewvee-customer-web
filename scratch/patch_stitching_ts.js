const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '(step === 3 && (!deliveryDate || (termsText && !agreedToTerms)))',
  '(step === 3 && (!deliveryDate || !!(termsText && !agreedToTerms)))'
);

fs.writeFileSync(file, content);
console.log('patched TS disabled button error');
