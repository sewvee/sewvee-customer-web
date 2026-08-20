'use client';
import { useState, useRef } from 'react';
import { Scissors, Camera, Image as ImageIcon, X, Loader2, Download, Save, Share } from 'lucide-react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { useGalleryStore } from '@/store/galleryStore';
import { useToast } from '@/hooks/useToast';

interface CollageMakerProps {
  open: boolean;
  onClose: () => void;
  onSave?: (url: string) => void;
}

export function CollageMaker({ open, onClose, onSave }: CollageMakerProps) {
  const { folders, uploadImage, addImageToFolder } = useGalleryStore();
  const { showToast } = useToast();
  const [layout, setLayout] = useState<2 | 3 | 4>(2);
  const [images, setImages] = useState<string[]>(Array(4).fill(''));
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot !== null) {
      const url = URL.createObjectURL(file);
      const newImages = [...images];
      newImages[activeSlot] = url;
      setImages(newImages);
      setActiveSlot(null);
    }
  };

  const handleSave = async () => {
    // Basic canvas rendering
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, 0, 800, 800);

    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    setSaving(true);
    try {
      const pad = 10;
      let slots = [];
      if (layout === 2) {
        slots = [
          { x: pad, y: pad, w: 400 - pad*1.5, h: 800 - pad*2 },
          { x: 400 + pad/2, y: pad, w: 400 - pad*1.5, h: 800 - pad*2 },
        ];
      } else if (layout === 3) {
        slots = [
          { x: pad, y: pad, w: 400 - pad*1.5, h: 800 - pad*2 },
          { x: 400 + pad/2, y: pad, w: 400 - pad*1.5, h: 400 - pad*1.5 },
          { x: 400 + pad/2, y: 400 + pad/2, w: 400 - pad*1.5, h: 400 - pad*1.5 },
        ];
      } else {
        slots = [
          { x: pad, y: pad, w: 400 - pad*1.5, h: 400 - pad*1.5 },
          { x: 400 + pad/2, y: pad, w: 400 - pad*1.5, h: 400 - pad*1.5 },
          { x: pad, y: 400 + pad/2, w: 400 - pad*1.5, h: 400 - pad*1.5 },
          { x: 400 + pad/2, y: 400 + pad/2, w: 400 - pad*1.5, h: 400 - pad*1.5 },
        ];
      }

      for (let i = 0; i < layout; i++) {
        if (images[i]) {
          const img = await loadImg(images[i]);
          
          // Cover logic
          const sRatio = img.width / img.height;
          const dRatio = slots[i].w / slots[i].h;
          let sw, sh, sx, sy;
          
          if (sRatio > dRatio) {
            sh = img.height;
            sw = img.height * dRatio;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
            sw = img.width;
            sh = img.width / dRatio;
            sx = 0;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, slots[i].x, slots[i].y, slots[i].w, slots[i].h);
        } else {
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(slots[i].x, slots[i].y, slots[i].w, slots[i].h);
        }
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `collage_${Date.now()}.jpg`, { type: 'image/jpeg' });
          if (folders.length > 0) {
            const url = await uploadImage(folders[0].id, file);
            if (url) {
              await addImageToFolder(folders[0].id, url, file.name);
              showToast('Collage saved to your first folder!');
              if (onSave) onSave(url);
              onClose();
            } else {
              showToast('Upload failed', 'error');
            }
          } else {
            showToast('Please create a folder first to save collages', 'error');
          }
        }
        setSaving(false);
      }, 'image/jpeg', 0.9);

    } catch (err) {
      console.error(err);
      showToast('Error saving collage', 'error');
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Collage Maker">
      <div className="space-y-4 pb-4">
        <div className="flex gap-2 justify-center pb-2 border-b border-gray-100 overflow-x-auto">
          {[2, 3, 4].map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l as any)}
              className={`px-4 py-2 rounded-full border text-sm font-bold ${layout === l ? 'bg-[#5B43EE] text-white border-[#5B43EE]' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {l} Images
            </button>
          ))}
        </div>

        <div className="aspect-square bg-gray-100 rounded-xl p-2 w-full max-w-[400px] mx-auto">
          <div className={`w-full h-full grid gap-2 ${layout === 2 ? 'grid-cols-2' : layout === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2 grid-rows-2'}`}>
            {Array(layout).fill(0).map((_, i) => (
              <div 
                key={i} 
                onClick={() => { setActiveSlot(i); fileInputRef.current?.click(); }}
                className={`bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer active:scale-95 transition-transform ${layout === 3 && i === 0 ? 'row-span-2' : ''}`}
              >
                {images[i] ? (
                  <img src={images[i]} className="w-full h-full object-cover" alt={`Slot ${i+1}`} />
                ) : (
                  <div className="flex flex-col items-center opacity-50">
                    <ImageIcon className="w-8 h-8 text-gray-500 mb-1" />
                    <span className="text-xs font-bold text-gray-500">Tap to add</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />

        <div className="flex gap-2 mb-2">
          <button 
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold disabled:opacity-50"
            disabled={images.slice(0, layout).every(img => !img) || saving}
            onClick={() => showToast('Download will be supported in the native app', 'info')}
          >
            <Download className="w-5 h-5" /> Download
          </button>
          <button 
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5B43EE] text-white font-bold disabled:opacity-50"
            disabled={images.slice(0, layout).every(img => !img) || saving}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Sewvee Collage', text: 'Check out my design collage!' }).catch(() => {});
              }
            }}
          >
            <Share className="w-5 h-5" /> Share
          </button>
        </div>

        <Button fullWidth onClick={handleSave} loading={saving} disabled={images.slice(0, layout).every(img => !img)} variant="secondary">
          {saving ? 'Saving Collage...' : 'Save to Folder'}
        </Button>
      </div>
    </BottomSheet>
  );
}
