const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `if (deliveryDate) lines.push(\`Expected Date: \${deliveryDate}\`);`;
const replace = `if (deliveryDate) lines.push(\`Expected Date: \${deliveryDate}\`);
        if (termsText && agreedToTerms) lines.push(\`Terms & Conditions: Agreed\`);`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
console.log('patched stitching/page.tsx payload');
