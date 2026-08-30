const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStep1 = `        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-4">Select Category</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, category: c })}
                  className={\`p-4 text-left rounded-[14px] border transition-colors \${formData.category === c ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}\`}
                >
                  <span className={\`font-bold text-[14px] \${formData.category === c ? 'text-[#5B43EE]' : 'text-[#475569]'}\`}>{c}</span>
                </button>
              ))}
            </div>
          </div>
        )}`;

const newStep1 = `        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-16">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-1">What would you like to stitch?</h2>
            <p className="text-[13px] text-[#64748B] mb-5">Select the number of outfits for each category.</p>
            <div className="flex flex-col gap-3">
              {categories.map((c) => {
                const count = categoryCounts[c] || 0;
                return (
                  <div key={c} className={\`p-4 flex items-center justify-between rounded-[14px] border transition-colors \${count > 0 ? 'border-[#5B43EE] bg-[#EEF2FF]' : 'border-[#E2E8F0] bg-white'}\`}>
                    <span className={\`font-bold text-[15px] \${count > 0 ? 'text-[#5B43EE]' : 'text-[#475569]'}\`}>{c}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setCategoryCounts(prev => ({...prev, [c]: Math.max(0, count - 1)}))} className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[16px] font-bold text-[#475569] leading-none">−</button>
                      <span className="w-4 text-center font-bold text-[15px] text-[#0F172A]">{count}</span>
                      <button onClick={() => setCategoryCounts(prev => ({...prev, [c]: count + 1}))} className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[16px] font-bold text-[#475569] leading-none">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}`;

content = content.replace(oldStep1, newStep1);
fs.writeFileSync(file, content);
