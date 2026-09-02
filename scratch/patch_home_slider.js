const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

const sliderRegex = /<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar">(.*?)<\/div>\s*<\/div>\s*\)\}/s;

const newSlider = `
<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 -mx-5 px-5">
              {featuredShop.map(item => (
                <button key={item.id} onClick={() => setSelectedProduct(item)} className="snap-start shrink-0 w-[140px] bg-white rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-left block">
                  <div className="h-[140px] bg-gray-100 relative p-1.5">
                    {item.image_url ? (
                      <SafeImage 
                        src={formatImageUrl(item.image_url.split(',')[0]) || ''} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-[12px]" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-[12px]"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-3 pt-2">
                    <p className="text-[12px] font-bold text-[#0F172A] truncate mb-1">{item.name}</p>
                    <p className="text-[13px] font-bold text-[#5B43EE]">₹{item.selling_price || item.price}</p>
                  </div>
                </button>
              ))}

              {/* View All Card */}
              <Link href="/shop" className="snap-start shrink-0 w-[140px] bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center group hover:bg-[#F1F5F9] transition-colors">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <p className="text-[13px] font-bold text-[#0F172A]">View All</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Explore Shop</p>
              </Link>
            </div>
`;

content = content.replace(sliderRegex, newSlider + '\n          </div>\n        )}');
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('patched slider');
