const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFooter = `      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-30 flex gap-3">
        <button
          onClick={handlePrev}
          className="px-6 py-4 rounded-[14px] font-bold text-[15px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center gap-2 hover:bg-[#E2E8F0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={step === 5 ? handleSubmit : handleNext}
          disabled={loading || (step === 1 && !formData.category) || (step === 5 && !formData.delivery_date)}
          className={\`flex-1 py-4 rounded-[14px] font-bold text-[15px] flex items-center justify-center transition-opacity \${
            step === 5 ? 'bg-[#5B43EE] text-white' : 'bg-[#5B43EE] text-white'
          } disabled:opacity-50\`}
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             step === 5 ? 'Submit Request' : 'Continue'
          )}
        </button>
      </div>`;

const newFooter = `      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-30 flex gap-3">
        <button
          onClick={handlePrev}
          className="px-6 py-4 rounded-[14px] font-bold text-[15px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center gap-2 hover:bg-[#E2E8F0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={
            loading || 
            (step === 1 && Object.values(categoryCounts).reduce((a, b) => a + b, 0) === 0) || 
            (step === 2 && (outfits.length === 0 || outfits.some(o => !o.isConfigured))) || 
            (step === 3 && !deliveryDate)
          }
          className={\`flex-1 py-4 rounded-[14px] font-bold text-[15px] flex items-center justify-center transition-opacity bg-[#5B43EE] text-white disabled:opacity-50\`}
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
             step === 3 ? 'Submit Request' : 'Continue'
          )}
        </button>
      </div>`;

content = content.replace(oldFooter, newFooter);
fs.writeFileSync(file, content);
