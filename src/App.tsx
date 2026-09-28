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
  GoalPlan,
  MealPlanDay,
} from './types';
import {
  loadGameState,
  saveGameState,
  resetGameState,
  DEFAULT_STUDENT_PROFILE,
  DEFAULT_WEEKLY_MEAL_PLAN,
} from './services/storage';
import { soundManager } from './services/sound';
import { estimateCaloriesFromText } from './services/calorieEstimator';
import { estimateExerciseBurnFromText } from './services/exerciseDatabase';
import {
  PETS,
  calculateLevel,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieRange,
} from './constants';

// Subcomponents
import { TopStatusBar } from './components/TopStatusBar';
import { PetDisplay } from './components/PetDisplay';
import { AdventureMap } from './components/AdventureMap';
import { DailyLogSection } from './components/DailyLogSection';
import { FoodAnalyzerModal } from './components/FoodAnalyzerModal';
import { ExerciseModal } from './components/ExerciseModal';
import { WeightCheckInModal } from './components/WeightCheckInModal';
import { PetRoomModal } from './components/PetRoomModal';
import { RewardShopModal } from './components/RewardShopModal';
import { HealthProfileModal } from './components/HealthProfileModal';
import { AdventureBookModal } from './components/AdventureBookModal';
import { HealthMetricsCard } from './components/HealthMetricsCard';
import { WelcomeScreen } from './components/WelcomeScreen';

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

  // Main 3 Menu Tabs: 1. โปรไฟล์สัตว์เลี้ยง, 2. เกม (เส้นทางก้าวเดิน), 3. บันทึกประจำวัน
  const [activeTab, setActiveTab] = useState<'petProfile' | 'game' | 'dailyLog'>('petProfile');

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

  // Start Adventure from Welcome Form Screen
  const handleStartAdventure = (newProfile: UserProfile, petId: PetId) => {
    setGameState((prev) => {
      const existingWeightLogs = prev.weightLogs || [];
      const hasInitialWeight = existingWeightLogs.some(
        (w) => w.weightKg === newProfile.currentWeight
      );
      const newWeightLog: WeightLog = {
        id: `weight-start-${Date.now()}`,
        timestamp: new Date().toISOString(),
        weightKg: newProfile.currentWeight,
        note: 'น้ำหนักเริ่มต้นการเดินทางผจญภัยสุขภาพ 🌸',
      };

      return {
        ...prev,
        profile: newProfile,
        selectedPet: petId,
        hasSeenWelcome: true,
        weightLogs: hasInitialWeight ? existingWeightLogs : [newWeightLog, ...existingWeightLogs],
      };
    });

    triggerReaction(
      `🎉 ยินดีต้อนรับคุณ ${newProfile.nickname}! มาร่วมผจญภัยดูแลสุขภาพสู่เป้าหมาย ${newProfile.targetWeight} kg ไปด้วยกันนะ ✨`
    );
    showToast(`ยินดีต้อนรับคุณ ${newProfile.nickname}! เริ่มต้นการผจญภัยแล้ว 🌸`);
  };

  // Reset all data handler
  const handleResetAllData = () => {
    resetGameState();
    setGameState(loadGameState());
    setActiveModal(null);
  };

  // Plan handlers
  const handleAddPlan = (planData: Omit<GoalPlan, 'id' | 'isCompleted'>) => {
    const newPlan: GoalPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      isCompleted: false,
    };

    setGameState((prev) => ({
      ...prev,
      plans: [newPlan, ...(prev.plans || [])],
    }));

    addRewards(10, 5, 'วางแผนเป้าหมายสำเร็จ');
    triggerReaction(`🎯 ตั้งเป้าหมายใหม่แล้ว! มาพยายามทำตามเป้าไปด้วยกันนะ ✨`);
  };

  const handleDeletePlan = (id: string) => {
    setGameState((prev) => ({
      ...prev,
      plans: (prev.plans || []).filter((p) => p.id !== id),
    }));
  };

  const handleUpdatePlanPhoto = (id: string, imageUrl: string) => {
    setGameState((prev) => ({
      ...prev,
      plans: (prev.plans || []).map((p) => (p.id === id ? { ...p, imageUrl } : p)),
    }));
    soundManager.playLevelUp();
    addRewards(15, 10, 'แนบรูปยืนยันเป้าหมาย');
    triggerReaction(`📸 ถ่ายรูปยืนยันเป้าหมายสำเร็จแล้ว! รับโบนัส +15 XP, +10 🪙 ✨`);
    showToast('แนบรูปยืนยันเป้าหมายสำเร็จ (+15 XP, +10 🪙)', 15, 10);
  };

  const handleUpdateWeeklyMealPlan = (updatedPlan: MealPlanDay[]) => {
    setGameState((prev) => ({
      ...prev,
      weeklyMealPlan: updatedPlan,
    }));
  };

  const handleUploadWeeklyMealPhoto = (
    dayIndex: number,
    imageUrl: string,
    note?: string,
    confirmationType: 'food' | 'exercise' | 'auto' = 'auto',
    mealTypeOption?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    customCalories?: number,
    customMinutes?: number
  ) => {
    const currentPlan = gameState.weeklyMealPlan || DEFAULT_WEEKLY_MEAL_PLAN;
    const day = currentPlan.find((d) => d.dayIndex === dayIndex);
    const dayName = day ? day.dayName : '';
    const nowIso = new Date().toISOString();
    const trimmedNote = note?.trim() || '';

    // Auto-detect whether this is food or exercise if type is 'auto'
    const noteLower = trimmedNote.toLowerCase();
    const isExerciseLikely =
      confirmationType === 'exercise' ||
      (confirmationType === 'auto' &&
        (noteLower.includes('วิ่ง') ||
          noteLower.includes('เดิน') ||
          noteLower.includes('คาร์ดิโอ') ||
          noteLower.includes('เวท') ||
          noteLower.includes('ฟิตเนส') ||
          noteLower.includes('ออกกำลัง') ||
          noteLower.includes('exercise') ||
          noteLower.includes('เต้น') ||
          noteLower.includes('ปั่นจักรยาน') ||
          noteLower.includes('โยคะ') ||
          noteLower.includes('กระโดดเชือก') ||
          (!trimmedNote && !!day?.exercise && !day?.lunch && !day?.breakfast)));

    const recordType: 'food' | 'exercise' = isExerciseLikely ? 'exercise' : 'food';

    setGameState((prev) => {
      // Calculate calories for food or exercise
      let caloriesVal = 0;
      let durationMins = 30;

      if (recordType === 'exercise') {
        const exerciseText = trimmedNote || day?.exercise?.trim() || `ออกกำลังกายวัน${dayName}`;
        const estEx = estimateExerciseBurnFromText(exerciseText, currentWeight) || {
          activityName: exerciseText,
          calories: Math.round(5.0 * currentWeight * 0.5),
          minutes: 30,
          emoji: '🏃',
        };
        caloriesVal = customCalories || estEx.calories;
        durationMins = customMinutes || estEx.minutes;
      } else {
        const foodTitle = trimmedNote || day?.lunch || day?.breakfast || day?.dinner || `อาหารวัน${dayName}`;
        caloriesVal = customCalories || estimateCaloriesFromText(foodTitle) || 350;
      }

      // Create new confirmation entry for history
      const newConfirmationId = `confirm-${dayIndex}-${Date.now()}`;
      const newConfirmationEntry = {
        id: newConfirmationId,
        type: recordType,
        imageUrl,
        note: trimmedNote || (recordType === 'exercise' ? `ออกกำลังกายวัน${dayName}` : `อาหารวัน${dayName}`),
        confirmedAt: nowIso,
        mealType: mealTypeOption || (recordType === 'food' ? 'lunch' : undefined),
        calories: caloriesVal,
        durationMinutes: recordType === 'exercise' ? durationMins : undefined,
      };

      const updatedPlan = (prev.weeklyMealPlan || DEFAULT_WEEKLY_MEAL_PLAN).map((d) => {
        if (d.dayIndex === dayIndex) {
          const prevConfirmations = d.confirmations || [];
          return {
            ...d,
            photoUrl: imageUrl,
            photoNote: trimmedNote || d.photoNote || `ยืนยันว่าทำตามแผนวัน${d.dayName}`,
            photoConfirmedAt: nowIso,
            confirmations: [newConfirmationEntry, ...prevConfirmations],
          };
        }
        return d;
      });

      // Synchronize directly into today's Food Log or Exercise Log (counting up top!)
      let newFoodLogs = [...prev.foodLogs];
      let newExerciseLogs = [...prev.exerciseLogs];

      if (recordType === 'exercise') {
        const exerciseTitle = trimmedNote || day?.exercise?.trim() || `ออกกำลังกายวัน${dayName}`;
        const newExLog: ExerciseLog = {
          id: `proof-ex-${Date.now()}`,
          timestamp: nowIso,
          activityName: `${exerciseTitle} (ยืนยันภารกิจวัน${dayName})`,
          durationMinutes: durationMins,
          intensity: 'moderate',
          estimatedCaloriesBurned: caloriesVal,
          notes: `ถ่ายรูปยืนยันภารกิจ 7 วัน (${dayName})`,
          imageUrl,
          sourceKey: `7day-proof-ex-${dayIndex}-${Date.now()}`,
        };
        newExerciseLogs = [newExLog, ...newExerciseLogs];
      } else {
        const foodTitle = trimmedNote || day?.lunch || day?.breakfast || day?.dinner || `มื้ออาหารวัน${dayName}`;
        const protein = Math.round((caloriesVal * 0.15) / 4);
        const carbs = Math.round((caloriesVal * 0.6) / 4);
        const fat = Math.round((caloriesVal * 0.25) / 9);

        const newFoodLog: FoodLog = {
          id: `proof-food-${Date.now()}`,
          timestamp: nowIso,
          mealType: mealTypeOption || 'lunch',
          items: [
            {
              id: `item-${Date.now()}`,
              name: `${foodTitle} (ยืนยันวัน${dayName})`,
              portion: '1 มื้อ',
              calories: caloriesVal,
              protein,
              carbs,
              fat,
            },
          ],
          total: {
            calories: caloriesVal,
            protein,
            carbs,
            fat,
          },
          note: `ถ่ายรูปยืนยันภารกิจ 7 วัน (${dayName})`,
          imageUrl,
          sourceKey: `7day-proof-food-${dayIndex}-${Date.now()}`,
        };
        newFoodLogs = [newFoodLog, ...newFoodLogs];
      }

      return {
        ...prev,
        weeklyMealPlan: updatedPlan,
        foodLogs: newFoodLogs,
        exerciseLogs: newExerciseLogs,
      };
    });

    const xp = recordType === 'exercise' ? 35 : 30;
    const coins = recordType === 'exercise' ? 25 : 20;
    addRewards(xp, coins, `ยืนยัน${recordType === 'exercise' ? 'ออกกำลังกาย' : 'มื้ออาหาร'}วัน${dayName}`);
    soundManager.playLevelUp();

    if (recordType === 'exercise') {
      triggerReaction(
        `🏃🔥 ยอดเยี่ยมมาก! ยืนยันออกกำลังกายวัน${dayName} สำเร็จ นับแคลอรี่เผาผลาญขึ้นยอดสรุปด้านบนแล้ว! (+${xp} XP, +${coins} 🪙) ✨`
      );
      showToast(
        `ยืนยันออกกำลังกายวัน${dayName} สำเร็จ! นับเผาผลาญขึ้นด้านบนแล้ว (+${xp} XP)`,
        xp,
        coins
      );
    } else {
      triggerReaction(
        `🍱✨ อิ่มอร่อย! ยืนยันมื้ออาหารวัน${dayName} สำเร็จ นับแคลอรี่ขึ้นยอดสรุปด้านบนแล้ว! (+${xp} XP, +${coins} 🪙) 💖`
      );
      showToast(
        `ยืนยันมื้ออาหารวัน${dayName} สำเร็จ! นับแคลอรี่ขึ้นด้านบนแล้ว (+${xp} XP)`,
        xp,
        coins
      );
    }
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

  // Calorie allowance baseline based on Mifflin-St Jeor and activity
  const bmr = calculateBMR(
    currentWeight,
    activeProfile.height,
    activeProfile.age,
    activeProfile.gender
  );
  const tdee = calculateTDEE(bmr, activeProfile.activityLevel);
  const calorieRange = calculateCalorieRange(
    tdee,
    currentWeight,
    activeProfile.targetWeight
  );
  const dailyTargetCal = Math.round((calorieRange.min + calorieRange.max) / 2);
  const currentBmiObj = calculateBMI(currentWeight, activeProfile.height);

  // Toggle Goal Plan with Auto-Sync to Daily Food/Exercise Log
  const handleTogglePlan = (id: string) => {
    const currentPlans = gameState.plans || [];
    const target = currentPlans.find((p) => p.id === id);
    if (!target) return;

    const nextVal = !target.isCompleted;
    const sourceKey = `plan-${id}`;

    setGameState((prev) => {
      const updatedPlans = (prev.plans || []).map((p) =>
        p.id === id
          ? {
              ...p,
              isCompleted: nextVal,
              completedAt: nextVal ? new Date().toISOString() : undefined,
            }
          : p
      );

      let newFoodLogs = [...prev.foodLogs];
      let newExerciseLogs = [...prev.exerciseLogs];

      if (nextVal) {
        // Auto-record to daily log based on category
        if (target.category === 'diet') {
          const estimatedCal = estimateCaloriesFromText(target.title) || 180;
          const protein = Math.round((estimatedCal * 0.15) / 4);
          const carbs = Math.round((estimatedCal * 0.6) / 4);
          const fat = Math.round((estimatedCal * 0.25) / 9);

          const newFoodLog: FoodLog = {
            id: `auto-plan-food-${Date.now()}`,
            timestamp: new Date().toISOString(),
            mealType: 'snack',
            items: [
              {
                id: `item-${Date.now()}`,
                name: `${target.title} (ตามเป้าหมาย)`,
                portion: target.targetValue || '1 ส่วน',
                calories: estimatedCal,
                protein,
                carbs,
                fat,
              },
            ],
            total: {
              calories: estimatedCal,
              protein,
              carbs,
              fat,
            },
            note: `บันทึกอัตโนมัติจากเป้าหมาย: ${target.title}`,
            sourceKey,
          };
          newFoodLogs = [newFoodLog, ...newFoodLogs];
        } else if (target.category === 'exercise') {
          const est = estimateExerciseBurnFromText(target.title, currentWeight) || {
            activityName: target.title,
            calories: Math.round(4.5 * currentWeight * 0.3),
            minutes: 20,
            emoji: '🏃',
          };
          const newExLog: ExerciseLog = {
            id: `auto-plan-ex-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activityName: `${est.activityName} (ตามเป้าหมาย)`,
            durationMinutes: est.minutes,
            intensity: 'moderate',
            estimatedCaloriesBurned: est.calories,
            notes: `บันทึกอัตโนมัติจากเป้าหมาย: ${target.title}`,
            sourceKey,
          };
          newExerciseLogs = [newExLog, ...newExerciseLogs];
        }
      } else {
        // Unchecked: clean up auto-logged item
        newFoodLogs = newFoodLogs.filter((f) => f.sourceKey !== sourceKey);
        newExerciseLogs = newExerciseLogs.filter((e) => e.sourceKey !== sourceKey);
      }

      return {
        ...prev,
        plans: updatedPlans,
        foodLogs: newFoodLogs,
        exerciseLogs: newExerciseLogs,
      };
    });

    if (nextVal) {
      addRewards(20, 10, 'ทำเป้าหมายสำเร็จ');
      soundManager.playLevelUp();
      triggerReaction(`🎉 ยอดเยี่ยมมาก! ทำเป้าหมาย "${target.title}" สำเร็จ และซิงค์เข้าบันทึกวันนี้แล้ว! 💖`);
      showToast(`บันทึกเป้าหมาย "${target.title}" สำเร็จแล้ว (+20 XP, +10 🪙)`, 20, 10);
    } else {
      soundManager.playPop();
      showToast(`ยกเลิกการบันทึกเป้าหมาย "${target.title}"`);
    }
  };

  // Toggle Weekly Meal/Exercise Table Item with Auto-Sync to Daily Food & Exercise Logs
  const handleToggleWeeklyMealItem = (
    dayIndex: number,
    itemKey: 'breakfastDone' | 'lunchDone' | 'dinnerDone' | 'snackDone' | 'exerciseDone',
    imageUrl?: string
  ) => {
    const currentPlan = gameState.weeklyMealPlan || DEFAULT_WEEKLY_MEAL_PLAN;
    const day = currentPlan.find((d) => d.dayIndex === dayIndex);
    if (!day) return;

    const nextVal = imageUrl ? true : !day[itemKey];
    const sourceKey = `weekly-${dayIndex}-${itemKey}`;

    const imageFieldMap: Record<string, keyof MealPlanDay> = {
      breakfastDone: 'breakfastImage',
      lunchDone: 'lunchImage',
      dinnerDone: 'dinnerImage',
      snackDone: 'snackImage',
      exerciseDone: 'exerciseImage',
    };
    const imgField = imageFieldMap[itemKey];

    if (itemKey === 'exerciseDone') {
      const exerciseText = day.exercise?.trim() || `ออกกำลังกายตามแผนวัน${day.dayName}`;
      const est = estimateExerciseBurnFromText(exerciseText, currentWeight) || {
        activityName: exerciseText,
        calories: Math.round(5.0 * currentWeight * 0.5),
        minutes: 30,
        emoji: '🏃',
      };

      setGameState((prev) => {
        const updatedPlan = (prev.weeklyMealPlan || DEFAULT_WEEKLY_MEAL_PLAN).map((d) =>
          d.dayIndex === dayIndex
            ? {
                ...d,
                [itemKey]: nextVal,
                ...(imgField && imageUrl ? { [imgField]: imageUrl } : {}),
              }
            : d
        );

        let newExerciseLogs = [...prev.exerciseLogs];

        if (nextVal) {
          const newExLog: ExerciseLog = {
            id: `auto-ex-${dayIndex}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activityName: `${est.activityName} (ตามแผนวัน${day.dayName})`,
            durationMinutes: est.minutes,
            intensity: 'moderate',
            estimatedCaloriesBurned: est.calories,
            notes: `บันทึกอัตโนมัติจากตารางวางแผนวัน${day.dayName}${imageUrl ? ' (มีรูปยืนยัน)' : ''}`,
            imageUrl: imageUrl || day.exerciseImage,
            sourceKey,
          };
          newExerciseLogs = [newExLog, ...newExerciseLogs];
        } else {
          newExerciseLogs = newExerciseLogs.filter((e) => e.sourceKey !== sourceKey);
        }

        return {
          ...prev,
          weeklyMealPlan: updatedPlan,
          exerciseLogs: newExerciseLogs,
        };
      });

      if (nextVal) {
        const xp = imageUrl ? 35 : 25;
        const coin = imageUrl ? 20 : 12;
        addRewards(xp, coin, `ออกกำลังกายวัน${day.dayName}${imageUrl ? ' (มีรูปยืนยัน)' : ''}`);
        soundManager.playLevelUp();
        triggerReaction(
          imageUrl
            ? `📸 ยอดเยี่ยมมาก! ยืนยันด้วยรูปถ่ายว่าออกกำลังกาย "${est.activityName}" สำเร็จแล้ว! (+${xp} XP, +${coin} 🪙) 🏃✨`
            : `🔥 ว้าว! บันทึก "${est.activityName}" (-${est.calories} kcal) เข้าช่องออกกำลังกายวันนี้แล้ว! 🏃`
        );
        showToast(
          imageUrl
            ? `ยืนยันว่าออกกำลังกายสำเร็จพร้อมรูปถ่าย! (+${xp} XP, +${coin} 🪙)`
            : `บันทึกออกกำลังกายวัน${day.dayName} เข้าช่องวันนี้แล้ว (-${est.calories} kcal)`,
          xp,
          coin
        );
      } else {
        soundManager.playPop();
        showToast(`ยกเลิกบันทึกการออกกำลังกายวัน${day.dayName}`);
      }
    } else {
      // Meal item: breakfastDone, lunchDone, dinnerDone, snackDone
      const mealTypeMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
        breakfastDone: 'breakfast',
        lunchDone: 'lunch',
        dinnerDone: 'dinner',
        snackDone: 'snack',
      };
      const mealFieldMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
        breakfastDone: 'breakfast',
        lunchDone: 'lunch',
        dinnerDone: 'dinner',
        snackDone: 'snack',
      };
      const mealType = mealTypeMap[itemKey];
      const mealField = mealFieldMap[itemKey];
      const mealName = day[mealField]?.trim() || `อาหาร${mealType}ตามแผนวัน${day.dayName}`;
      const estimatedCal = estimateCaloriesFromText(mealName) || 350;

      setGameState((prev) => {
        const updatedPlan = (prev.weeklyMealPlan || DEFAULT_WEEKLY_MEAL_PLAN).map((d) =>
          d.dayIndex === dayIndex
            ? {
                ...d,
                [itemKey]: nextVal,
                ...(imgField && imageUrl ? { [imgField]: imageUrl } : {}),
              }
            : d
        );

        let newFoodLogs = [...prev.foodLogs];

        if (nextVal) {
          const protein = Math.round((estimatedCal * 0.15) / 4);
          const carbs = Math.round((estimatedCal * 0.6) / 4);
          const fat = Math.round((estimatedCal * 0.25) / 9);

          const newFoodLog: FoodLog = {
            id: `auto-food-${dayIndex}-${itemKey}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            mealType,
            items: [
              {
                id: `item-${Date.now()}`,
                name: `${mealName} (ตามแผนวัน${day.dayName})`,
                portion: '1 จาน/ส่วน',
                calories: estimatedCal,
                protein,
                carbs,
                fat,
              },
            ],
            total: {
              calories: estimatedCal,
              protein,
              carbs,
              fat,
            },
            note: `บันทึกอัตโนมัติจากตารางวางแผนวัน${day.dayName}${imageUrl ? ' (มีรูปยืนยัน)' : ''}`,
            imageUrl: imageUrl || (day[imgField as keyof MealPlanDay] as string | undefined),
            sourceKey,
          };
          newFoodLogs = [newFoodLog, ...newFoodLogs];
        } else {
          newFoodLogs = newFoodLogs.filter((f) => f.sourceKey !== sourceKey);
        }

        return {
          ...prev,
          weeklyMealPlan: updatedPlan,
          foodLogs: newFoodLogs,
        };
      });

      if (nextVal) {
        const xp = imageUrl ? 30 : 20;
        const coin = imageUrl ? 18 : 10;
        addRewards(xp, coin, `ทานตามแผนวัน${day.dayName}${imageUrl ? ' (มีรูปยืนยัน)' : ''}`);
        soundManager.playLevelUp();
        triggerReaction(
          imageUrl
            ? `📸 ยอดเยี่ยมมาก! ยืนยันด้วยรูปถ่ายว่าทาน "${mealName}" สำเร็จแล้ว! (+${xp} XP, +${coin} 🪙) 🍱✨`
            : `🍱 อิ่มอร่อย! บันทึก "${mealName}" (+${estimatedCal} kcal) เข้าช่องบันทึกอาหารวันนี้แล้ว ✨`
        );
        showToast(
          imageUrl
            ? `ยืนยันว่าทานอาหารสำเร็จพร้อมรูปถ่าย! (+${xp} XP, +${coin} 🪙)`
            : `บันทึก "${mealName}" (+${estimatedCal} kcal) เข้าช่องอาหารวันนี้แล้ว`,
          xp,
          coin
        );
      } else {
        soundManager.playPop();
        showToast(`ยกเลิกการบันทึกอาหารวัน${day.dayName}`);
      }
    }
  };

  // If user hasn't completed onboarding, show the initial profile & pet setup screen
  if (!gameState.hasSeenWelcome) {
    return (
      <WelcomeScreen
        onStartAdventure={handleStartAdventure}
        initialProfile={gameState.profile}
        initialPet={gameState.selectedPet}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#F8F5FF] to-[#EBF5FF] text-slate-800 flex flex-col font-['Mali',sans-serif]">
      {/* Top Status Bar (Level, XP, Coins, Modals, 3 Main Tabs) */}
      <TopStatusBar
        level={gameState.level}
        xp={gameState.xp}
        coins={gameState.coins}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenShop={() => setActiveModal('shop')}
        onOpenBook={() => setActiveModal('book')}
        onOpenWelcomeScreen={() => {
          setGameState((prev) => ({
            ...prev,
            hasSeenWelcome: false,
          }));
        }}
      />

      {/* Floating Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 sm:top-24 left-1/2 -translate-x-1/2 z-50 bg-white/95 px-4 py-2 rounded-2xl shadow-lg border border-pink-200 text-xs font-extrabold text-slate-800 flex items-center gap-2"
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

      {/* Main Content Area switched by activeTab */}
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

        {/* TAB 1: โปรไฟล์สัตว์เลี้ยง (Pet Profile & Health Stats) */}
        {activeTab === 'petProfile' && (
          <div className="flex flex-col gap-5">
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

              {/* Big Interactive Pet Graphic with Pencil & Notebook button beside */}
              <div className="z-10 my-1">
                <PetDisplay
                  petId={gameState.selectedPet}
                  equippedAccessoryId={gameState.equippedAccessoryId}
                  reactionMessage={
                    petReaction ||
                    `สวัสดีคุณ ${activeProfile.nickname}! วันนี้อยากทำอะไรด้วยกันดีนะ? 🌸`
                  }
                  onOpenDailyLog={() => setActiveTab('dailyLog')}
                />
              </div>

              {/* Quick interactive pet controls */}
              <div className="z-10 mt-3 flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setGameState((prev) => ({
                      ...prev,
                      hasSeenWelcome: false,
                    }));
                  }}
                  className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="เปิดหน้ากรอกข้อมูลตั้งต้นใหม่"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                  หน้ากรอกข้อมูล (ตั้งต้น)
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setActiveModal('petRoom');
                  }}
                  className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Smile className="w-3.5 h-3.5 text-pink-500" />
                  ห้องสัตว์เลี้ยง ({currentPet.name})
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setActiveModal('shop');
                  }}
                  className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  แต่งตัว ({gameState.inventory.length} ชิ้น)
                </button>
              </div>
            </section>

            {/* Health Metrics & Energy Balance: BMI, BMR, TDEE */}
            <HealthMetricsCard
              profile={activeProfile}
              currentWeight={currentWeight}
              onOpenDetailedProfile={() => setActiveModal('profile')}
            />
          </div>
        )}

        {/* TAB 2: เกมเส้นทางก้าวเดิน (Adventure Stepping Map) */}
        {activeTab === 'game' && (
          <div className="flex flex-col gap-4">
            {/* Header info card */}
            <div className="bg-gradient-to-r from-purple-100/90 via-pink-50/80 to-sky-100/90 rounded-3xl p-4 sm:p-5 border border-purple-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🗺️</span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800">
                    เกมเส้นทางก้าวเดิน (ลด 1 โล เดิน 1 ก้าว)
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    ทุกๆ 1 kg ที่ลดลง {currentPet.name} จะก้าวไปข้างหน้า 1 ก้าว มุ่งสู่ปราสาทเป้าหมาย {activeProfile.targetWeight} kg 🏰
                  </p>
                </div>
              </div>
            </div>

            {/* Adventure Stepping Trail Map */}
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
          </div>
        )}

        {/* TAB 3: บันทึกประจำวัน (Daily Log Section) */}
        {activeTab === 'dailyLog' && (
          <DailyLogSection
            foodLogs={gameState.foodLogs}
            exerciseLogs={gameState.exerciseLogs}
            weightLogs={gameState.weightLogs}
            plans={gameState.plans || []}
            weeklyMealPlan={gameState.weeklyMealPlan || []}
            currentWeight={currentWeight}
            targetWeight={activeProfile.targetWeight}
            dailyTargetCal={dailyTargetCal}
            userBmi={currentBmiObj.value}
            userHeight={activeProfile.height}
            petEmoji={currentPet.emoji}
            petName={currentPet.name}
            onOpenFoodModal={() => setActiveModal('food')}
            onOpenExerciseModal={() => setActiveModal('exercise')}
            onOpenWeightModal={() => setActiveModal('weight')}
            onOpenAdventureBook={() => setActiveModal('book')}
            onAddPlan={handleAddPlan}
            onTogglePlan={handleTogglePlan}
            onDeletePlan={handleDeletePlan}
            onUpdateWeeklyMealPlan={handleUpdateWeeklyMealPlan}
            onToggleWeeklyMealItem={handleToggleWeeklyMealItem}
            onUpdatePlanPhoto={handleUpdatePlanPhoto}
            onUploadWeeklyMealPhoto={handleUploadWeeklyMealPhoto}
          />
        )}

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
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-500" />
              สมุดผจญภัย
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveModal('profile');
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
        dailyTargetCal={dailyTargetCal}
        currentCaloriesEaten={gameState.foodLogs
          .filter((f) => f.timestamp && f.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10))
          .reduce((sum, f) => sum + (f.total?.calories || 0), 0)}
      />

      <ExerciseModal
        isOpen={activeModal === 'exercise'}
        onClose={() => setActiveModal(null)}
        onSaveExercise={handleSaveExercise}
        userWeight={currentWeight}
        userHeight={activeProfile.height}
        userBmi={currentBmiObj}
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
        onOpenWelcomeScreen={() => {
          setGameState((prev) => ({
            ...prev,
            hasSeenWelcome: false,
          }));
          setActiveModal(null);
        }}
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
