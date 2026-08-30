const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/components/order/OrderCard.tsx';
let code = fs.readFileSync(file, 'utf8');

const statusHeaderOld = `<p className="text-[15px] font-bold text-[#1E293B] truncate font-inter">
                {order.boutiqueName}
              </p>`;
const statusHeaderNew = `<p className="text-[15px] font-bold text-[#1E293B] truncate font-inter flex items-center gap-2">
                {order.boutiqueName}
                {(String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED') && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-bold tracking-widest uppercase flex-shrink-0">
                    Cancelled
                  </span>
                )}
              </p>`;
              
code = code.replace(statusHeaderOld, statusHeaderNew);

const deliveryOld = `<div className="flex-1 flex flex-col items-end">
            <p className="text-[10px] text-[#64748B] font-medium font-inter mb-1">
              {order.order_type === 'STITCHING_REQUEST' ? 'Delivery' : 'Due'}
            </p>
            <p className={\`text-[13px] font-bold font-inter \${order.order_type === 'STITCHING_REQUEST' ? 'text-[#1E293B]' : 'text-[#EF4444]'}\`}>
              {order.order_type === 'STITCHING_REQUEST' ? (deliveryDate ? formatDate(deliveryDate) : 'TBD') : \`₹\${due}\`}
            </p>
          </div>`;
          
const deliveryNew = `<div className="flex-1 flex flex-col items-end">
            <p className="text-[10px] text-[#64748B] font-medium font-inter mb-1">
              {order.order_type === 'STITCHING_REQUEST' ? 'Delivery' : 'Due'}
            </p>
            <p className={\`text-[13px] font-bold font-inter \${order.order_type === 'STITCHING_REQUEST' ? 'text-[#1E293B]' : 'text-[#EF4444]'}\`}>
              {(String(order?.status).toUpperCase() === 'CANCELLED' || (order?.status as any)?.id === 4 || (order?.status as any)?.name === 'CANCELLED') 
                ? <span className="text-red-500">—</span>
                : (order.order_type === 'STITCHING_REQUEST' ? (deliveryDate ? formatDate(deliveryDate) : 'TBD') : \`₹\${due}\`)}
            </p>
          </div>`;
          
code = code.replace(deliveryOld, deliveryNew);

fs.writeFileSync(file, code);
console.log("Patched OrderCard");
