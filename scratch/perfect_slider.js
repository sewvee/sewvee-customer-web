const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

// 1. Fix InlineBanners
// Old: <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar px-5">
// New: <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar"><div className="shrink-0 w-1" />
content = content.replace(
  /<div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar px-5">\s*\{displayBanners.map/g,
  '<div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar">\n        <div className="shrink-0 w-1" />\n        {displayBanners.map'
);
// Also add right spacer
content = content.replace(
  /            <\/div>\n          \);\n        \}\)}\n      <\/div>/g,
  '            </div>\n          );\n        })}\n        <div className="shrink-0 w-1" />\n      </div>'
);

// 2. Fix Featured in Shop
// Old: <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 px-5">
// New: <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4"><div className="shrink-0 w-1" />
content = content.replace(
  /<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 px-5">\s*\{featuredShop.map/g,
  '<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4">\n              <div className="shrink-0 w-1" />\n              {featuredShop.map'
);
// And add right spacer after View All Card
content = content.replace(
  /                <p className="text-\[11px\] text-gray-500 mt-0.5">Explore Shop<\/p>\n              <\/Link>\n            <\/div>/g,
  '                <p className="text-[11px] text-gray-500 mt-0.5">Explore Shop</p>\n              </Link>\n              <div className="shrink-0 w-1" />\n            </div>'
);


fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('perfect sliders applied');
