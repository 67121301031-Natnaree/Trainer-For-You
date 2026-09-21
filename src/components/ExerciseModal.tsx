import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ExerciseLog } from '../types';
import { X, Sparkles, Check, Activity, Clock, Flame, Calendar } from 'lucide-react';
import { soundManager } from '../services/sound';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExercise: (log: Omit<ExerciseLog, 'id'>) => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  onSaveExercise,
}) => {
  const [selectedActivity, setSelectedActivity] = useState('เดิน');
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const activities = [
    { name: 'เดิน', emoji: '🚶', baseBurnPerMin: 4 },
    { name: 'วิ่ง', emoji: '🏃', baseBurnPerMin: 9 },
    { name: 'ปั่นจักรยาน', emoji: '🚴', baseBurnPerMin: 7 },
    { name: 'ว่ายน้ำ', emoji: '🏊', baseBurnPerMin: 8 },
    { name: 'เวทเทรนนิง', emoji: '🏋️', baseBurnPerMin: 6 },
    { name: 'คาร์ดิโอ', emoji: '🤸', baseBurnPerMin: 7.5 },
    { name: 'โยคะ / ยืดกล้ามเนื้อ', emoji: '🧘', baseBurnPerMin: 3.5 },
    { name: 'กีฬา / อื่น ๆ', emoji: '🏸', baseBurnPerMin: 6.5 },
  ];

  const currentAct = activities.find((a) => a.name === selectedActivity) || activities[0];
  const intensityMultiplier = intensity === 'light' ? 0.8 : intensity === 'moderate' ? 1.0 : 1.3;
  const estimatedBurn = Math.round(currentAct.baseBurnPerMin * duration * intensityMultiplier);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playLevelUp();

    onSaveExercise({
      timestamp: new Date(date).toISOString(),
      activityName: selectedActivity,
      durationMinutes: duration,
      intensity,
      estimatedCaloriesBurned: estimatedBurn,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-pink-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-sky-100 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                บันทึกการออกกำลังกาย
              </h2>
              <p className="text-xs text-purple-600 font-semibold">
                ขยับร่างกายเพื่อความสดชื่นและความแข็งแรง
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 flex flex-col gap-4 text-sm text-slate-700">
          {/* Activity Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              เลือกกิจกรรมที่ทำ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {activities.map((act) => {
                const isSelected = selectedActivity === act.name;
                return (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedActivity(act.name);
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                      isSelected
                        ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs ring-2 ring-purple-200'
                        : 'bg-white border-slate-200 hover:border-pink-200 text-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{act.emoji}</span>
                    <span className="text-[11px] font-bold text-center truncate w-full">
                      {act.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระยะเวลา (นาที)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="300"
                  required
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm font-bold text-center"
                />
                <span className="text-xs text-slate-400">นาที</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm bg-white text-center"
              />
            </div>
          </div>

          {/* Intensity Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ระดับความเข้มข้น (Intensity)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light' as const, label: '🌱 เบาสบาย', desc: 'หายใจคล่อง ไม่เหนื่อย' },
                { id: 'moderate' as const, label: '⚡ กำลังดี', desc: 'เหงื่อซึม พูดคุยได้' },
                { id: 'vigorous' as const, label: '🔥 หนักสะใจ', desc: 'หัวใจเต้นเร็ว สดชื่น' },
              ].map((lvl) => {
                const isSelected = intensity === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      setIntensity(lvl.id);
                    }}
                    className={`p-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-200 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-pink-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{lvl.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Calories Box with Safe Labeling */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-500" />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  พลังงานเผาผลาญประมาณการ:
                </span>
                <span className="text-[10px] text-slate-500">
                  * เป็นเพียงค่าประมาณตามน้ำหนักและเวลา ไม่ใช่เป้าหมายเพื่อชดเชยอาหาร
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-black text-purple-700">~{estimatedBurn}</span>
              <span className="text-xs text-purple-500 font-bold ml-1">kcal</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ความรู้สึกหรือบันทึกเพิ่มเติม (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น วันนี้สดชื่นมาก, วิ่งรอบสนามมหาวิทยาลัย"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-sm bg-white"
            />
          </div>

          {/* Positive Reward Banner */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-700 bg-purple-100/60 py-2.5 rounded-2xl">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>ขยับร่างกายวันนี้ รับทันที:</span>
            <span className="text-pink-600">⭐ +40 XP</span>
            <span>•</span>
            <span className="text-amber-600">🪙 +20 Coins</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            บันทึกการออกกำลังกาย
          </button>
        </form>
      </motion.div>
    </div>
  );
};
