const fs = require('fs');
const file = 'src/app/(app)/gallery/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import { CollageMaker } from '@/components/CollageMaker';",
  "import { CollageMakerModal as CollageMaker } from '@/components/chat/CollageMakerModal';"
);
code = code.replaceAll(
  "<CollageMaker open={isCollageOpen} onClose={() => setCollageOpen(false)} />",
  "<CollageMaker open={isCollageOpen} onClose={() => setCollageOpen(false)} onSend={async () => { setCollageOpen(false); }} />"
);

fs.writeFileSync(file, code);
console.log('Patched gallery/page.tsx');
