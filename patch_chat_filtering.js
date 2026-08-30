const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Insert formatDateGroup function
const dateGroupFn = `
function formatDateGroup(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
`;

if (!code.includes("formatDateGroup")) {
  code = code.replace(
    'export default function ChatDetailPage() {',
    dateGroupFn + '\nexport default function ChatDetailPage() {'
  );
}

// Filter messages
code = code.replace(
  'messages.map((msg, idx) => {',
  'const filteredMessages = contextOutfitId ? messages.filter(m => String(m.order_outfit_id) === String(contextOutfitId)) : messages;\n          filteredMessages.map((msg, idx) => {'
);

// Replace showContext with showDate
code = code.replace(
  'const showContext = idx === 0 || messages[idx-1].order_outfit_id !== msg.order_outfit_id;',
  'const showDate = idx === 0 || new Date(filteredMessages[idx-1].created_at).toDateString() !== new Date(msg.created_at).toDateString();'
);

code = code.replace(
  '{showContext && (\n                  <div className="flex justify-center mb-3 mt-2">\n                    <span className="bg-white border border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">\n                      {msg.outfit_name || \'Outfit\'}\n                    </span>\n                  </div>\n                )}',
  `{showDate && (
                  <div className="flex justify-center mb-3 mt-2">
                    <span className="bg-white border border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {formatDateGroup(msg.created_at)}
                    </span>
                  </div>
                )}`
);

fs.writeFileSync(file, code);
console.log("Patched message filtering and date pills");
