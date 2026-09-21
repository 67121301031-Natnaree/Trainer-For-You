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
}

export const PetDisplay: React.FC<PetDisplayProps> = ({
  petId,
  equippedAccessoryId,
  reactionMessage,
  onPetClick,
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
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-44 h-8 bg-gradient-to-r from-pink-200/40 via-purple-200/50 to-sky-200/40 rounded-[100%] blur-sm pointer-events-none" />

        {/* Pet Body Animation */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, y: -12 }}
          className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center p-2"
        >
          {/* Render Vector Cartoon Character */}
          <PetGraphic petId={petId} />

          {/* Equipped Accessory Overlay */}
          {accessory && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute pointer-events-none drop-shadow-md text-3xl sm:text-4xl"
              style={{
                top: accessory.category === 'head' ? '6%' : accessory.category === 'face' ? '30%' : '65%',
                right: accessory.category === 'head' ? '24%' : accessory.category === 'face' ? '18%' : '30%',
              }}
            >
              {accessory.emoji}
            </motion.div>
          )}

          {/* Sparkle click hint */}
          <div className="absolute -top-1 -right-1 bg-white/90 p-1.5 rounded-full shadow-sm border border-pink-100 opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Pet Title Badge */}
      <div className="mt-1 flex flex-col items-center">
        <span className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-1.5">
          {pet.name} <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-semibold">{pet.emoji}</span>
        </span>
        <span className="text-xs text-slate-500 font-medium">{pet.title}</span>
      </div>
    </div>
  );
};

// High-fidelity, cute SVG graphics for all 8 pets
const PetGraphic: React.FC<{ petId: PetId }> = ({ petId }) => {
  switch (petId) {
    case 'rabbit':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Rabbit Ears */}
          <ellipse cx="60" cy="40" rx="14" ry="34" fill="#FFFFFF" stroke="#F472B6" strokeWidth="4" />
          <ellipse cx="60" cy="40" rx="7" ry="22" fill="#FCE7F3" />
          <ellipse cx="100" cy="40" rx="14" ry="34" fill="#FFFFFF" stroke="#F472B6" strokeWidth="4" />
          <ellipse cx="100" cy="40" rx="7" ry="22" fill="#FCE7F3" />
          {/* Head */}
          <circle cx="80" cy="95" r="46" fill="#FFFFFF" stroke="#F472B6" strokeWidth="4" />
          {/* Cheeks */}
          <circle cx="56" cy="104" r="8" fill="#FBCFE8" opacity="0.8" />
          <circle cx="104" cy="104" r="8" fill="#FBCFE8" opacity="0.8" />
          {/* Eyes with sparkle */}
          <circle cx="64" cy="90" r="5.5" fill="#334155" />
          <circle cx="66" cy="88" r="2" fill="#FFFFFF" />
          <circle cx="96" cy="90" r="5.5" fill="#334155" />
          <circle cx="98" cy="88" r="2" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <polygon points="80,98 76,95 84,95" fill="#F472B6" />
          <path d="M76 102 Q80 106 84 102" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Paws */}
          <ellipse cx="65" cy="135" rx="9" ry="6" fill="#FFFFFF" stroke="#F472B6" strokeWidth="3" />
          <ellipse cx="95" cy="135" rx="9" ry="6" fill="#FFFFFF" stroke="#F472B6" strokeWidth="3" />
        </svg>
      );
    case 'cat':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Cat Ears */}
          <polygon points="45,65 52,25 78,50" fill="#FED7AA" stroke="#FB923C" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="51,55 56,33 72,48" fill="#FFEDD5" />
          <polygon points="115,65 108,25 82,50" fill="#FED7AA" stroke="#FB923C" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="109,55 104,33 88,48" fill="#FFEDD5" />
          {/* Head */}
          <circle cx="80" cy="95" r="46" fill="#FFF7ED" stroke="#FB923C" strokeWidth="4" />
          {/* Cheeks */}
          <circle cx="56" cy="104" r="7" fill="#FDE68A" opacity="0.9" />
          <circle cx="104" cy="104" r="7" fill="#FDE68A" opacity="0.9" />
          {/* Eyes */}
          <ellipse cx="64" cy="90" rx="5" ry="6" fill="#1E293B" />
          <circle cx="66" cy="88" r="2" fill="#FFFFFF" />
          <ellipse cx="96" cy="90" rx="5" ry="6" fill="#1E293B" />
          <circle cx="98" cy="88" r="2" fill="#FFFFFF" />
          {/* Whiskers */}
          <line x1="42" y1="96" x2="54" y2="98" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="105" x2="52" y2="104" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="118" y1="96" x2="106" y2="98" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="120" y1="105" x2="108" y2="104" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Nose & Mouth */}
          <polygon points="80,98 77,95 83,95" fill="#F87171" />
          <path d="M75 101 Q80 105 85 101" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'dog':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Dog Droopy Ears */}
          <ellipse cx="44" cy="85" rx="14" ry="28" fill="#FDE047" stroke="#CA8A04" strokeWidth="3.5" transform="rotate(20 44 85)" />
          <ellipse cx="116" cy="85" rx="14" ry="28" fill="#FDE047" stroke="#CA8A04" strokeWidth="3.5" transform="rotate(-20 116 85)" />
          {/* Head */}
          <circle cx="80" cy="92" r="44" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="4" />
          {/* Cheeks */}
          <circle cx="56" cy="102" r="7.5" fill="#FBCFE8" opacity="0.85" />
          <circle cx="104" cy="102" r="7.5" fill="#FBCFE8" opacity="0.85" />
          {/* Eyes */}
          <circle cx="64" cy="87" r="5" fill="#1E293B" />
          <circle cx="66" cy="85" r="2" fill="#FFFFFF" />
          <circle cx="96" cy="87" r="5" fill="#1E293B" />
          <circle cx="98" cy="85" r="2" fill="#FFFFFF" />
          {/* Nose & Tongue */}
          <ellipse cx="80" cy="97" rx="7" ry="5" fill="#1E293B" />
          <path d="M78 102 C 78 111, 82 111, 82 102" fill="#F43F5E" />
          <path d="M74 100 Q80 104 86 100" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'panda':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Panda Round Black Ears */}
          <circle cx="46" cy="54" r="16" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          <circle cx="114" cy="54" r="16" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          {/* Head */}
          <circle cx="80" cy="95" r="46" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
          {/* Eye Patches */}
          <ellipse cx="62" cy="90" rx="11" ry="14" fill="#1E293B" transform="rotate(-15 62 90)" />
          <ellipse cx="98" cy="90" rx="11" ry="14" fill="#1E293B" transform="rotate(15 98 90)" />
          {/* Eyes */}
          <circle cx="63" cy="88" r="4" fill="#FFFFFF" />
          <circle cx="63" cy="88" r="2" fill="#0F172A" />
          <circle cx="97" cy="88" r="4" fill="#FFFFFF" />
          <circle cx="97" cy="88" r="2" fill="#0F172A" />
          {/* Cheeks */}
          <circle cx="50" cy="107" r="7" fill="#FBCFE8" opacity="0.9" />
          <circle cx="110" cy="107" r="7" fill="#FBCFE8" opacity="0.9" />
          {/* Nose & Mouth */}
          <ellipse cx="80" cy="100" rx="6" ry="4" fill="#1E293B" />
          <path d="M76 104 Q80 108 84 104" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'fox':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Fox Pointy Ears */}
          <polygon points="40,65 48,22 80,48" fill="#F97316" stroke="#C2410C" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="46,55 52,32 74,47" fill="#334155" />
          <polygon points="120,65 112,22 80,48" fill="#F97316" stroke="#C2410C" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="114,55 108,32 86,47" fill="#334155" />
          {/* Head */}
          <circle cx="80" cy="94" r="45" fill="#FB923C" stroke="#C2410C" strokeWidth="4" />
          {/* White muzzle cheeks */}
          <path d="M42 98 Q80 140 118 98 Q80 115 42 98 Z" fill="#FFFFFF" />
          {/* Eyes */}
          <ellipse cx="63" cy="88" rx="5" ry="5.5" fill="#1E293B" />
          <circle cx="65" cy="86" r="2" fill="#FFFFFF" />
          <ellipse cx="97" cy="88" rx="5" ry="5.5" fill="#1E293B" />
          <circle cx="99" cy="86" r="2" fill="#FFFFFF" />
          {/* Nose */}
          <polygon points="80,105 76,101 84,101" fill="#1E293B" />
          <path d="M77 108 Q80 112 83 108" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'bear':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Bear Round Ears */}
          <circle cx="48" cy="55" r="15" fill="#B45309" stroke="#78350F" strokeWidth="3.5" />
          <circle cx="48" cy="55" r="8" fill="#FDE68A" />
          <circle cx="112" cy="55" r="15" fill="#B45309" stroke="#78350F" strokeWidth="3.5" />
          <circle cx="112" cy="55" r="8" fill="#FDE68A" />
          {/* Head */}
          <circle cx="80" cy="95" r="45" fill="#D97706" stroke="#78350F" strokeWidth="4" />
          {/* Muzzle */}
          <ellipse cx="80" cy="103" rx="20" ry="15" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="52" cy="102" r="7" fill="#FBCFE8" opacity="0.8" />
          <circle cx="108" cy="102" r="7" fill="#FBCFE8" opacity="0.8" />
          {/* Eyes */}
          <circle cx="64" cy="87" r="5" fill="#1E293B" />
          <circle cx="66" cy="85" r="2" fill="#FFFFFF" />
          <circle cx="96" cy="87" r="5" fill="#1E293B" />
          <circle cx="98" cy="85" r="2" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <ellipse cx="80" cy="98" rx="6.5" ry="4.5" fill="#1E293B" />
          <path d="M76 104 Q80 108 84 104" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'koala':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Koala Fluffy Ears */}
          <circle cx="42" cy="62" r="20" fill="#94A3B8" stroke="#64748B" strokeWidth="3.5" />
          <circle cx="42" cy="62" r="12" fill="#F1F5F9" />
          <circle cx="118" cy="62" r="20" fill="#94A3B8" stroke="#64748B" strokeWidth="3.5" />
          <circle cx="118" cy="62" r="12" fill="#F1F5F9" />
          {/* Head */}
          <circle cx="80" cy="95" r="44" fill="#CBD5E1" stroke="#64748B" strokeWidth="4" />
          {/* Cheeks */}
          <circle cx="54" cy="104" r="7.5" fill="#FBCFE8" opacity="0.85" />
          <circle cx="106" cy="104" r="7.5" fill="#FBCFE8" opacity="0.85" />
          {/* Eyes */}
          <circle cx="63" cy="88" r="5" fill="#1E293B" />
          <circle cx="65" cy="86" r="2" fill="#FFFFFF" />
          <circle cx="97" cy="88" r="5" fill="#1E293B" />
          <circle cx="99" cy="86" r="2" fill="#FFFFFF" />
          {/* Big Koala Dark Nose */}
          <ellipse cx="80" cy="98" rx="10" ry="15" fill="#334155" />
          <ellipse cx="78" cy="93" rx="3" ry="5" fill="#64748B" opacity="0.6" />
          <path d="M76 116 Q80 120 84 116" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'hamster':
      return (
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
          {/* Hamster Cute Little Ears */}
          <ellipse cx="50" cy="56" rx="12" ry="14" fill="#FDBA74" stroke="#EA580C" strokeWidth="3" />
          <ellipse cx="50" cy="56" rx="6" ry="8" fill="#FFEDD5" />
          <ellipse cx="110" cy="56" rx="12" ry="14" fill="#FDBA74" stroke="#EA580C" strokeWidth="3" />
          <ellipse cx="110" cy="56" rx="6" ry="8" fill="#FFEDD5" />
          {/* Head with Chubby Cheeks */}
          <ellipse cx="80" cy="98" rx="48" ry="42" fill="#FED7AA" stroke="#EA580C" strokeWidth="4" />
          {/* Chubby Cheek Highlights */}
          <circle cx="48" cy="106" r="10" fill="#FBCFE8" opacity="0.9" />
          <circle cx="112" cy="106" r="10" fill="#FBCFE8" opacity="0.9" />
          {/* White Tummy/Mouth area */}
          <ellipse cx="80" cy="108" rx="20" ry="14" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="62" cy="88" r="5.5" fill="#1E293B" />
          <circle cx="64" cy="86" r="2.5" fill="#FFFFFF" />
          <circle cx="98" cy="88" r="5.5" fill="#1E293B" />
          <circle cx="100" cy="86" r="2.5" fill="#FFFFFF" />
          {/* Tiny Nose & Mouth */}
          <polygon points="80,102 77,99 83,99" fill="#F43F5E" />
          <path d="M76 106 Q80 110 84 106" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sunflower seed in paws */}
          <ellipse cx="80" cy="126" rx="6" ry="9" fill="#92400E" transform="rotate(15 80 126)" />
          <circle cx="70" cy="125" r="5.5" fill="#FED7AA" stroke="#EA580C" strokeWidth="2" />
          <circle cx="90" cy="125" r="5.5" fill="#FED7AA" stroke="#EA580C" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};
