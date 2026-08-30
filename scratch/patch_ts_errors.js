const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const d = \{\};/g, 'const d: any = {};');
content = content.replace(/order\.details/g, '(order as any).details');
content = content.replace(/const parseNotes = \(notes\) => \{/g, 'const parseNotes = (notes: string) => {');
content = content.replace(/const result = \{\};/g, 'const result: any = {};');
content = content.replace(/const extract = \(key, nextKey\) => \{/g, 'const extract = (key: string, nextKey?: string) => {');

fs.writeFileSync(file, content);
console.log('Fixed typescript errors');
