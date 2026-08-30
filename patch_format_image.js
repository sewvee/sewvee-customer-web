const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/home/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldFunc = `const formatImageUrl = (urlStr: string) => {
  if (!urlStr) return null;
  if (urlStr.startsWith('http')) return urlStr;
  return \`\${BASE_URL.replace('/api/v1/', '')}/\${urlStr}\`;
};`;

const newFunc = `const formatImageUrl = (urlStr: string) => {
  if (!urlStr) return null;
  if (urlStr.startsWith('http')) return urlStr;
  const apiDomain = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sewvee.com';
  // Strip leading slash if urlStr has one, to avoid double slashes
  const cleanUrl = urlStr.startsWith('/') ? urlStr.slice(1) : urlStr;
  return \`\${apiDomain}/\${cleanUrl}\`;
};`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Could not find formatImageUrl");
}
