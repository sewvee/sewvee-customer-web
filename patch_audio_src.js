const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `<audio controls src={url} className="w-full h-8" />`;
const newCode = `<audio controls src={getImageUrl(url)} className="w-full h-8" />`;

code = code.replace(oldCode, newCode);

const oldCode2 = `const url: string = req.attachment_url || req.file_url || '';`;
const newCode2 = `const rawUrl: string = req.attachment_url || req.file_url || '';
                              const url = getImageUrl(rawUrl);`;

// Wait, let's just make sure we replace the right one.
// Let's use string replace for the audio tag.
fs.writeFileSync(file, code);
console.log("Patched audio src");
