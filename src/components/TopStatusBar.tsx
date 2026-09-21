import React from 'react';
import { Sparkles, Trophy, Coins, Volume2, VolumeX, User, BookOpen, ShoppingBag } from 'lucide-react';
import { soundManager } from '../services/sound';

interface TopStatusBarProps {
  level: number;
  xp: number;
  coins: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenBook: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  level,
  xp,
  coins,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
  onOpenShop,
  onOpenBook,
}) => {
  // Current progress in this level (0-99)
  const currentLevelXp = xp % 100;
  const nextLevelXp = 100;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXp / nextLevelXp) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm px-3 sm:px-6 py-2.5">
      <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        {/* Title & Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="tulip">🌷</span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 bg-clip-text text-transparent leading-none">
                Trainer For You
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">
                Cozy Health Adventure
              </p>
            </div>
          </div>

          {/* Mobile Right action shortcuts */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenShop();
              }}
              className="p-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
              title="ร้านรางวัล"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenBook();
              }}
              className="p-1.5 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              title="สมุดบันทึก"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenProfile();
              }}
              className="p-1.5 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
              title="โปรไฟล์สุขภาพ"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Game Stats & Currency */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          {/* Level & XP bar */}
          <div className="flex items-center gap-2 bg-pink-50/80 px-2.5 py-1.5 rounded-2xl border border-pink-100 flex-1 sm:flex-initial">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-xs sm:text-sm font-extrabold text-pink-600">
                Lv.{level}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="flex flex-col gap-0.5 min-w-[75px] sm:min-w-[110px]">
              <div className="w-full h-2.5 bg-pink-200/60 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-pink-500 font-bold px-0.5">
                <span>⭐ {currentLevelXp}/100 XP</span>
                <span>รวม {xp}</span>
              </div>
            </div>
          </div>

          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-2xl border border-amber-200/70 shadow-xs">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-xs sm:text-sm font-black text-amber-700">
              {coins}
            </span>
          </div>

          {/* Desktop quick links */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenShop();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-100/70 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-all shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              ร้านรางวัล
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenBook();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-purple-100/70 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              สมุดผจญภัย
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenProfile();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-pink-100/70 hover:bg-pink-200 text-pink-800 text-xs font-bold transition-all shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-pink-600" />
              โปรไฟล์
            </button>
            <button
              onClick={onToggleSound}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
