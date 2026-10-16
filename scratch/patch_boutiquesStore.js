const fs = require('fs');
const file = 'src/store/boutiquesStore.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'profile_icon_url: string | null;',
  'profile_icon_url: string | null;\n  terms_and_conditions?: string | null;'
);

fs.writeFileSync(file, content);
console.log('patched boutiquesStore');
