const fs = require('fs');
const file = 'src/components/FeedbackModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the Close (X) button
const closeButtonRegex = /<button\s+onClick=\{onClose\}\s+className="absolute top-4 right-4[^>]*>\s*<X size=\{20\} \/>\s*<\/button>/;
code = code.replace(closeButtonRegex, '');

// 2. Remove the Skip button
const skipButtonRegex = /<button\s+onClick=\{onClose\}\s+disabled=\{isSubmitting\}\s+className="flex-1 py-2.5 px-4 rounded-xl[^>]*>\s*Skip\s*<\/button>/;
code = code.replace(skipButtonRegex, '');

// 3. Make Body flex-col and textarea expand
code = code.replace('<div className="p-6 flex-1 overflow-y-auto">', '<div className="p-6 flex-1 overflow-y-auto flex flex-col">');

const oldTextareaContainer = `<div className="mt-4">
            <label className="block text-[13px] font-semibold text-slate-800 mb-2">Additional Comments</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              rows={3}
              placeholder="Tell us what you liked or how we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>`;

const newTextareaContainer = `<div className="mt-4 flex-1 flex flex-col min-h-[150px]">
            <label className="block text-[13px] font-semibold text-slate-800 mb-3">Additional Comments</label>
            <textarea
              className="w-full flex-1 border border-slate-200 rounded-xl p-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
              placeholder="Tell us what you liked or how we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>`;

code = code.replace(oldTextareaContainer, newTextareaContainer);

// 4. Update the footer container to make the submit button full width and maybe taller for mobile
const oldSubmitButton = `<button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm focus:outline-none"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>`;

const newSubmitButton = `<button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl text-[15px] font-bold text-white bg-[#5B43EE] hover:bg-[#4a34ce] transition-colors disabled:opacity-70 flex justify-center items-center shadow-md focus:outline-none active:scale-[0.98]"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>`;
            
code = code.replace(oldSubmitButton, newSubmitButton);

fs.writeFileSync(file, code);
console.log('Successfully patched FeedbackModal.tsx');
