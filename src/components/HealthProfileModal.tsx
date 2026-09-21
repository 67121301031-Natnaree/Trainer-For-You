import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, ActivityLevel } from '../types';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieRange } from '../constants';
import { X, User, Heart, Sparkles, Check, Edit2, ShieldAlert, RotateCcw } from 'lucide-react';
import { soundManager } from '../services/sound';

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  currentWeight: number;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetAllData: () => void;
}

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentWeight,
  onUpdateProfile,
  onResetAllData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [age, setAge] = useState<number>(profile?.age || 20);
  const [gender, setGender] = useState<'female' | 'male' | 'other'>(profile?.gender || 'female');
  const [height, setHeight] = useState<number>(profile?.height || 165);
  const [targetWeight, setTargetWeight] = useState<number>(profile?.targetWeight || 55);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel || 'moderate'
  );
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen || !profile) return null;

  const bmi = calculateBMI(currentWeight, height);
  const bmr = calculateBMR(currentWeight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieRange = calculateCalorieRange(tdee, currentWeight, targetWeight);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playLevelUp();
    const updated: UserProfile = {
      ...profile,
      nickname: nickname.trim() || profile.nickname,
      age: Number(age),
      gender,
      height: Number(height),
      targetWeight: Number(targetWeight),
      activityLevel,
    };
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                โปรไฟล์สุขภาพ (Health Profile)
              </h2>
              <p className="text-xs text-pink-600 font-semibold">
                เข้าใจร่างกายด้วยข้อมูลเชิงวิทยาศาสตร์แบบสร้างสรรค์
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-sm text-slate-700">
          {/* Main User Card */}
          <div className="bg-gradient-to-r from-pink-50/80 to-purple-50/80 rounded-3xl p-4 border border-pink-100 flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-slate-800">
                คุณ {profile.nickname}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                อายุ {profile.age} ปี • ส่วนสูง {profile.height} ซม.
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playPop();
                setIsEditing(!isEditing);
              }}
              className="px-3 py-1.5 bg-white text-pink-600 rounded-xl border border-pink-200 text-xs font-bold shadow-xs hover:bg-pink-50 transition-colors flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditing ? 'ยกเลิกแก้ไข' : 'แก้ไขข้อมูล'}
            </button>
          </div>

          {/* Edit Profile Inline Form */}
          {isEditing && (
            <form
              onSubmit={handleSaveEdit}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3"
            >
              <h4 className="text-xs font-bold text-slate-800">แก้ไขข้อมูลส่วนตัว</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    อายุ
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    ส่วนสูง (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    เป้าหมาย (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Gender selector for accurate BMR calculation */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  เพศกำเนิด (สำหรับคำนวณ BMR สูตรมาตรฐาน Mifflin-St Jeor)
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'female', label: 'หญิง 👩' },
                    { id: 'male', label: 'ชาย 👨' },
                    { id: 'other', label: 'ทั่วไป ✨' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`py-1.5 px-2 rounded-xl font-bold border transition-colors ${
                        gender === g.id
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-pink-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  ระดับกิจกรรม
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  <option value="sedentary">🪑 นั่งเรียน/ทำงานเป็นหลัก (ขยับตัวน้อย)</option>
                  <option value="light">🚶 เคลื่อนไหวเบาๆ (เดินไปเรียน 1-3 วัน/สัปดาห์)</option>
                  <option value="moderate">🏃 ออกกำลังกายปานกลาง (2-3 วัน/สัปดาห์)</option>
                  <option value="active">⚡ ออกกำลังกายสม่ำเสมอ (4-5 วัน/สัปดาห์)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-colors"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </form>
          )}

          {/* Metric Cards: BMI, BMR, TDEE */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* BMI */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">BMI (ดัชนีมวลกาย)</span>
                <span className={`text-2xl font-black ${bmi.color}`}>{bmi.value}</span>
              </div>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bmi.bg} ${bmi.color}`}>
                  {bmi.label}
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">เกณฑ์เอเชีย 18.5 - 22.9</span>
              </div>
            </div>

            {/* BMR */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-purple-600 font-bold block mb-0.5">BMR (พลังงานขณะพัก)</span>
                <span className="text-2xl font-black text-purple-700">{bmr.toLocaleString()}</span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  kcal / วัน
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">สูตร Mifflin-St Jeor</span>
              </div>
            </div>

            {/* TDEE */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-sky-600 font-bold block mb-0.5">TDEE (ใช้จริงรวมกิจกรรม)</span>
                <span className="text-2xl font-black text-sky-600">{tdee.toLocaleString()}</span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  kcal / วัน
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">BMR × ระดับกิจกรรม</span>
              </div>
            </div>
          </div>

          {/* Scientific Formulas & Explanations Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col gap-2">
            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
              <span>📖</span>
              <span>คำอธิบายและสูตรการคำนวณทางโภชนาการ:</span>
            </span>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <div>
                <strong className="text-slate-800">• BMI:</strong> คำนวณจาก <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-700">น้ำหนัก (กก.) ÷ ส่วนสูง² (ม.)</code> สำหรับคนเอเชีย ช่วงปกติคือ 18.5 - 22.9 กก./ตร.ม.
              </div>
              <div>
                <strong className="text-slate-800">• BMR:</strong> คำนวณด้วยสูตรมาตรฐานทางการแพทย์ <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-700">Mifflin-St Jeor</code> คือพลังงานขั้นต่ำสุดที่อวัยวะภายในต้องใช้เพื่อมีชีวิตรอด ห้ามกินน้อยกว่าค่านี้เด็ดขาด
              </div>
              <div>
                <strong className="text-slate-800">• TDEE:</strong> คำนวณจาก <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-700">BMR × ปัจจัยกิจกรรม</code> คือพลังงานที่ร่างกายเผาผลาญจริงตลอดทั้งวัน หากกินเท่า TDEE น้ำหนักจะคงที่ หากกินน้อยกว่าเล็กน้อย (Deficit 200-300 kcal) น้ำหนักจะค่อยๆ ลดลงอย่างปลอดภัย
              </div>
            </div>
          </div>

          {/* Daily Calorie Intake Recommendation */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-3xl border border-emerald-200/70 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-bold text-emerald-900">
                ช่วงพลังงานที่แนะนำต่อวัน (Daily Calorie Range)
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">
                {calorieRange.min} - {calorieRange.max}
              </span>
              <span className="text-xs font-bold text-emerald-600">kcal / วัน</span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              {calorieRange.description}
            </p>
          </div>

          {/* Mandatory Guardrail Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-800">คำเตือนสุขภาพสำคัญ:</div>
              “BMI เป็นเครื่องมือคัดกรองทั่วไป ไม่ใช่การวินิจฉัยสุขภาพ สุขภาพที่ดีประกอบด้วยมวลกล้ามเนื้อ คุณภาพการนอน การจัดการความเครียดในการเรียน และสุขภาวะทางใจ”
            </div>
          </div>

          {/* Positive Student Health Advice */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 flex flex-col gap-1.5 text-xs text-purple-900 leading-relaxed">
            <div className="font-bold flex items-center gap-1 text-purple-800">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-400" />
              คำแนะนำอบอุ่นใจสำหรับนักศึกษา:
            </div>
            <p>
              “เน้นกินโปรตีนให้เพียงพอ เช่น ไข่ต้ม อกไก่ เต้าหู้ นมถั่วเหลือง, ดื่มน้ำระหว่างวันเยอะ ๆ 
              และพยายามนอนหลับให้มีคุณภาพ ไม่ควรงดอาหารจนอ่อนเพลียก่อนเข้าห้องสอบนะ!”
            </p>
          </div>

          {/* Danger zone: Reset app data */}
          <div className="pt-3 border-t border-slate-100 flex flex-col items-center">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ตข้อมูลและเริ่มเล่นใหม่
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-2.5 rounded-2xl border border-rose-200">
                <span className="text-xs text-rose-700 font-bold">
                  แน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?
                </span>
                <button
                  onClick={onResetAllData}
                  className="px-3 py-1 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600"
                >
                  ยืนยันลบ
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
