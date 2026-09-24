const fs = require('fs');
const file = 'src/app/(app)/orders/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const searchExt = `const delivDate = localConfig?.delivery_date || localRichData.delivery_date || extractField('Expected Date') || activeOutfit.deliveryDate || (order as any).deliveryDate || '';`;
const replaceExt = `const delivDate = localConfig?.delivery_date || localRichData.delivery_date || extractField('Expected Date') || activeOutfit.deliveryDate || (order as any).deliveryDate || '';
                  const termsAgreed = localConfig?.terms_agreed || extractField('Terms & Conditions') === 'Agreed';`;
content = content.replace(searchExt, replaceExt);

const searchUI = `{delivDate ? (
                          <div className="p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Expected Delivery</span>
                            <span className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#5B43EE]" />
                              {new Date(delivDate).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'})}
                            </span>
                          </div>
                        ) : null}`;
const replaceUI = `{delivDate ? (
                          <div className="p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Expected Delivery</span>
                            <span className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#5B43EE]" />
                              {new Date(delivDate).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'})}
                            </span>
                          </div>
                        ) : null}

                        {/* Terms & Conditions Agreement */}
                        {termsAgreed ? (
                          <div className="p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Terms & Conditions</span>
                            <span className="text-[13px] font-semibold text-[#059669] flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Agreed by Customer
                            </span>
                          </div>
                        ) : null}`;
content = content.replace(searchUI, replaceUI);

fs.writeFileSync(file, content);
console.log('patched orders UI');
