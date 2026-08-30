const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add state
if (!code.includes('cancelEntireDrawerVisible')) {
  code = code.replace(
    'const [cancelOutfitDrawerId, setCancelOutfitDrawerId] = useState<string | null>(null);',
    'const [cancelOutfitDrawerId, setCancelOutfitDrawerId] = useState<string | null>(null);\n  const [cancelEntireDrawerVisible, setCancelEntireDrawerVisible] = useState(false);'
  );
}

// Modify handleCancelEntireOrder
code = code.replace(
  `  const handleCancelEntireOrder = async () => {
    if (!order || cancellingEntire) return;
    if (!window.confirm('Are you sure you want to cancel this entire pre-order request?')) return;
    setCancellingEntire(true);`,
  `  const handleCancelEntireOrder = async () => {
    if (!order || cancellingEntire) return;
    setCancelEntireDrawerVisible(false);
    setCancellingEntire(true);`
);

// Modify the button that triggers it
code = code.replace(
  `onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelEntireOrder();
                                    }}`,
  `onClick={(e) => {
                                      e.stopPropagation();
                                      setCancelEntireDrawerVisible(true);
                                    }}`
);
code = code.replace(
  `onClick={handleCancelEntireOrder}`,
  `onClick={() => setCancelEntireDrawerVisible(true)}`
);

// Add the drawer JSX at the bottom before final closing tags
const drawerJSX = `
      {cancelEntireDrawerVisible && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45 transition-opacity" onClick={() => setCancelEntireDrawerVisible(false)} />
          <div className="relative bg-white rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mr-3">
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1E293B] flex-1">Cancel Entire Request</h3>
              <button onClick={() => setCancelEntireDrawerVisible(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[15px] text-[#475569] mb-6 leading-relaxed font-inter">
              Are you sure you want to cancel this entire order request? All outfits within this request will be cancelled. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-[15px] transition-colors hover:bg-gray-200"
                onClick={() => setCancelEntireDrawerVisible(false)}
              >
                Keep Request
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#EF4444] text-white font-bold text-[15px] transition-opacity hover:opacity-90 flex justify-center items-center gap-2"
                onClick={handleCancelEntireOrder}
                disabled={cancellingEntire}
              >
                {cancellingEntire ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('cancelEntireDrawerVisible && (')) {
  code = code.replace(
    `      {cancelOutfitDrawerId && (`,
    drawerJSX + `\n      {cancelOutfitDrawerId && (`
  );
}

fs.writeFileSync(file, code);
