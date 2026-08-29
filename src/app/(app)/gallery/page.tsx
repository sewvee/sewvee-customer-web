'use client';
import { useEffect, useState, useRef } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { Folder, Plus, ArrowLeft, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useToast } from '@/hooks/useToast';
import type { GalleryFolder } from '@/types';

import { CollageMaker } from '@/components/CollageMaker';

export default function GalleryPage() {
  const { folders, loading, uploading, fetchFolders, createFolder, deleteFolder, uploadImage, addImageToFolder, deleteImage } = useGalleryStore();
  const { showToast } = useToast();
  
  const [activeFolder, setActiveFolder] = useState<GalleryFolder | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isCollageOpen, setCollageOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Keep activeFolder up to date
  useEffect(() => {
    if (activeFolder) {
      const updated = folders.find(f => f.id === activeFolder.id);
      if (updated) setActiveFolder(updated);
    }
  }, [folders, activeFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setCreateOpen(false);
    showToast('Folder created');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFolder) return;
    try {
      const url = await uploadImage(activeFolder.id, file);
      if (url) {
        await addImageToFolder(activeFolder.id, url, file.name);
        showToast('Image uploaded');
      } else {
        showToast('Upload failed', 'error');
      }
    } catch {
      showToast('Upload error', 'error');
    }
  };

  if (activeFolder) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveFolder(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{activeFolder.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCollageOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#5B43EE] text-white font-bold text-sm"
            >
              Collage
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="p-1.5 rounded-full bg-indigo-50 text-[#5B43EE] hover:bg-indigo-100 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        <div className="p-4 grid grid-cols-2 gap-3">
          {activeFolder.images.length === 0 ? (
            <div className="col-span-2 py-20 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Folder is empty</p>
            </div>
          ) : (
            activeFolder.images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                <button
                  onClick={() => deleteImage(activeFolder.id, img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white backdrop-blur-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        <CollageMaker open={isCollageOpen} onClose={() => setCollageOpen(false)} onSave={async (url: string) => { setCollageOpen(false); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Design Gallery</h1>
        <div className="flex gap-2">
          <button onClick={() => setCollageOpen(true)} className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold shadow-sm">
            Make Collage
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 bg-[#5B43EE] text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5B43EE] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder)}
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-left flex flex-col items-center justify-center aspect-square gap-3 hover:border-indigo-100 hover:shadow-md transition-all relative group"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Folder className="w-8 h-8 text-[#5B43EE]" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 line-clamp-1 px-2">{folder.name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">{folder.images.length} items</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <BottomSheet open={isCreateOpen} onClose={() => setCreateOpen(false)} title="New Folder">
        <div className="space-y-4">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder Name (e.g., Neck Designs)"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#5B43EE] focus:ring-1 focus:ring-[#5B43EE] outline-none font-medium"
          />
          <Button fullWidth onClick={handleCreateFolder}>Create Folder</Button>
        </div>
      </BottomSheet>
      <CollageMaker open={isCollageOpen} onClose={() => setCollageOpen(false)} onSave={async (url: string) => { setCollageOpen(false); }} />
    </div>
  );
}
