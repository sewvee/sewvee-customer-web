const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Business-Web/src/app/dashboard/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldImg = '<img src={getImageUrl(photo.file_url)} alt={group.title} className="h-full w-full object-cover pointer-events-none" />';
const newImg = `<img src={getImageUrl(photo.file_url)} alt={group.title} className="h-full w-full object-cover pointer-events-none" />
<div 
  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-pointer"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDeletePhoto(detail.id, photo.id);
  }}
>
  <X className="w-3 h-3 text-white" />
</div>`;

content = content.replace(oldImg, newImg);
content = content.replace('className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-[#5B43EE] hover:scale-105 transition-all duration-200 shadow-xs cursor-zoom-in shrink-0"', 'className="relative group h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-[#5B43EE] hover:scale-105 transition-all duration-200 shadow-xs cursor-zoom-in shrink-0"');

fs.writeFileSync(file, content);
console.log("Business Web patched img");
