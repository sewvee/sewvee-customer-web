const fs = require('fs');

// Patch Stitching page
const file1 = 'src/app/(app)/stitching/page.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  "import { CollageMaker } from '@/components/CollageMaker';",
  "import { CollageMakerModal as CollageMaker } from '@/components/chat/CollageMakerModal';"
);
const oldOnSave1 = `onSave={async (dataUrl: string) => {
          setCollageDataUrl(dataUrl);
          setCollageOpen(false);
        }}`;
const newOnSend1 = `onSend={async (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          setCollageDataUrl(url);
          setCollageOpen(false);
        }}`;
if (code1.includes(oldOnSave1)) {
  code1 = code1.replace(oldOnSave1, newOnSend1);
  fs.writeFileSync(file1, code1);
  console.log('Patched stitching/page.tsx');
}

// Patch Gallery page
const file2 = 'src/app/(app)/gallery/page.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(
  "import { CollageMaker } from '@/components/CollageMaker';",
  "import { CollageMakerModal as CollageMaker } from '@/components/chat/CollageMakerModal';"
);
const oldOnSave2 = `onSave={async (dataUrl: string) => {
          // ... 
        }}`;
// wait, gallery page doesn't do much with it, let's see how it uses it
