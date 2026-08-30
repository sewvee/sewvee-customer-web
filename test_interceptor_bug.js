const fs = require('fs');
const path = './src/lib/api.ts';
let code = fs.readFileSync(path, 'utf8');
console.log(code.includes('error.config?.url?.includes(\'login\')') ? "Fix already applied" : "Bug exists!");
