'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBoutiquesStore } from '@/store/boutiquesStore';
import { useOrdersStore } from '@/store/ordersStore';
import {
  ArrowLeft,
  ArrowRight,
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

const MEASUREMENT_CONFIGS = [
  {
    id: 'In-Store Measurement (Visiting Boutique)',
    title: 'In-Store Measurement',
    subtitle: 'Visit the boutique in person to have the master tailor take your measurements.',
    icon: '🏬',
    tag: 'Recommended',
  },
  {
    id: 'Use Previous Measurements (Saved in Profile)',
    title: 'Use Saved Profile Measurements',
    subtitle: 'We will use your body measurements already stored in your Sewvee profile.',
    icon: '📐',
    tag: 'Instant',
  },
  {
    id: 'Send Reference Garment with Fabric (Boutique pickup/courier)',
    title: 'Send Sample / Reference Garment',
    subtitle: 'Send your best-fitting garment along with fabric (Boutique pickup or courier).',
    icon: '📦',
    tag: 'Popular',
  },
  {
    id: 'I will provide measurements later via chat',
    title: 'Coordinate Later via Chat',
    subtitle: 'Submit now and provide custom measurements or notes directly in the chat.',
    icon: '💬',
    tag: 'Flexible',
  },
];

const MEASUREMENT_OPTIONS = MEASUREMENT_CONFIGS.map(m => m.id);

const FRONT_NECK_OPTIONS = [
  {
    name: 'Closeneck',
    svg: (
      <svg viewBox="0 0 56 46" className="w-10 h-10" fill="none">
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38 L 52 44 L 4 44 Z" fill="#F8FAFC" />
        <path d="M 22 20 C 22 25 34 25 34 20" stroke="#5B43EE" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 23 15 C 23 17 33 17 33 15" stroke="#5B43EE" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="23" y1="15" x2="22" y2="20" stroke="#5B43EE" strokeWidth="1.8" />
        <line x1="33" y1="15" x2="34" y2="20" stroke="#5B43EE" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    name: 'Collarneck',
    svg: (
      <svg viewBox="0 0 56 46" className="w-10 h-10" fill="none">
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38 L 52 44 L 4 44 Z" fill="#F8FAFC" />
        <path d="M 21 16 L 28 23 L 35 16" stroke="#5B43EE" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M 21 16 L 24 28 L 28 24 L 32 28 L 35 16" fill="#EDE9FE" stroke="#5B43EE" strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="28" y1="24" x2="28" y2="34" stroke="#5B43EE" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'High neck',
    svg: (
      <svg viewBox="0 0 56 46" className="w-10 h-10" fill="none">
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38 L 52 44 L 4 44 Z" fill="#F8FAFC" />
        <rect x="22" y="12" width="12" height="10" rx="2" fill="#EDE9FE" stroke="#5B43EE" strokeWidth="2.4" />
        <line x1="22" y1="17" x2="34" y2="17" stroke="#5B43EE" strokeWidth="1.5" strokeDasharray="2 1" />
      </svg>
    ),
  },
  {
    name: 'Boat neck',
    svg: (
      <svg viewBox="0 0 56 46" className="w-10 h-10" fill="none">
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38 L 52 44 L 4 44 Z" fill="#F8FAFC" />
        <path d="M 13 22 C 20 29 36 29 43 22" stroke="#5B43EE" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 13 22 C 20 29 36 29 43 22 C 38 20 28 20 13 22 Z" fill="#EDE9FE" opacity="0.8" />
      </svg>
    ),
  },
  {
    name: 'Normal neck',
    svg: (
      <svg viewBox="0 0 56 46" className="w-10 h-10" fill="none">
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38 L 52 44 L 4 44 Z" fill="#F8FAFC" />
        <path d="M 19 20 C 19 33 37 33 37 20" stroke="#5B43EE" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 19 20 C 19 33 37 33 37 20 Z" fill="#EDE9FE" opacity="0.8" />
      </svg>
    ),
  },
  {
    name: 'Others',
    svg: (
      <svg viewBox="0 0 56 46" className="w-10 h-10" fill="none">
        <path d="M 4 38 C 10 26 18 20 28 20 C 38 20 46 26 52 38" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
        <circle cx="28" cy="24" r="10" fill="#EDE9FE" stroke="#5B43EE" strokeWidth="2" />
        <text x="28" y="28" fontSize="12" textAnchor="middle" fill="#5B43EE">✨</text>
      </svg>
    ),
  },
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
  categoryCut?: string;
  name: string;
  icon: string;
  frontNeck: string;
  frontNeckCustomName?: string;
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
  activeStep?: number;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  type?: 'text' | 'start_cta' | 'selection' | 'cut_selection' | 'questionnaire' | 'add_another_prompt' | 'summary_ticket';
  outfitIndex?: number;
  isAnswered?: boolean;
  selectedCategory?: string;
  selectedCut?: string;
  quickActions?: Array<{ label: string; actionType: 'add_outfit' | 'select_measurement' | 'proceed_final' }>;
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
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_start_cta',
      sender: 'bot',
      type: 'start_cta',
      isAnswered: false,
    },
  ]);

  // Final ticket state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [measurementOption, setMeasurementOption] = useState('In-Store Measurement (Visiting Boutique)');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [measurementDrawerOpen, setMeasurementDrawerOpen] = useState(false);
  const [deliveryDateDrawerOpen, setDeliveryDateDrawerOpen] = useState(false);

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

  // Custom Cut Pattern state
  const [customCutMsgId, setCustomCutMsgId] = useState<string | null>(null);
  const [customCutInputText, setCustomCutInputText] = useState('');

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
              id: 'welcome_start_cta',
              sender: 'bot',
              type: 'start_cta',
              isAnswered: true,
            },
            {
              id: 'user_start',
              sender: 'user',
              text: "Let's Start Stitching! 🧵",
            },
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

  // Micro-Interaction: User clicks Start Stitching
  const handleStartStitching = () => {
    setChatMessages((prev) =>
      prev.map((m) => (m.type === 'start_cta' ? { ...m, isAnswered: true } : m))
    );

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user_start_${Date.now()}`,
        sender: 'user',
        text: "Let's Start Stitching! 🧵",
      },
    ]);

    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `selection_${Date.now()}`,
          sender: 'bot',
          text: `Awesome! What outfit would you like us to stitch for you today?`,
          type: 'selection',
          isAnswered: false,
        },
      ]);
    }, 450);
  };

  // Step 1: User Chooses an Outfit Type (e.g. Blouse, Co-ord Set)
  const handleSelectOutfit = (categoryName: string) => {
    const template = getOutfitTemplate(categoryName);
    const cuts = template.categoryCuts || [];

    setChatMessages((prev) => {
      const updated = prev.map((m) =>
        m.type === 'selection' ? { ...m, isAnswered: true, selectedCategory: categoryName } : m
      );

      return [
        ...updated,
        {
          id: `user_pick_type_${Date.now()}`,
          sender: 'user',
          text: `I want to stitch ${categoryName}`,
        },
      ];
    });

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      if (cuts.length > 0) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `cut_select_${Date.now()}`,
            sender: 'bot',
            type: 'cut_selection',
            selectedCategory: categoryName,
            isAnswered: false,
          },
        ]);
      } else {
        startOutfitQuestionnaire(categoryName, 'Standard Cut');
      }
    }, 350);
  };

  // Step 2: User Chooses Category Cut (e.g. Princesscut with pad)
  const handleSelectCut = (categoryName: string, cutName: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.type === 'cut_selection' ? { ...m, isAnswered: true, selectedCut: cutName } : m
      )
    );

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user_pick_cut_${Date.now()}`,
        sender: 'user',
        text: `Style / Pattern Cut: ${cutName}`,
      },
    ]);

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      startOutfitQuestionnaire(categoryName, cutName);
    }, 350);
  };

  const startOutfitQuestionnaire = (categoryName: string, cutName: string) => {
    const nextNum = outfits.length + 1;
    const template = getOutfitTemplate(categoryName);

    const newOutfit: OutfitConfig = {
      number: nextNum,
      category: categoryName,
      categoryCut: cutName,
      name: `Outfit ${nextNum}: ${categoryName}${cutName ? ` (${cutName})` : ''}`,
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
      activeStep: 1, // Start on Step 1: Front Neck
    };

    const newOutfits = [...outfits, newOutfit];
    setOutfits(newOutfits);
    setCurrentOutfitIndex(newOutfits.length - 1);
    triggerAutosave(newOutfits);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `questionnaire_${newOutfits.length - 1}`,
        sender: 'bot',
        type: 'questionnaire',
        outfitIndex: newOutfits.length - 1,
      },
    ]);
  };

  // Guided Step Progression (One by One)
  const handleNextStep = (outfitIdx: number) => {
    setOutfits((prev) => {
      const next = [...prev];
      const curStep = next[outfitIdx]?.activeStep || 1;
      next[outfitIdx] = {
        ...next[outfitIdx],
        activeStep: Math.min(curStep + 1, 4),
      };
      triggerAutosave(next);
      return next;
    });
  };

  const handlePrevStep = (outfitIdx: number) => {
    setOutfits((prev) => {
      const next = [...prev];
      const curStep = next[outfitIdx]?.activeStep || 1;
      next[outfitIdx] = {
        ...next[outfitIdx],
        activeStep: Math.max(curStep - 1, 1),
      };
      triggerAutosave(next);
      return next;
    });
  };

  const handleJumpToStep = (outfitIdx: number, stepNum: number) => {
    setOutfits((prev) => {
      const next = [...prev];
      next[outfitIdx] = {
        ...next[outfitIdx],
        activeStep: stepNum,
      };
      triggerAutosave(next);
      return next;
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
      next[idx] = { ...next[idx], isCompleted: false, activeStep: 1 };
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
          id: 'welcome_start_cta',
          sender: 'bot',
          type: 'start_cta',
          isAnswered: false,
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
          `Outfit Pattern / Cut: ${outfit.categoryCut || 'Standard'}`,
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
    const userText = bottomInputText.trim();
    setBottomInputText('');

    // Append user message immediately
    const userMsgId = `manual_user_${Date.now()}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: userText,
      },
    ]);

    // Show bot typing micro-interaction
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);

      // Determine active outfit
      const incompleteIdx = outfits.findIndex((o) => !o.isCompleted);
      const activeIdx = incompleteIdx !== -1 ? incompleteIdx : (outfits.length > 0 ? outfits.length - 1 : -1);
      const activeOutfit = activeIdx !== -1 ? outfits[activeIdx] : null;

      const lower = userText.toLowerCase();

      // Check for tailoring instruction
      const isInstruction = /(neck|front|back|sleeve|kai|lining|pad|cups|latkan|dori|rope|knot|depth|tight|loose|margin|piping|zip|chain|hook|slit|flare|cancan|inch|inches|cm|border|pot neck|boat neck|v neck|round|square|collar|pleat|cut|hip|waist|chest|length|short|long|elbow|sleeveless|cap sleeve)/i.test(userText);

      if (isInstruction && activeOutfit) {
        const existingNotes = activeOutfit.notes || '';
        const updatedNotes = existingNotes ? `${existingNotes}; ${userText}` : userText;
        setOutfits((prev) => {
          const next = [...prev];
          next[activeIdx] = { ...activeOutfit, notes: updatedNotes };
          triggerAutosave(next);
          return next;
        });
      }

      // Check intent and generate contextual response
      let botResponse = '';
      let quickActions: Array<{ label: string; actionType: 'add_outfit' | 'select_measurement' | 'proceed_final' }> | undefined = undefined;

      const boutiqueName = selectedBoutique?.boutique_name || 'Inba Boutique';

      if (
        /(add|more|another|multiple|second|third|2nd|3rd|two|extra).*(outfit|dress|blouse|kurti|suit|lehenga|piece|item)/i.test(lower) ||
        lower.includes('innoru') ||
        lower.includes('inoru') ||
        lower.includes('another dress')
      ) {
        botResponse = `✨ **Adding Multiple Outfits:**\nYes, absolutely! You can add multiple outfits to this single inquiry. Currently you have **${outfits.length} outfit${outfits.length > 1 ? 's' : ''}** in your order list.\n\nYou can click **+ Add Another Outfit** below or in the top bar to choose your next design!`;
        quickActions = [{ label: '+ Add Another Outfit', actionType: 'add_outfit' }];
      } else if (/(price|cost|charge|charges|rate|rates|fees|how much|evlo|evalo|amount|budget|quote|vilai|expensive|cheap)/i.test(lower)) {
        const cat = activeOutfit ? activeOutfit.category.toLowerCase() : '';
        if (cat.includes('blouse')) {
          botResponse = `👚 **Blouse Stitching Charges:**\n• Standard Plain Blouse: ₹450 – ₹650\n• Princess Cut / Padded Blouse: ₹850 – ₹1,200\n• Heavy Bridal / Aari Work Blouse: Based on embroidery work density (starts ₹1,500+)\n\n*Pure cotton lining, crepe, canvas, and soft bra pads can be provided by the boutique or brought by you.*`;
        } else if (cat.includes('dress') || cat.includes('gown')) {
          botResponse = `👘 **Dress / Gown Stitching Charges:**\n• Simple A-Line / Maxi Dress: ₹850 – ₹1,400\n• Full Flare Evening Gown (with lining): ₹1,500 – ₹2,800\n• Multi-layer Party / Bridal Gown with Can-can: ₹2,500 – ₹4,500+\n\n*The boutique master tailor will confirm the exact quote upon checking your fabric.*`;
        } else if (cat.includes('kurti') || cat.includes('salwar')) {
          botResponse = `👗 **Kurti & Salwar Suit Charges:**\n• Straight Kurti / Top: ₹450 – ₹650\n• Salwar / Chudithar Set with Lining: ₹750 – ₹1,100\n• Anarkali Flared Suit: ₹1,200 – ₹1,800`;
        } else {
          botResponse = `💰 **Stitching Estimates at ${boutiqueName}:**\n• Blouse: ₹450 – ₹1,200\n• Kurti / Salwar: ₹550 – ₹1,100\n• Evening Gown / Dress: ₹1,500 – ₹2,800\n• Lehenga Choli: ₹1,800 – ₹4,500\n\n*Every quote is confirmed transparently before cutting starts.*`;
        }
      } else if (/(how long|how many days|when|ready|urgent|express|emergency|date|time|fast|quick|delivery|timelines|eppo|ethana naal)/i.test(lower)) {
        botResponse = `⏱️ **Delivery Timelines:**\n• **Standard Stitching:** 5 to 7 business days from fabric handover or measurement.\n• **Express / Priority Delivery:** 2 to 3 days available on request!\n\nYou can select your target delivery date in the final step. Our master tailor will prioritize your slot accordingly.`;
        quickActions = [{ label: 'Proceed to Final Step', actionType: 'proceed_final' }];
      } else if (/(measurement|measure|size|sample|fit|fitting|old blouse|old dress|tape|home|visit|trial|alavu)/i.test(lower)) {
        botResponse = `📐 **How Measurements Work:**\n1. **🏬 In-Store Measurement (Recommended):** Visit ${boutiqueName} for an exact 12-point tape measurement by our master tailor.\n2. **📦 Send Sample Dress / Blouse:** Drop off or courier a well-fitting sample outfit, and we will replicate the exact fit.\n3. **📁 Saved Measurements on File:** If you have stitched before, your past measurements are already saved!\n\n*Every order includes our **100% Perfect Fit Trial Guarantee** with free on-the-spot adjustments.*`;
        quickActions = [{ label: '🏬 Choose Measurement Option', actionType: 'select_measurement' }];
      } else if (/(cloth|fabric|material|lining|saree|provide fabric|supply cloth|lining included|thuni|canvas)/i.test(lower)) {
        botResponse = `🧵 **Fabric & Lining Support:**\n• **Your Fabric:** You can bring or courier your own saree, dress material, or fabric to the boutique.\n• **Boutique Provided:** ${boutiqueName} provides premium pure cotton lining, crepe lining, can-can mesh, heavy-duty concealed zippers, and bra pads.\n\n*If you need the boutique to supply lining or matching latkans, just let us know in your tailor notes!*`;
      } else if (/(aari|embroidery|hand work|zardosi|maggam|bridal|latkan|dori|piping|patch work|bead|thread work|stone work)/i.test(lower)) {
        botResponse = `✨ **Aari Embroidery & Hand Work:**\nYes! ${boutiqueName} specializes in custom bridal Aari embroidery, zardosi, thread work, and designer sleeve borders.\n\nYou can attach any photo using the **+ Add Photo** button in the Front Neck, Back Neck, or Sleeve sections. Our master artisans will match the design pattern!`;
      } else if (/(location|address|where|timing|hours|phone|call|open|reach|direction|contact|shop|store)/i.test(lower)) {
        botResponse = `📍 **${boutiqueName} Details:**\n• **Location:** Inba Boutique, Chennai\n• **Timings:** Monday – Saturday: 10:00 AM – 8:30 PM | Sunday: 11:00 AM – 6:00 PM\n• **Services:** Bespoke stitching, bridal blouses, gown pattern-making, express trial & alterations.\n\nYou can visit the boutique directly for measurements or fabric handover once your inquiry is booked!`;
      } else if (/(alter|alteration|tight|loose|guarantee|fitting issue|fit guarantee)/i.test(lower)) {
        botResponse = `🛡️ **100% Perfect Fit Guarantee:**\nEvery order at ${boutiqueName} includes a trial session before final delivery. If anything feels slightly tight or loose at the waist, bust, or armhole, our master tailor does alterations on the spot free of charge until you are 100% delighted!`;
      } else if (isInstruction && activeOutfit) {
        botResponse = `✨ **Noted for Outfit #${activeOutfit.number} (${activeOutfit.name})!**\nI've saved this instruction to your order notes:\n*"${userText}"*\n\nOur master tailor and pattern cutter will follow this specification closely.`;
      } else if (/(hi|hello|vanakkam|hey|sup|good morning|good evening)/i.test(lower)) {
        botResponse = `Vanakkam! 👋 I am your ${boutiqueName} Stitching Assistant. Ask me anything about tailoring charges, delivery dates, neck patterns, or measurements. I'm here to help you get the perfect fit!`;
      } else if (activeOutfit) {
        botResponse = `📝 **Noted for Outfit #${activeOutfit.number} (${activeOutfit.name})!**\nI have saved your instruction: *"${userText}"* to your tailoring notes.\n\nFeel free to ask me anything about stitching charges, delivery timelines, measurements, or adding another outfit!`;
      } else {
        botResponse = `Got your note: *"${userText}"*. I've noted this for the master tailor at ${boutiqueName}.\n\nFeel free to ask about pricing, delivery timeline, measurement options, or adding multiple outfits!`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot_reply_${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          quickActions,
        },
      ]);
    }, 500);
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

          // Start Stitching CTA Welcome Card
          if (msg.type === 'start_cta') {
            if (msg.isAnswered) {
              return (
                <div key={msg.id} className="flex gap-2.5 max-w-xl items-start animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    ✨
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-900">
                      Welcome to {selectedBoutique?.boutique_name || 'Inba Boutique'}!
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Custom stitching session initiated.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="space-y-3 animate-in fade-in duration-300">
                <div className="flex gap-2.5 max-w-xl items-start">
                  <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    ✨
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm text-slate-800 text-xs sm:text-sm space-y-3.5">
                    <div>
                      <p className="font-bold text-slate-900 text-sm sm:text-base">
                        Vanakkam {user?.name || 'there'}! 👋
                      </p>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                        Welcome to <span className="font-semibold text-[#5B43EE]">{selectedBoutique?.boutique_name || 'Inba Boutique'}</span> stitching inquiry. Customize your outfits step-by-step with photos, neck patterns, and tailor notes.
                      </p>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 text-xs space-y-2 text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B43EE] shrink-0"></span>
                        <span>Interactive 1-on-1 guided stitching assistant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>Auto-collaged pattern references for perfect tailoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                        <span>Offline draft autosave & voice note instructions</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartStitching}
                      className="w-full py-3 px-4 bg-[#5B43EE] hover:bg-[#4d36d8] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#5B43EE]/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
                      <span>Start Stitching</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
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

          // Bot Cut Selection (Level 2: Cut / Pattern Style)
          if (msg.type === 'cut_selection' && msg.selectedCategory) {
            const template = getOutfitTemplate(msg.selectedCategory);
            const cuts = template.categoryCuts || [];

            if (msg.isAnswered) {
              return (
                <div key={msg.id} className="flex gap-2.5 max-w-xl items-start animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    ✂️
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-900 mb-1">
                      Cut Pattern Selected:
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-[#5B43EE] border border-[#5B43EE]/20 rounded-lg text-xs font-bold">
                      <span>✓ Style:</span>
                      <span>{msg.selectedCut || 'Standard Cut'}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="space-y-2.5 animate-in fade-in duration-200">
                <div className="flex gap-2.5 max-w-xl items-start">
                  <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                    ✂️
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm leading-relaxed">
                    <p className="font-bold text-slate-900 mb-0.5">
                      Select {msg.selectedCategory} Cut / Pattern:
                    </p>
                    <p className="text-slate-600 text-xs">
                      Choose which stitching pattern you would like for this {msg.selectedCategory.toLowerCase()}:
                    </p>
                  </div>
                </div>

                <div className="pl-10 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Available Cut Options:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cuts.map((cut) => (
                      <button
                        key={cut}
                        type="button"
                        onClick={() => {
                          if (cut === 'Others' || cut === 'Other') {
                            setCustomCutMsgId(msg.id);
                          } else {
                            handleSelectCut(msg.selectedCategory!, cut);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl border font-semibold text-xs sm:text-sm shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 ${
                          cut === 'Others' || cut === 'Other'
                            ? 'bg-purple-50/80 border-purple-300 text-[#5B43EE] hover:bg-purple-100/80'
                            : 'bg-white border-slate-200 hover:border-[#5B43EE] hover:bg-purple-50/70 text-slate-700 hover:text-[#5B43EE]'
                        }`}
                      >
                        <span>{cut === 'Others' || cut === 'Other' ? '✨' : '✂️'}</span>
                        <span>{cut}</span>
                      </button>
                    ))}
                  </div>

                  {/* Inline Custom Cut Pattern Input */}
                  {customCutMsgId === msg.id && (
                    <div className="p-3.5 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 border border-purple-200 rounded-2xl space-y-2.5 animate-in fade-in duration-200 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#5B43EE] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          ✏️
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Enter Custom Cut / Pattern Name:
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Type your custom style or pick a suggestion below
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Sabyasachi Cut, Corset Blouse, Collar Blouse..."
                        value={customCutInputText}
                        onChange={(e) => setCustomCutInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const name = customCutInputText.trim() || 'Custom Designer Cut';
                            handleSelectCut(msg.selectedCategory!, name);
                            setCustomCutMsgId(null);
                            setCustomCutInputText('');
                          }
                        }}
                        className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 font-semibold outline-none focus:ring-2 focus:ring-[#5B43EE]/40 shadow-inner"
                        autoFocus
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold">Suggestions:</span>
                        {['Sabyasachi Cut', 'Corset Blouse', 'Double Katori'].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setCustomCutInputText(sug)}
                            className="text-[10px] bg-white hover:bg-purple-100 border border-purple-200 text-[#5B43EE] px-2 py-0.5 rounded-md font-semibold transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const name = customCutInputText.trim() || 'Custom Designer Cut';
                          handleSelectCut(msg.selectedCategory!, name);
                          setCustomCutMsgId(null);
                          setCustomCutInputText('');
                        }}
                        className="w-full py-2 bg-[#5B43EE] hover:bg-[#4a35c9] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <span>Next: Choose Front Neck, Back & Sleeves →</span>
                      </button>
                    </div>
                  )}
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

            // ACTIVE STREAMLINED QUESTIONNAIRE CARD (STEP-BY-STEP GUIDED CUSTOMIZATION)
            const currentStep = outfit.activeStep || 1;

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
                        Outfit #{outfit.number} • {outfit.category}{outfit.categoryCut ? ` (${outfit.categoryCut})` : ''}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">Design Customization</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#5B43EE] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                        Step {currentStep} of 4
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancelOutfit(idx)}
                        className="text-xs text-slate-400 hover:text-red-500 font-semibold px-2 py-0.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Discard outfit"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Step Progress Stepper Tabs */}
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-xl">
                    {[
                      { num: 1, label: 'Front Neck' },
                      { num: 2, label: 'Back Neck' },
                      { num: 3, label: 'Sleeves' },
                      { num: 4, label: 'Extras' },
                    ].map((s) => {
                      const isActive = currentStep === s.num;
                      const isDone = currentStep > s.num;
                      return (
                        <button
                          key={s.num}
                          type="button"
                          onClick={() => handleJumpToStep(idx, s.num)}
                          className={`py-1.5 px-1 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                            isActive
                              ? 'bg-white text-[#5B43EE] font-bold shadow-2xs'
                              : isDone
                              ? 'bg-emerald-50 text-emerald-700 font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              isActive
                                ? 'bg-[#5B43EE] text-white'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            {isDone ? '✓' : s.num}
                          </span>
                          <span className="truncate hidden sm:inline">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* STEP 1: FRONT NECK */}
                  {currentStep === 1 && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#5B43EE]"></span> 1. Front Neck Style
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Select preferred neck cut or choose Others below:
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-[#5B43EE] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                            {outfit.frontNeck === 'Others'
                              ? outfit.frontNeckCustomName
                                ? `Custom: ${outfit.frontNeckCustomName}`
                                : 'Custom Neck'
                              : outfit.frontNeck}
                          </span>
                        </div>

                        {/* Box Type Grid: Image on top, Name below */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                          {FRONT_NECK_OPTIONS.map((opt) => {
                            const isSelected = outfit.frontNeck === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => {
                                  setOutfits((prev) => {
                                    const next = [...prev];
                                    next[idx].frontNeck = opt.name;
                                    if (opt.name !== 'Others') {
                                      next[idx].frontNeckCustomName = '';
                                    }
                                    triggerAutosave(next);
                                    return next;
                                  });
                                }}
                                className={`p-2.5 rounded-xl flex flex-col items-center justify-between text-center transition-all cursor-pointer relative group active:scale-95 ${
                                  isSelected
                                    ? 'bg-purple-50/90 border-2 border-[#5B43EE] text-[#5B43EE] shadow-2xs'
                                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#5B43EE] text-white flex items-center justify-center text-[9px] font-bold shadow-2xs">
                                    ✓
                                  </div>
                                )}
                                <div className="w-11 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
                                  {opt.svg}
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 leading-tight ${isSelected ? 'text-[#5B43EE]' : 'text-slate-800'}`}>
                                  {opt.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* IF THEY CHOOSE OTHER: Name it below & then below upload reference photo */}
                        {outfit.frontNeck === 'Others' ? (
                          <div className="p-3.5 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 border border-purple-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                            <div>
                              <label className="block text-xs font-bold text-slate-900 mb-1">
                                ✏️ Name your Front Neck Style:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Sweetheart Neck, Deep V-Neck, Square Cut..."
                                value={outfit.frontNeckCustomName || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setOutfits((prev) => {
                                    const next = [...prev];
                                    next[idx].frontNeckCustomName = val;
                                    triggerAutosave(next);
                                    return next;
                                  });
                                }}
                                className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 font-semibold outline-none focus:ring-2 focus:ring-[#5B43EE]/40 shadow-inner"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-900 mb-1">
                                📷 Upload Reference Photo for Neck:
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  handleTriggerPhotoUpload(idx, 'frontNeckPhotos', 'Front Neck', '👚')
                                }
                                className="w-full py-2.5 bg-white border border-dashed border-[#5B43EE] hover:bg-purple-100/50 rounded-xl text-xs font-bold text-[#5B43EE] flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>+ Add Reference Photo (Crop & Rotate)</span>
                              </button>

                              {outfit.frontNeckPhotos.length > 0 && (
                                <div className="space-y-2 pt-2">
                                  {outfit.frontNeckPhotos.map((p) => (
                                    <div
                                      key={p.id}
                                      className="bg-white border border-purple-200 rounded-xl p-2.5 shadow-2xs space-y-1.5"
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
                                            <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                              <span>✓</span> Reference Photo Attached
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
                                        className="w-full bg-slate-50 border border-purple-100 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#5B43EE] focus:bg-white transition-all"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Optional Photo Upload for Standard Neck Styles */
                          <div>
                            {outfit.frontNeckPhotos.length === 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleTriggerPhotoUpload(idx, 'frontNeckPhotos', 'Front Neck', '👚')
                                }
                                className="w-full py-2.5 bg-white border border-dashed border-[#5B43EE]/40 hover:border-[#5B43EE] hover:bg-purple-50 text-[#5B43EE] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>+ Add Front Neck Photo (Optional)</span>
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
                                  <Camera className="w-3 h-3" /> + Add Another Front Neck Photo
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Front Neck Note / Depth input */}
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
                          placeholder="💬 Specific front neck note (e.g. depth 6.5 inch, piping)..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#5B43EE] transition-all"
                        />
                      </div>

                      {/* Step 1 Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleCancelOutfit(idx)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNextStep(idx)}
                          className="px-5 py-2.5 bg-[#5B43EE] hover:bg-[#4E36DE] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 active:scale-98"
                        >
                          <span>Next: Back Neck Style</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: BACK NECK */}
                  {currentStep === 2 && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 2. Back Neck Style
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Select shape, dori/potli details and back photos
                            </p>
                          </div>
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
                            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-600 text-emerald-700 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-all"
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
                          placeholder="💬 Specific back neck note (e.g. 8 inch deep, tassels, dori)..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 transition-all"
                        />

                        {outfit.backNeckPhotos.length === 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleTriggerPhotoUpload(idx, 'backNeckPhotos', 'Back Neck', '✨')
                            }
                            className="w-full py-2.5 bg-white border border-dashed border-emerald-600/40 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                              <Camera className="w-3 h-3" /> + Add Another Back Neck Photo
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Step 2 Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handlePrevStep(idx)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all border border-slate-200 flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNextStep(idx)}
                          className="px-5 py-2.5 bg-[#5B43EE] hover:bg-[#4E36DE] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 active:scale-98"
                        >
                          <span>Next: Sleeves & Opening</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SLEEVES & OPENING */}
                  {currentStep === 3 && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                        <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 3. Sleeve Pattern & Opening
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
                            className="w-full py-2.5 bg-white border border-dashed border-indigo-400/50 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                            <button
                              type="button"
                              onClick={() =>
                                handleTriggerPhotoUpload(idx, 'sleevePhotos', 'Sleeve Design', '🧵')
                              }
                              className="text-[11px] font-semibold text-indigo-700 hover:underline flex items-center gap-1 pt-0.5"
                            >
                              <Camera className="w-3 h-3" /> + Add Another Sleeve Photo
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Step 3 Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handlePrevStep(idx)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all border border-slate-200 flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNextStep(idx)}
                          className="px-5 py-2.5 bg-[#5B43EE] hover:bg-[#4E36DE] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 active:scale-98"
                        >
                          <span>Next: Audio & Extras</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: UNIFIED FABRIC, VOICE & TAILOR NOTES (No confusing 4, 5, 6 numbering) */}
                  {currentStep === 4 && (
                    <div className="space-y-3.5 animate-in fade-in duration-200">
                      
                      <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                        {/* Step 4 Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                          <div>
                            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 4. Fabric, Voice & Tailor Notes
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              All details below are optional — provide any reference fabric, voice note, or fit details:
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                            Optional Details
                          </span>
                        </div>

                        {/* 1. EXTRA FABRIC / MATERIAL PHOTOS */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-amber-500" /> Extra Fabric or Reference Photos:
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleTriggerPhotoUpload(idx, 'extraPhotos', 'Extra Reference', '📸')
                            }
                            className="w-full py-2 bg-white border border-dashed border-slate-300 hover:border-[#5B43EE] hover:bg-purple-50 text-slate-700 hover:text-[#5B43EE] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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

                        {/* 2. VOICE NOTE */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-[#5B43EE]" /> Voice Instructions for Tailor:
                          </span>

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
                              className="w-full py-2.5 bg-white border border-dashed border-[#5B43EE]/40 text-[#5B43EE] hover:bg-purple-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Mic className="w-4 h-4" />
                              <span>Record Voice Note for Outfit #{outfit.number}</span>
                            </button>
                          )}
                        </div>

                        {/* 3. FIT & TAILOR NOTES */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <Edit2 className="w-3.5 h-3.5 text-slate-600" /> Fit & Stitching Instructions:
                          </span>
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
                      </div>

                      {/* Step 4 Actions: Back or Complete & Generate Collage */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handlePrevStep(idx)}
                          className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all border border-slate-200 flex items-center justify-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompleteOutfit(idx)}
                          className="w-2/3 py-2.5 bg-[#5B43EE] hover:bg-[#4E36DE] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Save & Complete Outfit #{outfit.number}</span>
                        </button>
                      </div>

                    </div>
                  )}

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
                        onClick={() => setMeasurementDrawerOpen(true)}
                        className="w-full bg-white border border-slate-200 hover:border-[#5B43EE] p-3 rounded-xl flex items-center justify-between text-left transition-all shadow-2xs group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B43EE] flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-[#5B43EE] group-hover:text-white transition-colors">
                            {MEASUREMENT_CONFIGS.find(m => m.id === measurementOption)?.icon || '📐'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {MEASUREMENT_CONFIGS.find(m => m.id === measurementOption)?.title || measurementOption}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {MEASUREMENT_CONFIGS.find(m => m.id === measurementOption)?.subtitle || 'Tap to choose measurement option'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#5B43EE] px-2.5 py-1 bg-purple-50 rounded-lg shrink-0 group-hover:bg-purple-100 transition-colors ml-2">
                          Change
                        </span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Target Delivery Date:
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeliveryDateDrawerOpen(true)}
                        className="w-full bg-white border border-slate-200 hover:border-[#5B43EE] p-3 rounded-xl flex items-center justify-between text-left transition-all shadow-2xs group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-[#5B43EE] group-hover:text-white transition-colors">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {deliveryDate 
                                ? new Date(deliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Select Target Delivery Date'}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {deliveryDate ? 'Tailor will deliver on or before this date' : 'Tap to select delivery timeline'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#5B43EE] px-2.5 py-1 bg-purple-50 rounded-lg shrink-0 group-hover:bg-purple-100 transition-colors ml-2">
                          {deliveryDate ? 'Change' : 'Select'}
                        </span>
                      </button>
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

          // Fallback text message / Bot conversational response
          return (
            <div key={msg.id} className="flex gap-2.5 max-w-xl items-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs mt-0.5">
                🤖
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-3.5 shadow-xs text-slate-800 text-xs sm:text-sm whitespace-pre-line space-y-2.5">
                <div className="leading-relaxed">{msg.text}</div>
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (qa.actionType === 'add_outfit') {
                            setChatMessages((prev) => [
                              ...prev.filter((m) => m.type !== 'add_another_prompt' && m.type !== 'summary_ticket'),
                              {
                                id: `prompt_manual_add_${Date.now()}`,
                                sender: 'bot',
                                type: 'selection',
                              },
                            ]);
                          } else if (qa.actionType === 'select_measurement') {
                            setMeasurementDrawerOpen(true);
                          } else if (qa.actionType === 'proceed_final') {
                            handleProceedToFinal();
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-[#5B43EE] text-[#5B43EE] hover:text-white border border-[#5B43EE]/30 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bot Typing Micro-Interaction */}
        {isBotTyping && (
          <div className="flex gap-2.5 max-w-xl items-center animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full bg-[#5B43EE] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              🤖
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5B43EE] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#5B43EE] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#5B43EE] animate-bounce"></span>
              <span className="text-xs text-slate-400 font-medium ml-1.5">Assistant is preparing...</span>
            </div>
          </div>
        )}

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

      {/* 8. REVAMPED MEASUREMENT DRAWER */}
      <BottomSheet
        open={measurementDrawerOpen}
        onClose={() => setMeasurementDrawerOpen(false)}
        title="Select Measurement Option"
      >
        <div className="space-y-2.5 py-1 pb-6">
          <p className="text-xs text-slate-500 mb-1">
            How would you like the boutique tailor to take your measurements?
          </p>
          {MEASUREMENT_CONFIGS.map((cfg) => {
            const isSelected = measurementOption === cfg.id;
            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => {
                  setMeasurementOption(cfg.id);
                  setMeasurementDrawerOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#5B43EE] bg-[#5B43EE]/5 shadow-sm ring-1 ring-[#5B43EE]/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  isSelected ? 'bg-[#5B43EE] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {cfg.title}
                    </span>
                    {cfg.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#5B43EE] border border-[#5B43EE]/20">
                        {cfg.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                    {cfg.subtitle}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'border-[#5B43EE] bg-[#5B43EE] text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* 9. REVAMPED DELIVERY DATE DRAWER (COMES ON TOP) */}
      <BottomSheet
        open={deliveryDateDrawerOpen}
        onClose={() => setDeliveryDateDrawerOpen(false)}
        title="Choose Target Delivery Date"
      >
        <div className="space-y-4 py-1 pb-6">
          <p className="text-xs text-slate-500">
            Select a quick delivery preset or pick your preferred completion date.
          </p>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { days: 7, label: 'Express Stitching', tag: '7 Days' },
              { days: 14, label: 'Standard Timeline', tag: '14 Days' },
              { days: 21, label: 'Relaxed Timeline', tag: '21 Days' },
              { days: 30, label: '1 Month Timeline', tag: '30 Days' },
            ].map((preset) => {
              const d = new Date();
              d.setDate(d.getDate() + preset.days);
              const dateVal = d.toISOString().split('T')[0];
              const isSelected = deliveryDate === dateVal;

              return (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    setDeliveryDate(dateVal);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#5B43EE] bg-[#5B43EE]/5 ring-1 ring-[#5B43EE]/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B43EE] bg-purple-50 px-2 py-0.5 rounded-md">
                      {preset.tag}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#5B43EE]" strokeWidth={3} />}
                  </div>
                  <span className="font-bold text-xs text-slate-800 block">
                    {preset.label}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Date Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#5B43EE]" /> Or Pick Exact Date:
            </span>
            <input
              type="date"
              value={deliveryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#5B43EE] shadow-2xs transition-all"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            disabled={!deliveryDate}
            onClick={() => setDeliveryDateDrawerOpen(false)}
            className="w-full py-3 bg-[#5B43EE] hover:bg-[#4d36dc] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 active:scale-98"
          >
            Confirm Delivery Date {deliveryDate ? `(${new Date(deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})` : ''}
          </button>
        </div>
      </BottomSheet>

    </div>
  );
}
