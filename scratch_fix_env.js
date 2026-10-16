const fs = require('fs');
let content = fs.readFileSync('src/lib/env.ts', 'utf8');

content = content.replace(`export const URL_CUSTOMER_REGISTER
export const URL_CUSTOMER_FORGOT_PIN = \`\${BASE_URL}customer-auth/forgot-pin\`;
export const URL_CUSTOMER_RESET_PIN = \`\${BASE_URL}customer-auth/reset-pin\`;
 = \`\${BASE_URL}customer-auth/register\`;`, 
 `export const URL_CUSTOMER_REGISTER = \`\${BASE_URL}customer-auth/register\`;
export const URL_CUSTOMER_FORGOT_PIN = \`\${BASE_URL}customer-auth/forgot-pin\`;
export const URL_CUSTOMER_RESET_PIN = \`\${BASE_URL}customer-auth/reset-pin\`;`);

fs.writeFileSync('src/lib/env.ts', content);
