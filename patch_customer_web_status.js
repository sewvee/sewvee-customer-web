const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// The status might be a string 'CANCELLED' or an object. Let's make a helper at the top or replace inline.
const oldStatusCheck = `(order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED'`;
const newStatusCheck = `String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED'`;

code = code.split(oldStatusCheck).join(newStatusCheck);

const oldDescCheck1 = `let description = localConfig?.description || extractField('Description') || '';
                  if (!description && rawNotes && !rawNotes.includes('Category:')) description = rawNotes;`;

const newDescCheck1 = `let description = localConfig?.description || extractField('Description') || '';
                  if (!description && rawNotes && !rawNotes.includes('Category:')) description = rawNotes;
                  if (description) {
                    description = description.replace(/\\[CUSTOMER_CANCELLED\\]/g, '').trim();
                  }`;

code = code.replace(oldDescCheck1, newDescCheck1);

fs.writeFileSync(file, code);
console.log("Patched order details status and description");
