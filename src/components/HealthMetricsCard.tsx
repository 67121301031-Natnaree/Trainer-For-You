import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ActivityLevel } from '../types';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieRange } from '../constants';
import { Activity, Flame, Zap, Heart, Info, Sliders, ChevronRight } from 'lucide-react';
import { soundManager } from '../services/sound';

interface HealthMetricsCardProps {
  profile: UserProfile;
  currentWeight: number;
  onOpenDetailedProfile: () => void;
}

export const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({
  profile,
  currentWeight,
  onOpenDetailedProfile,
}) => {
  const [showSimTool, setShowSimTool] = useState(false);
  const [simWeight, setSimWeight] = useState<number>(currentWeight);
  const [simActivity, setSimActivity] = useState<ActivityLevel>(profile.activityLevel || 'moderate');

  // Baseline calculations
  const bmi = calculateBMI(currentWeight, profile.height);
  const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel || 'moderate');
  const calorieRange = calculateCalorieRange(tdee, currentWeight, profile.targetWeight);

  // Simulation calculations (when user wants to test what-if scenarios)
  const simBmi = calculateBMI(simWeight, profile.height);
  const simBmr = calculateBMR(simWeight, profile.height, profile.age, profile.gender);
  const simTdee = calculateTDEE(simBmr, simActivity);
  const simCalorieRange = calculateCalorieRange(simTdee, simWeight, profile.targetWeight);

  return (
    <section
      id="card-health-metrics"
      className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs flex flex-col gap-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              ดัชนีสุขภาพ & สมดุลพลังงาน (BMI • BMR • TDEE)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              คำนวณตามหลักสูตรโภชนาการสำหรับนักศึกษา
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-toggle-sim-calc"
            type="button"
            onClick={() => {
              soundManager.playPop();
              setShowSimTool(!showSimTool);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
              showSimTool
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100'
            }`}
            title="ลองคำนวณจำลองเป้าหมาย"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showSimTool ? 'ปิดตัวจำลอง' : 'จำลองคำนวณ'}</span>
          </button>

          <button
            id="btn-open-health-profile-modal"
            type="button"
            onClick={() => {
              soundManager.playPop();
              onOpenDetailedProfile();
            }}
            className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200/80 transition-colors"
            title="เปิดโปรไฟล์สุขภาพเต็มรูปแบบ"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Core Metric Displays */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* 1. BMI Card */}
        <div className="bg-gradient-to-b from-slate-50 to-white p-3 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
              BMI (ดัชนีมวลกาย)
            </span>
            <span className={`text-xl sm:text-2xl font-black ${bmi.color}`}>
              {bmi.value}
            </span>
          </div>
          <div className="mt-1">
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight ${bmi.bg} ${bmi.color}`}
            >
              {bmi.label}
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              เกณฑ์เอเชีย 18.5 - 22.9
            </span>
          </div>
        </div>

        {/* 2. BMR Card */}
        <div className="bg-gradient-to-b from-purple-50/50 to-white p-3 rounded-2xl border border-purple-100 text-center flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-purple-600 block mb-0.5 flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-purple-500" /> BMR พื้นฐาน
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-700">
              {bmr.toLocaleString()}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full inline-block">
              kcal / วัน
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              เผาผลาญขณะพัก (อวัยวะทำงาน)
            </span>
          </div>
        </div>

        {/* 3. TDEE Card */}
        <div className="bg-gradient-to-b from-sky-50/50 to-white p-3 rounded-2xl border border-sky-100 text-center flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-sky-600 block mb-0.5 flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 text-sky-500" /> TDEE รวมกิจกรรม
            </span>
            <span className="text-xl sm:text-2xl font-black text-sky-700">
              {tdee.toLocaleString()}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-[10px] font-bold text-sky-600 bg-sky-100/70 px-2 py-0.5 rounded-full inline-block">
              kcal / วัน
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              พลังงานที่ใช้จริงตามไลฟ์สไตล์
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Healthy Calorie Range Banner */}
      <div className="p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-pink-50/40 rounded-2xl border border-emerald-200/70 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥗</span>
          <div>
            <div className="font-extrabold text-emerald-900 flex items-center gap-1">
              <span>ช่วงพลังงานที่แนะนำต่อวัน:</span>
              <span className="text-emerald-700 font-black text-sm">
                {calorieRange.min.toLocaleString()} - {calorieRange.max.toLocaleString()} kcal
              </span>
            </div>
            <p className="text-[10px] text-emerald-800/80 leading-tight mt-0.5">
              {calorieRange.description}
            </p>
          </div>
        </div>

        <button
          id="btn-view-health-advice"
          type="button"
          onClick={() => {
            soundManager.playPop();
            onOpenDetailedProfile();
          }}
          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 shadow-2xs transition-colors flex-shrink-0"
        >
          อ่านคำแนะนำ
        </button>
      </div>

      {/* Interactive What-If Simulation Tool (Expandable) */}
      <AnimatePresence>
        {showSimTool && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-purple-50/60 rounded-2xl p-3.5 border border-purple-200/70 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                🧮 เครื่องมือจำลองคำนวณด่วน (What-If Calculator)
              </span>
              <span className="text-[10px] text-purple-600 font-medium">
                ทดลองปรับน้ำหนักหรือกิจกรรมเพื่อดูค่าใหม่
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Simulated Weight Slider */}
              <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-600">น้ำหนักจำลอง:</span>
                  <span className="font-black text-pink-600 text-sm">{simWeight} กก.</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="130"
                  step="0.5"
                  value={simWeight}
                  onChange={(e) => setSimWeight(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              {/* Simulated Activity Level */}
              <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-600">ระดับกิจกรรมจำลอง:</span>
                </div>
                <select
                  value={simActivity}
                  onChange={(e) => setSimActivity(e.target.value as ActivityLevel)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg p-1.5 border border-slate-200 focus:outline-none"
                >
                  <option value="sedentary">🪑 นั่งเรียน/อ่านหนังสือเป็นหลัก</option>
                  <option value="light">🚶 เคลื่อนไหวเบาๆ เดินไปเรียน</option>
                  <option value="moderate">🏃 ออกกำลังกาย 2-3 วัน/สัปดาห์</option>
                  <option value="active">⚡ ออกกำลังกาย 4-5 วัน/สัปดาห์</option>
                </select>
              </div>
            </div>

            {/* Simulation Results Bar */}
            <div className="bg-white p-2.5 rounded-xl border border-purple-200 flex items-center justify-around text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">BMI จำลอง</span>
                <span className={`font-black ${simBmi.color}`}>{simBmi.value}</span>
                <span className="text-[9px] block text-slate-500">({simBmi.label})</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block">BMR จำลอง</span>
                <span className="font-black text-purple-700">{simBmr.toLocaleString()}</span>
                <span className="text-[9px] block text-slate-400">kcal</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block">TDEE จำลอง</span>
                <span className="font-black text-sky-700">{simTdee.toLocaleString()}</span>
                <span className="text-[9px] block text-slate-400">kcal</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block">ช่วงแคลอรีที่แนะนำ</span>
                <span className="font-black text-emerald-700">
                  {simCalorieRange.min} - {simCalorieRange.max}
                </span>
                <span className="text-[9px] block text-slate-400">kcal/วัน</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
