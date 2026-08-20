import { create } from 'zustand';
import type { GalleryFolder, GalleryImage } from '@/types';
import api from '@/lib/api';
import {
  URL_CUSTOMER_GALLERY,
  URL_CUSTOMER_GALLERY_FOLDERS,
  URL_GALLERY_FOLDER,
  URL_GALLERY_FOLDER_IMAGES,
  URL_GALLERY_FOLDER_IMAGE,
  URL_UPLOAD,
} from '@/lib/env';

const DEFAULT_FOLDERS: Omit<GalleryFolder, 'id'>[] = [
  { name: 'Chudithars', images: [] },
  { name: 'Lehengas', images: [] },
  { name: 'Kurtas & Skirts', images: [] },
  { name: 'Blouses', images: [] },
  { name: 'Embroidery', images: [] },
];

interface GalleryState {
  folders: GalleryFolder[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  uploadImage: (folderId: string, file: File) => Promise<string>;
  addImageToFolder: (folderId: string, url: string, name: string) => Promise<void>;
  deleteImage: (folderId: string, imageId: string) => Promise<void>;
  saveCollageToFolder: (folderId: string, blob: Blob) => Promise<void>;
}

export const useGalleryStore = create<GalleryState>()((set, get) => ({
  folders: [],
  loading: false,
  uploading: false,
  error: null,

  fetchFolders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(URL_CUSTOMER_GALLERY);
      let folders: GalleryFolder[] = res.data.data ?? [];
      // Seed default folders if none exist
      if (folders.length === 0) {
        for (const def of DEFAULT_FOLDERS) {
          try {
            const createRes = await api.post(URL_CUSTOMER_GALLERY_FOLDERS, { name: def.name });
            folders.push(createRes.data.data);
          } catch { /* ignore */ }
        }
      }
      set({ folders, loading: false });
    } catch {
      // Fallback to localStorage if server not available
      try {
        const saved = localStorage.getItem('sewvee_customer_gallery');
        const folders = saved ? JSON.parse(saved) : DEFAULT_FOLDERS.map((f, i) => ({ ...f, id: `local_${i}` }));
        set({ folders, loading: false });
      } catch {
        set({ loading: false, error: 'Failed to load gallery' });
      }
    }
  },

  createFolder: async (name: string) => {
    try {
      const res = await api.post(URL_CUSTOMER_GALLERY_FOLDERS, { name });
      const newFolder: GalleryFolder = res.data.data;
      set((state) => ({ folders: [...state.folders, newFolder] }));
    } catch {
      // Fallback: create locally
      const newFolder: GalleryFolder = { id: `local_${Date.now()}`, name, images: [] };
      set((state) => ({ folders: [...state.folders, newFolder] }));
    }
  },

  deleteFolder: async (folderId: string) => {
    try {
      await api.delete(URL_GALLERY_FOLDER(folderId));
    } catch { /* ignore */ }
    set((state) => ({ folders: state.folders.filter((f) => f.id !== folderId) }));
  },

  uploadImage: async (folderId: string, file: File): Promise<string> => {
    set({ uploading: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key_name', 'customer_gallery_web');
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch(URL_UPLOAD, {
        method: 'POST',
        headers: { Authorization: formattedToken },
        body: formData,
      });
      const json = await res.json();
      const url: string =
        json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url ?? '';
      set({ uploading: false });
      return url;
    } catch {
      set({ uploading: false });
      return '';
    }
  },

  addImageToFolder: async (folderId: string, url: string, name: string) => {
    try {
      const res = await api.post(URL_GALLERY_FOLDER_IMAGES(folderId), { url, name });
      const newImage: GalleryImage = res.data.data;
      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, images: [newImage, ...f.images] } : f,
        ),
      }));
    } catch {
      // Fallback: add locally
      const newImage: GalleryImage = { id: `img_${Date.now()}`, url, name, date: new Date().toISOString() };
      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, images: [newImage, ...f.images] } : f,
        ),
      }));
    }
  },

  deleteImage: async (folderId: string, imageId: string) => {
    try {
      await api.delete(URL_GALLERY_FOLDER_IMAGE(folderId, imageId));
    } catch { /* ignore */ }
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, images: f.images.filter((img) => img.id !== imageId) } : f,
      ),
    }));
  },

  saveCollageToFolder: async (folderId: string, blob: Blob) => {
    const file = new File([blob], `collage_${Date.now()}.jpg`, { type: 'image/jpeg' });
    const url = await get().uploadImage(folderId, file);
    if (url) {
      await get().addImageToFolder(folderId, url, file.name);
    }
  },
}));
