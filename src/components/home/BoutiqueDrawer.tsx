import { useState, useMemo } from 'react';
import { X, Search, MapPin } from 'lucide-react';
import { useBoutiquesStore, Boutique } from '@/store/boutiquesStore';

interface BoutiqueDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function BoutiqueDrawer({ open, onClose }: BoutiqueDrawerProps) {
  const { boutiques, selectedBoutiqueId, setSelectedBoutiqueId } = useBoutiquesStore();
  const [search, setSearch] = useState('');

  const filteredBoutiques = useMemo(() => {
    const s = search.toLowerCase();
    const filtered = boutiques.filter((b) => 
      (b.boutique_name && b.boutique_name.toLowerCase().includes(s)) ||
      (b.city_name && b.city_name.toLowerCase().includes(s))
    );
    
    return filtered.sort((a, b) => {
      if (a.id === selectedBoutiqueId) return -1;
      if (b.id === selectedBoutiqueId) return 1;
      return 0;
    });
  }, [boutiques, search, selectedBoutiqueId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-full bg-white rounded-t-3xl shadow-xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <h2 className="text-[18px] font-bold text-[#0F172A] font-inter">Select Boutique</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by boutique or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#4F46E5] transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-10">
          {!search && (
            <div className="mb-2">
              <button
                onClick={() => {
                  setSelectedBoutiqueId(null);
                  onClose();
                }}
                className={`w-full flex items-center py-4 text-left transition-colors ${
                  selectedBoutiqueId === null ? 'bg-indigo-50/50 rounded-xl px-2' : 'px-2'
                }`}
              >
                <div className="flex-1">
                  <p className={`text-[15px] font-bold font-inter ${selectedBoutiqueId === null ? 'text-[#4F46E5]' : 'text-[#0F172A]'}`}>
                    All Boutiques
                  </p>
                  <div className="flex items-center mt-1 text-gray-500">
                    <p className="text-[13px] font-inter">View products from all boutiques</p>
                  </div>
                </div>
              </button>
              {filteredBoutiques.length > 0 && (
                <div className="h-[1px] bg-gray-100 w-full ml-2 my-1" />
              )}
            </div>
          )}
          {filteredBoutiques.length > 0 ? (
            filteredBoutiques.map((boutique, index) => {
              const isSelected = selectedBoutiqueId === boutique.id;
              return (
                <div key={boutique.id}>
                  <button
                    onClick={() => {
                      setSelectedBoutiqueId(boutique.id);
                      onClose();
                    }}
                    className={`w-full flex items-center py-4 text-left transition-colors ${
                      isSelected ? 'bg-indigo-50/50 rounded-xl px-2' : 'px-2'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-[15px] font-bold font-inter ${isSelected ? 'text-[#4F46E5]' : 'text-[#0F172A]'}`}>
                        {boutique.boutique_name}
                      </p>
                      <div className="flex items-center mt-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <p className="text-[13px] font-inter">
                          {boutique.city_name ? boutique.city_name : 'No City'} 
                          {boutique.address && ` • ${boutique.address}`}
                        </p>
                      </div>
                    </div>
                  </button>
                  {index < filteredBoutiques.length - 1 && (
                    <div className="h-[1px] bg-gray-100 w-full ml-2" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm font-medium">No boutiques found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
