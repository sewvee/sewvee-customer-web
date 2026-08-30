const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Check to lucide-react import
content = content.replace(
  "import { ArrowLeft, ShoppingBag, Shirt, Calendar, Scissors, Image as ImageIcon, Download, Camera, Palette, X, AlertCircle } from 'lucide-react';",
  "import { ArrowLeft, ShoppingBag, Shirt, Calendar, Scissors, Image as ImageIcon, Download, Camera, Palette, X, AlertCircle, Check } from 'lucide-react';"
);

// 2. Add State variables
content = content.replace(
  "const [activeOutfitForCollage, setActiveOutfitForCollage] = useState<any | null>(null);",
  `const [activeOutfitForCollage, setActiveOutfitForCollage] = useState<any | null>(null);
  const [confirmDrawerVisible, setConfirmDrawerVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedOutfitForConfirm, setSelectedOutfitForConfirm] = useState<any | null>(null);

  const handleConfirmOutfitPhotos = async () => {
    const token = useAuthStore.getState().token;
    if (!selectedOutfitForConfirm || !token || !order) return;
    const outfitId = selectedOutfitForConfirm.id || selectedOutfitForConfirm.order_outfit_id;
    setSubmittingOutfitId(outfitId);
    try {
      await useOrdersStore.getState().markRequestsAsRead(order.id.toString(), outfitId.toString(), token);
      fetchOrders(user?.mobile ?? '');
      setConfirmDrawerVisible(false);
    } catch(e) {
      console.error(e);
    } finally {
      setSubmittingOutfitId(null);
    }
  };`
);

// 3. Expand outfits based on quantity
const oldOutfitsLine = "const outfits = order.outfits || order.items || [];";
const newOutfitsLine = `
  const rawOutfits = order.outfits || order.items || [];
  const outfits = [];
  rawOutfits.forEach((o: any) => {
    const qty = o.quantity || 1;
    if (qty > 1) {
      for (let i = 0; i < qty; i++) {
        outfits.push({ ...o, _expandedIndex: i });
      }
    } else {
      outfits.push(o);
    }
  });
`;
content = content.replace(oldOutfitsLine, newOutfitsLine);

// 4. Update the onClick of the Confirm Photos button
const oldButtonCode = `onClick={async () => {
                          const outfitId = activeOutfit.id || activeOutfit.order_outfit_id;
                          setSubmittingOutfitId(outfitId);
                          try {
                            const { markRequestsAsRead } = useOrdersStore.getState();
                            const token = useAuthStore.getState().token;
                            await markRequestsAsRead(order.id.toString(), outfitId.toString(), token!);
                            fetchOrders(user?.mobile ?? '');
                          } catch(e) {
                            console.error(e);
                          } finally {
                            setSubmittingOutfitId(null);
                          }
                        }}`;
const newButtonCode = `onClick={() => {
                          setSelectedOutfitForConfirm(activeOutfit);
                          setAgreedToTerms(false);
                          setConfirmDrawerVisible(true);
                        }}`;
content = content.replace(oldButtonCode, newButtonCode);

// 5. Inject the Drawer UI before the FINAL closing tag of the component.
// We use regex to find the last </>;
const drawerUI = `
      {confirmDrawerVisible && selectedOutfitForConfirm && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45" onClick={() => setConfirmDrawerVisible(false)} />
          <div className="relative bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mr-3">
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1E293B] flex-1">Confirm Photos</h3>
              <button onClick={() => setConfirmDrawerVisible(false)} className="p-1">
                <X size={20} color="#64748B" />
              </button>
            </div>

            <p className="text-[14px] font-medium text-[#475569] mb-6 leading-relaxed">
              Are you sure you want to confirm these photos? Once submitted, you cannot change them and they will be sent directly to the boutique for reference.
            </p>

            <button 
              className="flex items-start mb-6 text-left w-full cursor-pointer"
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              <div className={\`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center shrink-0 mt-0.5 \${agreedToTerms ? 'bg-[#5B43EE] border-[#5B43EE]' : 'border-[#CBD5E1] bg-transparent'}\`}>
                {agreedToTerms && <Check size={14} color="#FFF" strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1E293B] mb-1.5">
                  I agree with the terms and conditions
                </p>
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">
                  <p className="text-[12px] font-medium text-[#64748B] leading-relaxed whitespace-pre-line">
                    {order?.company?.invoice_terms || order?.company?.termsAndConditions || order?.boutiqueTerms || 'No Refund / No Exchange / No Cancellation\\nE & O.E.'}
                  </p>
                </div>
              </div>
            </button>

            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#F1F5F9] text-[#64748B] font-bold text-[15px]"
                onClick={() => setConfirmDrawerVisible(false)}
              >
                Cancel
              </button>
              <button 
                className={\`flex-1 py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center \${agreedToTerms ? 'bg-[#5B43EE] text-white' : 'bg-[#94A3B8] text-white opacity-70'}\`}
                disabled={!agreedToTerms || submittingOutfitId !== null}
                onClick={handleConfirmOutfitPhotos}
              >
                {submittingOutfitId ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/(<\/>\s*)$/, drawerUI + '\n$1');

fs.writeFileSync(file, content);
console.log('Done');
