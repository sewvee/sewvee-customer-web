const fs = require('fs');

let feedbackCode = fs.readFileSync('src/components/FeedbackModal.tsx', 'utf8');
feedbackCode = feedbackCode.replace('const toast = useToast();', 'const { showToast } = useToast();');
feedbackCode = feedbackCode.replace('toast.error(', 'showToast(');
feedbackCode = feedbackCode.replace(');', ", 'error');");
fs.writeFileSync('src/components/FeedbackModal.tsx', feedbackCode);

let chatCode = fs.readFileSync('src/app/(app)/chat/[orderId]/page.tsx', 'utf8');
chatCode = chatCode.replace('const toast = useToast();', 'const { showToast } = useToast();');
chatCode = chatCode.replace('toast.success("Feedback submitted!");', 'showToast("Feedback submitted!", "success");');
chatCode = chatCode.replace('toast.error("Failed to submit feedback");', 'showToast("Failed to submit feedback", "error");');
fs.writeFileSync('src/app/(app)/chat/[orderId]/page.tsx', chatCode);
