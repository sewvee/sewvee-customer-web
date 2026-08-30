const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /\{\/\* OUTFIT DETAILS \*\/\}.*?(?=\{\/\* STITCHING SPECIFICATIONS \*\/)/s;

const newOutfitDetails = `{/* OUTFIT DETAILS */}
                {order.order_type === 'STITCHING_REQUEST' ? (() => {
                  const getDetails = () => {
                    const d = {};
                    
                    // Fallback to order.details if it exists
                    const od = order.details || {};
                    const cat = activeOutfit.category || activeOutfit.type || activeOutfit.name || od.category;
                    if (cat) d['Category'] = cat.replace('Stitching Request - ', '');
                    
                    if (activeOutfit.name) d['Outfit Name'] = activeOutfit.name.replace('Stitching Request - ', '');
                    
                    const desc = activeOutfit.customer_notes || activeOutfit.notes || activeOutfit.description || activeOutfit.customer_instructions || od.description;
                    if (desc) d['Description / Notes'] = desc;
                    
                    const meas = activeOutfit.measurement_option || activeOutfit.measurement || od.measurement_option;
                    if (meas) d['Measurement'] = meas;
                    
                    const del = activeOutfit.deliveryDate || activeOutfit.expected_date || od.delivery_date || order.deliveryDate;
                    if (del) {
                      d['Expected Date'] = new Date(del).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
                    }
                    
                    return d;
                  };
                  
                  // If we specifically have our formatted customer_notes, let's parse it nicely
                  const parseNotes = (notes) => {
                    if (!notes || !notes.includes('Category:')) return getDetails();
                    const result = {};
                    const extract = (key, nextKey) => {
                      const k = key + ':';
                      const s = notes.indexOf(k);
                      if (s === -1) return '';
                      const start = s + k.length;
                      if (nextKey) {
                        const e = notes.indexOf('\\n' + nextKey + ':', start);
                        if (e === -1) return notes.substring(start).trim();
                        return notes.substring(start, e).trim();
                      }
                      return notes.substring(start).trim();
                    };
                    result['Category'] = extract('Category', 'Outfit Name') || extract('Category', 'Description');
                    result['Outfit Name'] = extract('Outfit Name', 'Description');
                    result['Description'] = extract('Description', 'Measurement');
                    result['Measurement'] = extract('Measurement', 'Expected Date');
                    result['Expected Date'] = extract('Expected Date');
                    return result;
                  };
                  
                  const parsed = (activeOutfit.customer_notes && activeOutfit.customer_notes.includes('Category:')) 
                    ? parseNotes(activeOutfit.customer_notes) 
                    : getDetails();
                  
                  return (
                    <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <div className="flex items-center">
                          <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                          <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">OUTFIT DETAILS</h2>
                        </div>
                        <button className="text-[10px] font-bold text-red-500 uppercase tracking-wide px-2 py-1 bg-red-50 rounded-md border border-red-100 active:bg-red-100">Cancel Outfit</button>
                      </div>
                      <div className="p-4 grid grid-cols-1 gap-y-4">
                        {Object.entries(parsed).filter(([k,v]) => v).length > 0 ? (
                          Object.entries(parsed).filter(([k,v]) => v).map(([k, v]) => (
                            <div key={k} className="flex flex-col">
                              <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">{k}</span>
                              <span className="text-[13px] font-bold text-[#0F172A] font-inter whitespace-pre-wrap">{String(v)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col gap-2 text-[12px] font-mono text-gray-400">
                             <p>Debug Data:</p>
                             <p>customer_notes: {String(activeOutfit.customer_notes)}</p>
                             <p>notes: {String(activeOutfit.notes)}</p>
                             <p>desc: {String(activeOutfit.description)}</p>
                             <p>order details: {JSON.stringify(order.details)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <Shirt className="w-3.5 h-3.5 text-[#5B43EE] mr-2" />
                    <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">OUTFIT DETAILS</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">ORDER TYPE</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter">{order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER' : 'STITCHING'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">URGENCY</span>
                      <span className="text-[13px] font-bold text-[#0F172A] font-inter uppercase">{activeOutfit.urgency || (order).urgency || 'NORMAL'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">TRIAL DATE</span>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                          {activeOutfit.trialDate ? new Date(activeOutfit.trialDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">DELIVERY DATE</span>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#5B43EE] mr-1.5" />
                        <span className="text-[13px] font-bold text-[#0F172A] font-inter">
                          {activeOutfit.deliveryDate ? new Date(activeOutfit.deliveryDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'N/A')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                )}
                `;

content = content.replace(targetRegex, newOutfitDetails);
fs.writeFileSync(file, content);
console.log('Robust details patched');
