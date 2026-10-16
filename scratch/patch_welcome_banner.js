const fs = require('fs');
const file = 'src/app/(app)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div \n              className="w-full cursor-pointer max-h-[70vh] overflow-y-auto no-scrollbar"\n              onClick={() => {',
  '<div \n              className="w-full min-h-[300px] cursor-pointer max-h-[70vh] overflow-y-auto no-scrollbar bg-gray-100 flex items-center justify-center"\n              onClick={() => {'
);

fs.writeFileSync(file, content);
console.log('patched welcome banner');
