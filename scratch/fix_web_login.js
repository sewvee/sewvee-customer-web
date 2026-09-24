const fs = require('fs');

let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

content = content.replace(
  /await login\(cleaned, pin\);/,
  "await login(countryCode === '+91' ? cleaned : countryCode + cleaned, pin);"
);

fs.writeFileSync('src/app/login/page.tsx', content);
