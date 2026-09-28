import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoalPlan } from '../types';
import { soundManager } from '../services/sound';
import {
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  Target,
  Flame,
  Droplet,
  Utensils,
  Dumbbell,
  Smile,
  Camera,
  Upload,
} from 'lucide-react';

interface GoalPlannerSectionProps {
  plans: GoalPlan[];
  onAddPlan: (plan: Omit<GoalPlan, 'id' | 'isCompleted'>) => void;
  onTogglePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlanPhoto?: (id: string, imageUrl: string) => void;
  petEmoji?: string;
  petName?: string;
}

export const GoalPlannerSection: React.FC<GoalPlannerSectionProps> = ({
  plans,
  onAddPlan,
  onTogglePlan,
  onDeletePlan,
  onUpdatePlanPhoto,
  petEmoji = '🐰',
  petName = 'Mochi',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalPlan['category']>('diet');
  const [targetValue, setTargetValue] = useState('');
  const [planImage, setPlanImage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPlans = plans.filter((p) => p.date === todayStr);

  const completedCount = todayPlans.filter((p) => p.isCompleted).length;
  const totalCount = todayPlans.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Image Upload handler for new goal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPlanImage(reader.result as string);
        soundManager.playLevelUp();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Image Upload handler for existing goal in list
  const handleUploadPhotoForPlan = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (onUpdatePlanPhoto) {
          onUpdatePlanPhoto(id, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Quick suggestions for students
  const quickSuggestions = [
    { title: 'ดื่มน้ำให้ครบ 8 แก้ว (2 ลิตร)', category: 'water' as const, target: '8 แก้ว' },
    { title: 'ไม่ดื่มชานม / น้ำหวานวันนี้', category: 'diet' as const, target: 'หวาน 0%' },
    { title: 'เดินขึ้นบันไดแทนลิฟต์ 2 ชั้น', category: 'exercise' as const, target: '2 รอบ' },
    { title: 'นอนก่อนเที่ยงคืน (พักผ่อน 7 ชม.)', category: 'habit' as const, target: '23:30 น.' },
    { title: 'ทานผักสลัดหรือผลไม้ 1 จาน', category: 'diet' as const, target: '1 จาน' },
    { title: 'ออกกำลังกาย / ยืดเหงือก 15 นาที', category: 'exercise' as const, target: '15 นาที' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundManager.playPop();
    onAddPlan({
      date: todayStr,
      title: title.trim(),
      category,
      targetValue: targetValue.trim() || undefined,
      imageUrl: planImage || undefined,
    });

    setTitle('');
    setTargetValue('');
    setPlanImage(null);
    setIsAdding(false);
  };

  const handlePickSuggestion = (s: (typeof quickSuggestions)[0]) => {
    soundManager.playPop();
    onAddPlan({
      date: todayStr,
      title: s.title,
      category: s.category,
      targetValue: s.target,
    });
  };

  const getCategoryIcon = (cat: GoalPlan['category']) => {
    switch (cat) {
      case 'diet':
        return <Utensils className="w-3.5 h-3.5 text-pink-500" />;
      case 'exercise':
        return <Dumbbell className="w-3.5 h-3.5 text-purple-500" />;
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-sky-500" />;
      case 'habit':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'mind':
        return <Smile className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <Target className="w-3.5 h-3.5 text-pink-500" />;
    }
  };

  const getCategoryName = (cat: GoalPlan['category']) => {
    switch (cat) {
      case 'diet':
        return 'อาหาร';
      case 'exercise':
        return 'ออกกำลังกาย';
      case 'water':
        return 'ดื่มน้ำ';
      case 'habit':
        return 'นิสัยสุขภาพ';
      case 'mind':
        return 'ผ่อนคลาย';
      default:
        return 'เป้าหมาย';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl p-4 sm:p-5 border-2 border-purple-200/80 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center text-xl shadow-2xs">
            🎯
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
              <span>วางแผนเป้าหมายของตัวเอง</span>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                Goal Planner
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              ตั้งเป้าหมายประจำวัน แล้วดูว่าทำสำเร็จตามแผนไหม!
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2">
          <div className="bg-white px-3 py-1.5 rounded-2xl border border-purple-200 shadow-2xs flex items-center gap-2">
            <span className="text-xs font-black text-purple-700">
              สำเร็จ {completedCount}/{totalCount}
            </span>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-black text-slate-500">
              {progressPercent}%
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              setIsAdding(!isAdding);
            }}
            className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'ปิดฟอร์ม' : 'เพิ่มแผนใหม่'}</span>
          </button>
        </div>
      </div>

      {/* Adding Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mb-4 p-3.5 bg-white/95 rounded-2xl border border-purple-200/90 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                ✏️ เขียนเป้าหมายที่อยากทำให้ได้วันนี้
              </span>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                +20 XP เมื่อทำสำเร็จ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="เช่น ไม่กินของทอดในมื้อเย็น, ดื่มน้ำ 2 ลิตร..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 bg-white"
                  autoFocus
                />
              </div>

              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-400 bg-white"
                >
                  <option value="diet">🍱 อาหาร & โภชนาการ</option>
                  <option value="exercise">🏃 ออกกำลังกาย & ก้าวเดิน</option>
                  <option value="water">💧 ดื่มน้ำเปล่า</option>
                  <option value="habit">⏰ พักผ่อน / นิสัย</option>
                  <option value="mind">🧘 ผ่อนคลาย / สุขภาพจิต</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <input
                type="text"
                placeholder="ระบุเป้าหมายตัวเลข (ไม่บังคับ เช่น 8 แก้ว, 20 นาที)"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-400 bg-white"
              />

              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                บันทึกแผนงาน
              </button>
            </div>

            {/* Photo Attachment (Optional) */}
            <div className="pt-1 flex items-center justify-between gap-2 border-t border-purple-100">
              {!planImage ? (
                <label className="px-3 py-1.5 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 text-[11px] font-bold text-purple-700 flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5 text-purple-600" />
                  <span>📸 ถ่ายรูป / แนบรูปภาพยืนยันเป้าหมาย</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2">
                  <img
                    src={planImage}
                    alt="Goal preview"
                    className="w-9 h-9 rounded-xl object-cover border border-purple-300 shadow-2xs"
                  />
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>แนบรูปหลักฐานแล้ว ✅</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPlanImage(null)}
                    className="text-[10px] text-rose-500 hover:underline font-bold"
                  >
                    ลบรูป
                  </button>
                </div>
              )}
              <span className="text-[10px] text-slate-400">
                (รูปอาหาร, แก้วน้ำ, หรือรูปออกกำลังกาย)
              </span>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Today's Goal List */}
      <div className="space-y-2">
        {todayPlans.length === 0 ? (
          <div className="p-4 bg-white/70 rounded-2xl border border-dashed border-purple-200 text-center flex flex-col items-center">
            <span className="text-3xl mb-1">{petEmoji}</span>
            <p className="text-xs font-bold text-slate-700">
              ยังไม่ได้วางแผนสำหรับวันนี้เลย
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
              เลือกจากแผนแนะนำด้านล่าง หรือกด "เพิ่มแผนใหม่" เพื่อเริ่มสร้างความสำเร็จไปด้วยกันนะ!
            </p>
          </div>
        ) : (
          todayPlans.map((plan) => (
            <motion.div
              key={plan.id}
              layout
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                plan.isCompleted
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-white border-purple-100 shadow-2xs hover:border-purple-200'
              }`}
            >
              {/* Checkbox & Title */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playPurr();
                  onTogglePlan(plan.id);
                }}
                className="flex items-center gap-2.5 flex-1 text-left cursor-pointer group"
              >
                {plan.isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-bold transition-all ${
                        plan.isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {plan.title}
                    </span>
                    {plan.targetValue && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.2 rounded-full">
                        {plan.targetValue}
                      </span>
                    )}
                    {plan.imageUrl && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Camera className="w-3 h-3" />
                        <span>มีรูปยืนยัน ✅</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {getCategoryIcon(plan.category)}
                    <span>{getCategoryName(plan.category)}</span>
                    {plan.isCompleted && (
                      <span className="text-emerald-600 font-bold ml-1">
                        ✓ ทำสำเร็จแล้ว (+20 XP)
                      </span>
                    )}
                  </div>
                </div>

                {plan.imageUrl ? (
                  <div className="relative group/img flex-shrink-0">
                    <img
                      src={plan.imageUrl}
                      alt="Proof"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-400 shadow-2xs"
                    />
                    <label
                      className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[9px] font-bold"
                      title="เปลี่ยนรูปภาพ"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleUploadPhotoForPlan(plan.id, e)}
                      />
                    </label>
                  </div>
                ) : (
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0"
                    title="ถ่ายรูปยืนยันเป้าหมายนี้"
                  >
                    <Camera className="w-3 h-3 text-purple-600" />
                    <span>ถ่ายรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleUploadPhotoForPlan(plan.id, e)}
                    />
                  </label>
                )}
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playPop();
                  onDeletePlan(plan.id);
                }}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                title="ลบแผนนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Suggestions Chips */}
      <div className="mt-3.5 pt-3 border-t border-purple-100">
        <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>แผนแนะนำสำหรับนักศึกษา (แตะเพื่อเพิ่มทันที):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePickSuggestion(s)}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 border border-purple-200/70 text-slate-700 text-[11px] font-bold shadow-2xs hover:border-purple-300 flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3 text-purple-500" />
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
