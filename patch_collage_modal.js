const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace import
code = code.replace(
  "import { CollageMaker } from '@/components/CollageMaker';",
  "import { CollageMakerModal as CollageMaker } from '@/components/chat/CollageMakerModal';"
);

// Replace onSave with onSend
const oldOnSave = `onSave={async (dataUrl: string) => {
        if (!activeOutfitForCollage || !dataUrl) return;
        const token = localStorage.getItem('sewvee_customer_token') ?? '';
        const formattedToken = token.startsWith('Bearer ') ? token : \`Bearer \${token}\`;
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();`;

const newOnSend = `onSend={async (blob: Blob) => {
        if (!activeOutfitForCollage || !blob) return;
        const token = localStorage.getItem('sewvee_customer_token') ?? '';
        const formattedToken = token.startsWith('Bearer ') ? token : \`Bearer \${token}\`;
        try {`;

if (code.includes(oldOnSave)) {
  code = code.replace(oldOnSave, newOnSend);
  fs.writeFileSync(file, code);
  console.log('Successfully replaced CollageMaker with CollageMakerModal!');
} else {
  console.log('Failed to find oldOnSave string.');
}
