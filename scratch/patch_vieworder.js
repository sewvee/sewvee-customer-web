const fs = require('fs');
const file = 'src/app/(app)/stitching/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldOrdersMap = `              {pastStitchingOrders.map(o => (
                <button 
                  key={o.id}
                  onClick={() => {
                    setFormData({ ...formData, selected_past_order_id: o.id.toString() });
                    setMeasurementDrawerOpen(false);
                  }}
                  className={\`w-full p-4 rounded-xl border text-left flex justify-between items-center \${formData.selected_past_order_id === o.id.toString() ? 'border-[#5B43EE] bg-indigo-50' : 'border-gray-200'}\`}
                >
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">Order: {o.billNo || \`ORD-\${o.id}\`}</p>
                    <p className="text-[12px] text-gray-500 mt-1">{new Date(o.createdAt || o.date || new Date()).toLocaleDateString()}</p>
                  </div>
                  {formData.selected_past_order_id === o.id.toString() && <CheckCircle className="w-5 h-5 text-[#5B43EE]" />}
                </button>
              ))}`;

const newOrdersMap = `              {pastStitchingOrders.map(o => (
                <div key={o.id} className={\`w-full p-4 rounded-xl border flex justify-between items-center \${formData.selected_past_order_id === o.id.toString() ? 'border-[#5B43EE] bg-indigo-50' : 'border-gray-200'}\`}>
                  <button 
                    onClick={() => {
                      setFormData({ ...formData, selected_past_order_id: o.id.toString() });
                      setMeasurementDrawerOpen(false);
                    }}
                    className="flex-1 text-left flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-[#0F172A]">Order: {o.billNo || \`ORD-\${o.id}\`}</p>
                      <p className="text-[12px] text-gray-500 mt-1">{new Date(o.createdAt || o.date || new Date()).toLocaleDateString()}</p>
                    </div>
                    {formData.selected_past_order_id === o.id.toString() && <CheckCircle className="w-5 h-5 text-[#5B43EE] mr-4" />}
                  </button>
                  <a 
                    href={\`/orders/\${o.id}\`}
                    target="_blank"
                    className="text-[12px] font-bold text-[#5B43EE] bg-[#EEF2FF] px-3 py-1.5 rounded-lg ml-2 shrink-0 border border-[#5B43EE]/20 hover:bg-[#E0E7FF] flex items-center gap-1"
                  >
                    View Order
                    <ChevronRight size={14} />
                  </a>
                </div>
              ))}`;

content = content.replace(oldOrdersMap, newOrdersMap);
fs.writeFileSync(file, content);
console.log('View Order patched');
