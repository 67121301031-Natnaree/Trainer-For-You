import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { GameState, FoodLog, ExerciseLog, WeightLog } from '../types';
import { PETS, calculateBMI, calculateBMR, calculateTDEE } from '../constants';
import {
  X,
  BookOpen,
  Trash2,
  Edit2,
  Check,
  Flame,
  Trophy,
  Coins,
  Calendar,
  Sparkles,
  Download,
  Upload,
  Zap,
  Activity,
  FileCheck,
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface AdventureBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onDeleteFoodLog: (id: string) => void;
  onDeleteExerciseLog: (id: string) => void;
  onDeleteWeightLog: (id: string) => void;
  onUpdateFoodLog: (updated: FoodLog) => void;
  onImportGameState?: (importedState: GameState) => void;
}

export const AdventureBookModal: React.FC<AdventureBookModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onDeleteFoodLog,
  onDeleteExerciseLog,
  onDeleteWeightLog,
  onUpdateFoodLog,
  onImportGameState,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'food' | 'exercise' | 'weight'>('overview');
  const [editingFoodLog, setEditingFoodLog] = useState<FoodLog | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const { profile, xp, level, coins, selectedPet, foodLogs, exerciseLogs, weightLogs } = gameState;
  const pet = PETS[selectedPet];

  const currentWeight =
    weightLogs.length > 0
      ? weightLogs[weightLogs.length - 1].weightKg
      : profile?.currentWeight || 0;

  const startWeight =
    profile?.startWeight ||
    (weightLogs.length > 0 ? weightLogs[0].weightKg : currentWeight);
  const targetWeight = profile?.targetWeight || currentWeight;
  const weightLost = Math.max(0, Number((startWeight - currentWeight).toFixed(1)));
  const totalSteps =
    startWeight > targetWeight ? Math.max(1, Math.round(startWeight - targetWeight)) : 3;
  const completedSteps = Math.min(totalSteps, Math.floor(weightLost));

  const bmi = calculateBMI(currentWeight, profile?.height || 0);
  const bmr = calculateBMR(
    currentWeight,
    profile?.height || 0,
    profile?.age || 20,
    profile?.gender
  );
  const tdee = calculateTDEE(bmr, profile?.activityLevel || 'moderate');

  // Nutrition summary calculations
  const totalCaloriesLogged = foodLogs.reduce((acc, log) => acc + log.total.calories, 0);
  const totalProteinLogged = foodLogs.reduce((acc, log) => acc + log.total.protein, 0);
  const totalExerciseMinutes = exerciseLogs.reduce((acc, log) => acc + log.durationMinutes, 0);

  // Export game state to JSON file
  const handleExportJSON = () => {
    soundManager.playLevelUp();
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(gameState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute(
      'download',
      `trainer-for-you-backup-${profile?.nickname || 'hero'}-${dateStr}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setImportNotice('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว! 📁');
    setTimeout(() => setImportNotice(null), 3500);
  };

  // Import game state from JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || !parsed.profile) {
          throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
        }
        if (onImportGameState) {
          soundManager.playLevelUp();
          onImportGameState(parsed);
          setImportNotice('กู้คืนข้อมูลสำเร็จเรียบร้อย! ✨');
          setTimeout(() => setImportNotice(null), 3500);
        }
      } catch (err) {
        setImportNotice('เกิดข้อผิดพลาด: ไฟล์สำรองไม่ถูกต้อง');
        setTimeout(() => setImportNotice(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                สมุดนักผจญภัย (Adventure Book)
              </h2>
              <p className="text-xs text-purple-600 font-semibold">
                บันทึกการเดินทาง สถิติสุขภาพ และประวัติกิจกรรม
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

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1 overflow-x-auto text-xs font-bold">
          {[
            { id: 'overview' as const, label: '🌟 ภาพรวม', count: null },
            { id: 'food' as const, label: '🍱 อาหาร', count: foodLogs.length },
            { id: 'exercise' as const, label: '🏃 ออกกำลังกาย', count: exerciseLogs.length },
            { id: 'weight' as const, label: '⚖️ น้ำหนัก', count: weightLogs.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playPop();
                setActiveTab(t.id);
              }}
              className={`py-2 px-3 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== null && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              {/* Character Snapshot */}
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 rounded-3xl p-4 border border-pink-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-pink-200 flex items-center justify-center text-4xl">
                  {pet.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-800">
                      {profile?.nickname || 'นักผจญภัย'}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                      Lv.{level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คู่หู: {pet.name} ({pet.thaiName.split(' ')[0]}) • อายุ {profile?.age || 20} ปี
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="font-bold text-pink-600">⭐ {xp} XP</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-amber-600">🪙 {coins} Coins</span>
                  </div>
                </div>
              </div>

              {/* Weight Loss Stepping Progress: ลด 1 โล เดิน 1 ก้าว */}
              <div className="p-3.5 bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 rounded-2xl border border-pink-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-pink-200 flex items-center justify-center text-xl">
                    🐾
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>ลด 1 โล เดิน 1 ก้าว</span>
                      <span className="text-[10px] bg-pink-500 text-white px-2 py-0.2 rounded-full font-extrabold">
                        เดินแล้ว {completedSteps}/{totalSteps} ก้าว
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      เริ่มต้น {startWeight} kg ➔ ปัจจุบัน {currentWeight} kg{' '}
                      {weightLost > 0 ? `(ลดแล้ว -${weightLost} kg)` : ''} ➔ เป้าหมาย {targetWeight} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[11px] text-slate-400 font-bold block">น้ำหนักปัจจุบัน</span>
                  <span className="text-lg font-black text-slate-800">{currentWeight}</span>
                  <span className="text-xs text-slate-400 ml-1">kg</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[11px] text-slate-400 font-bold block">น้ำหนักเป้าหมาย</span>
                  <span className="text-lg font-black text-purple-700">{profile?.targetWeight}</span>
                  <span className="text-xs text-slate-400 ml-1">kg</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[11px] text-slate-400 font-bold block">BMI ประมาณการ</span>
                  <span className={`text-lg font-black ${bmi.color}`}>{bmi.value || '-'}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">({bmi.label})</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-purple-100 text-center shadow-xs">
                  <span className="text-[11px] text-purple-600 font-bold block">BMR ขณะพัก</span>
                  <span className="text-lg font-black text-purple-700">{bmr.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">kcal/วัน</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-sky-100 text-center shadow-xs">
                  <span className="text-[11px] text-sky-600 font-bold block">TDEE รวมกิจกรรม</span>
                  <span className="text-lg font-black text-sky-700">{tdee.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">kcal/วัน</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[11px] text-slate-400 font-bold block">ออกกำลังกายสะสม</span>
                  <span className="text-lg font-black text-emerald-600">{totalExerciseMinutes}</span>
                  <span className="text-xs text-slate-400 ml-1">นาที</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed">
                ℹ️ <strong>ข้อควรรู้:</strong> “BMI เป็นเครื่องมือคัดกรองทั่วไป ไม่ใช่การวินิจฉัยสุขภาพ” และน้ำหนักของนักศึกษาจะปรับสมดุลตามการนอน การเรียน และการดื่มน้ำ ขอให้ดูแลตัวเองอย่างผ่อนคลายและมีความสุข
              </div>

              {/* Nutrition Total Milestones */}
              <div className="p-4 bg-gradient-to-br from-white to-pink-50/50 rounded-2xl border border-pink-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  สรุปโภชนาการที่บันทึก (Nutrition Summary):
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block">บันทึกอาหารแล้ว</span>
                    <span className="font-extrabold text-pink-600 text-sm">{foodLogs.length} มื้อ</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block">โปรตีนรวม</span>
                    <span className="font-extrabold text-rose-600 text-sm">{totalProteinLogged} g</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block">แคลอรีบันทึกรวม</span>
                    <span className="font-extrabold text-amber-600 text-sm">{totalCaloriesLogged} kcal</span>
                  </div>
                </div>
              </div>

              {/* Data Safety & Backup (Export / Import) for Real Use */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span>จัดการข้อมูลจริง & สำรองข้อมูล (Data Backup & Sync)</span>
                  </div>
                  <span className="text-[10px] text-purple-600 font-medium">เก็บบันทึกสุขภาพได้ตลอดไป</span>
                </div>
                <p className="text-[11px] text-purple-800/80 leading-relaxed">
                  สามารถดาวน์โหลดข้อมูลสุขภาพของคุณเก็บไว้เป็นไฟล์ JSON เพื่อสำรอง หรือนำไปกู้คืนบนเครื่องอื่น (iPad, มือถือ, คอม) ได้ตลอดเวลา
                </p>

                {importNotice && (
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center border border-emerald-300">
                    {importNotice}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="btn-export-backup-json"
                    type="button"
                    onClick={handleExportJSON}
                    className="flex-1 py-2 px-3 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลดสำรองข้อมูล (JSON)
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    id="btn-import-backup-json"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    กู้คืนข้อมูลจากไฟล์ (Restore)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOOD LOGS */}
          {activeTab === 'food' && (
            <div className="flex flex-col gap-3">
              {foodLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  ยังไม่มีประวัติมื้ออาหารที่บันทึกไว้ ลองกดเมนู 🍱 AI Food เพื่อเริ่มบันทึกนะ!
                </div>
              ) : (
                foodLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                          {log.mealType === 'breakfast'
                            ? '🌅 มื้อเช้า'
                            : log.mealType === 'lunch'
                            ? '☀️ มื้อเที่ยง'
                            : log.mealType === 'dinner'
                            ? '🌙 มื้อเย็น'
                            : '🧋 ของว่าง'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            soundManager.playPop();
                            onDeleteFoodLog(log.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image if attached */}
                    {log.imageUrl && (
                      <div className="w-full max-h-32 overflow-hidden rounded-xl bg-slate-200 flex items-center justify-center">
                        <img
                          src={log.imageUrl}
                          alt="Food"
                          className="object-cover w-full h-full max-h-32"
                        />
                      </div>
                    )}

                    {/* Food Items */}
                    <div className="flex flex-col gap-1 text-xs">
                      {log.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between py-0.5">
                          <span className="font-semibold text-slate-700">
                            • {it.name} ({it.portion})
                          </span>
                          <span className="text-slate-500 font-bold">
                            {it.calories} kcal
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Nutrition Total */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>รวมทั้งมื้อ:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-pink-600 font-black">{log.total.calories} kcal</span>
                        <span className="text-[11px] text-slate-400">P:{log.total.protein}g C:{log.total.carbs}g F:{log.total.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: EXERCISE LOGS */}
          {activeTab === 'exercise' && (
            <div className="flex flex-col gap-3">
              {exerciseLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  ยังไม่มีประวัติการออกกำลังกาย ลองกดเมนู 🏃 ออกกำลังกาย เพื่อเริ่มขยับร่างกายนะ!
                </div>
              ) : (
                exerciseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          🏃 {log.activityName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                          {log.intensity === 'light'
                            ? 'เบาสบาย'
                            : log.intensity === 'moderate'
                            ? 'กำลังดี'
                            : 'หนักสดชื่น'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>⏱️ {log.durationMinutes} นาที</span>
                        <span>•</span>
                        <span>🔥 ~{log.estimatedCaloriesBurned} kcal (ค่าประมาณ)</span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playPop();
                        onDeleteExerciseLog(log.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: WEIGHT LOGS */}
          {activeTab === 'weight' && (
            <div className="flex flex-col gap-3">
              {weightLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  ยังไม่มีประวัติเช็คอินน้ำหนัก
                </div>
              ) : (
                weightLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-800">
                          {log.weightKg} kg
                        </span>
                        <span className="text-xs text-slate-400">
                          (เป้าหมาย {profile?.targetWeight} kg)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {log.note && ` • ${log.note}`}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playPop();
                        onDeleteWeightLog(log.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      title="ลบประวัติ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
