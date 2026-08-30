const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode1 = `                        <button
                          onClick={() => handleCancelOutfit(activeOutfit.id || activeOutfit.order_outfit_id)}
                          disabled={cancellingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id)}
                          className="text-[10px] font-bold text-red-500 uppercase tracking-wide px-2.5 py-1.5 bg-red-50 rounded-md border border-red-100 active:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {cancellingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id) ? '...' : 'Cancel Outfit'}
                        </button>`;

const newCode1 = `                        {!(order?.status?.id === 4 || order?.status?.name === 'CANCELLED') && (
                          <button
                            onClick={() => handleCancelOutfit(activeOutfit.id || activeOutfit.order_outfit_id)}
                            disabled={cancellingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id)}
                            className="text-[10px] font-bold text-red-500 uppercase tracking-wide px-2.5 py-1.5 bg-red-50 rounded-md border border-red-100 active:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {cancellingOutfitId === (activeOutfit.id || activeOutfit.order_outfit_id) ? '...' : 'Cancel Outfit'}
                          </button>
                        )}`;

const oldCode2 = `            {/* ENTIRE ORDER ACTIONS */}
            {order.order_type === 'STITCHING_REQUEST' && (
              <div className="mt-4 mb-8">
                <button
                  onClick={handleCancelEntireOrder}
                  disabled={cancellingEntire}
                  className="w-full py-4 rounded-xl border border-red-200 text-red-500 font-bold text-[14px] bg-red-50 active:bg-red-100 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {cancellingEntire ? (
                    <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X size={18} />
                  )}
                  Cancel Entire Request
                </button>
              </div>
            )}`;

const newCode2 = `            {/* ENTIRE ORDER ACTIONS */}
            {order.order_type === 'STITCHING_REQUEST' && !(order?.status?.id === 4 || order?.status?.name === 'CANCELLED') && (
              <div className="mt-4 mb-8">
                <button
                  onClick={handleCancelEntireOrder}
                  disabled={cancellingEntire}
                  className="w-full py-4 rounded-xl border border-red-200 text-red-500 font-bold text-[14px] bg-red-50 active:bg-red-100 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {cancellingEntire ? (
                    <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X size={18} />
                  )}
                  Cancel Entire Request
                </button>
              </div>
            )}`;

code = code.replace(oldCode1, newCode1).replace(oldCode2, newCode2);
fs.writeFileSync(file, code);
console.log("Patched customer web buttons");
