import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GameState,
  UserProfile,
  PetId,
  FoodLog,
  ExerciseLog,
  WeightLog,
  AccessoryItem,
} from './types';
import { loadGameState, saveGameState, resetGameState, DEFAULT_STUDENT_PROFILE } from './services/storage';
import { soundManager } from './services/sound';
import { PETS, calculateLevel } from './constants';

// Subcomponents
import { TopStatusBar } from './components/TopStatusBar';
import { PetDisplay } from './components/PetDisplay';
import { AdventureMap } from './components/AdventureMap';
import { FoodAnalyzerModal } from './components/FoodAnalyzerModal';
import { ExerciseModal } from './components/ExerciseModal';
import { WeightCheckInModal } from './components/WeightCheckInModal';
import { PetRoomModal } from './components/PetRoomModal';
import { RewardShopModal } from './components/RewardShopModal';
import { HealthProfileModal } from './components/HealthProfileModal';
import { AdventureBookModal } from './components/AdventureBookModal';
import { HealthMetricsCard } from './components/HealthMetricsCard';

import {
  Sparkles,
  Utensils,
  Activity,
  Scale,
  ShoppingBag,
  BookOpen,
  Heart,
  Smile,
  Compass,
} from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Modals state
  const [activeModal, setActiveModal] = useState<
    'food' | 'exercise' | 'weight' | 'petRoom' | 'shop' | 'profile' | 'book' | null
  >(null);

  // Dynamic pet reaction message when actions occur
  const [petReaction, setPetReaction] = useState<string | null>(null);

  // Encouraging toast alert
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    xpBonus?: number;
    coinsBonus?: number;
  } | null>(null);

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Cheerful university wellness quotes
  const studentTips = [
    '💡 อย่าลืมจิบน้ำระหว่างนั่งอ่านหนังสือนะ ร่างกายต้องการความชุ่มชื้นเสมอ!',
    '🌸 นอนหลับให้ครบ 7-8 ชั่วโมง คืออาวุธลับในการจำบทเรียนและความสดชื่น',
    '✨ การขยับตัวลุกยืดเส้นยืดสายแค่ 5 นาที ช่วยให้สมองปลอดโปร่งขึ้นเยอะเลย',
    '🥗 การดูแลสุขภาพคือการรักตัวเอง ไม่ใช่การลงโทษตัวเองนะ สู้ๆ!',
    '🌈 น้ำหนักที่ขึ้นลงเล็กน้อยในแต่ละวันเกิดจากปริมาณน้ำและอาหาร ไม่ต้องกังวลเลยนะ',
  ];
  const [dailyTip] = useState(() => studentTips[Math.floor(Math.random() * studentTips.length)]);

  const triggerReaction = (msg: string, durationMs = 4500) => {
    setPetReaction(msg);
    setTimeout(() => {
      setPetReaction(null);
    }, durationMs);
  };

  const showToast = (text: string, xpBonus?: number, coinsBonus?: number) => {
    setToastMessage({ text, xpBonus, coinsBonus });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add XP and Coins helper with Level-Up celebration
  const addRewards = (xpAmount: number, coinsAmount: number, reason: string) => {
    setGameState((prev) => {
      const newXp = prev.xp + xpAmount;
      const newLevel = calculateLevel(newXp);
      const newCoins = prev.coins + coinsAmount;

      if (newLevel > prev.level) {
        soundManager.playLevelUp();
        triggerReaction(`🎉 ไชโย! เลเวลอัปเป็น Lv.${newLevel} แล้ว! เก่งมากๆ เลย!`);
        showToast(`🎉 Level Up เป็น Lv.${newLevel}!`, xpAmount, coinsAmount);
      } else {
        soundManager.playCoin();
        triggerReaction(`✨ ${reason} ได้รับ +${xpAmount} XP และ +${coinsAmount} Coins!`);
        showToast(`✨ บันทึกสำเร็จ!`, xpAmount, coinsAmount);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        coins: newCoins,
      };
    });
  };

  // Food log save handler
  const handleSaveFoodLog = (logData: Omit<FoodLog, 'id' | 'timestamp'>) => {
    const newLog: FoodLog = {
      ...logData,
      id: `food-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setGameState((prev) => ({
      ...prev,
      foodLogs: [newLog, ...prev.foodLogs],
    }));

    addRewards(30, 15, 'บันทึกอาหารเรียบร้อย');
    triggerReaction(`🍱 อื้มมม อิ่มอร่อยและได้สารอาหารดีๆ พร้อมลุยต่อแล้ว!`);
  };

  // Exercise log save handler
  const handleSaveExercise = (logData: Omit<ExerciseLog, 'id'>) => {
    const newLog: ExerciseLog = {
      ...logData,
      id: `exercise-${Date.now()}`,
    };

    setGameState((prev) => ({
      ...prev,
      exerciseLogs: [newLog, ...prev.exerciseLogs],
    }));

    addRewards(40, 20, 'ออกกำลังกายสำเร็จ');
    triggerReaction(`🏃 สดชื่นและกระปรี้กระเปร่ามาก! ร่างกายแข็งแรงขึ้นอีกก้าวแล้ว!`);
  };

  // Weight log save handler (Never deducts XP!)
  const handleSaveWeight = (logData: Omit<WeightLog, 'id'>) => {
    const prevWeight =
      gameState.weightLogs.length > 0
        ? gameState.weightLogs[gameState.weightLogs.length - 1].weightKg
        : gameState.profile?.currentWeight || logData.weightKg;

    const newLog: WeightLog = {
      ...logData,
      id: `weight-${Date.now()}`,
    };

    const weightDecreased = logData.weightKg < prevWeight;

    setGameState((prev) => ({
      ...prev,
      weightLogs: [...prev.weightLogs, newLog],
      profile: prev.profile
        ? {
            ...prev.profile,
            startWeight: prev.profile.startWeight || prev.profile.currentWeight,
            currentWeight: logData.weightKg,
          }
        : null,
    }));

    addRewards(25, 10, 'เช็คอินน้ำหนักสำเร็จ');

    if (weightDecreased) {
      triggerReaction(`🎉 ไชโย! น้ำหนักลดลง เดินหน้าไปอีกก้าวแล้ว! ก้าวทีละ 1 โลสู่เป้าหมาย 🐾`);
    } else {
      triggerReaction(`⚖️ ขอบคุณที่ใส่ใจและรักสุขภาพนะ ไม่ว่าตัวเลขจะเป็นอย่างไร เราก็ยังก้าวไปด้วยกันเสมอ 🌸`);
    }
  };

  // Accessory buy & equip handlers
  const handleBuyAccessory = (item: AccessoryItem) => {
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...prev.inventory, item.id],
      equippedAccessoryId: item.id, // Auto-equip the newly purchased item
    }));
    triggerReaction(`🎀 ว้าว! ได้ ${item.name} มาใหม่แล้ว สวยน่ารักจังเลย!`);
  };

  const handleEquipAccessory = (id: string | null) => {
    setGameState((prev) => ({
      ...prev,
      equippedAccessoryId: id,
    }));
    if (id) {
      triggerReaction(`✨ แต่งตัวเสร็จแล้ว! น่ารักแบบนี้มีกำลังใจเต็มเปี่ยม`);
    }
  };

  // Switch pet handler
  const handleSelectPet = (petId: PetId) => {
    setGameState((prev) => ({
      ...prev,
      selectedPet: petId,
    }));
    triggerReaction(`ยินดีที่ได้ร่วมทางกันนะ! มาดูแลสุขภาพไปด้วยกันเถอะ ✨`);
  };

  // Profile update handler
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
    }));
    showToast('บันทึกข้อมูลส่วนตัวสำเร็จแล้ว');
  };

  // Reset all data handler
  const handleResetAllData = () => {
    resetGameState();
    setGameState(loadGameState());
    setActiveModal(null);
  };

  // User profile is always initialized with default student settings for instant game access
  const activeProfile = gameState.profile || DEFAULT_STUDENT_PROFILE;
  const currentPet = PETS[gameState.selectedPet] || PETS.rabbit;
  const startWeight =
    activeProfile.startWeight ||
    (gameState.weightLogs.length > 0
      ? gameState.weightLogs[0].weightKg
      : activeProfile.currentWeight);
  const currentWeight =
    gameState.weightLogs.length > 0
      ? gameState.weightLogs[gameState.weightLogs.length - 1].weightKg
      : activeProfile.currentWeight;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#F8F5FF] to-[#EBF5FF] text-slate-800 flex flex-col font-['Mali',sans-serif]">
      {/* Top Status Bar (Level, XP, Coins, Sound, Modals) */}
      <TopStatusBar
        level={gameState.level}
        xp={gameState.xp}
        coins={gameState.coins}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundManager.toggleSound(next);
        }}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenShop={() => setActiveModal('shop')}
        onOpenBook={() => setActiveModal('book')}
      />

      {/* Floating Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white/95 px-4 py-2 rounded-2xl shadow-lg border border-pink-200 text-xs font-extrabold text-slate-800 flex items-center gap-2"
          >
            <span>{toastMessage.text}</span>
            {toastMessage.xpBonus && (
              <span className="text-pink-600 font-black">+{toastMessage.xpBonus} XP</span>
            )}
            {toastMessage.coinsBonus && (
              <span className="text-amber-600 font-black">+{toastMessage.coinsBonus} Coins</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game World Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col gap-5">
        {/* Friendly University Tip Card */}
        <div className="bg-white/75 backdrop-blur-xs rounded-2xl p-3 border border-pink-100/80 shadow-2xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base flex-shrink-0">💬</span>
            <span className="truncate font-medium">{dailyTip}</span>
          </div>
          <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
            ทิปสุขภาพ
          </span>
        </div>

        {/* Hero Pet Stage Section */}
        <section className="relative bg-gradient-to-b from-white/90 via-pink-50/40 to-purple-50/50 rounded-3xl p-5 sm:p-7 border border-pink-100 shadow-sm flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle Background Scenery: cozy hills and trees */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-between items-end px-4 pb-2">
            <span className="text-5xl">🌳</span>
            <span className="text-4xl">🌷</span>
            <span className="text-6xl">🏡</span>
            <span className="text-4xl">🌸</span>
            <span className="text-5xl">🌲</span>
          </div>

          {/* Stepping Progress Tag: ลด 1 โล เดิน 1 ก้าว */}
          <div className="mb-2 z-10 flex items-center gap-2 bg-white/90 px-3.5 py-1 rounded-full border border-pink-200 shadow-2xs">
            <span className="text-sm">🐾</span>
            <span className="text-xs font-bold text-slate-700">
              {currentWeight <= activeProfile.targetWeight
                ? 'พิชิตปราสาทเป้าหมายแล้ว! 🏆'
                : startWeight > currentWeight
                ? `เดินมาแล้ว ${Math.floor(startWeight - currentWeight)} ก้าว (ลดได้ ${(startWeight - currentWeight).toFixed(1)} kg)`
                : 'จุดเริ่มต้น: ลด 1 โล เดิน 1 ก้าว!'}
            </span>
            <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full">
              เป้าหมาย {activeProfile.targetWeight} kg
            </span>
          </div>

          {/* Big Interactive Pet Graphic */}
          <div className="z-10 my-1">
            <PetDisplay
              petId={gameState.selectedPet}
              equippedAccessoryId={gameState.equippedAccessoryId}
              reactionMessage={
                petReaction ||
                `สวัสดีคุณ ${activeProfile.nickname}! วันนี้อยากทำอะไรด้วยกันดีนะ? 🌸`
              }
            />
          </div>

          {/* Quick interactive pet controls */}
          <div className="z-10 mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveModal('petRoom');
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Smile className="w-3.5 h-3.5 text-pink-500" />
              ห้องสัตว์เลี้ยง ({currentPet.name})
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveModal('shop');
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              แต่งตัว ({gameState.inventory.length} ชิ้น)
            </button>
          </div>
        </section>

        {/* Core Game Action Launcher Buttons (Cartoon-like & Rounded) */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* 1. AI Food Analyzer Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundManager.playPop();
              setActiveModal('food');
            }}
            className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-md shadow-pink-200 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-1.5 group-hover:rotate-6 transition-transform">
              🍱
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-tight">
              AI Food
            </span>
            <span className="text-[10px] text-pink-100 font-medium mt-0.5">
              พิมพ์/ถ่ายรูป
            </span>
            <span className="mt-1 text-[9px] font-bold px-2 py-0.5 bg-white/20 rounded-full">
              +30 XP ⭐
            </span>
          </motion.button>

          {/* 2. Exercise Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundManager.playPop();
              setActiveModal('exercise');
            }}
            className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white shadow-md shadow-purple-200 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-1.5 group-hover:scale-110 transition-transform">
              🏃
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-tight">
              ออกกำลังกาย
            </span>
            <span className="text-[10px] text-purple-100 font-medium mt-0.5">
              ขยับร่างกาย
            </span>
            <span className="mt-1 text-[9px] font-bold px-2 py-0.5 bg-white/20 rounded-full">
              +40 XP ⭐
            </span>
          </motion.button>

          {/* 3. Weight Check-In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundManager.playPop();
              setActiveModal('weight');
            }}
            className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-sky-400 to-teal-400 text-white shadow-md shadow-sky-200 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-1.5 group-hover:-rotate-6 transition-transform">
              ⚖️
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-tight">
              เช็คอินน้ำหนัก
            </span>
            <span className="text-[10px] text-sky-100 font-medium mt-0.5">
              เดินหน้าสู่ปราสาท
            </span>
            <span className="mt-1 text-[9px] font-bold px-2 py-0.5 bg-white/20 rounded-full">
              +25 XP ⭐
            </span>
          </motion.button>
        </section>

        {/* Health Metrics & Energy Balance: BMI, BMR, TDEE */}
        <HealthMetricsCard
          profile={activeProfile}
          currentWeight={currentWeight}
          onOpenDetailedProfile={() => setActiveModal('profile')}
        />

        {/* Weight Loss Stepping Trail: ลดน้ำหนัก 1 โล เดิน 1 ก้าว */}
        <section className="bg-white/80 backdrop-blur-xs rounded-3xl border border-pink-100 shadow-sm p-2 sm:p-4">
          <AdventureMap
            startWeight={startWeight}
            currentWeight={currentWeight}
            targetWeight={activeProfile.targetWeight}
            selectedPet={gameState.selectedPet}
            xp={gameState.xp}
            level={gameState.level}
            onOpenFoodModal={() => setActiveModal('food')}
            onOpenExerciseModal={() => setActiveModal('exercise')}
            onOpenWeightModal={() => setActiveModal('weight')}
          />
        </section>

        {/* Bottom Quick Navigation & Adventure Summary Bar */}
        <section className="bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 rounded-3xl p-4 border border-pink-100/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-xs">
              🏰
            </div>
            <div>
              <div className="font-extrabold text-slate-800">
                เป้าหมาย: ปราสาทน้ำหนัก {activeProfile.targetWeight} kg
              </div>
              <div className="text-[11px] text-slate-500">
                ปัจจุบัน {currentWeight} kg • บันทึกแล้ว{' '}
                {gameState.foodLogs.length} มื้อ, {gameState.exerciseLogs.length} กิจกรรม
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveModal('book');
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-purple-500" />
              สมุดผจญภัย
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveModal('profile');
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-pink-500" />
              โปรไฟล์สุขภาพ
            </button>
          </div>
        </section>
      </main>

      {/* Modals */}
      <FoodAnalyzerModal
        isOpen={activeModal === 'food'}
        onClose={() => setActiveModal(null)}
        onSaveFoodLog={handleSaveFoodLog}
      />

      <ExerciseModal
        isOpen={activeModal === 'exercise'}
        onClose={() => setActiveModal(null)}
        onSaveExercise={handleSaveExercise}
      />

      <WeightCheckInModal
        isOpen={activeModal === 'weight'}
        onClose={() => setActiveModal(null)}
        profile={activeProfile}
        weightLogs={gameState.weightLogs}
        onSaveWeight={handleSaveWeight}
      />

      <PetRoomModal
        isOpen={activeModal === 'petRoom'}
        onClose={() => setActiveModal(null)}
        selectedPet={gameState.selectedPet}
        equippedAccessoryId={gameState.equippedAccessoryId}
        onSelectPet={handleSelectPet}
      />

      <RewardShopModal
        isOpen={activeModal === 'shop'}
        onClose={() => setActiveModal(null)}
        coins={gameState.coins}
        inventory={gameState.inventory}
        equippedAccessoryId={gameState.equippedAccessoryId}
        onBuyAccessory={handleBuyAccessory}
        onEquipAccessory={handleEquipAccessory}
      />

      <HealthProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        profile={activeProfile}
        currentWeight={currentWeight}
        onUpdateProfile={handleUpdateProfile}
        onResetAllData={handleResetAllData}
      />

      <AdventureBookModal
        isOpen={activeModal === 'book'}
        onClose={() => setActiveModal(null)}
        gameState={gameState}
        onDeleteFoodLog={(id) => {
          setGameState((prev) => ({
            ...prev,
            foodLogs: prev.foodLogs.filter((l) => l.id !== id),
          }));
          showToast('ลบรายการอาหารเรียบร้อย');
        }}
        onDeleteExerciseLog={(id) => {
          setGameState((prev) => ({
            ...prev,
            exerciseLogs: prev.exerciseLogs.filter((l) => l.id !== id),
          }));
          showToast('ลบรายการออกกำลังกายเรียบร้อย');
        }}
        onDeleteWeightLog={(id) => {
          setGameState((prev) => ({
            ...prev,
            weightLogs: prev.weightLogs.filter((l) => l.id !== id),
          }));
          showToast('ลบรายการน้ำหนักเรียบร้อย');
        }}
        onUpdateFoodLog={(updated) => {
          setGameState((prev) => ({
            ...prev,
            foodLogs: prev.foodLogs.map((l) => (l.id === updated.id ? updated : l)),
          }));
          showToast('แก้ไขรายการอาหารเรียบร้อย');
        }}
        onImportGameState={(importedState) => {
          setGameState(importedState);
          saveGameState(importedState);
          showToast('กู้คืนข้อมูลผจญภัยสำเร็จแล้ว! ✨');
        }}
      />
    </div>
  );
}
