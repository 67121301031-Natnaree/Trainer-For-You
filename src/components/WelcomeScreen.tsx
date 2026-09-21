import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, PetId, ActivityLevel } from '../types';
import { PETS, calculateBMI, calculateBMR, calculateTDEE, calculateCalorieRange } from '../constants';
import { PetDisplay } from './PetDisplay';
import { Sparkles, Heart, ChevronRight, Check, Flame, Zap, Activity } from 'lucide-react';
import { soundManager } from '../services/sound';

interface WelcomeScreenProps {
  onStartAdventure: (profile: UserProfile, petId: PetId) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartAdventure }) => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<number | ''>(20);
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [currentWeight, setCurrentWeight] = useState<number | ''>(58);
  const [height, setHeight] = useState<number | ''>(165);
  const [targetWeight, setTargetWeight] = useState<number | ''>(54);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [selectedPet, setSelectedPet] = useState<PetId>('rabbit');
  const [errorMsg, setErrorMsg] = useState('');

  const petKeys = Object.keys(PETS) as PetId[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('กรุณากรอกชื่อเล่นสำหรับเรียกในเกมนะ');
      return;
    }
    if (!age || age < 12 || age > 100) {
      setErrorMsg('กรุณากรอกอายุที่สมเหตุสมผล');
      return;
    }
    if (!currentWeight || currentWeight < 30 || currentWeight > 250) {
      setErrorMsg('กรุณากรอกน้ำหนักปัจจุบันที่ถูกต้อง (กก.)');
      return;
    }
    if (!height || height < 100 || height > 230) {
      setErrorMsg('กรุณากรอกส่วนสูงที่ถูกต้อง (ซม.)');
      return;
    }
    if (!targetWeight || targetWeight < 30 || targetWeight > 250) {
      setErrorMsg('กรุณากรอกน้ำหนักเป้าหมายที่ต้องการ (กก.)');
      return;
    }

    // Safety guardrail: avoid extreme weight differences
    const weightDiff = Math.abs(Number(currentWeight) - Number(targetWeight));
    if (weightDiff > 40) {
      setErrorMsg('เพื่อสุขภาพที่ดีและปลอดภัย แนะนำให้ตั้งเป้าหมายทีละช่วง (ไม่เกิน 15-20 กก.)');
      return;
    }

    setErrorMsg('');
    soundManager.playLevelUp();

    const profile: UserProfile = {
      nickname: nickname.trim(),
      age: Number(age),
      gender,
      currentWeight: Number(currentWeight),
      startWeight: Number(currentWeight),
      height: Number(height),
      targetWeight: Number(targetWeight),
      activityLevel,
      createdAt: new Date().toISOString(),
    };

    onStartAdventure(profile, selectedPet);
  };

  const bmiPreview = calculateBMI(Number(currentWeight) || 0, Number(height) || 0);
  const bmrPreview = calculateBMR(
    Number(currentWeight) || 0,
    Number(height) || 0,
    Number(age) || 20,
    gender
  );
  const tdeePreview = calculateTDEE(bmrPreview, activityLevel);
  const calorieRangePreview = calculateCalorieRange(
    tdeePreview,
    Number(currentWeight) || 0,
    Number(targetWeight) || 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#F5F3FF] to-[#E0F2FE] py-8 px-4 flex flex-col items-center justify-center">
      {/* Decorative Floating Clouds/Stars */}
      <div className="max-w-xl w-full mx-auto">
        {/* Game Title Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-pink-200 shadow-xs mb-2 backdrop-blur-xs"
          >
            <span className="text-xl">🌸</span>
            <span className="text-xs sm:text-sm font-bold text-pink-600">
              เกมดูแลสุขภาพสำหรับนักศึกษา
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            🌷 Trainer For You
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            เริ่มต้นการผจญภัยดูแลสุขภาพ พร้อมสัตว์เลี้ยงคู่ใจแสนน่ารัก!
          </p>
        </div>

        {/* Main Onboarding Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-xl border border-pink-100"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Step 1: Pet Choice with Big Preview */}
            <div className="flex flex-col items-center bg-gradient-to-b from-pink-50/70 to-purple-50/40 rounded-3xl p-4 border border-pink-100">
              <span className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">
                🐾 เลือกสัตว์เลี้ยงคู่ใจของคุณ
              </span>

              {/* Big Animated Pet Graphic */}
              <div className="my-1">
                <PetDisplay
                  petId={selectedPet}
                  equippedAccessoryId={null}
                  reactionMessage={`สวัสดี! เราคือ ${PETS[selectedPet].name} พร้อมผจญภัยกับเธอแล้วนะ 🌸`}
                />
              </div>

              {/* 8 Pet Selectable Carousel / Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full mt-2">
                {petKeys.map((key) => {
                  const petItem = PETS[key];
                  const isSelected = selectedPet === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedPet(key);
                      }}
                      className={`flex flex-col items-center p-2 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-white border-pink-400 shadow-md ring-2 ring-pink-300 scale-105'
                          : 'bg-white/60 border-slate-100 hover:bg-white hover:border-pink-200'
                      }`}
                    >
                      <span className="text-2xl">{petItem.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center mt-1">
                        {petItem.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Student Health Information */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-pink-100 pb-2">
                <span className="text-lg">📝</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  ข้อมูลเบื้องต้นของนักผจญภัย
                </h2>
              </div>

              {/* Nickname, Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อเล่น <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น กัส, มายด์, พิม"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อายุ (ปี) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Gender for BMR calculation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เพศกำเนิด (สำหรับคำนวณ BMR อัตราเผาผลาญ) <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'female', label: 'หญิง 👩' },
                    { id: 'male', label: 'ชาย 👨' },
                    { id: 'other', label: 'ทั่วไป ✨' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setGender(g.id as any);
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                        gender === g.id
                          ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white border-pink-500 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-pink-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Weight, Height, Target Weight */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                    น้ำหนัก (kg) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={currentWeight}
                    onChange={(e) =>
                      setCurrentWeight(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm bg-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                    ส่วนสูง (cm) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={height}
                    onChange={(e) =>
                      setHeight(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm bg-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                    เป้าหมาย (kg) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={targetWeight}
                    onChange={(e) =>
                      setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-pink-300 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-sm bg-pink-50/50 text-center font-bold text-pink-700"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ระดับกิจกรรมในชีวิตประจำวัน (คำนวณ TDEE)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      id: 'sedentary' as ActivityLevel,
                      title: '🪑 นั่งเรียน/ทำงานเป็นหลัก',
                      sub: 'ขยับตัวน้อย นั่งอ่านหนังสือ',
                    },
                    {
                      id: 'light' as ActivityLevel,
                      title: '🚶 เคลื่อนไหวเบาๆ',
                      sub: 'เดินไปเรียน เดินขึ้นบันได',
                    },
                    {
                      id: 'moderate' as ActivityLevel,
                      title: '🏃 ออกกำลังกายปานกลาง',
                      sub: 'สัปดาห์ละ 2-3 ครั้ง',
                    },
                    {
                      id: 'active' as ActivityLevel,
                      title: '⚡ ออกกำลังกายสม่ำเสมอ',
                      sub: 'สัปดาห์ละ 4-5 ครั้ง หรือเล่นกีฬา',
                    },
                  ].map((act) => {
                    const isSelected = activityLevel === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          soundManager.playPop();
                          setActivityLevel(act.id);
                        }}
                        className={`p-2.5 rounded-2xl text-left transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-pink-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{act.title}</div>
                          <div className="text-[10px] text-slate-400">{act.sub}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comprehensive Live Health Calculation Card (BMI, BMR, TDEE) */}
              {bmiPreview.value > 0 && (
                <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/70 to-sky-50/70 p-3.5 rounded-3xl border border-pink-200/80 text-xs flex flex-col gap-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-pink-500" />
                      ผลคำนวณสุขภาพเริ่มต้นของคุณ (Live Health Metrics)
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">
                      อัปเดตเรียลไทม์ ✨
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* BMI */}
                    <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/70 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 block">BMI</span>
                      <span className={`text-lg font-black ${bmiPreview.color}`}>
                        {bmiPreview.value}
                      </span>
                      <span className={`block text-[9px] font-bold mt-0.5 ${bmiPreview.color}`}>
                        {bmiPreview.label}
                      </span>
                    </div>

                    {/* BMR */}
                    <div className="bg-white/90 p-2.5 rounded-2xl border border-purple-200/70 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-purple-600 flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3 text-purple-500" /> BMR
                      </span>
                      <span className="text-lg font-black text-purple-700">
                        {bmrPreview.toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">kcal พัก</span>
                    </div>

                    {/* TDEE */}
                    <div className="bg-white/90 p-2.5 rounded-2xl border border-sky-200/70 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-sky-600 flex items-center justify-center gap-0.5">
                        <Zap className="w-3 h-3 text-sky-500" /> TDEE
                      </span>
                      <span className="text-lg font-black text-sky-700">
                        {tdeePreview.toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">kcal รวมกิจกรรม</span>
                    </div>
                  </div>

                  {/* Target recommendation */}
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-slate-700 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 font-bold">ช่วงพลังงานที่แนะนำ: </span>
                      <span className="font-extrabold text-emerald-700">
                        {calorieRangePreview.min} - {calorieRangePreview.max} kcal/วัน
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">ปลอดภัย ไม่โยโย่ 🥗</span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    * BMI, BMR และ TDEE เป็นเครื่องมือคัดกรองและประเมินพลังงานเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
              เริ่มการผจญภัย
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
