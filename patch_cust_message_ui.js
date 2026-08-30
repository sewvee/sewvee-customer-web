const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const parseInquiryStr = `
function renderMessageContent(msgText: string, isCustomer: boolean) {
  if (msgText && msgText.startsWith("Category:")) {
    try {
      const lines = msgText.split("\\n");
      const category = lines.find(l => l.startsWith("Category:"))?.replace("Category:", "").trim() || "";
      const description = lines.find(l => l.startsWith("Description:"))?.replace("Description:", "").trim() || "";
      const measurement = lines.find(l => l.startsWith("Measurement:"))?.replace("Measurement:", "").trim() || "";
      const delivery = lines.find(l => l.startsWith("Delivery Date:"))?.replace("Delivery Date:", "").trim() || "";

      return (
        <div className="flex flex-col gap-2 mt-1 mb-1 w-full min-w-[200px]">
          <div className={\`rounded-md p-2.5 shadow-sm text-[13.5px] \${isCustomer ? 'bg-white/10' : 'bg-indigo-50/50 border border-indigo-100'}\`}>
            {category && <div className={\`font-bold mb-1 \${isCustomer ? 'text-white' : 'text-[#5B43EE]'}\`}>{category}</div>}
            {description && <div className={\`leading-snug italic mb-2 \${isCustomer ? 'text-indigo-100' : 'text-slate-700'}\`}>"{description}"</div>}
            <div className={\`flex flex-col gap-1 text-[12.5px] border-t pt-1.5 \${isCustomer ? 'text-indigo-50 border-white/20' : 'text-slate-600 border-[#5B43EE]/10'}\`}>
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Measurements:</span>
                <span className="text-right">{measurement}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Expected By:</span>
                <span className="text-right">{delivery}</span>
              </div>
            </div>
          </div>
        </div>
      );
    } catch(e) {}
  }
  return msgText;
}
`;

if (!code.includes("function renderMessageContent")) {
  code = code.replace(
    'export default function ChatDetailPage({ params }: { params: { orderId: string } }) {',
    parseInquiryStr + '\nexport default function ChatDetailPage({ params }: { params: { orderId: string } }) {'
  );
  
  code = code.replace(
    /\{msg\.message\}/,
    '{renderMessageContent(msg.message, isCustomer)}'
  );
  
  fs.writeFileSync(file, code);
  console.log("Patched Customer UI");
} else {
  console.log("Already patched");
}
