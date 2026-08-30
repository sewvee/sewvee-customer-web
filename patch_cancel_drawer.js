const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add state
if (!code.includes('cancelOutfitDrawerId')) {
  code = code.replace(
    'const [confirmDrawerVisible, setConfirmDrawerVisible] = useState(false);',
    'const [confirmDrawerVisible, setConfirmDrawerVisible] = useState(false);\n  const [cancelOutfitDrawerId, setCancelOutfitDrawerId] = useState<string | null>(null);'
  );
}

// Modify handleCancelOutfit
code = code.replace(
  `  const handleCancelOutfit = async (outfitId: string) => {
    if (!order || cancellingOutfitId) return;
    if (!window.confirm('Are you sure you want to cancel this outfit?')) return;
    setCancellingOutfitId(outfitId);`,
  `  const handleCancelOutfit = async (outfitId: string) => {
    if (!order || cancellingOutfitId) return;
    setCancelOutfitDrawerId(null);
    setCancellingOutfitId(outfitId);`
);

// Modify the button that triggers it
code = code.replace(
  `onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelOutfit(activeOutfit.id || activeOutfit.order_outfit_id);
                                    }}`,
  `onClick={(e) => {
                                      e.stopPropagation();
                                      setCancelOutfitDrawerId(activeOutfit.id || activeOutfit.order_outfit_id);
                                    }}`
);
code = code.replace(
  `onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOutfit(activeOutfit.id || activeOutfit.order_outfit_id);
                              }}`,
  `onClick={(e) => {
                                e.stopPropagation();
                                setCancelOutfitDrawerId(activeOutfit.id || activeOutfit.order_outfit_id);
                              }}`
);

// Add the drawer JSX at the bottom before final closing tags
const drawerJSX = `
      {cancelOutfitDrawerId && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45 transition-opacity" onClick={() => setCancelOutfitDrawerId(null)} />
          <div className="relative bg-white rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mr-3">
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1E293B] flex-1">Cancel Outfit</h3>
              <button onClick={() => setCancelOutfitDrawerId(null)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[15px] text-[#475569] mb-6 leading-relaxed font-inter">
              Are you sure you want to cancel this outfit? This action cannot be undone and the boutique will be notified.
            </p>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-[15px] transition-colors hover:bg-gray-200"
                onClick={() => setCancelOutfitDrawerId(null)}
              >
                Keep Outfit
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#EF4444] text-white font-bold text-[15px] transition-opacity hover:opacity-90 flex justify-center items-center gap-2"
                onClick={() => handleCancelOutfit(cancelOutfitDrawerId)}
                disabled={cancellingOutfitId !== null}
              >
                {cancellingOutfitId ? 'Cancelling...' : 'Cancel Outfit'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('cancelOutfitDrawerId && (')) {
  code = code.replace(
    `      {confirmDrawerVisible && selectedOutfitForConfirm && (`,
    drawerJSX + `\n      {confirmDrawerVisible && selectedOutfitForConfirm && (`
  );
}

fs.writeFileSync(file, code);
