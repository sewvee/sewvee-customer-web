import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface CollageMakerModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (blob: Blob) => Promise<void>;
  outfitId?: number;
}

export function CollageMakerModal({ open, onClose, onSend, outfitId }: CollageMakerModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) {
      setImages([]);
      setIsProcessing(false);
    }
  }, [open]);

  // Use a second effect to draw to the canvas when images state changes.
  useEffect(() => {
    if (images.length > 0 && open && !isProcessing) {
      drawPreview();
    }
  }, [images, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    const newImages = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newImages]);
  };

  const drawPreview = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const CANVAS_SIZE = 1080;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const PADDING = 20;
    const loadedImages = await Promise.all(
      images.map(src => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        });
      })
    );

    const drawImageContain = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      // Draw standard cover behavior
      const ratio = Math.max(w / img.width, h / img.height);
      const nw = img.width * ratio;
      const nh = img.height * ratio;
      const nx = x + (w - nw) / 2;
      const ny = y + (h - nh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, nx, ny, nw, nh);
      ctx.restore();
    };

    if (loadedImages.length === 1) {
      drawImageContain(loadedImages[0], PADDING, PADDING, CANVAS_SIZE - PADDING*2, CANVAS_SIZE - PADDING*2);
    } else if (loadedImages.length === 2) {
      const w = (CANVAS_SIZE - PADDING * 3) / 2;
      const h = CANVAS_SIZE - PADDING * 2;
      drawImageContain(loadedImages[0], PADDING, PADDING, w, h);
      drawImageContain(loadedImages[1], PADDING * 2 + w, PADDING, w, h);
    } else if (loadedImages.length === 3) {
      const w1 = (CANVAS_SIZE - PADDING * 3) / 2;
      const h = CANVAS_SIZE - PADDING * 2;
      drawImageContain(loadedImages[0], PADDING, PADDING, w1, h);
      
      const w2 = (CANVAS_SIZE - PADDING * 3) / 2;
      const h2 = (CANVAS_SIZE - PADDING * 3) / 2;
      drawImageContain(loadedImages[1], PADDING * 2 + w1, PADDING, w2, h2);
      drawImageContain(loadedImages[2], PADDING * 2 + w1, PADDING * 2 + h2, w2, h2);
    } else if (loadedImages.length >= 4) {
      const w = (CANVAS_SIZE - PADDING * 3) / 2;
      const h = (CANVAS_SIZE - PADDING * 3) / 2;
      drawImageContain(loadedImages[0], PADDING, PADDING, w, h);
      drawImageContain(loadedImages[1], PADDING * 2 + w, PADDING, w, h);
      drawImageContain(loadedImages[2], PADDING, PADDING * 2 + h, w, h);
      drawImageContain(loadedImages[3], PADDING * 2 + w, PADDING * 2 + h, w, h);
    }

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  };

  const handleCreateAndSend = async () => {
    setIsProcessing(true);
    try {
      const blob = await drawPreview(); // Actually generate the blob
      if (blob) {
        await onSend(blob);
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="p-4 flex flex-col h-full bg-slate-50 min-h-[450px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Collage Maker</h2>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 flex flex-col items-center">
          <div className="w-full max-w-[400px] aspect-square bg-white rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden shadow-sm">
            {images.length > 0 ? (
              <canvas 
                ref={canvasRef} 
                className="w-full h-full object-contain"
                style={{ display: isProcessing ? 'none' : 'block' }}
              />
            ) : (
              <div className="text-center p-6">
                <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Select up to 4 photos to arrange</p>
              </div>
            )}
            
            {!isProcessing && images.length > 0 && (
              <button 
                onClick={() => setImages([])}
                className="absolute top-3 right-3 bg-white/80 backdrop-blur shadow p-1.5 rounded-full text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-6 flex gap-3 w-full max-w-[400px]">
            {images.length < 4 && (
              <label className="flex-1 bg-white border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 shadow-sm transition">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-slate-700">Add Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            )}
            {images.length > 0 && (
              <button 
                onClick={handleCreateAndSend}
                disabled={isProcessing}
                className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {isProcessing ? "Processing..." : "Create & Send"}
              </button>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
