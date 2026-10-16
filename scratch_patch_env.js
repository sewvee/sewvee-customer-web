const fs = require('fs');
let content = fs.readFileSync('src/lib/env.ts', 'utf8');

const toAdd = `
export const URL_CUSTOMER_FORGOT_PIN = \`\${BASE_URL}customer-auth/forgot-pin\`;
export const URL_CUSTOMER_RESET_PIN = \`\${BASE_URL}customer-auth/reset-pin\`;
`;

if (!content.includes('URL_CUSTOMER_FORGOT_PIN')) {
    content = content.replace('export const URL_CUSTOMER_REGISTER', 'export const URL_CUSTOMER_REGISTER' + toAdd);
    fs.writeFileSync('src/lib/env.ts', content);
    console.log('patched env.ts');
}
