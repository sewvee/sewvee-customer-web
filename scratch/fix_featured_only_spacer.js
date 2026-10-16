const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

const oldFeatured = `<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 -mx-5">
              <div className="shrink-0 w-5" />`;

const newFeatured = `<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 -mx-5">
              <div className="shrink-0 w-1" />`;

content = content.replace(oldFeatured, newFeatured);
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('patched featured card spacer');
