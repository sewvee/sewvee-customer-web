const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/.env.local';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /# NEXT_PUBLIC_API_URL=https:\/\/api-stage\.sewvee\.com/,
  'NEXT_PUBLIC_API_URL=https://api-stage.sewvee.com'
);

content = content.replace(
  /NEXT_PUBLIC_API_URL=http:\/\/localhost:3021/,
  '# NEXT_PUBLIC_API_URL=http://localhost:3021'
);

fs.writeFileSync(file, content);
console.log('Done');
