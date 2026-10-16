const fs = require('fs');
let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

const oldBlock = `        {featuredShop.length > 0 && (
          <div className="mt-8 px-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[18px] font-bold text-[#0F172A] font-inter">Featured in Shop</h2>
              <Link href="/shop" className="text-[13px] font-bold text-[#4F46E5] flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 px-5 -mx-5">`;

const newBlock = `        {featuredShop.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 px-5">
              <h2 className="text-[18px] font-bold text-[#0F172A] font-inter">Featured in Shop</h2>
              <Link href="/shop" className="text-[13px] font-bold text-[#4F46E5] flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 px-5">`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('fixed featured padding properly');
