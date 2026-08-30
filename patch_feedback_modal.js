const fs = require('fs');
let code = fs.readFileSync('src/components/FeedbackModal.tsx', 'utf8');

code = code.replace("w-[400px]", "w-full sm:w-[400px]");
code = code.replace("Share the customer's feedback.", "Share your feedback.");
code = code.replace("How satisfied was the customer with the outfit?", "How satisfied are you with the outfit?");
code = code.replace("Tell us what the customer liked", "Tell us what you liked");

fs.writeFileSync('src/components/FeedbackModal.tsx', code);
