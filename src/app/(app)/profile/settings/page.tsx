'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, User, Phone, Mail, Lock, Pencil, X, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api'; // Actually we need API_URL
import { useToast } from '@/hooks/useToast';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();
  const { showToast } = useToast();

  const [editModal, setEditModal] = useState(false);
  const [editField, setEditField] = useState<'name' | 'email'>('name');
  const [editValue, setEditValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  const [pinModal, setPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // We construct the API_DOMAIN based on the env

  useEffect(() => {
    async function syncProfile() {
      try {
        const res = await api.get('/customer-auth/profile');
        if (res.data?.success && res.data?.customer) {
          setUser({ ...user, ...res.data.customer });
        }
      } catch (err) {
        // ignore errors silently for sync
      }
    }
    syncProfile();
  }, []);

  const API_DOMAIN = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3021";

  const openEdit = (field: 'name' | 'email') => {
    setEditField(field);
    setEditValue(field === 'name' ? (user?.name || '') : (user?.email || ''));
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) { showToast('This field cannot be empty', 'error'); return; }
    if (editField === 'email' && !editValue.includes('@')) { showToast('Enter a valid email', 'error'); return; }
    setEditLoading(true);
    try {
      const res = await api.patch('customer-auth/profile', { [editField]: editValue.trim() });
      const data = res.data;
      if (!data.success) { showToast(data.message || 'Failed to update', 'error'); setEditLoading(false); return; }
      setUser({ ...user, ...data.customer });
      showToast('Profile updated successfully', 'success');
      setEditModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Network error. Please try again.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const openPinModal = () => {
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setPinModal(true);
  };

  const savePin = async () => {
    if (currentPin.length < 4) { showToast('Enter your current 4-digit PIN', 'error'); return; }
    if (newPin.length < 4) { showToast('New PIN must be 4 digits', 'error'); return; }
    if (newPin !== confirmPin) { showToast('New PINs do not match', 'error'); return; }
    setPinLoading(true);
    try {
      const res = await api.post('customer-auth/change-pin', { mobile: user?.mobile, currentPin, newPin });
      const data = res.data;
      if (!data.success) { showToast(data.message || 'Failed to change PIN', 'error'); setPinLoading(false); return; }
      setPinModal(false);
      showToast('Your PIN has been changed successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Network error. Please try again.', 'error');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-row items-center p-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 mr-2 -ml-2 rounded-full active:bg-gray-100">
          <ChevronLeft className="w-6 h-6 text-[#0F172A]" />
        </button>
        <h1 className="text-[17px] font-bold text-[#0F172A] font-inter">My Profile</h1>
      </div>

      <div className="p-4 pt-6 pb-24">
        {/* Settings Card */}
        <div className="bg-white rounded-[14px] border border-[#E2E8F0] overflow-hidden">
          
          {/* Name */}
          <div 
            className="flex flex-row items-center px-4 py-4 cursor-pointer active:bg-gray-50 border-b border-[#F1F5F9]"
            onClick={() => openEdit('name')}
          >
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EEF2FF] flex items-center justify-center mr-3.5">
              <User className="w-4 h-4 text-[#5B43EE]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.4px] mb-0.5">Full Name</p>
              <p className="text-[15px] font-semibold text-[#0F172A]">{user?.name || '—'}</p>
            </div>
            <Pencil className="w-4 h-4 text-[#CBD5E1]" />
          </div>

          {/* Mobile (Read-only) */}
          <div className="flex flex-row items-center px-4 py-4 border-b border-[#F1F5F9]">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EEF2FF] flex items-center justify-center mr-3.5">
              <Phone className="w-4 h-4 text-[#5B43EE]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.4px] mb-0.5">Mobile Number</p>
              <p className="text-[15px] font-semibold text-[#0F172A]">{user?.mobile || '—'}</p>
            </div>
          </div>

          {/* Email */}
          <div 
            className="flex flex-row items-center px-4 py-4 cursor-pointer active:bg-gray-50 border-b border-[#F1F5F9]"
            onClick={() => openEdit('email')}
          >
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EEF2FF] flex items-center justify-center mr-3.5">
              <Mail className="w-4 h-4 text-[#5B43EE]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.4px] mb-0.5">Email Address</p>
              <p className="text-[15px] font-semibold text-[#0F172A]">{user?.email || '—'}</p>
            </div>
            <Pencil className="w-4 h-4 text-[#CBD5E1]" />
          </div>

          {/* PIN */}
          <div 
            className="flex flex-row items-center px-4 py-4 cursor-pointer active:bg-gray-50"
            onClick={openPinModal}
          >
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EEF2FF] flex items-center justify-center mr-3.5">
              <Lock className="w-4 h-4 text-[#5B43EE]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.4px] mb-0.5">PIN</p>
              <p className="text-[15px] font-semibold text-[#0F172A]">••••</p>
            </div>
            <span className="text-[12px] font-semibold text-[#5B43EE]">Change</span>
          </div>
        </div>
      </div>

      {/* Edit Name/Email Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-[20px] p-6 pb-8 animate-in slide-in-from-bottom-full duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[16px] font-bold text-[#0F172A]">
                {editField === 'name' ? 'Edit Name' : 'Edit Email'}
              </h3>
              <button onClick={() => setEditModal(false)} className="p-1 rounded-full active:bg-gray-100">
                <X className="w-5 h-5 text-[#94A3B8]" />
              </button>
            </div>
            
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-2">
              {editField === 'name' ? 'Full Name' : 'Email Address'}
            </p>
            <input
              type={editField === 'email' ? 'email' : 'text'}
              className="w-full h-12 px-4 border border-[#E2E8F0] rounded-[10px] text-[15px] font-medium text-[#0F172A] mb-5 outline-none focus:border-[#5B43EE]"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editField === 'name' ? 'Your name' : 'your@email.com'}
              autoFocus
            />

            <button
              onClick={saveEdit}
              disabled={editLoading}
              className="w-full h-12 bg-[#5B43EE] text-white rounded-[10px] font-semibold text-[15px] flex items-center justify-center disabled:opacity-70"
            >
              {editLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {pinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-[20px] p-6 pb-8 animate-in slide-in-from-bottom-full duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[16px] font-bold text-[#0F172A]">Change PIN</h3>
              <button onClick={() => setPinModal(false)} className="p-1 rounded-full active:bg-gray-100">
                <X className="w-5 h-5 text-[#94A3B8]" />
              </button>
            </div>
            
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-2">Current PIN</p>
            <div className="relative mb-4">
              <input
                type={showCurrent ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                className="w-full h-12 pl-4 pr-12 border border-[#E2E8F0] rounded-[10px] text-[15px] font-medium text-[#0F172A] tracking-[4px] outline-none focus:border-[#5B43EE]"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
              />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center">
                {showCurrent ? <EyeOff className="w-4 h-4 text-[#94A3B8]" /> : <Eye className="w-4 h-4 text-[#94A3B8]" />}
              </button>
            </div>

            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-2">New PIN</p>
            <div className="relative mb-4">
              <input
                type={showNew ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                className="w-full h-12 pl-4 pr-12 border border-[#E2E8F0] rounded-[10px] text-[15px] font-medium text-[#0F172A] tracking-[4px] outline-none focus:border-[#5B43EE]"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center">
                {showNew ? <EyeOff className="w-4 h-4 text-[#94A3B8]" /> : <Eye className="w-4 h-4 text-[#94A3B8]" />}
              </button>
            </div>

            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.4px] mb-2">Confirm New PIN</p>
            <div className="relative mb-6">
              <input
                type={showConfirm ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                className="w-full h-12 pl-4 pr-12 border border-[#E2E8F0] rounded-[10px] text-[15px] font-medium text-[#0F172A] tracking-[4px] outline-none focus:border-[#5B43EE]"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
              />
              <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center">
                {showConfirm ? <EyeOff className="w-4 h-4 text-[#94A3B8]" /> : <Eye className="w-4 h-4 text-[#94A3B8]" />}
              </button>
            </div>

            <button
              onClick={savePin}
              disabled={pinLoading}
              className="w-full h-12 bg-[#5B43EE] text-white rounded-[10px] font-semibold text-[15px] flex items-center justify-center disabled:opacity-70"
            >
              {pinLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Change PIN'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
