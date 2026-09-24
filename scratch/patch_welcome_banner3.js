const fs = require('fs');
const file = 'src/app/(app)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('animate-pulse ', '');
fs.writeFileSync(file, content);
