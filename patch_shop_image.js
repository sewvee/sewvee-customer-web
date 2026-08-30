const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/shop/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldFunc = `const formatImageUrl = (urlStr: string | null): string | undefined => {
  if (!urlStr) return undefined;
  const firstUrl = urlStr.split(',')[0];
  if (firstUrl.startsWith('http')) return firstUrl;
  return \`\${BASE_URL.replace('/api/v1/', '')}/\${firstUrl}\`;
};`;

const newFunc = `const formatImageUrl = (urlStr: string | null): string | undefined => {
  if (!urlStr) return undefined;
  const firstUrl = urlStr.split(',')[0];
  if (firstUrl.startsWith('http')) return firstUrl;
  const apiDomain = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sewvee.com';
  const cleanUrl = firstUrl.startsWith('/') ? firstUrl.slice(1) : firstUrl;
  return \`\${apiDomain}/\${cleanUrl}\`;
};`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync(file, code);
  console.log("Success shop");
} else {
  console.log("Could not find formatImageUrl in shop");
}
