const fs = require('fs');

let feedbackModalCode = fs.readFileSync('src/components/FeedbackModal.tsx', 'utf8');
feedbackModalCode = feedbackModalCode.replace('import toast from "react-hot-toast";', 'import { useToast } from "@/hooks/useToast";');
feedbackModalCode = feedbackModalCode.replace(
  'export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {',
  'export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {\n  const toast = useToast();'
);
fs.writeFileSync('src/components/FeedbackModal.tsx', feedbackModalCode);

let chatCode = fs.readFileSync('src/app/(app)/chat/[orderId]/page.tsx', 'utf8');
chatCode = chatCode.replace("import toast from 'react-hot-toast';", "import { useToast } from '@/hooks/useToast';");
chatCode = chatCode.replace(
  'export default function ChatScreen({ params }: { params: { orderId: string } }) {',
  'export default function ChatScreen({ params }: { params: { orderId: string } }) {\n  const toast = useToast();'
);
fs.writeFileSync('src/app/(app)/chat/[orderId]/page.tsx', chatCode);
