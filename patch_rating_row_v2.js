const fs = require('fs');
const file = 'src/components/FeedbackModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace RatingRow
const oldRatingRowStart = 'const RatingRow = ({ label, description, value, onChange }: any) => {';
const oldRatingRowEnd = '  );\n};\n';

const startIdx = code.indexOf(oldRatingRowStart);
const endIdx = code.indexOf(oldRatingRowEnd, startIdx) + oldRatingRowEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  const newRatingRow = `const RatingRow = ({ label, description, value, onChange }: any) => {
  return (
    <div className="flex flex-col mb-8 items-center border-b border-slate-100 pb-6 last:border-0 last:pb-0">
      <div className="text-center mb-3">
        <h4 className="text-[16px] font-bold text-slate-800">{label}</h4>
        {description && <p className="text-[13px] text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none"
          >
            <Star
              size={36}
              className={\`transition-all duration-300 \${
                star <= value 
                  ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-sm" 
                  : "fill-transparent text-slate-300"
              }\`}
              strokeWidth={star <= value ? 0 : 1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
`;
  code = code.substring(0, startIdx) + newRatingRow + code.substring(endIdx);
} else {
  console.log('Failed to find RatingRow');
}

// Replace Textarea block
const oldTextareaStart = '<div className="mt-4 flex-1 flex flex-col min-h-[150px]">';
const oldTextareaEnd = '</div>\n        </div>';

const textStartIdx = code.indexOf(oldTextareaStart);
const textEndIdx = code.indexOf(oldTextareaEnd, textStartIdx);

if (textStartIdx !== -1 && textEndIdx !== -1) {
  const newTextarea = `<div className="mt-6 border-t border-slate-100 pt-6">
            <label className="block text-[15px] font-bold text-slate-800 mb-3 text-center">Additional Comments</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
              rows={4}
              placeholder="Tell us what you liked or how we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>\n        </div>`;
  code = code.substring(0, textStartIdx) + newTextarea + code.substring(textEndIdx + oldTextareaEnd.length);
} else {
  console.log('Failed to find textarea');
}

fs.writeFileSync(file, code);
console.log('Patched again.');
