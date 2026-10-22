'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { useOrdersStore } from '@/store/ordersStore';
import {
  ArrowLeft,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Trash2,
  Edit2,
  Mic,
  Square,
  Play,
  Pause,
  UploadCloud,
  Send,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  BadgeCheck,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { URL_ORDERS, URL_CUSTOMER_PORTAL_ORDERS, URL_UPLOAD } from '@/lib/env';
import { useToast } from '@/hooks/useToast';
import { OUTFIT_CATEGORIES, getOutfitTemplate, OutfitTemplate } from '@/config/stitchingTemplates';
import { ImageCropModal } from '@/components/ImageCropModal';
import { generateMasterCollage } from '@/utils/masterCollageGenerator';
import { BottomSheet } from '@/components/ui/BottomSheet';

const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sewvee.com';

const formatImageUrl = (urlStr?: string | null): string | undefined => {
  if (!urlStr) return undefined;
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://') || urlStr.startsWith('data:')) return urlStr;
  return `${API_DOMAIN}/${urlStr.replace(/^\//, '')}`;
};

const SLEEVE_OPTIONS = [
  'Elbow Length',
  'Short Sleeve (4-5 inch)',
  'Puff Sleeve',
  'Sleeveless',
  'Full Length',
  '3/4th Sleeve',
  'Cap Sleeve',
  'Bell Sleeve',
  'Custom Sleeve Pattern',
];

const HOOK_OPTIONS = [
  'Front Hook',
  'Back Hook',
  'Side Zipper',
  'Back Zipper',
  'No Opening / Elastic',
];

const MEASUREMENT_OPTIONS = [
  'Use Previous Measurements (Saved in Profile)',
  'Send Reference Garment with Fabric (Boutique pickup/courier)',
  'Store Visit (Tailor will measure me at boutique)',
  'I will provide measurements later via chat',
];

interface AttachedPhoto {
  id: string;
  section: string;
  fileName: string;
  dataUrl: string;
  emoji: string;
  comment: string;
}

interface OutfitConfig {
  number: number;
  category: string;
  name: string;
  icon: string;
  frontNeck: string;
  frontNeckNote: string;
  frontNeckPhotos: AttachedPhoto[];
  backNeck: string;
  backNeckNote: string;
  backNeckPhotos: AttachedPhoto[];
  sleeve: string;
  sleevePhotos: AttachedPhoto[];
  hook: string;
  extraPhotos: AttachedPhoto[];
  notes: string;
  voiceNoteBlob: Blob | null;
  voiceNoteUrl: string | null;
  voiceNoteDuration: string | null;
  masterCollageUrl: string | null;
  isCompleted: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  type?: 'text' | 'selection' | 'questionnaire' | 'add_another_prompt' | 'summary_ticket';
  outfitIndex?: number;
  isAnswered?: boolean;
  selectedCategory?: string;
}

interface DrawerState {
  title: string;
  subtitle?: string;
  options: string[];
  currentValue: string;
  onSelect: (val: string) => void;
}

export default function StitchingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedBoutiqueId, boutiques, fetchBoutiques } = useBoutiquesStore();
  const { orders } = useOrdersStore();
  const { showToast } = useToast();

  const selectedBoutique = useMemo(
    () => boutiques.find((b) => b.id === selectedBoutiqueId),
    [boutiques, selectedBoutiqueId]
  );
  const termsText = selectedBoutique?.terms_and_conditions;

  // Guard: Ensure a boutique is selected
  useEffect(() => {
    if (selectedBoutiqueId === null) {
      showToast('Please select a boutique first from the home dashboard.', 'error');
      router.push('/home');
    }
  }, [selectedBoutiqueId, router, showToast]);

  useEffect(() => {
    fetchBoutiques();
  }, [fetchBoutiques]);

  // Main State
  const [outfits, setOutfits] = useState<OutfitConfig[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Vanakkam ${user?.name || 'Customer'}! 👋 Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}. What would you like us to stitch for you today?`,
      type: 'selection',
    },
  ]);

  // Final ticket state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [measurementOption, setMeasurementOption] = useState('Use Previous Measurements');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Autosave status
  const [autosaveText, setAutosaveText] = useState('Autosaved Draft');
  const [avatarError, setAvatarError] = useState(false);

  // Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<{
    outfitIndex: number;
    sectionKey: 'frontNeckPhotos' | 'backNeckPhotos' | 'sleevePhotos' | 'extraPhotos';
    sectionTitle: string;
    emoji: string;
  } | null>(null);

  // Voice Recording Per Outfit State
  const [recordingOutfitIdx, setRecordingOutfitIdx] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Full view preview of master collage
  const [previewCollageUrl, setPreviewCollageUrl] = useState<string | null>(null);

  // Bottom manual message text input
  const [bottomInputText, setBottomInputText] = useState('');

  // Bottom Drawer Picker State
  const [pickerDrawer, setPickerDrawer] = useState<DrawerState | null>(null);

  const openDrawer = (
    title: string,
    options: string[],
    currentValue: string,
    onSelect: (val: string) => void,
    subtitle?: string
  ) => {
    setPickerDrawer({
      title,
      subtitle,
      options,
      currentValue,
      onSelect: (val: string) => {
        onSelect(val);
        setPickerDrawer(null);
      },
    });
  };

  // Custom Audio Voice Player State
  const [playingVoiceOutfitIdx, setPlayingVoiceOutfitIdx] = useState<number | null>(null);
  const [voicePlayProgress, setVoicePlayProgress] = useState(0);
  const voiceAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePlayVoice = (idx: number, url: string) => {
    if (playingVoiceOutfitIdx === idx) {
      if (voiceAudioPlayerRef.current) {
        voiceAudioPlayerRef.current.pause();
      }
      setPlayingVoiceOutfitIdx(null);
    } else {
      if (!voiceAudioPlayerRef.current) {
        voiceAudioPlayerRef.current = new Audio();
        voiceAudioPlayerRef.current.ontimeupdate = () => {
          if (voiceAudioPlayerRef.current && voiceAudioPlayerRef.current.duration) {
            const prog =
              (voiceAudioPlayerRef.current.currentTime / voiceAudioPlayerRef.current.duration) * 100;
            setVoicePlayProgress(isNaN(prog) ? 0 : prog);
          }
        };
        voiceAudioPlayerRef.current.onended = () => {
          setPlayingVoiceOutfitIdx(null);
          setVoicePlayProgress(0);
        };
      }
      voiceAudioPlayerRef.current.src = url;
      voiceAudioPlayerRef.current.play().catch(() => {});
      setPlayingVoiceOutfitIdx(idx);
    }
  };

  useEffect(() => {
    return () => {
      if (voiceAudioPlayerRef.current) {
        voiceAudioPlayerRef.current.pause();
        voiceAudioPlayerRef.current = null;
      }
    };
  }, []);

  // Draft Key
  const draftKey = useMemo(
    () => `sewvee_stitching_chat_draft_${selectedBoutiqueId || 'default'}`,
    [selectedBoutiqueId]
  );

  // Restore Draft on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.outfits && Array.isArray(parsed.outfits) && parsed.outfits.length > 0) {
          setOutfits(parsed.outfits);
          if (parsed.deliveryDate) setDeliveryDate(parsed.deliveryDate);
          if (parsed.measurementOption) setMeasurementOption(parsed.measurementOption);
          if (parsed.agreedToTerms) setAgreedToTerms(parsed.agreedToTerms);
          
          // Reconstruct chat flow
          const restoredMessages: ChatMessage[] = [
            {
              id: 'welcome',
              sender: 'bot',
              text: `Vanakkam ${user?.name || 'Customer'}! 👋 Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}. What would you like us to stitch for you today?`,
              type: 'selection',
              isAnswered: true,
              selectedCategory: parsed.outfits[0]?.category,
            },
          ];

          parsed.outfits.forEach((o: OutfitConfig, idx: number) => {
            restoredMessages.push({
              id: `user_pick_${idx}`,
              sender: 'user',
              text: `I would like to stitch ${o.name}`,
            });
            restoredMessages.push({
              id: `questionnaire_${idx}`,
              sender: 'bot',
              type: 'questionnaire',
              outfitIndex: idx,
            });
          });

          const allCompleted = parsed.outfits.every((o: OutfitConfig) => o.isCompleted);
          if (allCompleted) {
            restoredMessages.push({
              id: 'add_another_prompt',
              sender: 'bot',
              type: 'add_another_prompt',
            });
          }

          setChatMessages(restoredMessages);
          setAutosaveText('Draft Restored');
          setTimeout(() => setAutosaveText('Autosaved Draft'), 2000);
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }, [draftKey, selectedBoutique, user]);

  // Trigger Autosave
  const triggerAutosave = useCallback(
    (updatedOutfits: OutfitConfig[]) => {
      try {
        const payload = {
          outfits: updatedOutfits.map((o) => ({
            ...o,
            voiceNoteBlob: null,
          })),
          deliveryDate,
          measurementOption,
          agreedToTerms,
        };
        localStorage.setItem(draftKey, JSON.stringify(payload));
        setAutosaveText('Saved just now');
        setTimeout(() => setAutosaveText('Autosaved Draft'), 1500);
      } catch (e) {}
    },
    [draftKey, deliveryDate, measurementOption, agreedToTerms]
  );

  // Audio compatibility helper
  const getSupportedAudioMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/aac',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startVoiceRecording = async (outfitIdx: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const finalMime = mr.mimeType || mimeType || 'audio/mp4';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        const audioUrl = URL.createObjectURL(blob);
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        setOutfits((prev) => {
          const next = [...prev];
          next[outfitIdx] = {
            ...next[outfitIdx],
            voiceNoteBlob: blob,
            voiceNoteUrl: audioUrl,
            voiceNoteDuration: durationStr,
          };
          triggerAutosave(next);
          return next;
        });

        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecordingOutfitIdx(outfitIdx);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      showToast('Microphone access denied', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecordingOutfitIdx(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    setRecordingOutfitIdx(null);
    setRecordingSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const deleteVoiceRecording = (outfitIdx: number) => {
    if (playingVoiceOutfitIdx === outfitIdx && voiceAudioPlayerRef.current) {
      voiceAudioPlayerRef.current.pause();
      setPlayingVoiceOutfitIdx(null);
    }
    setOutfits((prev) => {
      const next = [...prev];
      next[outfitIdx] = {
        ...next[outfitIdx],
        voiceNoteBlob: null,
        voiceNoteUrl: null,
        voiceNoteDuration: null,
      };
      triggerAutosave(next);
      return next;
    });
  };

  // Step 1: User Chooses an Outfit
  const handleSelectOutfit = (categoryName: string) => {
    const nextNum = outfits.length + 1;
    const template = getOutfitTemplate(categoryName);

    const newOutfit: OutfitConfig = {
      number: nextNum,
      category: categoryName,
      name: `Outfit ${nextNum}: ${categoryName}`,
      icon: template.icon,
      frontNeck: template.sections[0]?.options[0] || 'Standard Front Neck',
      frontNeckNote: '',
      frontNeckPhotos: [],
      backNeck: template.sections[1]?.options[0] || 'Standard Back Neck',
      backNeckNote: '',
      backNeckPhotos: [],
      sleeve: template.sections[2]?.options[0] || 'Elbow Length',
      sleevePhotos: [],
      hook: 'Front Hook',
      extraPhotos: [],
      notes: '',
      voiceNoteBlob: null,
      voiceNoteUrl: null,
      voiceNoteDuration: null,
      masterCollageUrl: null,
      isCompleted: false,
    };

    const newOutfits = [...outfits, newOutfit];
    setOutfits(newOutfits);
    setCurrentOutfitIndex(newOutfits.length - 1);
    triggerAutosave(newOutfits);

    setChatMessages((prev) => {
      // Mark any pending selection prompts as answered with this choice
      const updated = prev.map((m) =>
        m.type === 'selection' ? { ...m, isAnswered: true, selectedCategory: categoryName } : m
      );

      return [
        ...updated,
        {
          id: `user_pick_${nextNum}`,
          sender: 'user',
          text: `I would like to stitch ${newOutfit.name}`,
        },
        {
          id: `questionnaire_${newOutfits.length - 1}`,
          sender: 'bot',
          type: 'questionnaire',
          outfitIndex: newOutfits.length - 1,
        },
      ];
    });
  };

  // Photo Upload Trigger with Crop
  const handleTriggerPhotoUpload = (
    outfitIndex: number,
    sectionKey: 'frontNeckPhotos' | 'backNeckPhotos' | 'sleevePhotos' | 'extraPhotos',
    sectionTitle: string,
    emoji: string
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setCropImageSrc(reader.result as string);
          setCropTarget({ outfitIndex, sectionKey, sectionTitle, emoji });
          setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (!cropTarget) return;
    const { outfitIndex, sectionKey, sectionTitle, emoji } = cropTarget;
    const newPhoto: AttachedPhoto = {
      id: `photo_${Date.now()}`,
      section: sectionTitle,
      fileName: `${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ref.jpg`,
      dataUrl: croppedDataUrl,
      emoji: emoji,
      comment: '',
    };

    setOutfits((prev) => {
      const next = [...prev];
      next[outfitIndex] = {
        ...next[outfitIndex],
        [sectionKey]: [...next[outfitIndex][sectionKey], newPhoto],
      };
      triggerAutosave(next);
      return next;
    });

    setCropModalOpen(false);
    setCropImageSrc(null);
    setCropTarget(null);
  };

  const handleRemovePhoto = (
    outfitIndex: number,
    sectionKey: 'frontNeckPhotos' | 'backNeckPhotos' | 'sleevePhotos' | 'extraPhotos',
    photoId: string
  ) => {
    setOutfits((prev) => {
      const next = [...prev];
      next[outfitIndex] = {
        ...next[outfitIndex],
        [sectionKey]: next[outfitIndex][sectionKey].filter((p) => p.id !== photoId),
      };
      triggerAutosave(next);
      return next;
    });
  };

  const handleUpdatePhotoComment = (
    outfitIndex: number,
    sectionKey: 'frontNeckPhotos' | 'backNeckPhotos' | 'sleevePhotos' | 'extraPhotos',
    photoId: string,
    comment: string
  ) => {
    setOutfits((prev) => {
      const next = [...prev];
      next[outfitIndex] = {
        ...next[outfitIndex],
        [sectionKey]: next[outfitIndex][sectionKey].map((p) =>
          p.id === photoId ? { ...p, comment } : p
        ),
      };
      triggerAutosave(next);
      return next;
    });
  };

  // Cancel an in-progress outfit (returns cleanly to outfit picker)
  const handleCancelOutfit = (idx: number) => {
    if (!confirm('Discard this outfit customization?')) return;

    const remainingOutfits = outfits.filter((_, i) => i !== idx);
    const reindexed = remainingOutfits.map((o, i) => ({
      ...o,
      number: i + 1,
      name: `Outfit ${i + 1}: ${o.category}`,
    }));

    setOutfits(reindexed);
    triggerAutosave(reindexed);

    if (reindexed.length === 0) {
      setChatMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Vanakkam ${user?.name || 'Customer'}! 👋 Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}. What would you like us to stitch for you today?`,
          type: 'selection',
        },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev.filter((m) => m.outfitIndex !== idx),
        {
          id: 'add_another_prompt',
          sender: 'bot',
          type: 'add_another_prompt',
        },
      ]);
    }
  };

  // Complete an outfit & Automatically Generate Master Collage
  const handleCompleteOutfit = async (idx: number) => {
    const outfit = outfits[idx];

    // Build Tiles for Automated Master Collage
    const tiles = [
      {
        label: 'FRONT NECK',
        styleName: outfit.frontNeck,
        note: outfit.frontNeckNote,
        imageSrc: outfit.frontNeckPhotos[0]?.dataUrl,
        emoji: '👚',
      },
      {
        label: 'BACK NECK',
        styleName: outfit.backNeck,
        note: outfit.backNeckNote,
        imageSrc: outfit.backNeckPhotos[0]?.dataUrl,
        emoji: '✨',
      },
      {
        label: 'SLEEVE & HOOK',
        styleName: `${outfit.sleeve} • ${outfit.hook}`,
        imageSrc: outfit.sleevePhotos[0]?.dataUrl,
        emoji: '🧵',
      },
      {
        label: 'EXTRA / FABRIC NOTES',
        styleName: outfit.notes || 'Standard Customization',
        imageSrc: outfit.extraPhotos[0]?.dataUrl,
        emoji: '📸',
      },
    ];

    let masterCollageUrl: string | null = null;
    try {
      masterCollageUrl = await generateMasterCollage({
        outfitName: outfit.name,
        boutiqueName: selectedBoutique?.boutique_name || 'Inba Boutique',
        inquiryNumber: '#ENQ-NEW',
        tiles,
        generalNotes: outfit.notes,
        voiceNoteDuration: outfit.voiceNoteDuration || undefined,
      });
    } catch (e) {
      console.error('Failed to auto-generate master collage:', e);
    }

    const updatedOutfits = [...outfits];
    updatedOutfits[idx] = {
      ...outfit,
      isCompleted: true,
      masterCollageUrl,
    };

    setOutfits(updatedOutfits);
    triggerAutosave(updatedOutfits);

    // Remove any previous add_another_prompt and append fresh prompt
    setChatMessages((prev) => [
      ...prev.filter((m) => m.type !== 'add_another_prompt' && m.type !== 'summary_ticket'),
      {
        id: `prompt_after_${idx}`,
        sender: 'bot',
        type: 'add_another_prompt',
      },
    ]);
  };

  // Edit an already completed outfit
  const handleEditOutfit = (idx: number) => {
    setOutfits((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], isCompleted: false };
      triggerAutosave(next);
      return next;
    });

    setChatMessages((prev) =>
      prev.filter((m) => m.type !== 'add_another_prompt' && m.type !== 'summary_ticket')
    );
  };

  // Delete an outfit
  const handleDeleteOutfit = (idx: number) => {
    if (!confirm(`Delete ${outfits[idx].name}?`)) return;

    const remaining = outfits.filter((_, i) => i !== idx);
    if (remaining.length === 0) {
      setOutfits([]);
      localStorage.removeItem(draftKey);
      setChatMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Vanakkam ${user?.name || 'Customer'}! 👋 Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}. What would you like us to stitch for you today?`,
          type: 'selection',
        },
      ]);
      return;
    }

    const reindexed = remaining.map((o, i) => ({
      ...o,
      number: i + 1,
      name: `Outfit ${i + 1}: ${o.category}`,
    }));

    setOutfits(reindexed);
    triggerAutosave(reindexed);

    setChatMessages((prev) => [
      ...prev.filter((m) => m.outfitIndex !== idx),
      {
        id: 'add_another_prompt',
        sender: 'bot',
        type: 'add_another_prompt',
      },
    ]);
  };

  // Proceed to Final Consolidated Inquiry Ticket
  const handleProceedToFinal = () => {
    setChatMessages((prev) => [
      ...prev.filter((m) => m.type !== 'summary_ticket'),
      {
        id: `user_ready`,
        sender: 'user',
        text: `I am ready with my ${outfits.length} outfit${outfits.length > 1 ? 's' : ''}`,
      },
      {
        id: 'summary_ticket',
        sender: 'bot',
        type: 'summary_ticket',
      },
    ]);
  };

  // Discard / Reset entire inquiry
  const handleDiscardEntireInquiry = () => {
    if (confirm('Discard this entire stitching inquiry draft?')) {
      setOutfits([]);
      localStorage.removeItem(draftKey);
      setChatMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Vanakkam ${user?.name || 'Customer'}! 👋 Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}. What would you like us to stitch for you today?`,
          type: 'selection',
        },
      ]);
    }
  };

  // Helper to convert base64 dataUrl to File
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Final Submit to Backend API
  const handleSubmitInquiry = async () => {
    if (!deliveryDate) {
      showToast('Please select your expected delivery date', 'error');
      return;
    }
    if (termsText && !agreedToTerms) {
      showToast('Please agree to the boutique terms and conditions', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('sewvee_customer_token') ?? '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const outfitUploadedUrls: string[][] = [];

      for (const outfit of outfits) {
        const uploadedUrls: string[] = [];

        // 1. Upload Master Collage if present
        if (outfit.masterCollageUrl) {
          try {
            const collageFile = dataUrlToFile(outfit.masterCollageUrl, `master_collage_${outfit.number}.jpg`);
            const fd = new FormData();
            fd.append('file', collageFile);
            fd.append('key_name', 'order_photos');
            const uploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (uploadRes.ok) {
              const json = await uploadRes.json();
              const rawUrl = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              const url = rawUrl ? (rawUrl.startsWith('/') ? `${API_DOMAIN}${rawUrl}` : rawUrl) : null;
              if (url) uploadedUrls.push(url);
            }
          } catch (e) {
            console.error('Failed to upload master collage:', e);
          }
        }

        // 2. Upload Individual Section Photos
        const allPhotos = [
          ...outfit.frontNeckPhotos,
          ...outfit.backNeckPhotos,
          ...outfit.sleevePhotos,
          ...outfit.extraPhotos,
        ];

        for (const p of allPhotos) {
          try {
            const photoFile = dataUrlToFile(p.dataUrl, p.fileName);
            const fd = new FormData();
            fd.append('file', photoFile);
            fd.append('key_name', 'order_photos');
            const uploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (uploadRes.ok) {
              const json = await uploadRes.json();
              const rawUrl = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              const url = rawUrl ? (rawUrl.startsWith('/') ? `${API_DOMAIN}${rawUrl}` : rawUrl) : null;
              if (url) uploadedUrls.push(url);
            }
          } catch (e) {
            console.error('Failed to upload section photo:', e);
          }
        }

        // 3. Upload Voice Note if present
        if (outfit.voiceNoteBlob) {
          try {
            const audioMime = outfit.voiceNoteBlob.type || 'audio/mp4';
            const ext = audioMime.includes('mp4') || audioMime.includes('aac') ? 'm4a' : 'webm';
            const audioFile = new File([outfit.voiceNoteBlob], `voice_note_${Date.now()}.${ext}`, {
              type: audioMime,
            });
            const fd = new FormData();
            fd.append('file', audioFile);
            fd.append('key_name', 'order_audios');
            const audioUploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: fd,
            });
            if (audioUploadRes.ok) {
              const json = await audioUploadRes.json();
              const rawUrl = json.file_url ?? json.data?.file_url ?? json.url ?? json.data?.url;
              const url = rawUrl ? (rawUrl.startsWith('/') ? `${API_DOMAIN}${rawUrl}` : rawUrl) : null;
              if (url) uploadedUrls.push(url);
            }
          } catch (e) {
            console.error('Failed to upload voice note:', e);
          }
        }

        outfitUploadedUrls.push(uploadedUrls);
      }

      // Compile payload
      const payloadOutfits = outfits.map((outfit, idx) => {
        const urls = outfitUploadedUrls[idx] || [];
        const lines = [
          `Category: ${outfit.category}`,
          `Outfit Name: ${outfit.name}`,
          `Front Neck: ${outfit.frontNeck}${outfit.frontNeckNote ? ` (${outfit.frontNeckNote})` : ''}`,
          `Back Neck: ${outfit.backNeck}${outfit.backNeckNote ? ` (${outfit.backNeckNote})` : ''}`,
          `Sleeve: ${outfit.sleeve} | Hook: ${outfit.hook}`,
        ];
        if (outfit.notes) lines.push(`Specific Notes: ${outfit.notes}`);
        lines.push(`Measurement: ${measurementOption}`);
        if (deliveryDate) lines.push(`Expected Date: ${deliveryDate}`);
        if (termsText && agreedToTerms) lines.push(`Terms & Conditions: Agreed`);

        return {
          name: outfit.category,
          quantity: 1,
          total_amount: 0,
          customer_notes: lines.join('\n'),
          photos: urls.map((u) => ({ file_url: u })),
          items: [],
        };
      });

      const payload = {
        order_type: 'STITCHING_REQUEST',
        customer_mobile: user?.mobile,
        customer_name: user?.name,
        company_id: selectedBoutiqueId,
        outfits: payloadOutfits,
      };

      const res = await fetch(URL_CUSTOMER_PORTAL_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: formattedToken },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        showToast('Failed to submit inquiry', 'error');
        return;
      }

      const resJson = await res.json();
      const createdOrderId = resJson?.data?.id ?? resJson?.id;
      const createdOutfits: any[] = resJson?.data?.outfits ?? resJson?.outfits ?? [];

      // Attach photos to outfits via /requests
      if (createdOrderId && createdOutfits.length > 0) {
        for (let i = 0; i < createdOutfits.length; i++) {
          const outfitId = createdOutfits[i]?.id;
          const urls = outfitUploadedUrls[i] || [];
          if (!outfitId || urls.length === 0) continue;
          for (const url of urls) {
            try {
              await fetch(
                `${URL_CUSTOMER_PORTAL_ORDERS}/${createdOrderId}/outfits/${outfitId}/requests`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: formattedToken },
                  body: JSON.stringify({
                    attachment_url: url,
                    message: 'Stitching Reference & Master Sheet',
                    phone: user?.mobile ?? '',
                  }),
                }
              );
            } catch (e) {}
          }
        }
      }

      // Clear draft on successful placement
      localStorage.removeItem(draftKey);

      showToast('Stitching inquiry submitted successfully!', 'success');
      router.push(`/orders`);
    } catch (e) {
      console.error(e);
      showToast('Error submitting inquiry request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendManualMessage = () => {
    if (!bottomInputText.trim()) return;
    const msg = bottomInputText.trim();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `manual_${Date.now()}`,
        sender: 'user',
        text: msg,
      },
      {
        id: `bot_ack_${Date.now()}`,
        sender: 'bot',
        text: `Noted: "${msg}". I've included this in your inquiry notes for the master tailor.`,
      },
    ]);
    setBottomInputText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 antialiased pb-20">
      
      {/* 1. TOP HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-3 sm:px-4 h-14 shadow-xs">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-between gap-2">
          {/* Left: Back button + Avatar + Boutique Info */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5B43EE] to-[#8E7CFF] flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden">
                {selectedBoutique?.profile_icon_url && !avatarError ? (
                  <img
                    src={formatImageUrl(selectedBoutique.profile_icon_url)}
                    alt={selectedBoutique.boutique_name || 'Boutique'}
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(selectedBoutique?.boutique_name || 'B').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="font-semibold text-sm sm:text-[15px] text-slate-900 truncate leading-tight tracking-tight">
                  {selectedBoutique?.boutique_name || 'Boutique'}
                </h1>
                <span title="Verified Partner" className="shrink-0 inline-flex items-center text-[#5B43EE]">
                  <BadgeCheck className="w-4 h-4 fill-[#5B43EE] text-white" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                <span className="font-medium text-slate-600 truncate">Stitching Inquiry</span>
                <span className="text-slate-300 shrink-0">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {autosaveText}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Reset Action Button */}
          <button
            onClick={handleDiscardEntireInquiry}
            title="Reset inquiry draft"
            className="h-8 px-2.5 rounded-full text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC STICKY MULTI-OUTFIT TABS TRAY */}
      {outfits.length > 0 && (
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2 sticky top-14 z-30 shadow-2xs">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 overflow-x-auto custom-scroll">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Inquiry Outfits:
              </span>
              {outfits.map((outfit, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentOutfitIndex(idx);
                    const el = document.getElementById(`outfitCard_${idx}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                    idx === currentOutfitIndex
                      ? 'bg-[#5B43EE] text-white ring-2 ring-purple-300'
                      : outfit.isCompleted
                      ? 'bg-purple-50 text-[#5B43EE] border border-[#5B43EE]/30'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span>
                    {outfit.icon} Outfit {idx + 1}: {outfit.category}
                  </span>
                  {outfit.isCompleted ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setChatMessages((prev) => [
                  ...prev.filter((m) => m.type !== 'add_another_prompt' && m.type !== 'summary_ticket'),
                  {
                    id: `prompt_manual_add_${Date.now()}`,
                    sender: 'bot',
                    type: 'selection',
                  },
                ]);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-dashed border-[#5B43EE] text-[#5B43EE] hover:bg-purple-50 shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>+ Add Outfit</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CHAT TIMELINE STREAM */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        <div className="flex justify-center">
          <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 text-slate-400 rounded-full shadow-2xs">
            Today • Guided Stitching Inquiry Session
          </span>
        </div>

        {chatMessages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-in fade-in duration-200">
                <div className="bg-[#5B43EE] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-xs text-xs sm:text-sm font-medium max-w-[85%]">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Bot Selection Chips
          if (msg.type === 'selection') {
            if (msg.isAnswered) {
              return (
                <div key={msg.id} className="flex gap-2.5 max-w-xl items-start animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    🤖
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-900 mb-1">
                      {msg.id === 'welcome'
                        ? `Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}!`
                        : `Outfit Selected:`}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-[#5B43EE] border border-[#5B43EE]/20 rounded-lg text-xs font-bold">
                      <span>✓ Chosen:</span>
                      <span>{msg.selectedCategory || 'Custom Outfit'}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="space-y-2.5 animate-in fade-in duration-200">
                <div className="flex gap-2.5 max-w-xl items-start">
                  <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    🤖
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm leading-relaxed">
                    <p className="font-bold text-slate-900 mb-0.5">
                      {outfits.length === 0 ? `Hello ${user?.name || 'there'}! 👋` : `Add Another Outfit:`}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {outfits.length === 0
                        ? `Welcome to ${selectedBoutique?.boutique_name || 'Inba Boutique'}. What outfit would you like to stitch today?`
                        : `Select which outfit you would like to design next:`}
                    </p>
                  </div>
                </div>

                <div className="pl-10 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Choose Outfit Type:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => handleSelectOutfit(cat.name)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#5B43EE] hover:bg-purple-50/70 text-slate-700 hover:text-[#5B43EE] font-semibold text-xs sm:text-sm shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Bot Questionnaire Card
          if (msg.type === 'questionnaire' && typeof msg.outfitIndex === 'number') {
            const outfit = outfits[msg.outfitIndex];
            if (!outfit) return null;
            const idx = msg.outfitIndex;
            const template = getOutfitTemplate(outfit.category);

            // If already completed, show clean overview with generated Master Collage & Categorized Photos
            if (outfit.isCompleted) {
              const allSections = [
                { title: 'Front Neck Photos', photos: outfit.frontNeckPhotos },
                { title: 'Back Neck Photos', photos: outfit.backNeckPhotos },
                { title: 'Sleeve Design Photos', photos: outfit.sleevePhotos },
                { title: 'Extra Reference Photos', photos: outfit.extraPhotos },
              ];

              return (
                <div key={msg.id} id={`outfitCard_${idx}`} className="flex gap-2.5 max-w-2xl items-start animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    ✓
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xs w-full space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{outfit.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Collage Generated ✓
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditOutfit(idx)}
                          className="text-xs font-bold text-[#5B43EE] hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors border border-[#5B43EE]/20 flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOutfit(idx)}
                          className="text-xs font-bold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors border border-red-200 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Master Collage Card Preview */}
                    {outfit.masterCollageUrl && (
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-3 shadow-md border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                          <span className="font-bold text-purple-300">MASTER DESIGN COLLAGE</span>
                          <button
                            type="button"
                            onClick={() => setPreviewCollageUrl(outfit.masterCollageUrl)}
                            className="text-[11px] font-bold text-white hover:text-purple-300 flex items-center gap-1"
                          >
                            <span>View HD Fullscreen</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <div
                          onClick={() => setPreviewCollageUrl(outfit.masterCollageUrl)}
                          className="w-full h-48 sm:h-56 rounded-xl overflow-hidden cursor-pointer relative group bg-black/40"
                        >
                          <img
                            src={outfit.masterCollageUrl}
                            alt="Master Collage"
                            className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}

                    {/* Categorized Photos Breakdown */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Attached Photos by Section:
                      </span>
                      <div className="space-y-2">
                        {allSections.map(
                          (sec) =>
                            sec.photos.length > 0 && (
                              <div
                                key={sec.title}
                                className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5"
                              >
                                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                  <span>📁</span> {sec.title} ({sec.photos.length})
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {sec.photos.map((p) => (
                                    <div
                                      key={p.id}
                                      className="bg-white border border-slate-200 rounded-lg p-2 flex items-center gap-2 shadow-2xs"
                                    >
                                      <img
                                        src={p.dataUrl}
                                        alt={p.fileName}
                                        className="w-10 h-10 rounded-md object-cover border border-slate-100 shrink-0"
                                      />
                                      <div className="overflow-hidden">
                                        <span className="text-xs font-semibold text-slate-800 truncate block">
                                          {p.fileName}
                                        </span>
                                        {p.comment && (
                                          <span className="text-[10px] text-[#5B43EE] italic block truncate">
                                            "{p.comment}"
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    </div>

                    {/* Voice Note & General Notes */}
                    {outfit.voiceNoteUrl && (
                      <div className="bg-purple-50/70 border border-[#5B43EE]/20 rounded-xl p-2.5 flex items-center gap-3">
                        <Mic className="w-4 h-4 text-[#5B43EE]" />
                        <span className="text-xs font-bold text-slate-800">
                          Voice Note Included ({outfit.voiceNoteDuration || '0:15'})
                        </span>
                      </div>
                    )}
                    {outfit.notes && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs text-slate-600">
                        <b>Tailor Note:</b> "{outfit.notes}"
                      </div>
                    )}

                  </div>
                </div>
              );
            }

            // ACTIVE STREAMLINED QUESTIONNAIRE CARD
            return (
              <div key={msg.id} id={`outfitCard_${idx}`} className="flex gap-2.5 max-w-2xl items-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                  🤖
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xs w-full space-y-3.5">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B43EE] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        Outfit #{outfit.number} • {outfit.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">Design Customization</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Step-by-step</span>
                  </div>

                  {/* 1. FRONT NECK */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#5B43EE]"></span> 1. Front Neck
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openDrawer(
                            'Select Front Neck Style',
                            template.sections[0]?.options || [],
                            outfit.frontNeck,
                            (val) => {
                              setOutfits((prev) => {
                                const next = [...prev];
                                next[idx].frontNeck = val;
                                triggerAutosave(next);
                                return next;
                              });
                            }
                          )
                        }
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#5B43EE] text-[#5B43EE] font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-all"
                      >
                        <span>{outfit.frontNeck}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={outfit.frontNeckNote}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOutfits((prev) => {
                          const next = [...prev];
                          next[idx].frontNeckNote = val;
                          triggerAutosave(next);
                          return next;
                        });
                      }}
                      placeholder="💬 Specific front neck note (e.g. depth 6.5 inch)..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#5B43EE] transition-all"
                    />

                    {outfit.frontNeckPhotos.length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerPhotoUpload(idx, 'frontNeckPhotos', 'Front Neck', '👚')
                        }
                        className="w-full py-2 bg-white border border-dashed border-[#5B43EE]/40 hover:border-[#5B43EE] hover:bg-purple-50 text-[#5B43EE] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>+ Add Front Neck Photo (Crop & Rotate)</span>
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        {outfit.frontNeckPhotos.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={p.dataUrl}
                                  alt={p.fileName}
                                  className="w-10 h-10 rounded-lg object-cover border border-purple-200 shrink-0"
                                />
                                <div className="overflow-hidden">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {p.fileName}
                                  </span>
                                  <span className="text-[9px] text-[#5B43EE] font-semibold uppercase tracking-wider">
                                    [Front Neck • Cropped ✓]
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx, 'frontNeckPhotos', p.id)}
                                className="text-slate-400 hover:text-red-500 text-xs px-2 py-0.5"
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={p.comment}
                              onChange={(e) =>
                                handleUpdatePhotoComment(idx, 'frontNeckPhotos', p.id, e.target.value)
                              }
                              placeholder="💬 Note for this photo..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#5B43EE] focus:bg-white transition-all"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            handleTriggerPhotoUpload(idx, 'frontNeckPhotos', 'Front Neck', '👚')
                          }
                          className="text-[11px] font-semibold text-[#5B43EE] hover:underline flex items-center gap-1 pt-0.5"
                        >
                          <Camera className="w-3 h-3" /> + Add Another Photo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. BACK NECK */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 2. Back Neck
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openDrawer(
                            'Select Back Neck Style',
                            template.sections[1]?.options || [],
                            outfit.backNeck,
                            (val) => {
                              setOutfits((prev) => {
                                const next = [...prev];
                                next[idx].backNeck = val;
                                triggerAutosave(next);
                                return next;
                              });
                            }
                          )
                        }
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-600 text-emerald-700 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-all"
                      >
                        <span>{outfit.backNeck}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={outfit.backNeckNote}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOutfits((prev) => {
                          const next = [...prev];
                          next[idx].backNeckNote = val;
                          triggerAutosave(next);
                          return next;
                        });
                      }}
                      placeholder="💬 Specific back neck note (e.g. 8 inch deep, tassels)..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 transition-all"
                    />

                    {outfit.backNeckPhotos.length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerPhotoUpload(idx, 'backNeckPhotos', 'Back Neck', '✨')
                        }
                        className="w-full py-2 bg-white border border-dashed border-emerald-600/40 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>+ Add Back Neck Photo (Crop & Rotate)</span>
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        {outfit.backNeckPhotos.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={p.dataUrl}
                                  alt={p.fileName}
                                  className="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0"
                                />
                                <div className="overflow-hidden">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {p.fileName}
                                  </span>
                                  <span className="text-[9px] text-emerald-700 font-semibold uppercase tracking-wider">
                                    [Back Neck • Cropped ✓]
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx, 'backNeckPhotos', p.id)}
                                className="text-slate-400 hover:text-red-500 text-xs px-2 py-0.5"
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={p.comment}
                              onChange={(e) =>
                                handleUpdatePhotoComment(idx, 'backNeckPhotos', p.id, e.target.value)
                              }
                              placeholder="💬 Note for this photo..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            handleTriggerPhotoUpload(idx, 'backNeckPhotos', 'Back Neck', '✨')
                          }
                          className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 pt-0.5"
                        >
                          <Camera className="w-3 h-3" /> + Add Another Photo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3. SLEEVE & HOOK PLACEMENT */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 3. Sleeve & Opening
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Sleeve Pattern:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openDrawer('Select Sleeve Pattern', SLEEVE_OPTIONS, outfit.sleeve, (val) => {
                              setOutfits((prev) => {
                                const next = [...prev];
                                next[idx].sleeve = val;
                                triggerAutosave(next);
                                return next;
                              });
                            })
                          }
                          className="w-full bg-white border border-slate-200 hover:border-indigo-400 text-slate-800 font-bold text-xs p-2.5 rounded-xl shadow-2xs flex items-center justify-between text-left transition-all"
                        >
                          <span className="truncate">{outfit.sleeve}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Opening / Hook:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openDrawer('Select Opening / Hook Placement', HOOK_OPTIONS, outfit.hook, (val) => {
                              setOutfits((prev) => {
                                const next = [...prev];
                                next[idx].hook = val;
                                triggerAutosave(next);
                                return next;
                              });
                            })
                          }
                          className="w-full bg-white border border-slate-200 hover:border-indigo-400 text-slate-800 font-bold text-xs p-2.5 rounded-xl shadow-2xs flex items-center justify-between text-left transition-all"
                        >
                          <span className="truncate">{outfit.hook}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </button>
                      </div>
                    </div>

                    {outfit.sleevePhotos.length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleTriggerPhotoUpload(idx, 'sleevePhotos', 'Sleeve Design', '🧵')
                        }
                        className="w-full py-2 bg-white border border-dashed border-indigo-400/50 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>+ Add Sleeve Reference Photo</span>
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        {outfit.sleevePhotos.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={p.dataUrl}
                                  alt={p.fileName}
                                  className="w-10 h-10 rounded-lg object-cover border border-indigo-200 shrink-0"
                                />
                                <div className="overflow-hidden">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {p.fileName}
                                  </span>
                                  <span className="text-[9px] text-indigo-700 font-semibold uppercase tracking-wider">
                                    [Sleeve Reference]
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx, 'sleevePhotos', p.id)}
                                className="text-slate-400 hover:text-red-500 text-xs px-2 py-0.5"
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={p.comment}
                              onChange={(e) =>
                                handleUpdatePhotoComment(idx, 'sleevePhotos', p.id, e.target.value)
                              }
                              placeholder="💬 Note for this photo..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. EXTRA / FABRIC REFERENCE PHOTOS */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> 4. Extra Fabric / Material Photos
                      </span>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPhotoUpload(idx, 'extraPhotos', 'Extra Reference', '📸')
                      }
                      className="w-full py-2 bg-white border border-dashed border-slate-300 hover:border-[#5B43EE] hover:bg-purple-50 text-slate-700 hover:text-[#5B43EE] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>+ Upload Extra / Fabric Reference Photo</span>
                    </button>

                    {outfit.extraPhotos.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        {outfit.extraPhotos.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={p.dataUrl}
                                  alt={p.fileName}
                                  className="w-10 h-10 rounded-lg object-cover border border-amber-200 shrink-0"
                                />
                                <div className="overflow-hidden">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {p.fileName}
                                  </span>
                                  <span className="text-[9px] text-amber-700 font-semibold uppercase tracking-wider">
                                    [Extra / Fabric Reference]
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx, 'extraPhotos', p.id)}
                                className="text-slate-400 hover:text-red-500 text-xs px-2 py-0.5"
                              >
                                ✕ Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={p.comment}
                              onChange={(e) =>
                                handleUpdatePhotoComment(idx, 'extraPhotos', p.id, e.target.value)
                              }
                              placeholder="💬 Note for this photo..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#5B43EE] focus:bg-white transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 5. PER-OUTFIT VOICE NOTE (CUSTOM WHATSAPP-STYLE PLAYER - NO OVERLAPPING!) */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#5B43EE]" /> 5. Voice Note for Outfit #{outfit.number}
                      </span>
                      <span className="text-[10px] text-slate-400">Audio Instructions</span>
                    </div>

                    {recordingOutfitIdx === idx ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                          <span className="text-xs font-bold text-red-600 truncate">
                            Recording Audio ({recordingSeconds}s)...
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={cancelVoiceRecording}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={stopVoiceRecording}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Square className="w-3 h-3" /> Stop & Save
                          </button>
                        </div>
                      </div>
                    ) : outfit.voiceNoteUrl ? (
                      <div className="bg-purple-50/80 border border-[#5B43EE]/25 rounded-xl p-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePlayVoice(idx, outfit.voiceNoteUrl!)}
                          className="w-9 h-9 rounded-full bg-[#5B43EE] hover:bg-[#4d36dc] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95"
                          aria-label={playingVoiceOutfitIdx === idx ? 'Pause voice note' : 'Play voice note'}
                        >
                          {playingVoiceOutfitIdx === idx ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                            <span className="flex items-center gap-1 text-[#5B43EE]">
                              <Mic className="w-3 h-3" /> Voice Note #{outfit.number}
                            </span>
                            <span className="text-slate-500 font-medium">
                              {outfit.voiceNoteDuration || '0:15'}
                            </span>
                          </div>
                          <div className="h-1.5 bg-purple-200/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#5B43EE] rounded-full transition-all duration-100"
                              style={{
                                width: `${playingVoiceOutfitIdx === idx ? voicePlayProgress : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteVoiceRecording(idx)}
                          title="Delete voice note"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startVoiceRecording(idx)}
                        className="w-full py-2.5 bg-white border border-dashed border-[#5B43EE]/40 text-[#5B43EE] hover:bg-purple-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Record Voice Note for Outfit #{outfit.number}</span>
                      </button>
                    )}
                  </div>

                  {/* 6. OVERALL REQUIREMENT NOTES */}
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" /> 6. Tailor Notes / Fit Instructions
                      </span>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>
                    <textarea
                      rows={2}
                      value={outfit.notes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOutfits((prev) => {
                          const next = [...prev];
                          next[idx].notes = val;
                          triggerAutosave(next);
                          return next;
                        });
                      }}
                      placeholder="E.g., Extra margin inside, tight fit on waist, lining cloth already provided..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#5B43EE] transition-all"
                    />
                  </div>

                  {/* BOTTOM ACTIONS: CANCEL OR SAVE & GENERATE MASTER COLLAGE */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCancelOutfit(idx)}
                      className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all border border-slate-200 flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteOutfit(idx)}
                      className="w-2/3 py-2.5 bg-[#5B43EE] hover:bg-[#4E36DE] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save & Complete Outfit #{outfit.number}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          }

          // Bot Prompt after finishing an outfit
          if (msg.type === 'add_another_prompt') {
            return (
              <div key={msg.id} className="flex gap-2.5 max-w-xl items-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                  🤖
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 shadow-xs text-slate-800 text-xs sm:text-sm space-y-3">
                  <p className="text-slate-700 font-medium">
                    Outfit #{outfits.length} master collage is ready! 🎉 Would you like to add another outfit to this inquiry, or proceed to measurements and delivery date?
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setChatMessages((prev) => [
                          ...prev.filter(
                            (m) => m.type !== 'add_another_prompt' && m.type !== 'summary_ticket'
                          ),
                          {
                            id: `pick_next_${Date.now()}`,
                            sender: 'bot',
                            type: 'selection',
                            isAnswered: false,
                          },
                        ]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 border border-[#5B43EE]/40 text-[#5B43EE] font-bold text-xs hover:bg-[#5B43EE] hover:text-white transition-all shadow-2xs"
                    >
                      + Add Another Outfit (Outfit #{outfits.length + 1})
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToFinal}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Proceed to Final Step</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // REVAMPED INQUIRY TICKET COMPONENT
          if (msg.type === 'summary_ticket') {
            return (
              <div key={msg.id} className="animate-in fade-in duration-200 space-y-4">
                <div className="border border-emerald-500/30 rounded-2xl bg-white p-4 sm:p-5 shadow-sm space-y-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Consolidated Inquiry
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">Inquiry Ticket Summary</h3>
                    </div>
                    <span className="text-xs font-bold text-[#5B43EE] bg-purple-50 px-2.5 py-1 rounded-lg border border-[#5B43EE]/20">
                      {outfits.length} Outfit{outfits.length > 1 ? 's' : ''} Ready
                    </span>
                  </div>

                  {/* Outfits List */}
                  <div className="space-y-2">
                    {outfits.map((o, i) => (
                      <div
                        key={i}
                        className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-purple-100 text-[#5B43EE] font-bold flex items-center justify-center text-xs shrink-0">
                            {o.icon}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block text-xs truncate">
                              {o.name}
                            </span>
                            <span className="text-slate-500 text-[11px] block truncate">
                              {o.frontNeck} Front • {o.backNeck} Back • {o.sleeve}
                            </span>
                            {o.voiceNoteUrl && (
                              <span className="text-[10px] text-[#5B43EE] block font-semibold flex items-center gap-1 mt-0.5">
                                <Mic className="w-2.5 h-2.5" /> Voice note included
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                          Ready ✓
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Measurements & Date */}
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Measurement Option:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openDrawer(
                            'Select Measurement Option',
                            MEASUREMENT_OPTIONS,
                            measurementOption,
                            (val) => setMeasurementOption(val)
                          )
                        }
                        className="w-full bg-white border border-slate-200 hover:border-[#5B43EE] p-2.5 rounded-xl flex items-center justify-between text-left transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-[#5B43EE] shrink-0"></span>
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {measurementOption}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Target Delivery Date:
                      </span>
                      <input
                        type="date"
                        value={deliveryDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#5B43EE] shadow-2xs transition-all"
                      />
                    </div>
                  </div>

                  {/* Terms Agreed Card */}
                  {termsText && (
                    <label className={`flex items-center gap-3 cursor-pointer p-3.5 border rounded-xl transition-colors shadow-2xs ${
                      agreedToTerms ? 'border-[#5B43EE] bg-[#5B43EE]/5' : 'border-slate-200 bg-white'
                    }`}>
                      <div className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center transition-all ${
                        agreedToTerms
                          ? 'bg-[#5B43EE] border-[#5B43EE] shadow-[0_2px_8px_rgba(91,67,238,0.3)]'
                          : 'border-[1.5px] border-[#CBD5E1] bg-white'
                      }`}>
                        {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                      <span className={`text-xs font-semibold select-none ${
                        agreedToTerms ? 'text-[#5B43EE]' : 'text-slate-700'
                      }`}>
                        I agree to {selectedBoutique?.boutique_name || 'Boutique'} Terms and Conditions
                      </span>
                    </label>
                  )}

                  {/* Final Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDiscardEntireInquiry}
                      className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 transition-all flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitInquiry}
                      className="w-2/3 py-3 bg-gradient-to-r from-[#5B43EE] to-[#7158FF] hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
                    >
                      {submitting ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Stitching Inquiry</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          }

          // Fallback text message
          return (
            <div key={msg.id} className="flex gap-2.5 max-w-xl items-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                🤖
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm">
                {msg.text}
              </div>
            </div>
          );
        })}

      </main>

      {/* 4. BOTTOM FIXED CHAT INPUT BAR */}
      <footer className="bg-white border-t border-slate-200 p-3 fixed bottom-0 left-0 right-0 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 flex items-center gap-2 border border-slate-200 focus-within:border-[#5B43EE] focus-within:bg-white transition-all">
            <input
              type="text"
              value={bottomInputText}
              onChange={(e) => setBottomInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendManualMessage()}
              placeholder="Type instructions or chat notes for the tailor..."
              className="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 w-full outline-none"
            />
            <button
              type="button"
              onClick={handleSendManualMessage}
              className="text-[#5B43EE] hover:text-[#4B33DE] font-bold text-xs shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </footer>

      {/* 5. IMAGE CROP / ROTATE / ZOOM MODAL */}
      <ImageCropModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        sectionTitle={cropTarget?.sectionTitle || 'Design'}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSrc(null);
          setCropTarget(null);
        }}
        onCropComplete={handleCropComplete}
      />

      {/* 6. FULLSCREEN MASTER COLLAGE PREVIEW MODAL */}
      {previewCollageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewCollageUrl(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-800 flex items-center justify-between text-white border-b border-slate-700">
              <span className="font-bold text-sm text-purple-300">
                Master Stitching Design Sheet (Full HD)
              </span>
              <button
                type="button"
                onClick={() => setPreviewCollageUrl(null)}
                className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/40">
              <img
                src={previewCollageUrl}
                alt="Master Collage Full HD"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. BOTTOM SHEET PICKER DRAWER */}
      <BottomSheet
        open={!!pickerDrawer}
        onClose={() => setPickerDrawer(null)}
        title={pickerDrawer?.title || 'Select Option'}
      >
        <div className="space-y-1.5 py-1">
          {pickerDrawer?.options.map((opt) => {
            const isSelected = pickerDrawer.currentValue === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => pickerDrawer.onSelect(opt)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#5B43EE] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

    </div>
  );
}
