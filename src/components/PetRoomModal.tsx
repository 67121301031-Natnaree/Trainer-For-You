import React from 'react';
import { motion } from 'motion/react';
import { PetId } from '../types';
import { PETS } from '../constants';
import { PetDisplay } from './PetDisplay';
import { X, Sparkles, Check, Heart } from 'lucide-react';
import { soundManager } from '../services/sound';

interface PetRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPet: PetId;
  equippedAccessoryId: string | null;
  onSelectPet: (petId: PetId) => void;
}

export const PetRoomModal: React.FC<PetRoomModalProps> = ({
  isOpen,
  onClose,
  selectedPet,
  equippedAccessoryId,
  onSelectPet,
}) => {
  if (!isOpen) return null;

  const petKeys = Object.keys(PETS) as PetId[];
  const activePet = PETS[selectedPet];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-purple-100 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                ห้องสัตว์เลี้ยงคู่ใจ (Pet Room)
              </h2>
              <p className="text-xs text-pink-600 font-semibold">
                ทักทาย เล่นกับน้อง และเปลี่ยนเพื่อนร่วมผจญภัย
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 text-sm">
          {/* Main Pet Stage Display */}
          <div className="bg-gradient-to-b from-pink-50/80 to-purple-50/50 rounded-3xl p-4 border border-pink-100 flex flex-col items-center">
            <PetDisplay
              petId={selectedPet}
              equippedAccessoryId={equippedAccessoryId}
            />

            <div className="w-full max-w-md mt-3 bg-white/90 rounded-2xl p-3.5 border border-pink-100 text-center shadow-xs">
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                {activePet.description}
              </div>
              <div className="mt-2 text-xs font-bold text-pink-600 flex items-center justify-center gap-1">
                <span>ของโปรด:</span>
                <span className="text-slate-700">{activePet.favoriteFood}</span>
              </div>
            </div>
          </div>

          {/* All 8 Pets Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                เลือกสัตว์เลี้ยงตัวอื่น:
              </span>
              <span className="text-[11px] text-slate-400">
                สลับเพื่อนคู่ใจได้ตลอดเวลา
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {petKeys.map((key) => {
                const p = PETS[key];
                const isCurrent = selectedPet === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      soundManager.playPurr();
                      onSelectPet(key);
                    }}
                    className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                      isCurrent
                        ? 'bg-pink-50/90 border-pink-400 ring-2 ring-pink-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {p.thaiName.split(' ')[0]}
                      </div>
                    </div>
                    {isCurrent && (
                      <Check className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pet Care Tip */}
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center gap-2 text-xs text-purple-700">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span>
              แตะที่ตัวสัตว์เลี้ยงในหน้าหลัก เพื่อเล่นกับน้องและรับพลังบวกได้ตลอดเวลานะ!
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
          >
            เรียบร้อย ออกไปผจญภัยกันต่อ!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
