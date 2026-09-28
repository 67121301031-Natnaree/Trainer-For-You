import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodLog, ExerciseLog, WeightLog } from '../types';
import { soundManager } from '../services/sound';
import {
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Award,
  Utensils,
  Flame,
  Scale,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface CuteSummaryCardProps {
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLog[];
  dailyTargetCal: number;
  currentWeight: number;
  targetWeight: number;
  petEmoji?: string;
  petName?: string;
}

export const CuteSummaryCard: React.FC<CuteSummaryCardProps> = ({
  foodLogs,
  exerciseLogs,
  weightLogs,
  dailyTargetCal,
  currentWeight,
  targetWeight,
  petEmoji = '🐰',
  petName = 'Mochi',
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [copiedToast, setCopiedToast] = useState(false);

  // Today calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFoods = foodLogs.filter(
    (f) => f.timestamp && f.timestamp.slice(0, 10) === todayStr
  );
  const todayExercises = exerciseLogs.filter(
    (e) => e.timestamp && e.timestamp.slice(0, 10) === todayStr
  );

  const todayCaloriesIn = todayFoods.reduce(
    (sum, f) => sum + (f.total?.calories || 0),
    0
  );
  const todayCaloriesBurned = todayExercises.reduce(
    (sum, e) => sum + (e.estimatedCaloriesBurned || 0),
    0
  );
  const todayExerciseMinutes = todayExercises.reduce(
    (sum, e) => sum + (e.durationMinutes || 0),
    0
  );

  const remainingDailyCalories = dailyTargetCal - todayCaloriesIn + todayCaloriesBurned;

  // Past 7 Days (Weekly calculations)
  const now = new Date();
  const past7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    past7Days.push(d.toISOString().slice(0, 10));
  }

  const weekFoods = foodLogs.filter(
    (f) => f.timestamp && past7Days.includes(f.timestamp.slice(0, 10))
  );
  const weekExercises = exerciseLogs.filter(
    (e) => e.timestamp && past7Days.includes(e.timestamp.slice(0, 10))
  );

  const weekTotalCaloriesIn = weekFoods.reduce(
    (sum, f) => sum + (f.total?.calories || 0),
    0
  );
  const weekTotalBurned = weekExercises.reduce(
    (sum, e) => sum + (e.estimatedCaloriesBurned || 0),
    0
  );
  const weekTotalMinutes = weekExercises.reduce(
    (sum, e) => sum + (e.durationMinutes || 0),
    0
  );

  // Active days count in this week
  const activeDaysSet = new Set<string>();
  weekFoods.forEach((f) => activeDaysSet.add(f.timestamp.slice(0, 10)));
  weekExercises.forEach((e) => activeDaysSet.add(e.timestamp.slice(0, 10)));
  const daysLoggedCount = activeDaysSet.size;

  // Calculate day-by-day stats for bar mini-chart
  const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const weekChartData = past7Days.map((dateStr) => {
    const d = new Date(dateStr);
    const dayName = dayLabels[d.getDay()];
    const cIn = foodLogs
      .filter((f) => f.timestamp && f.timestamp.slice(0, 10) === dateStr)
      .reduce((s, f) => s + (f.total?.calories || 0), 0);
    const cOut = exerciseLogs
      .filter((e) => e.timestamp && e.timestamp.slice(0, 10) === dateStr)
      .reduce((s, e) => s + (e.estimatedCaloriesBurned || 0), 0);
    return {
      dateStr,
      dayName,
      cIn,
      cOut,
    };
  });

  // Encouraging speech based on status
  let petFeedback = '';
  if (viewMode === 'daily') {
    if (todayFoods.length === 0) {
      petFeedback = `อย่าลืมเติมพลังด้วยอาหารดีๆ นะ ${petEmoji} วันนี้รอเช็คอินอยู่นะจ๊ะ!`;
    } else if (remainingDailyCalories < -100) {
      petFeedback = `วันนี้ทานอิ่มจุกๆ เลย! ไม่เป็นไรนะ ค่อยไปยืดเส้นยืดสายหรือเดินเล่นชิลๆ ด้วยกัน ${petEmoji}✨`;
    } else if (remainingDailyCalories >= 0 && remainingDailyCalories <= 300) {
      petFeedback = `สุดยอดมาก! คุมแคลอรี่ได้สมดุลเป๊ะตามเป้าหมาย ยอดเยี่ยมที่สุดเลยคนเก่ง ${petEmoji}💖`;
    } else {
      petFeedback = `เก่งมาก! ยังมีโควต้าแคลอรี่เหลือให้ทานมื้ออร่อยได้อีก ${Math.max(0, remainingDailyCalories).toLocaleString()} kcal นะ ${petEmoji}`;
    }
  } else {
    if (daysLoggedCount >= 5) {
      petFeedback = `ว้าว! สัปดาห์นี้มีวินัยสุดยอด บันทึกไปถึง ${daysLoggedCount}/7 วัน น้อง ${petName} ภูมิใจในตัวเธอมากๆ! 🏆✨`;
    } else if (daysLoggedCount >= 3) {
      petFeedback = `สัปดาห์นี้ทำได้ดีมากๆ แล้วนะ ค่อยๆ สะสมก้าวเล็กๆ ไปด้วยกัน สู้ๆ นะ! 🌸`;
    } else {
      petFeedback = `เริ่มต้นสัปดาห์ใหม่ไปด้วยกันนะ ก้าวทีละวัน ไม่ต้องกดดันตัวเองเลย! 💖`;
    }
  }

  const handleCopySummary = () => {
    soundManager.playPop();
    const text =
      viewMode === 'daily'
        ? `🌟 สรุปสุขภาพวันนี้จาก ${petName} ${petEmoji}
🍱 พลังงานที่ทาน: ${todayCaloriesIn} kcal
🏃 เผาผลาญ: ${todayCaloriesBurned} kcal (${todayExerciseMinutes} นาที)
⚖️ น้ำหนักปัจจุบัน: ${currentWeight} kg (เป้าหมาย: ${targetWeight} kg)
✨ สุขภาพดีขึ้นทีละก้าวไปด้วยกัน!`
        : `🌈 สรุปสุขภาพประจำสัปดาห์จาก ${petName} ${petEmoji}
📅 วันที่บันทึก: ${daysLoggedCount}/7 วัน
🍱 พลังงานรวม: ${weekTotalCaloriesIn.toLocaleString()} kcal
🏃 เผาผลาญรวม: ${weekTotalBurned.toLocaleString()} kcal (${weekTotalMinutes} นาที)
🎯 มุ่งสู่เป้าหมาย ${targetWeight} kg!`;

    navigator.clipboard?.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-white via-pink-50/40 to-purple-50/40 rounded-3xl p-4 sm:p-5 border-2 border-pink-200/80 shadow-sm relative overflow-hidden">
      {/* Decorative cute background elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-200/30 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-200/30 rounded-full blur-xl pointer-events-none" />

      {/* Header & Toggle */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
              <span>สรุปข้อมูลสุขภาพ</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">
                {viewMode === 'daily' ? 'รายวัน' : 'รายสัปดาห์'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              ภาพรวมพลังงาน กิจกรรม และความก้าวหน้า
            </p>
          </div>
        </div>

        {/* Daily / Weekly Pills Switcher */}
        <div className="flex items-center bg-pink-100/70 p-1 rounded-2xl border border-pink-200/80">
          <button
            onClick={() => {
              soundManager.playPop();
              setViewMode('daily');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white text-pink-600 shadow-2xs'
                : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            ☀️ รายวัน
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setViewMode('weekly');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white text-purple-600 shadow-2xs'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            📅 รายสัปดาห์
          </button>
        </div>
      </div>

      {/* Pet speech bubble with cute message */}
      <div className="relative z-10 mb-4 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-pink-100/80 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
          {petEmoji}
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold text-pink-600 flex items-center gap-1">
            <span>{petName} กระซิบให้กำลังใจ</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">
            {petFeedback}
          </p>
        </div>
      </div>

      {/* VIEW 1: DAILY SUMMARY */}
      {viewMode === 'daily' ? (
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {/* 1. Eaten */}
            <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-2xs text-center">
              <span className="text-xl">🍱</span>
              <div className="text-[10px] text-slate-400 font-bold mt-1">ทานไปวันนี้</div>
              <div className="text-base font-black text-pink-600 mt-0.5">
                {todayCaloriesIn.toLocaleString()}{' '}
                <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {todayFoods.length} มื้ออาหาร
              </div>
            </div>

            {/* 2. Target Allowance */}
            <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs text-center">
              <span className="text-xl">🎯</span>
              <div className="text-[10px] text-slate-400 font-bold mt-1">เป้าหมายประจำวัน</div>
              <div className="text-base font-black text-purple-700 mt-0.5">
                {dailyTargetCal.toLocaleString()}{' '}
                <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <div className="text-[10px] text-purple-500 font-bold mt-0.5">
                ตามเกณฑ์ร่างกาย
              </div>
            </div>

            {/* 3. Calories Burned */}
            <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-2xs text-center">
              <span className="text-xl">🏃</span>
              <div className="text-[10px] text-slate-400 font-bold mt-1">เผาผลาญกิจกรรม</div>
              <div className="text-base font-black text-sky-600 mt-0.5">
                {todayCaloriesBurned.toLocaleString()}{' '}
                <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {todayExerciseMinutes} นาที
              </div>
            </div>

            {/* 4. Remaining Allowance (เหลือให้กินได้) */}
            <div
              className={`p-3 rounded-2xl border shadow-2xs text-center ${
                remainingDailyCalories >= 0
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50/70 border-rose-200 text-rose-800'
              }`}
            >
              <span className="text-xl">
                {remainingDailyCalories >= 0 ? '✨' : '⚠️'}
              </span>
              <div className="text-[10px] font-bold mt-1">
                {remainingDailyCalories >= 0 ? 'เหลือกินได้อีก' : 'เกินเป้าหมาย'}
              </div>
              <div
                className={`text-base font-black mt-0.5 ${
                  remainingDailyCalories >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {Math.abs(remainingDailyCalories).toLocaleString()}{' '}
                <span className="text-[10px] font-bold">kcal</span>
              </div>
              <div className="text-[10px] font-semibold mt-0.5">
                {remainingDailyCalories >= 0 ? 'กำลังพอดี' : 'ออกกำลังเพิ่มได้'}
              </div>
            </div>
          </div>

          {/* Calorie Progress Bar */}
          <div className="bg-white/90 p-3 rounded-2xl border border-pink-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span>สมดุลแคลอรี่วันนี้</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ({todayCaloriesIn} / {dailyTargetCal + todayCaloriesBurned} kcal)
                </span>
              </span>
              <span
                className={`text-[11px] font-black ${
                  remainingDailyCalories >= 0 ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {remainingDailyCalories >= 0
                  ? `เหลือกินได้อีก ${remainingDailyCalories.toLocaleString()} kcal`
                  : `ทานเกินเป้า ${Math.abs(remainingDailyCalories).toLocaleString()} kcal`}
              </span>
            </div>

            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (todayCaloriesIn /
                        Math.max(1, dailyTargetCal + todayCaloriesBurned)) *
                        100
                    )
                  )}%`,
                }}
                className={`h-full rounded-full ${
                  remainingDailyCalories < 0
                    ? 'bg-gradient-to-r from-pink-400 to-rose-500'
                    : 'bg-gradient-to-r from-pink-400 to-purple-400'
                }`}
              />
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: WEEKLY SUMMARY */
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
            {/* 1. Weekly Logged Days */}
            <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-2xs">
              <span className="text-xl">📅</span>
              <div className="text-[10px] text-slate-400 font-bold mt-1">วันที่บันทึก</div>
              <div className="text-base font-black text-purple-700 mt-0.5">
                {daysLoggedCount} <span className="text-xs font-bold text-slate-500">/ 7 วัน</span>
              </div>
              <div className="text-[10px] text-pink-500 font-semibold mt-0.5">
                {daysLoggedCount >= 5 ? 'สม่ำเสมอดีมาก!' : 'ทำต่อไปนะ'}
              </div>
            </div>

            {/* 2. Total In */}
            <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-2xs">
              <span className="text-xl">🍱</span>
              <div className="text-[10px] text-slate-400 font-bold mt-1">พลังงานรวม 7 วัน</div>
              <div className="text-base font-black text-pink-600 mt-0.5">
                {weekTotalCaloriesIn.toLocaleString()}{' '}
                <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                เฉลี่ย {Math.round(weekTotalCaloriesIn / 7)} kcal/วัน
              </div>
            </div>

            {/* 3. Total Out */}
            <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-2xs">
              <span className="text-xl">🏃</span>
              <div className="text-[10px] text-slate-400 font-bold mt-1">เผาผลาญรวม</div>
              <div className="text-base font-black text-sky-600 mt-0.5">
                {weekTotalBurned.toLocaleString()}{' '}
                <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                รวม {weekTotalMinutes} นาที
              </div>
            </div>
          </div>

          {/* 7-Day Mini Chart */}
          <div className="bg-white/90 p-3 rounded-2xl border border-pink-100 shadow-2xs">
            <div className="text-xs font-extrabold text-slate-700 mb-2">
              กราฟพลังงาน 7 วันล่าสุด (เทียบเป้าหมาย {dailyTargetCal} kcal)
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end h-24 pt-2">
              {weekChartData.map((day, idx) => {
                const maxScale = Math.max(2200, dailyTargetCal * 1.3);
                const heightPercent = Math.min(
                  100,
                  Math.round((day.cIn / maxScale) * 100)
                );
                const isToday = day.dateStr === todayStr;

                return (
                  <div
                    key={day.dateStr}
                    className={`flex flex-col items-center h-full justify-end rounded-xl p-1 ${
                      isToday ? 'bg-pink-50 border border-pink-200' : ''
                    }`}
                  >
                    <span className="text-[9px] font-bold text-slate-400 mb-1">
                      {day.cIn > 0 ? `${Math.round(day.cIn / 100) * 100}` : '-'}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-md h-12 flex items-end overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(8, heightPercent)}%` }}
                        className={`w-full ${
                          day.cIn === 0
                            ? 'bg-slate-200'
                            : day.cIn > dailyTargetCal + 200
                            ? 'bg-rose-400'
                            : 'bg-gradient-to-t from-pink-400 to-purple-400'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-extrabold ${
                        isToday ? 'text-pink-600' : 'text-slate-600'
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Copy / Share Button */}
      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-pink-100 relative z-10">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          ดูแลตัวเองอย่างมีความสุข ไม่กดดันนะ
        </span>

        <button
          onClick={handleCopySummary}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          {copiedToast ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600">คัดลอกสำเร็จ!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>คัดลอกสรุปข้อมูล</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
