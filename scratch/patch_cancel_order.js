const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `              </div>
            )}
          </>
        )}
      </div>`;

const newTarget = `              </div>
            )}
            
            {/* ENTIRE ORDER ACTIONS */}
            {order.order_type === 'STITCHING_REQUEST' && (
              <div className="mt-4 mb-8">
                <button className="w-full py-4 rounded-xl border border-red-200 text-red-500 font-bold text-[14px] bg-red-50 active:bg-red-100 flex justify-center items-center gap-2">
                  <X size={18} />
                  Cancel Entire Request
                </button>
              </div>
            )}
          </>
        )}
      </div>`;

content = content.replace(target, newTarget);
fs.writeFileSync(file, content);
console.log('Cancel Entire Request inserted');
