import re
with open('src/app/(app)/orders/[id]/page.tsx', 'r') as f:
    content = f.read()

old_block = """                    {activeOutfit.stitchingOptions && activeOutfit.stitchingOptions.length > 0 ? (
                      <div className="space-y-3">
                        {activeOutfit.stitchingOptions.map((opt: any, index: number) => (
                          <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                            <span className="text-[13px] font-medium text-[#475569]">{opt.name}</span>
                            <span className="text-[13px] font-bold text-[#0F172A] text-right ml-4">{opt.value}</span>
                          </div>
                        ))}
                      </div>"""

new_block = """                    {activeOutfit.stitching && activeOutfit.stitching.length > 0 ? (
                      <div className="space-y-3">
                        {activeOutfit.stitching.map((opt: any, index: number) => (
                          <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                            <span className="text-[13px] font-medium text-[#475569]">{opt.category?.name || 'Option'}</span>
                            <span className="text-[13px] font-bold text-[#0F172A] text-right ml-4">{opt.option?.name || '-'}</span>
                          </div>
                        ))}
                      </div>"""

content = content.replace(old_block, new_block)

with open('src/app/(app)/orders/[id]/page.tsx', 'w') as f:
    f.write(content)
