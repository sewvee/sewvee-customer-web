const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

const oldBanners = `<div className="mt-4 px-5 mb-4">
      {/* Removed scroll-smooth class so JS can perform instant jumps */}
      <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar">
        {displayBanners.map((banner, idx) => {
          const imgUrl = banner.image_url || banner.mobile_image_url;
          return (
            <div 
              key={idx} 
              className={\`shrink-0 h-[160px] rounded-[16px] overflow-hidden bg-gray-200 relative border border-gray-200 shadow-sm cursor-pointer \${
                banners.length > 1 ? 'snap-center w-[90%] md:w-[400px]' : 'w-full'
              }\`}`;

const newBanners = `<div className="mt-4 mb-4">
      {/* Removed scroll-smooth class so JS can perform instant jumps */}
      <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar px-5">
        {displayBanners.map((banner, idx) => {
          const imgUrl = banner.image_url || banner.mobile_image_url;
          return (
            <div 
              key={idx} 
              className={\`shrink-0 h-[160px] rounded-[16px] overflow-hidden bg-gray-200 relative border border-gray-200 shadow-sm cursor-pointer \${
                banners.length > 1 ? 'snap-start w-[85%] md:w-[400px]' : 'w-full snap-start'
              }\`}`;

content = content.replace(oldBanners, newBanners);
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('patched Banners');
