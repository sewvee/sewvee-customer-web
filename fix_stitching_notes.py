import re

with open('src/app/(app)/stitching/page.tsx', 'r') as f:
    content = f.read()

old_block = """                    {(outfit.notes || outfit.customer_notes) && (
                      <div className="mt-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Notes</span>
                        <p className="text-[13px] text-gray-700">{outfit.notes || outfit.customer_notes}</p>
                      </div>
                    )}"""

new_block = """                    {(outfit.notes || outfit.customer_notes) && (() => {
                      const text = outfit.notes || outfit.customer_notes;
                      if (text.includes('--- Boutique Notes ---')) {
                        const parts = text.split('--- Boutique Notes ---');
                        return (
                          <div className="mt-3 flex flex-col gap-2">
                            {parts[0].trim() && (
                              <div className="bg-[#FEF3C7] rounded-lg p-3 border border-[#FDE68A]">
                                <span className="text-[10px] font-bold text-[#B45309] uppercase block mb-1">Customer Notes</span>
                                <p className="text-[13px] text-[#92400E] whitespace-pre-wrap">{parts[0].trim()}</p>
                              </div>
                            )}
                            {parts[1] && parts[1].trim() && (
                              <div className="bg-[#F0FDF4] rounded-lg p-3 border border-[#BBF7D0]">
                                <span className="text-[10px] font-bold text-[#166534] uppercase block mb-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Boutique Notes
                                </span>
                                <p className="text-[13px] text-[#15803D] whitespace-pre-wrap">{parts[1].trim()}</p>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="mt-3 bg-[#FEF3C7] rounded-lg p-3 border border-[#FDE68A]">
                          <span className="text-[10px] font-bold text-[#B45309] uppercase block mb-1">Notes</span>
                          <p className="text-[13px] text-[#92400E] whitespace-pre-wrap">{text}</p>
                        </div>
                      );
                    })()}"""

content = content.replace(old_block, new_block)

with open('src/app/(app)/stitching/page.tsx', 'w') as f:
    f.write(content)
