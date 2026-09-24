const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `photo_urls: outfitUploadedUrls[idx] || [],`;
const replace = `photo_urls: outfitUploadedUrls[idx] || [],
            terms_agreed: !!(termsText && agreedToTerms),`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
console.log('patched stitching local storage');
