'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, RotateCw, RotateCcw, Check, ZoomIn } from 'lucide-react';
import { getCroppedImg } from '@/lib/cropImage';

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  sectionTitle: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export function ImageCropModal({
  open,
  imageSrc,
  sectionTitle,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const onCropAreaChange = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error('Failed to crop image', e);
      // Fallback to original image if crop fails
      onCropComplete(imageSrc);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col h-[520px] border border-slate-200">
        
        {/* Header */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B43EE] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              Crop & Rotate
            </span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{sectionTitle} Reference</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropAreaChange}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls Toolbar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2.5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#5B43EE] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rotate Buttons */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Rotate Angle:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleDone}
            className="w-2/3 py-2.5 bg-[#5B43EE] hover:bg-[#4E36DE] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Done & Attach Photo</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
