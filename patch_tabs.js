const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldContextSelector = `{/* Context Selector */}
      {outfits.length > 0 && (
        <div className="bg-white px-4 py-2 border-b border-gray-200 shrink-0 shadow-sm z-10 flex items-center gap-2">
          <span className="text-[12px] font-bold text-gray-500 uppercase shrink-0">Topic:</span>
          <select 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-[13px] py-1.5 px-2 outline-none text-[#0F172A] font-medium"
            value={contextOutfitId}
            onChange={e => setContextOutfitId(e.target.value)}
          >
            {outfits.map((outf: any) => {
              const oid = outf.id || outf.order_outfit_id;
              return (
                <option key={oid} value={oid}>
                  {outf.name || outf.outfit_type || 'Outfit'}
                </option>
              );
            })}
          </select>
        </div>
      )}`;

const newContextSelector = `{/* Context Selector */}
      {outfits.length > 0 && (
        <div className="bg-white border-b border-gray-200 shrink-0 shadow-sm z-10">
          <div className="overflow-x-auto hide-scrollbar flex items-center gap-2 px-4 py-2.5">
            {outfits.map((outf: any) => {
              const oid = outf.id || outf.order_outfit_id;
              const isActive = String(contextOutfitId) === String(oid);
              return (
                <button
                  key={oid}
                  onClick={() => setContextOutfitId(String(oid))}
                  className={\`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 \${
                    isActive 
                      ? 'bg-[#5B43EE] text-white shadow-sm' 
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }\`}
                >
                  {outf.name || outf.outfit_type || 'Outfit'}
                </button>
              );
            })}
          </div>
        </div>
      )}`;

code = code.replace(oldContextSelector, newContextSelector);
fs.writeFileSync(file, code);
console.log("Replaced dropdown with tabs");
