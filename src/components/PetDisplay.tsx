import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetId } from '../types';
import { PETS, ACCESSORIES } from '../constants';
import { soundManager } from '../services/sound';
import { Sparkles, Heart } from 'lucide-react';

interface PetDisplayProps {
  petId: PetId;
  equippedAccessoryId: string | null;
  reactionMessage?: string | null;
  onPetClick?: () => void;
  onOpenDailyLog?: () => void;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({
  petId,
  equippedAccessoryId,
  reactionMessage,
  onPetClick,
  onOpenDailyLog,
}) => {
  const pet = PETS[petId] || PETS.rabbit;
  const accessory = ACCESSORIES.find((a) => a.id === equippedAccessoryId);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const currentSpeech =
    reactionMessage || pet.quotes[quoteIdx % pet.quotes.length];

  const handleTap = (e: React.MouseEvent) => {
    soundManager.playPurr();
    setQuoteIdx((prev) => prev + 1);

    // Add floating heart
    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -20 - Math.random() * 20,
    };
    setHearts((prev) => [...prev.slice(-4), newHeart]);

    if (onPetClick) {
      onPetClick();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Speech Bubble */}
      <motion.div
        key={currentSpeech}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative mb-3 max-w-[280px] sm:max-w-xs px-4 py-2.5 bg-white/95 rounded-2xl shadow-sm border border-pink-100 text-slate-700 text-sm sm:text-base font-medium text-center backdrop-blur-sm"
      >
        <span className="text-pink-500 font-bold mr-1">“</span>
        {currentSpeech}
        <span className="text-pink-500 font-bold ml-1">”</span>

        {/* Speech triangle */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
      </motion.div>

      {/* Pet Interactive Container */}
      <div className="relative cursor-pointer group" onClick={handleTap}>
        {/* Floating Heart Particles */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.6, x: h.x, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, y: -90, x: h.x * 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/4 pointer-events-none z-30"
            >
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400 drop-shadow-sm" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pet Platform Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-10 bg-gradient-to-r from-pink-300/40 via-purple-300/50 to-sky-300/40 rounded-[100%] blur-md pointer-events-none" />

        {/* Pet Body Animation with Big Pure Emoji */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9, y: -15 }}
          className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center select-none"
        >
          {/* Big Emoji Pet Display */}
          <span
            className="text-8xl sm:text-9xl leading-none filter drop-shadow-xl transition-transform"
            role="img"
            aria-label={pet.name}
          >
            {pet.emoji}
          </span>

          {/* Equipped Accessory Overlay */}
          {accessory && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute pointer-events-none drop-shadow-md text-3xl sm:text-4xl"
              style={{
                top: accessory.category === 'head' ? '6%' : accessory.category === 'face' ? '30%' : '65%',
                right: accessory.category === 'head' ? '18%' : accessory.category === 'face' ? '14%' : '20%',
              }}
            >
              {accessory.emoji}
            </motion.div>
          )}

          {/* Sparkle click hint */}
          <div className="absolute -top-1 -right-1 bg-white/95 p-1.5 rounded-full shadow-md border border-pink-200 opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Notebook & Pencil Quick Button beside pet (Bottom Corner) */}
        {onOpenDailyLog && (
          <motion.button
            whileHover={{ scale: 1.15, rotate: 6 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playPop();
              onOpenDailyLog();
            }}
            title="บันทึกประจำวัน (จดบันทึกด่วน)"
            className="absolute -bottom-2 -right-4 sm:-right-8 z-30 bg-white/95 hover:bg-pink-50 p-2.5 sm:p-3 rounded-2xl shadow-md border-2 border-pink-200 text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="text-xl sm:text-2xl leading-none">📝</span>
            <span className="hidden sm:inline text-[11px] font-black text-pink-600 pl-1">
              บันทึกประจำวัน
            </span>
          </motion.button>
        )}
      </div>

      {/* Pet Title Badge */}
      <div className="mt-2 flex flex-col items-center">
        <span className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
          {pet.name}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-600 font-bold border border-pink-200 shadow-2xs">
            {pet.emoji} {pet.thaiName.split(' ')[0]}
          </span>
        </span>
        <span className="text-xs text-slate-500 font-semibold">{pet.title}</span>
      </div>
    </div>
  );
};
