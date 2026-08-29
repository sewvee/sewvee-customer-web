'use client';
import { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { URL_UPLOAD } from '@/lib/env';
import { useToast } from '@/hooks/useToast';

interface PhotoUploadSectionProps {
  orderId: string;
  outfitId: string;
  outfitName: string;
  existingPhotos?: { id: string; url: string; category?: string }[];
  onUploadSuccess?: () => void;
}

export function PhotoUploadSection({
  orderId,
  outfitId,
  outfitName,
  existingPhotos = [],
  onUploadSuccess,
}: PhotoUploadSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const referencePhotos = existingPhotos.filter((p) => p.category === 'REFERENCE');
  const hasPhotos = referencePhotos.length > 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key_name', 'order_photos');
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const res = await fetch(URL_UPLOAD, {
        method: 'POST',
        headers: { Authorization: formattedToken },
        body: formData,
      });
      const json = await res.json();
      const url: string = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url ?? '';

      if (!url) throw new Error('No URL returned');

      // Attach photo to order outfit via backend
      const { URL_ORDERS } = await import('@/lib/env');
      await fetch(`${URL_ORDERS}/${orderId}/outfits/${outfitId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: formattedToken,
        },
        body: JSON.stringify({ url, category: 'REFERENCE' }),
      });

      showToast('Photo uploaded successfully!', 'success');
      onUploadSuccess?.();
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{outfitName}</p>
          <p className="text-xs text-orange-600 font-medium">
            {hasPhotos ? 'Reference photo uploaded ✓' : 'Reference design photo needed'}
          </p>
        </div>
        {!hasPhotos && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 bg-[#5B43EE] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#4a35d4] disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        )}
      </div>
      {hasPhotos && (
        <div className="flex gap-2 flex-wrap">
          {referencePhotos.map((p) => (
            <img
              key={p.id}
              src={p.url}
              alt="Reference"
              className="w-16 h-16 rounded-lg object-cover border border-orange-200"
            />
          ))}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
