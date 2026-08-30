const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021'}\${url.startsWith('/') ? '' : '/'}\${url}\`;
  };`;

const newCode = `  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    // Ensure the path has a leading slash
    let path = url.startsWith('/') ? url : \`/\${url}\`;
    
    // If the path doesn't start with /uploads/ and the backend is serving from /uploads
    // (e.g. order_photos/file.png), prepend /uploads
    if (!path.startsWith('/uploads/')) {
       path = \`/uploads\${path}\`;
    }
    
    return \`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021'}\${path}\`;
  };`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched getImageUrl to prepend /uploads/");
