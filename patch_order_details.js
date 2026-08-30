import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/app/(app)/orders/[id]/page.tsx', 'utf-8');

// 1. Change CUSTOM STITCHING to PRE-ORDER INQUIRY if STITCHING_REQUEST
content = content.replace(
  "{order.order_type === 'SALE_ORDER' ? 'SALE ORDER' : 'CUSTOM STITCHING'}",
  "{order.order_type === 'SALE_ORDER' ? 'SALE ORDER' : (order.order_type === 'STITCHING_REQUEST' ? 'PRE-ORDER INQUIRY' : 'CUSTOM STITCHING')}"
);

// 2. Change STITCHING to PRE-ORDER in the Order Type badge
content = content.replace(
  '<span className="text-[13px] font-bold text-[#0F172A] font-inter">STITCHING</span>',
  '<span className="text-[13px] font-bold text-[#0F172A] font-inter">{order.order_type === \'STITCHING_REQUEST\' ? \'PRE-ORDER\' : \'STITCHING\'}</span>'
);

// 3. Add Request Details (Customer Notes) block
const requestDetailsBlock = `
                {order.order_type === 'STITCHING_REQUEST' && activeOutfit.customerNotes && (
                  <div className="bg-white rounded-[16px] overflow-hidden mb-4 border border-[#E2E8F0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
                      <h2 className="text-[11px] font-bold text-[#0F172A] font-inter tracking-wide uppercase">REQUEST DETAILS</h2>
                    </div>
                    <div className="p-4">
                      <p className="text-[13px] text-[#475569] whitespace-pre-line leading-relaxed font-inter">{activeOutfit.customerNotes}</p>
                    </div>
                  </div>
                )}
`;

// Insert it before the Stitching Specifications
content = content.replace(
  '{/* STITCHING SPECIFICATIONS */}',
  requestDetailsBlock + '\n                {/* STITCHING SPECIFICATIONS */}'
);

writeFileSync('src/app/(app)/orders/[id]/page.tsx', content);
