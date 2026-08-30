const fs = require('fs');
const file = 'src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetRegex = /\{\(\(\) => \{\s*const allOutfits.*?return null;\s*\}\)\(\)\}/s;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, '');
  fs.writeFileSync(file, code);
  console.log('Successfully removed the sticky Action Required bar.');
} else {
  console.log('Could not find the target block.');
}
