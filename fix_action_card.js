const fs = require('fs');
const file = 'src/app/(app)/chat/[orderId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the amber card I just added to renderMessageContent
const oldAmberCard = `  if (msgText && msgText.includes("[ACTION_REQUIRED: PHOTO_REQUEST]")) {
    return (
      <div className="flex flex-col gap-2 w-full mt-1 mb-1">
        <div className={\`rounded-xl p-4 shadow-sm border \${isCustomer ? 'bg-white/10 border-white/20' : 'bg-amber-50 border-amber-200'}\`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={\`flex items-center justify-center w-8 h-8 rounded-full \${isCustomer ? 'bg-white/20' : 'bg-amber-100 text-amber-600'}\`}>
              📸
            </span>
            <span className={\`font-bold text-[13.5px] \${isCustomer ? 'text-white' : 'text-amber-800'}\`}>Action Required</span>
          </div>
          <p className={\`text-[13px] leading-relaxed \${isCustomer ? 'text-indigo-100' : 'text-amber-700'}\`}>
            The boutique has requested you to upload reference photos or sketches for this outfit. Please go to the order details page to upload them.
          </p>
        </div>
      </div>
    );
  }`;

if (code.includes(oldAmberCard)) {
  code = code.replace(oldAmberCard, '');
  console.log('Removed amber card.');
}

// 2. Fix the strict equality check at line 440
const oldCheck = `{msg.message === '[ACTION_REQUIRED: PHOTO_REQUEST]' ? (`;
const newCheck = `{msg.message && msg.message.includes('[ACTION_REQUIRED: PHOTO_REQUEST]') ? (`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  console.log('Fixed strict equality check to includes!');
} else {
  console.log('Could not find old check:', oldCheck);
}

fs.writeFileSync(file, code);
