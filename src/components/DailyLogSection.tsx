import React from 'react';
import { motion } from 'motion/react';
import { FoodLog, ExerciseLog, WeightLog, GoalPlan, UserProfile, MealPlanDay } from '../types';
import { soundManager } from '../services/sound';
import { CuteSummaryCard } from './CuteSummaryCard';
import { WeeklyMealTablePlanner } from './WeeklyMealTablePlanner';
import {
  Utensils,
  Activity,
  Scale,
  Sparkles,
  Clock,
  Flame,
  Plus,
  BookOpen,
  ChevronRight,
  TrendingDown,
  Info,
  Camera,
} from 'lucide-react';

interface DailyLogSectionProps {
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLog[];
  plans?: GoalPlan[];
  weeklyMealPlan?: MealPlanDay[];
  currentWeight: number;
  targetWeight: number;
  dailyTargetCal: number;
  userBmi?: number;
  userHeight?: number;
  petEmoji?: string;
  petName?: string;
  onOpenFoodModal: () => void;
  onOpenExerciseModal: () => void;
  onOpenWeightModal: () => void;
  onOpenAdventureBook: () => void;
  onAddPlan: (plan: Omit<GoalPlan, 'id' | 'isCompleted'>) => void;
  onTogglePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onUpdateWeeklyMealPlan?: (plan: MealPlanDay[]) => void;
  onUpdatePlanPhoto?: (id: string, imageUrl: string) => void;
  onUploadWeeklyMealPhoto?: (
    dayIndex: number,
    imageUrl: string,
    note?: string,
    confirmationType?: 'food' | 'exercise' | 'auto',
    mealTypeOption?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    customCalories?: number,
    customMinutes?: number
  ) => void;
  onToggleWeeklyMealItem?: (
    dayIndex: number,
    itemKey:
      | 'breakfastDone'
      | 'lunchDone'
      | 'dinnerDone'
      | 'snackDone'
      | 'exerciseDone'
  ) => void;
}

export const DailyLogSection: React.FC<DailyLogSectionProps> = ({
  foodLogs,
  exerciseLogs,
  weightLogs,
  plans = [],
  weeklyMealPlan = [],
  currentWeight,
  targetWeight,
  dailyTargetCal,
  userBmi = 21.3,
  userHeight = 165,
  petEmoji = '🐰',
  petName = 'Mochi',
  onOpenFoodModal,
  onOpenExerciseModal,
  onOpenWeightModal,
  onOpenAdventureBook,
  onAddPlan,
  onTogglePlan,
  onDeletePlan,
  onUpdateWeeklyMealPlan,
  onUpdatePlanPhoto,
  onUploadWeeklyMealPhoto,
  onToggleWeeklyMealItem,
}) => {
  // Today's Date String (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter today's records
  const todayFoods = foodLogs.filter(
    (f) => f.timestamp && f.timestamp.slice(0, 10) === todayStr
  );
  const todayExercises = exerciseLogs.filter(
    (e) => e.timestamp && e.timestamp.slice(0, 10) === todayStr
  );
  const todayWeights = weightLogs.filter(
    (w) => w.timestamp && w.timestamp.slice(0, 10) === todayStr
  );

  const todayCaloriesIn = todayFoods.reduce((sum, f) => sum + (f.total?.calories || 0), 0);
  const todayCaloriesOut = todayExercises.reduce(
    (sum, e) => sum + (e.estimatedCaloriesBurned || 0),
    0
  );
  const todayExerciseMinutes = todayExercises.reduce(
    (sum, e) => sum + (e.durationMinutes || 0),
    0
  );

  // Remaining calories calculation
  const remainingCalories = dailyTargetCal - todayCaloriesIn + todayCaloriesOut;

  const getMealTypeName = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'มื้อเช้า';
      case 'lunch':
        return 'มื้อกลางวัน';
      case 'dinner':
        return 'มื้อเย็น';
      case 'snack':
        return 'ของว่าง';
      default:
        return 'มื้ออาหาร';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-100/80 via-purple-100/70 to-sky-100/80 rounded-3xl p-4 sm:p-5 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-2xs flex items-center justify-center text-2xl flex-shrink-0">
            📝
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
              <span>บันทึกประจำวัน & วางแผนสุขภาพ</span>
              <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                Daily Log & Planner
              </span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              บันทึกสิ่งดีๆ วางแผนเป้าหมาย และติดตามพัฒนาการสุขภาพ ✨
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playPop();
            onOpenAdventureBook();
          }}
          className="self-start sm:self-auto px-4 py-2 bg-white/90 hover:bg-white text-purple-700 hover:text-purple-800 text-xs font-extrabold rounded-2xl border border-purple-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-purple-500" />
          <span>ดูประวัติทั้งหมด / สำรองข้อมูล</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Food Card with Eaten vs Remaining Calories */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/95 rounded-3xl p-4 border border-pink-200/90 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🍱</span>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                +30 XP
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-800">มื้ออาหาร & แคลอรี่</h3>

            {/* Eaten stats */}
            <p className="text-xs text-slate-500 mt-1">
              วันนี้ทานไป:{' '}
              <span className="font-bold text-pink-600">
                {todayCaloriesIn.toLocaleString()}
              </span>{' '}
              kcal ({todayFoods.length} มื้อ)
            </p>

            {/* Remaining calories highlights requested by user */}
            <div
              className={`mt-2 p-2 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                remainingCalories >= 0
                  ? 'bg-pink-50/80 border-pink-200 text-pink-700'
                  : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}
            >
              <span>{remainingCalories >= 0 ? 'เหลือกินได้อีก:' : 'เกินเป้าหมาย:'}</span>
              <span className="font-black text-sm">
                {remainingCalories >= 0
                  ? `${remainingCalories.toLocaleString()} kcal`
                  : `+${Math.abs(remainingCalories).toLocaleString()} kcal`}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              onOpenFoodModal();
            }}
            className="mt-3 w-full py-2 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ถ่ายรูป / จดบันทึกอาหาร</span>
          </button>
        </motion.div>

        {/* 2. Exercise Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/95 rounded-3xl p-4 border border-purple-200/90 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏃</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                +40 XP
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-800">ออกกำลังกาย & ขยับตัว</h3>
            <p className="text-xs text-slate-500 mt-1">
              เผาผลาญ:{' '}
              <span className="font-bold text-purple-600">
                {todayCaloriesOut.toLocaleString()}
              </span>{' '}
              kcal ({todayExerciseMinutes} นาที)
            </p>
            <div className="mt-2 p-2 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs font-bold text-purple-700 flex items-center justify-between">
              <span>เพิ่มโควต้ากินได้:</span>
              <span className="font-black text-sm">+{todayCaloriesOut.toLocaleString()} kcal</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenExerciseModal();
            }}
            className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>ถ่ายรูป / บันทึกออกกำลังกาย</span>
          </button>
        </motion.div>

        {/* 3. Weight Check-in Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/95 rounded-3xl p-4 border border-sky-200/90 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚖️</span>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full">
                +25 XP
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-800">เช็คอินน้ำหนักตัว</h3>
            <p className="text-xs text-slate-500 mt-1">
              ปัจจุบัน:{' '}
              <span className="font-bold text-sky-600">{currentWeight}</span> kg
              (เป้าหมาย {targetWeight} kg)
            </p>
            <div className="mt-2 p-2 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs font-bold text-sky-700 flex items-center justify-between">
              <span>ระยะทางสู่เป้า:</span>
              <span className="font-black text-sm">
                {Math.abs(currentWeight - targetWeight).toFixed(1)} kg
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenWeightModal();
            }}
            className="mt-3 w-full py-2 bg-gradient-to-r from-sky-400 to-teal-400 hover:from-sky-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เช็คอินน้ำหนักวันนี้</span>
          </button>
        </motion.div>
      </div>

      {/* 7-Day Meal Planner Table (ตารางกรอกอาหาร & ออกกำลังกาย 7 วัน พร้อมถ่ายรูปยืนยัน) */}
      <WeeklyMealTablePlanner
        weeklyMealPlan={weeklyMealPlan}
        onUpdateMealPlan={onUpdateWeeklyMealPlan || (() => {})}
        onToggleWeeklyMealItem={onToggleWeeklyMealItem}
        onUploadDayPhoto={onUploadWeeklyMealPhoto}
        petEmoji={petEmoji}
        petName={petName}
        userWeight={currentWeight}
        userBmi={userBmi}
      />

      {/* Recent Activity Feed */}
      <div className="bg-white/80 rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <h3 className="text-sm font-extrabold text-slate-800">
              รายการที่บันทึกล่าสุด
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            รวม {foodLogs.length + exerciseLogs.length + weightLogs.length} รายการทั้งหมด
          </span>
        </div>

        {foodLogs.length === 0 && exerciseLogs.length === 0 && weightLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center">
            <span className="text-3xl mb-2">📖</span>
            <p className="text-xs font-bold text-slate-600">ยังไม่มีบันทึกในระบบ</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              เริ่มบันทึกมื้อแรกหรือน้ำหนักเพื่อรับคะแนน XP ก้าวแรกกันเลย!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Recent Foods (top 2) */}
            {foodLogs.slice(0, 2).map((item) => {
              const displayName =
                item.items && item.items.length > 0
                  ? item.items.map((i) => i.name).join(', ')
                  : getMealTypeName(item.mealType);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="Food photo"
                        className="w-10 h-10 rounded-xl object-cover border border-pink-200 shadow-2xs flex-shrink-0"
                      />
                    ) : (
                      <span className="text-xl flex-shrink-0">🍱</span>
                    )}
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-800 truncate flex items-center gap-1">
                        <span>{displayName}</span>
                        {item.imageUrl && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                            📷 รูป
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {getMealTypeName(item.mealType)} • โปรตีน {item.total.protein}g • คาร์บ {item.total.carbs}g
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-black text-pink-600">
                      +{item.total.calories} kcal
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Recent Exercise (top 1) */}
            {exerciseLogs.slice(0, 1).map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {ex.imageUrl ? (
                    <img
                      src={ex.imageUrl}
                      alt="Exercise proof"
                      className="w-10 h-10 rounded-xl object-cover border border-purple-200 shadow-2xs flex-shrink-0"
                    />
                  ) : (
                    <span className="text-xl flex-shrink-0">🏃</span>
                  )}
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-800 truncate flex items-center gap-1">
                      <span>{ex.activityName}</span>
                      {ex.imageUrl && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                          📷 ยืนยันแล้ว ✅
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {ex.durationMinutes} นาที
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-black text-purple-600">
                    -{ex.estimatedCaloriesBurned} kcal
                  </span>
                </div>
              </div>
            ))}

            {/* Recent Weight (top 1) */}
            {weightLogs.slice(-1).map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚖️</span>
                  <div>
                    <div className="font-extrabold text-slate-800">เช็คอินน้ำหนักล่าสุด</div>
                    <div className="text-[10px] text-slate-400">
                      {w.timestamp ? w.timestamp.slice(0, 10) : 'ล่าสุด'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sky-600">{w.weightKg} kg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Card (Daily & Weekly) at the very bottom */}
      <CuteSummaryCard
        foodLogs={foodLogs}
        exerciseLogs={exerciseLogs}
        weightLogs={weightLogs}
        dailyTargetCal={dailyTargetCal}
        currentWeight={currentWeight}
        targetWeight={targetWeight}
        petEmoji={petEmoji}
        petName={petName}
      />
    </div>
  );
};
