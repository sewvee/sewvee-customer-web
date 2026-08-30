const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/stitching/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `                    {(outfit.measurements || outfit.customer_measurements) && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Measurements</span>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{outfit.measurements || outfit.customer_measurements}</p>
                      </div>
                    )}`;

const newCode = `                    {(() => {
                      const m = outfit.measurements || outfit.customer_measurements;
                      if (!m || (Array.isArray(m) && m.length === 0)) return null;
                      
                      return (
                        <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Measurements</span>
                          {Array.isArray(m) ? (
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
                              {m.map((meas: any, i: number) => {
                                const name = meas.measurement_name || meas.name || meas.field_name || \`M\${i+1}\`;
                                const val = typeof meas.value === 'object' && meas.value !== null ? meas.value.value || JSON.stringify(meas.value) : meas.value;
                                return (
                                  <div key={i} className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-medium">{name}</span>
                                    <span className="text-[13px] font-semibold text-gray-800">{val}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[13px] text-gray-700 whitespace-pre-wrap mt-1">{String(m)}</p>
                          )}
                        </div>
                      );
                    })()}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Patched stitching measurements rendering");
