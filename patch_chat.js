const fs = require('fs');
let code = fs.readFileSync('src/app/(app)/chat/[orderId]/page.tsx', 'utf8');

// Add imports
code = code.replace(
  "import CollageMaker from '@/components/CollageMaker';",
  "import CollageMaker from '@/components/CollageMaker';\nimport { FeedbackModal } from '@/components/FeedbackModal';\nimport toast from 'react-hot-toast';"
);

// Add state
const targetState = "  const [collageMakerOutfitId, setCollageMakerOutfitId] = useState<number | null>(null);";
const newState = "  const [collageMakerOutfitId, setCollageMakerOutfitId] = useState<number | null>(null);\n  const [feedbackOutfitId, setFeedbackOutfitId] = useState<number | null>(null);\n  const [submittingFeedback, setSubmittingFeedback] = useState(false);";
code = code.replace(targetState, newState);

// Add ACTION_REQUIRED render block
const targetBlock = \`                    {msg.message && msg.message.includes('[ACTION_REQUIRED: PHOTO_REQUEST]') ? (() => {
                      const hasUploadedAfter = filteredMessages.some(m => 
                        m.order_outfit_id === msg.order_outfit_id && \`;
const newBlock = \`                    {msg.message && msg.message.includes('[ACTION_REQUIRED: FEEDBACK]') ? (() => {
                      const hasReviewedAfter = filteredMessages.some(m => 
                        m.order_outfit_id === msg.order_outfit_id && 
                        m.sender_type === 'CUSTOMER' && 
                        m.message && m.message.includes('Feedback Submitted') &&
                        new Date(m.created_at) > new Date(msg.created_at)
                      );
                      
                      if (hasReviewedAfter) {
                        return (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-emerald-600 text-xl">✓</span>
                            </div>
                            <h4 className="font-bold text-emerald-900 text-[15px] mb-1">Feedback Sent</h4>
                            <p className="text-emerald-800 text-[13.5px] leading-snug">
                              Thank you for providing your feedback!
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 my-2 text-center shadow-sm w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400"></div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-indigo-600 text-xl">⭐</span>
                        </div>
                        <h4 className="font-bold text-indigo-900 text-[15px] mb-1">⭐ Feedback Requested</h4>
                        <p className="text-indigo-800 text-[13.5px] leading-snug mb-4">
                          We'd love to hear about your experience! Please leave your feedback.
                        </p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFeedbackOutfitId(msg.order_outfit_id); }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          Leave Feedback
                        </button>
                      </div>
                      );
                    })() : msg.message && msg.message.includes('[ACTION_REQUIRED: PHOTO_REQUEST]') ? (() => {
                      const hasUploadedAfter = filteredMessages.some(m => 
                        m.order_outfit_id === msg.order_outfit_id && \`;
code = code.replace(targetBlock, newBlock);

// Add FeedbackModal Component rendering at the bottom
const targetCollage = \`      <CollageMaker 
        open={!!collageMakerOutfitId}\`;
const newCollage = \`      <FeedbackModal
        isOpen={!!feedbackOutfitId}
        onClose={() => setFeedbackOutfitId(null)}
        isSubmitting={submittingFeedback}
        onSubmit={async (feedbackData) => {
          if (!feedbackOutfitId) return;
          setSubmittingFeedback(true);
          try {
            const ratingMsg = \\\`⭐ Feedback Submitted!\\\\nStitching: \${feedbackData.stitchingRating}★ | Staff: \${feedbackData.staffRating}★ | Overall: \${feedbackData.boutiqueRating}★\${feedbackData.comments ? \\\`\\\\nComments: \${feedbackData.comments}\\\` : ''}\\\`;
            await api.post(\\\`/customer-portal/orders/\${orderId}/outfits/\${feedbackOutfitId}/requests\\\`, {
              message: ratingMsg
            });
            setFeedbackOutfitId(null);
            toast.success("Feedback submitted!");
            loadChat();
          } catch (e) {
            toast.error("Failed to submit feedback");
          } finally {
            setSubmittingFeedback(false);
          }
        }}
      />
      <CollageMaker 
        open={!!collageMakerOutfitId}\`;
code = code.replace(targetCollage, newCollage);

fs.writeFileSync('src/app/(app)/chat/[orderId]/page.tsx', code);
