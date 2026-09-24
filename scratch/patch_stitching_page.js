const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
content = content.replace(
  "const [deliveryDate, setDeliveryDate] = useState('');",
  "const [deliveryDate, setDeliveryDate] = useState('');\n  const [agreedToTerms, setAgreedToTerms] = useState(false);"
);

// Add selectedBoutique lookup if not exists
if (!content.includes('const selectedBoutique =')) {
  content = content.replace(
    "const pastStitchingOrders = useMemo(() => {",
    "const selectedBoutique = boutiques.find((b) => b.id === selectedBoutiqueId);\n  const termsText = selectedBoutique?.terms_and_conditions;\n\n  const pastStitchingOrders = useMemo(() => {"
  );
}

// Add UI for terms
const uiSearch = `<p className="text-[12px] text-[#64748B] mt-4 font-medium">\n              Note: The boutique will confirm the final delivery date after reviewing your request.\n            </p>`;
const uiReplace = `<p className="text-[12px] text-[#64748B] mt-4 font-medium">\n              Note: The boutique will confirm the final delivery date after reviewing your request.\n            </p>\n\n            {termsText && (\n              <div className="mt-6">\n                <h3 className="text-[14px] font-bold text-[#0F172A] mb-2">Terms and Conditions</h3>\n                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 h-[120px] overflow-y-auto mb-3">\n                  <p className="text-[12px] text-[#475569] whitespace-pre-wrap">{termsText}</p>\n                </div>\n                <label className="flex items-start gap-2.5 cursor-pointer">\n                  <div className="pt-0.5">\n                    <input \n                      type="checkbox" \n                      className="w-4 h-4 rounded border-[#CBD5E1] text-[#5B43EE] focus:ring-[#5B43EE]"\n                      checked={agreedToTerms}\n                      onChange={(e) => setAgreedToTerms(e.target.checked)}\n                    />\n                  </div>\n                  <span className="text-[13px] font-medium text-[#334155] leading-snug">\n                    I agree to the Terms and Conditions\n                  </span>\n                </label>\n              </div>\n            )}`;
content = content.replace(uiSearch, uiReplace);

// Update button disable logic
content = content.replace(
  "(step === 3 && !deliveryDate)",
  "(step === 3 && (!deliveryDate || (termsText && !agreedToTerms)))"
);

fs.writeFileSync(file, content);
console.log('patched stitching/page.tsx');
