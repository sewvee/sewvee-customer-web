const fs = require('fs');
const file = 'src/app/(app)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="w-full min-h-[300px] cursor-pointer max-h-[70vh] overflow-y-auto no-scrollbar bg-gray-100 flex items-center justify-center"',
  'className="w-full min-h-[300px] cursor-pointer max-h-[70vh] overflow-y-auto no-scrollbar bg-slate-100 animate-pulse flex items-center justify-center"'
);

fs.writeFileSync(file, content);
