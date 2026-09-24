const fs = require('fs');

let content = fs.readFileSync('src/app/(app)/home/page.tsx', 'utf8');

const oldFeatured = `<div className="h-[140px] bg-gray-100 relative p-1.5">
                    {item.image_url ? (
                      <SafeImage 
                        src={formatImageUrl(item.image_url.split(',')[0]) || ''} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-[12px]" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-[12px]"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
                    )}
                  </div>`;

const newFeatured = `<div className="h-[140px] bg-gray-50 relative rounded-t-[16px] overflow-hidden">
                    {item.image_url ? (
                      <SafeImage 
                        src={formatImageUrl(item.image_url.split(',')[0]) || ''} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag className="w-8 h-8" /></div>
                    )}
                  </div>`;

content = content.replace(oldFeatured, newFeatured);
fs.writeFileSync('src/app/(app)/home/page.tsx', content);
console.log('patched featured padding');
