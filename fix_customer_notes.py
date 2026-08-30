import re

with open('src/app/(app)/orders/[id]/page.tsx', 'r') as f:
    content = f.read()

old_block = """                {/* BOUTIQUE NOTES */}
                {activeOutfit.notes && (
                  <div className="bg-[#FEF3C7] rounded-[12px] p-4 mb-4 border border-[#FDE68A]">
                    <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">INSTRUCTIONS</p>
                    <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed">{activeOutfit.notes}</p>
                  </div>
                )}"""

new_block = """                {/* BOUTIQUE NOTES */}
                {activeOutfit.notes && (() => {
                  const text = activeOutfit.notes;
                  if (text.includes('--- Boutique Notes ---')) {
                    const parts = text.split('--- Boutique Notes ---');
                    return (
                      <div className="flex flex-col gap-3 mb-4">
                        {parts[0].trim() && (
                          <div className="bg-[#FEF3C7] rounded-[12px] p-4 border border-[#FDE68A]">
                            <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">CUSTOMER NOTES</p>
                            <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed whitespace-pre-wrap">{parts[0].trim()}</p>
                          </div>
                        )}
                        {parts[1] && parts[1].trim() && (
                          <div className="bg-[#F0FDF4] rounded-[12px] p-4 border border-[#BBF7D0]">
                            <p className="text-[11px] font-bold text-[#166534] font-inter mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> BOUTIQUE NOTES
                            </p>
                            <p className="text-[13px] font-medium text-[#15803D] font-inter leading-relaxed whitespace-pre-wrap">{parts[1].trim()}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="bg-[#FEF3C7] rounded-[12px] p-4 mb-4 border border-[#FDE68A]">
                      <p className="text-[11px] font-bold text-[#B45309] font-inter mb-1">INSTRUCTIONS</p>
                      <p className="text-[13px] font-medium text-[#92400E] font-inter leading-relaxed whitespace-pre-wrap">{activeOutfit.notes}</p>
                    </div>
                  );
                })()}"""

content = content.replace(old_block, new_block)

with open('src/app/(app)/orders/[id]/page.tsx', 'w') as f:
    f.write(content)
