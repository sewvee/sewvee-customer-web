import React, { useState } from "react";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { stitchingRating: number; staffRating: number; boutiqueRating: number; comments: string }) => void;
  isSubmitting?: boolean;
}

const RatingRow = ({ label, description, value, onChange }: any) => {
  return (
    <div className="flex flex-col mb-8 items-center border-b border-slate-100 pb-6 last:border-0 last:pb-0">
      <div className="text-center mb-3">
        <h4 className="text-[16px] font-bold text-slate-800">{label}</h4>
        {description && <p className="text-[13px] text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none"
          >
            <Star
              size={36}
              className={`transition-all duration-300 ${
                star <= value 
                  ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-sm" 
                  : "fill-transparent text-slate-300"
              }`}
              strokeWidth={star <= value ? 0 : 1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const { showToast } = useToast();
  const [stitchingRating, setStitchingRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [boutiqueRating, setBoutiqueRating] = useState(0);
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (stitchingRating === 0 && staffRating === 0 && boutiqueRating === 0 && !comments.trim()) {
      showToast("Please provide at least one rating or comment.", "error");
      return;
    }
    onSubmit({ stitchingRating, staffRating, boutiqueRating, comments });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop (clickable) */}
      <div className="absolute inset-0" />
      
      {/* Centered Modal */}
      <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-5 px-6 shrink-0 relative text-center">
          <h2 className="text-[18px] font-bold text-white">Customer Feedback</h2>
          <p className="text-indigo-100 text-[13px] mt-1 font-medium leading-tight">
            How was the experience? Share your feedback.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col">
          <RatingRow
            label="Stitching & Fitting"
            description="How satisfied are you with the outfit?"
            value={stitchingRating}
            onChange={setStitchingRating}
          />
          <RatingRow
            label="Staff Behavior"
            description="Rate the customer service experience."
            value={staffRating}
            onChange={setStaffRating}
          />
          <RatingRow
            label="Overall Experience"
            description="Rate the overall boutique experience."
            value={boutiqueRating}
            onChange={setBoutiqueRating}
          />

          <div className="mt-2">
            <label className="block text-[15px] font-bold text-slate-800 mb-3 text-center">Additional Comments</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 text-[14px] text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
              rows={3}
              placeholder="Tell us what you liked or how we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 px-4 rounded-xl text-[15px] font-bold text-white bg-[#5B43EE] hover:bg-[#4a34ce] transition-colors disabled:opacity-70 flex justify-center items-center shadow-md focus:outline-none active:scale-[0.98]"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};
