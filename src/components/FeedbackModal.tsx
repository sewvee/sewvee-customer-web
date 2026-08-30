import React, { useState } from "react";
import { X, Star, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { stitchingRating: number; staffRating: number; boutiqueRating: number; comments: string }) => void;
  isSubmitting?: boolean;
}

const RatingRow = ({ label, description, value, onChange }: any) => {
  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{label}</h4>
          {description && <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{description}</p>}
        </div>
        <div className="flex gap-1 shrink-0 ml-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={22}
                className={star <= value ? "fill-amber-500 text-amber-500" : "fill-transparent text-slate-300"}
                strokeWidth={star <= value ? 2 : 1.5}
              />
            </button>
          ))}
        </div>
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
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop (clickable) */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full sm:w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
            <Sparkles className="text-white" size={24} />
          </div>
          <h2 className="text-[17px] font-bold text-white text-center">Customer Feedback</h2>
          <p className="text-indigo-100 text-center text-[12px] mt-1 font-medium leading-tight">
            How was the experience? Share your feedback.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
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

          <div className="mt-4">
            <label className="block text-[13px] font-semibold text-slate-800 mb-2">Additional Comments</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              rows={3}
              placeholder="Tell us what you liked or how we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm focus:outline-none"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
