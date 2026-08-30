const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHeader = `      <div className="flex items-center justify-center gap-2 px-6 pt-4 bg-white shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2 relative">
            <div
              className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] z-10 transition-colors \${
                step > i ? 'bg-[#22C55E] text-white' : step === i ? 'bg-[#5B43EE] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'
              }\`}
            >
              {step > i ? <CheckCircle className="w-5 h-5" /> : i}
            </div>
            {i < 5 && (
              <div className={\`w-10 h-0.5 \${step > i ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}\`} />
            )}
          </div>
        ))}
      </div>`;

const newHeader = `      <div className="flex items-center justify-center gap-2 px-6 pt-4 bg-white shrink-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 relative">
            <div
              className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] z-10 transition-colors \${
                step > i ? 'bg-[#22C55E] text-white' : step === i ? 'bg-[#5B43EE] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'
              }\`}
            >
              {step > i ? <CheckCircle className="w-5 h-5" /> : i}
            </div>
            {i < 3 && (
              <div className={\`w-10 h-0.5 \${step > i ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'}\`} />
            )}
          </div>
        ))}
      </div>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync(file, content);
