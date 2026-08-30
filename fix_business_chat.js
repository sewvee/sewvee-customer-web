const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Business-Web/src/app/dashboard/messages/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `function renderMessageContent(msgText) {`;
const newCode = `function renderMessageContent(msgText) {
  if (msgText && msgText.includes("[ACTION_REQUIRED: PHOTO_REQUEST]")) {
    return (
      <div className="flex items-center gap-2 text-[#075E54] font-medium py-1">
        📸 You requested the customer to upload reference photos for this outfit.
      </div>
    );
  }`;

if (code.includes(target) && !code.includes("You requested the customer to upload reference photos")) {
  code = code.replace(target, newCode);
  fs.writeFileSync(file, code);
  console.log('Successfully updated business web app ACTION_REQUIRED text!');
}
