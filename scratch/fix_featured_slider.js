const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

// The block has:
// <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 -mx-5">
//   <div className="shrink-0 w-5" />

const oldBlock = `<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 -mx-5">
              <div className="shrink-0 w-5" />`;

const newBlock = `<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 px-5 -mx-5">`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('fixed featured slider');
