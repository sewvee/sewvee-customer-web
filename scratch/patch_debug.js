const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                      <div className="p-4 grid grid-cols-1 gap-y-4">
                        {Object.entries(parsed).filter(([k,v]) => v).map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">{k}</span>
                            <span className="text-[13px] font-bold text-[#0F172A] font-inter whitespace-pre-wrap">{v}</span>
                          </div>
                        ))}
                      </div>`;

const newTarget = `                      <div className="p-4 grid grid-cols-1 gap-y-4">
                        {Object.entries(parsed).filter(([k,v]) => v).length > 0 ? (
                          Object.entries(parsed).filter(([k,v]) => v).map(([k, v]) => (
                            <div key={k} className="flex flex-col">
                              <span className="text-[10px] font-bold text-[#94A3B8] font-inter tracking-wide mb-1.5 uppercase">{k}</span>
                              <span className="text-[13px] font-bold text-[#0F172A] font-inter whitespace-pre-wrap">{v}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] font-mono text-gray-500 overflow-hidden">
                            <strong>Debug Info:</strong><br />
                            customer_notes: {String(activeOutfit.customer_notes)}<br/>
                            notes: {String(activeOutfit.notes)}<br/>
                            description: {String(activeOutfit.description)}<br/>
                            order.details: {JSON.stringify(order.details || {})}
                          </div>
                        )}
                      </div>`;

content = content.replace(target, newTarget);
fs.writeFileSync(file, content);
