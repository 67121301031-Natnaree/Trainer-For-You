import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MealPlanDay } from '../types';
import { soundManager } from '../services/sound';
import { estimateCaloriesFromText } from '../services/calorieEstimator';
import { estimateExerciseBurnFromText } from '../services/exerciseDatabase';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Edit3,
  Save,
  Trash2,
  Sparkles,
  Dumbbell,
  Utensils,
  Flame,
  Camera,
  Upload,
  X,
  Check,
  Eye,
  LayoutGrid,
  Table,
  Trophy,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface WeeklyMealTablePlannerProps {
  weeklyMealPlan: MealPlanDay[];
  onUpdateMealPlan: (updatedPlan: MealPlanDay[]) => void;
  onToggleWeeklyMealItem?: (
    dayIndex: number,
    itemKey:
      | 'breakfastDone'
      | 'lunchDone'
      | 'dinnerDone'
      | 'snackDone'
      | 'exerciseDone',
    imageUrl?: string
  ) => void;
  onUploadDayPhoto?: (
    dayIndex: number,
    imageUrl: string,
    note?: string,
    confirmationType?: 'food' | 'exercise' | 'auto',
    mealTypeOption?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    customCalories?: number,
    customMinutes?: number
  ) => void;
  petEmoji?: string;
  petName?: string;
  userWeight?: number;
  userBmi?: number;
}

interface PhotoConfirmDialogData {
  dayIndex: number;
  dayName: string;
  existingPhoto?: string;
  existingNote?: string;
  defaultType?: 'food' | 'exercise';
}

export const WeeklyMealTablePlanner: React.FC<WeeklyMealTablePlannerProps> = ({
  weeklyMealPlan,
  onUpdateMealPlan,
  onToggleWeeklyMealItem,
  onUploadDayPhoto,
  petEmoji = '🐰',
  petName = 'Mochi',
  userWeight = 58,
  userBmi = 21.3,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [draftPlan, setDraftPlan] = useState<MealPlanDay[]>(weeklyMealPlan);

  // Photo Dialog State
  const [photoDialog, setPhotoDialog] = useState<PhotoConfirmDialogData | null>(null);
  const [dialogCategory, setDialogCategory] = useState<'food' | 'exercise'>('food');
  const [dialogMealType, setDialogMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [dialogNote, setDialogNote] = useState('');
  const [dialogCalories, setDialogCalories] = useState<string>('');
  const [dialogMinutes, setDialogMinutes] = useState<string>('30');
  const [dialogImagePreview, setDialogImagePreview] = useState<string | null>(null);

  // Fullscreen Preview Modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Sync draft whenever weeklyMealPlan updates and user is not editing
  React.useEffect(() => {
    if (!isEditingTable) {
      setDraftPlan(weeklyMealPlan);
    }
  }, [weeklyMealPlan, isEditingTable]);

  // Current day of week (0 = Monday, ..., 6 = Sunday)
  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Calculate 7-day photo completion
  const completedPhotoDaysCount = weeklyMealPlan.filter(
    (d) => !!d.photoUrl || (d.breakfastDone && d.breakfastImage) || (d.exerciseDone && d.exerciseImage) || (d.confirmations && d.confirmations.length > 0)
  ).length;

  const photoProgressPercent = Math.round((completedPhotoDaysCount / 7) * 100);

  // Open photo confirmation dialog
  const handleOpenPhotoDialog = (
    dayIndex: number,
    dayName: string,
    existingPhoto?: string,
    existingNote?: string,
    defaultType: 'food' | 'exercise' = 'food'
  ) => {
    soundManager.playPop();
    const targetDay = weeklyMealPlan.find((d) => d.dayIndex === dayIndex);
    const initialNote =
      existingNote ||
      (defaultType === 'exercise'
        ? targetDay?.exercise || 'วิ่งออกกำลังกาย 30 นาที'
        : targetDay?.lunch || targetDay?.breakfast || 'ข้าวยำอกไก่ คลีน');

    setPhotoDialog({ dayIndex, dayName, existingPhoto, existingNote, defaultType });
    setDialogCategory(defaultType);
    setDialogNote(initialNote);
    setDialogImagePreview(existingPhoto || null);
    if (defaultType === 'exercise') {
      const estEx = estimateExerciseBurnFromText(initialNote, userWeight);
      setDialogCalories(estEx ? String(estEx.calories) : '150');
      setDialogMinutes(estEx ? String(estEx.minutes) : '30');
    } else {
      const estCal = estimateCaloriesFromText(initialNote);
      setDialogCalories(estCal ? String(estCal) : '350');
    }
  };

  // Close photo dialog
  const handleClosePhotoDialog = () => {
    setPhotoDialog(null);
    setDialogNote('');
    setDialogCalories('');
    setDialogMinutes('30');
    setDialogImagePreview(null);
  };

  // Handle image upload inside dialog
  const handleDialogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDialogImagePreview(reader.result as string);
        soundManager.playPop();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Save photo confirmation
  const handleSavePhotoConfirm = () => {
    if (!photoDialog || !dialogImagePreview) {
      alert('กรุณาเลือกหรือถ่ายรูปภาพก่อนกดยืนยัน');
      return;
    }

    const { dayIndex } = photoDialog;
    const imageUrl = dialogImagePreview;
    const note =
      dialogNote.trim() ||
      (dialogCategory === 'exercise'
        ? `ออกกำลังกายวัน${photoDialog.dayName}`
        : `มื้ออาหารวัน${photoDialog.dayName}`);
    const numCalories = parseInt(dialogCalories, 10) || undefined;
    const numMinutes = parseInt(dialogMinutes, 10) || undefined;

    // Update state via callback or locally
    if (onUploadDayPhoto) {
      onUploadDayPhoto(
        dayIndex,
        imageUrl,
        note,
        dialogCategory,
        dialogMealType,
        numCalories,
        numMinutes
      );
    } else {
      const updated = weeklyMealPlan.map((d) =>
        d.dayIndex === dayIndex
          ? {
              ...d,
              photoUrl: imageUrl,
              photoNote: note,
              photoConfirmedAt: new Date().toISOString(),
              breakfastDone: true,
            }
          : d
      );
      onUpdateMealPlan(updated);
      setDraftPlan(updated);
      soundManager.playLevelUp();
    }

    handleClosePhotoDialog();
  };

  // Quick Direct Photo Upload (Direct from Card File Input)
  const handleDirectQuickPhotoUpload = (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const targetDay = weeklyMealPlan.find((d) => d.dayIndex === dayIndex);
        const dayName = targetDay ? targetDay.dayName : '';
        const defaultNote = targetDay?.lunch || targetDay?.exercise || `ยืนยันว่าทำจริง วัน${dayName}`;

        if (onUploadDayPhoto) {
          onUploadDayPhoto(dayIndex, dataUrl, defaultNote);
        } else {
          const updated = weeklyMealPlan.map((d) =>
            d.dayIndex === dayIndex
              ? {
                  ...d,
                  photoUrl: dataUrl,
                  photoNote: defaultNote,
                  photoConfirmedAt: new Date().toISOString(),
                  breakfastDone: true,
                }
              : d
          );
          onUpdateMealPlan(updated);
          setDraftPlan(updated);
          soundManager.playLevelUp();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Remove Photo for Day
  const handleRemovePhoto = (dayIndex: number) => {
    soundManager.playPop();
    const updated = weeklyMealPlan.map((d) =>
      d.dayIndex === dayIndex
        ? {
            ...d,
            photoUrl: undefined,
            photoNote: undefined,
            photoConfirmedAt: undefined,
            confirmations: [],
          }
        : d
    );
    onUpdateMealPlan(updated);
    setDraftPlan(updated);
    handleClosePhotoDialog();
  };

  // Text changes for table mode
  const handleTableTextChange = (
    dayIndex: number,
    fieldKey: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'exercise',
    value: string
  ) => {
    setDraftPlan((prev) =>
      prev.map((d) => (d.dayIndex === dayIndex ? { ...d, [fieldKey]: value } : d))
    );
  };

  const handleSaveTableDraft = () => {
    soundManager.playLevelUp();
    onUpdateMealPlan(draftPlan);
    setIsEditingTable(false);
  };

  const handleCancelTableEdit = () => {
    soundManager.playPop();
    setDraftPlan(weeklyMealPlan);
    setIsEditingTable(false);
  };

  const handleClearAllTable = () => {
    if (window.confirm('คุณต้องการล้างตารางทั้งหมดเป็นตารางเปล่าใช่หรือไม่?')) {
      soundManager.playPop();
      const cleared = draftPlan.map((d) => ({
        ...d,
        breakfast: '',
        breakfastDone: false,
        lunch: '',
        lunchDone: false,
        dinner: '',
        dinnerDone: false,
        snack: '',
        snackDone: false,
        exercise: '',
        exerciseDone: false,
        photoUrl: undefined,
        photoNote: undefined,
      }));
      setDraftPlan(cleared);
      onUpdateMealPlan(cleared);
      setIsEditingTable(true);
    }
  };

  const getDayTotalEstimatedCalories = (day: MealPlanDay): number => {
    const bCal = estimateCaloriesFromText(day.breakfast) || 0;
    const lCal = estimateCaloriesFromText(day.lunch) || 0;
    const dCal = estimateCaloriesFromText(day.dinner) || 0;
    const sCal = estimateCaloriesFromText(day.snack || '') || 0;
    return bCal + lCal + dCal + sCal;
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-pink-200/90 shadow-sm mb-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-pink-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2 flex-wrap">
                <span>ภารกิจ 7 วัน: ถ่ายรูปยืนยันว่าทำ</span>
                <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                  📸 ยืนยันว่าทำจริง {completedPhotoDaysCount}/7 วัน
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ทั้ง 7 วันมีปุ่มถ่ายรูปยืนยันว่าทำ ถ่ายรูปอาหารหรือการออกกำลังกายในแต่ละวันเพื่อรับ XP และเหรียญรางวัล! ✨
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => {
              soundManager.playPop();
              setViewMode('cards');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>การ์ดถ่ายรูป 7 วัน</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playPop();
              setViewMode('table');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-pink-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>ตารางรายละเอียดอาหาร</span>
          </button>
        </div>
      </div>

      {/* 7-Day Streak & Progress Header */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl p-3.5 border border-purple-200/80 mb-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <span className="text-xs font-black text-purple-950 block">
                ความคืบหน้าการถ่ายรูปยืนยัน 7 วัน (7-Day Photo Streak)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ทำสำเร็จ {completedPhotoDaysCount} จาก 7 วัน ({photoProgressPercent}%) • ถ่ายรูปรับโบนัสทันที +30 XP, +20 🪙
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {weeklyMealPlan.map((d) => {
              const isDone = !!d.photoUrl || (d.breakfastDone && d.breakfastImage) || (d.exerciseDone && d.exerciseImage);
              const isToday = d.dayIndex === currentDayIndex;

              return (
                <div
                  key={d.dayIndex}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isToday
                      ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-1 font-bold'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                  title={`วัน${d.dayName}: ${isDone ? 'ยืนยันว่าทำแล้ว' : 'ยังไม่ยืนยัน'}`}
                >
                  {isDone ? '✓' : d.dayName.slice(0, 1)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden border border-purple-200/60 p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${photoProgressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 rounded-full"
          />
        </div>

        {completedPhotoDaysCount === 7 && (
          <div className="mt-2 text-center text-xs font-black text-emerald-700 bg-white/90 py-1.5 px-3 rounded-xl border border-emerald-300">
            🎉 ยินดีด้วย! คุณถ่ายรูปยืนยันว่าทำครบทั้ง 7 วันเรียบร้อยแล้ว สุดยอดวินัยมาก! 💖✨
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 7-DAY PHOTO CARDS (แสดงทั้ง 7 วัน จันทร์ - อาทิตย์ ชัดเจนทุกวัน)     */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {weeklyMealPlan.map((day) => {
              const isDone = !!day.photoUrl;
              const photo = day.photoUrl;
              const isToday = day.dayIndex === currentDayIndex;

              // Check planned meals/exercise
              const plannedItems = [
                day.breakfast ? `เช้า: ${day.breakfast}` : null,
                day.lunch ? `กลางวัน: ${day.lunch}` : null,
                day.dinner ? `เย็น: ${day.dinner}` : null,
                day.snack ? `ของว่าง: ${day.snack}` : null,
                day.exercise ? `ออกกำลังกาย: ${day.exercise}` : null,
              ].filter(Boolean);

              return (
                <div
                  key={day.dayIndex}
                  className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs ${
                    isToday
                      ? 'border-purple-400 ring-2 ring-purple-200/70 bg-gradient-to-b from-purple-50/40 via-white to-pink-50/20'
                      : isDone
                      ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/30 to-white'
                      : 'border-slate-200 hover:border-pink-300 bg-white'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800 text-sm">
                        วัน{day.dayName}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">
                          📍 วันนี้
                        </span>
                      )}
                    </div>

                    {isDone ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ยืนยันว่าทำแล้ว ✅</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                        ⏳ ยังไม่ได้ยืนยัน
                      </span>
                    )}
                  </div>

                  {/* Card Body: Photo Verification Area */}
                  <div className="p-3.5 flex-1 flex flex-col justify-center">
                    {/* If there are confirmations or photo */}
                    {isDone && photo ? (
                      <div className="space-y-2.5">
                        {/* Display Latest Confirmed Photo */}
                        <div
                          className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 shadow-xs cursor-pointer group"
                          onClick={() =>
                            setPreviewImage({
                              url: photo,
                              title: `รูปยืนยันว่าทำวัน${day.dayName}`,
                            })
                          }
                        >
                          <img
                            src={photo}
                            alt={`วัน${day.dayName}`}
                            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black gap-1">
                            <Eye className="w-4 h-4" /> แตะเพื่อดูรูปใหญ่
                          </div>
                          <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/20">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span>
                              {day.confirmations && day.confirmations.length > 1
                                ? `ยืนยันแล้ว ${day.confirmations.length} รายการ`
                                : 'ยืนยันแล้ว'}
                            </span>
                          </div>
                        </div>

                        {/* Note / Caption */}
                        {day.photoNote && (
                          <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-200/60 text-[11px] text-purple-900 font-semibold leading-tight flex items-center justify-between">
                            <span className="truncate">📝 {day.photoNote}</span>
                          </div>
                        )}

                        {/* Multi-confirmation history badges if multiple records */}
                        {day.confirmations && day.confirmations.length > 1 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 block">
                              ประวัติยืนยันในวันนี้ ({day.confirmations.length} รอบ):
                            </span>
                            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                              {day.confirmations.map((c, idx) => (
                                <div
                                  key={c.id || idx}
                                  className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]"
                                >
                                  <div className="flex items-center gap-1 truncate">
                                    <span>{c.type === 'exercise' ? '🏃' : '🍱'}</span>
                                    <span className="truncate font-bold text-slate-700">
                                      {c.note || (c.type === 'exercise' ? 'ออกกำลังกาย' : 'อาหาร')}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-black flex-shrink-0 ${
                                      c.type === 'exercise' ? 'text-purple-600' : 'text-pink-600'
                                    }`}
                                  >
                                    {c.type === 'exercise'
                                      ? `-${c.calories || 150} kcal`
                                      : `+${c.calories || 350} kcal`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons: Add another confirmation (+ ยืนยันเพิ่มอีกรอบ) */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenPhotoDialog(
                                day.dayIndex,
                                day.dayName,
                                undefined,
                                '',
                                'food'
                              )
                            }
                            className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ยืนยันเพิ่มอีกรอบ (มื้ออื่น/ออกกำลังกาย)</span>
                          </button>

                          <div className="flex items-center justify-between px-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPhotoDialog(
                                  day.dayIndex,
                                  day.dayName,
                                  day.photoUrl,
                                  day.photoNote,
                                  'food'
                                )
                              }
                              className="text-[11px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                            >
                              แก้ไขรูปหลัก
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(day.dayIndex)}
                              className="text-[11px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                            >
                              ลบรูปหลัก
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Big Prominent "ถ่ายรูปยืนยันว่าทำ" Button */
                      <div className="space-y-2 py-1">
                        <div className="text-center pb-1">
                          <span className="text-xs font-bold text-slate-500 block">
                            {plannedItems.length > 0
                              ? plannedItems.slice(0, 2).join(' • ')
                              : 'ยังไม่ได้ระบุเมนูอาหาร/ออกกำลังกาย'}
                          </span>
                        </div>

                        {/* Primary Action Buttons: Food confirmation vs Exercise confirmation */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPhotoDialog(
                                  day.dayIndex,
                                  day.dayName,
                                  undefined,
                                  day.lunch || day.breakfast || '',
                                  'food'
                                )
                              }
                              className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              <span>ยืนยันอาหาร</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPhotoDialog(
                                  day.dayIndex,
                                  day.dayName,
                                  undefined,
                                  day.exercise || '',
                                  'exercise'
                                )
                              }
                              className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>ยืนยันออกกำลังกาย</span>
                            </button>
                          </div>

                          <label
                            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.01] ${
                              isToday
                                ? 'bg-slate-900 hover:bg-black text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                            <span>📷 ถ่ายรูปด่วน (+30 XP)</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleDirectQuickPhotoUpload(day.dayIndex, e)}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Quick Planned Summary */}
                  <div className="p-2.5 px-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[170px]">
                      {day.exercise ? `🏃 ${day.exercise}` : day.lunch ? `🍱 ${day.lunch}` : 'ว่าง'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setViewMode('table');
                        setIsEditingTable(true);
                      }}
                      className="text-pink-600 font-bold hover:underline cursor-pointer flex-shrink-0"
                    >
                      วางแผน
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DETAILED MEAL & EXERCISE TABLE (สำหรับคนที่อยากดูตารางคำนวณแคล)      */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-600 font-semibold">
              ตารางวางแผนเมนูอาหาร 7 วัน พร้อมคำนวณแคลอรี่โดยประมาณ
            </span>
            <div className="flex items-center gap-2">
              {isEditingTable ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelTableEdit}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTableDraft}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกตาราง</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      setIsEditingTable(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-pink-100 text-pink-700 hover:bg-pink-200 font-bold text-xs flex items-center gap-1 border border-pink-200 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขตารางอาหาร</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllTable}
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 cursor-pointer"
                    title="ล้างข้อมูลทั้งหมด"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-pink-200/80 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-pink-100/90 via-purple-100/80 to-pink-100/90 text-slate-700 font-black border-b border-pink-200">
                  <th className="p-3 w-20 text-center">วัน</th>
                  <th className="p-3 w-28 text-center bg-purple-50/70 text-purple-900 border-r border-pink-200">
                    📸 รูปยืนยันว่าทำ
                  </th>
                  <th className="p-3">🌅 เช้า</th>
                  <th className="p-3">☀️ กลางวัน</th>
                  <th className="p-3">🌙 เย็น</th>
                  <th className="p-3">🍎 ของว่าง</th>
                  <th className="p-3 w-20 text-center bg-pink-50/50 text-pink-700 border-l border-pink-200">
                    🔥 แคลอรี่
                  </th>
                  <th className="p-3 bg-purple-50/50 text-purple-900 border-l border-pink-200">
                    🏃 ออกกำลังกาย
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {draftPlan.map((day) => {
                  const estCal = getDayTotalEstimatedCalories(day);
                  const isDone = !!day.photoUrl;

                  return (
                    <tr
                      key={day.dayIndex}
                      className={`hover:bg-pink-50/20 transition-colors ${
                        day.dayIndex === currentDayIndex ? 'bg-purple-50/30' : ''
                      }`}
                    >
                      {/* Day Name */}
                      <td className="p-3 text-center align-middle font-black text-slate-800 bg-slate-50/60 border-r border-pink-100">
                        <span className="px-2 py-1 rounded-xl bg-pink-100 text-pink-700 text-xs font-black inline-block">
                          {day.dayName}
                        </span>
                        {day.dayIndex === currentDayIndex && (
                          <span className="block text-[9px] text-purple-700 font-bold mt-0.5">
                            (วันนี้)
                          </span>
                        )}
                      </td>

                      {/* Photo Verification Column */}
                      <td className="p-2 text-center align-middle border-r border-pink-100 bg-purple-50/10">
                        {isDone && day.photoUrl ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <img
                              src={day.photoUrl}
                              alt="Proof"
                              onClick={() =>
                                setPreviewImage({
                                  url: day.photoUrl!,
                                  title: `รูปยืนยันว่าทำวัน${day.dayName}`,
                                })
                              }
                              className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-400 shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                            />
                            {day.confirmations && day.confirmations.length > 1 && (
                              <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-1 rounded-full">
                                {day.confirmations.length} รอบ
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPhotoDialog(
                                  day.dayIndex,
                                  day.dayName,
                                  undefined,
                                  '',
                                  'food'
                                )
                              }
                              className="text-[9px] text-purple-700 hover:underline font-bold cursor-pointer"
                            >
                              +ยืนยันเพิ่ม
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenPhotoDialog(
                                day.dayIndex,
                                day.dayName,
                                undefined,
                                day.lunch || day.exercise || '',
                                'food'
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-[11px] font-black cursor-pointer shadow-2xs"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>ยืนยัน</span>
                          </button>
                        )}
                      </td>

                      {/* Breakfast */}
                      <td className="p-2 align-middle">
                        {isEditingTable ? (
                          <input
                            type="text"
                            value={day.breakfast || ''}
                            onChange={(e) =>
                              handleTableTextChange(day.dayIndex, 'breakfast', e.target.value)
                            }
                            placeholder="เมนูเช้า..."
                            className="w-full px-2 py-1 rounded-lg border border-pink-200 text-xs bg-white focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-700">{day.breakfast || '-'}</span>
                        )}
                      </td>

                      {/* Lunch */}
                      <td className="p-2 align-middle">
                        {isEditingTable ? (
                          <input
                            type="text"
                            value={day.lunch || ''}
                            onChange={(e) =>
                              handleTableTextChange(day.dayIndex, 'lunch', e.target.value)
                            }
                            placeholder="เมนูกลางวัน..."
                            className="w-full px-2 py-1 rounded-lg border border-pink-200 text-xs bg-white focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-700">{day.lunch || '-'}</span>
                        )}
                      </td>

                      {/* Dinner */}
                      <td className="p-2 align-middle">
                        {isEditingTable ? (
                          <input
                            type="text"
                            value={day.dinner || ''}
                            onChange={(e) =>
                              handleTableTextChange(day.dayIndex, 'dinner', e.target.value)
                            }
                            placeholder="เมนูเย็น..."
                            className="w-full px-2 py-1 rounded-lg border border-pink-200 text-xs bg-white focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-700">{day.dinner || '-'}</span>
                        )}
                      </td>

                      {/* Snack */}
                      <td className="p-2 align-middle">
                        {isEditingTable ? (
                          <input
                            type="text"
                            value={day.snack || ''}
                            onChange={(e) =>
                              handleTableTextChange(day.dayIndex, 'snack', e.target.value)
                            }
                            placeholder="ของว่าง..."
                            className="w-full px-2 py-1 rounded-lg border border-pink-200 text-xs bg-white focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-700">{day.snack || '-'}</span>
                        )}
                      </td>

                      {/* Calories */}
                      <td className="p-2 text-center align-middle border-l border-pink-100 bg-pink-50/20 font-bold text-pink-700">
                        {estCal > 0 ? `~${estCal}` : '-'}
                      </td>

                      {/* Exercise */}
                      <td className="p-2 align-middle border-l border-pink-100">
                        {isEditingTable ? (
                          <input
                            type="text"
                            value={day.exercise || ''}
                            onChange={(e) =>
                              handleTableTextChange(day.dayIndex, 'exercise', e.target.value)
                            }
                            placeholder="ออกกำลังกาย..."
                            className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs bg-white focus:outline-none"
                          />
                        ) : (
                          <span className="text-purple-900 font-semibold">{day.exercise || '-'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📸 POPUP DIALOG: ถ่ายรูปยืนยันว่าทำวัน...                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {photoDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs"
            onClick={handleClosePhotoDialog}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-5 border border-purple-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">
                      ถ่ายรูปยืนยันว่าทำ: วัน{photoDialog.dayName}
                    </h4>
                    <span className="text-[11px] text-purple-700 font-bold">
                      📸 แนบรูปอาหารหรือการออกกำลังกาย (+30 XP, +20 🪙)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClosePhotoDialog}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Preview / Upload Area */}
              {dialogImagePreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 shadow-xs">
                    <img
                      src={dialogImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>รูปพร้อมยืนยันแล้ว ✅</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-2 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>ถ่ายรูปใหม่</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleDialogFileChange}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setDialogImagePreview(null)}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
                    >
                      ลบรูปนี้
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Primary: Camera */}
                  <label className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]">
                    <Camera className="w-5 h-5" />
                    <span>📷 เปิดกล้องถ่ายรูปยืนยันว่าทำ</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleDialogFileChange}
                    />
                  </label>

                  {/* Secondary: Upload from gallery */}
                  <label className="w-full py-3 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer border border-purple-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>🖼️ เลือกรูปจากอัลบั้มมือถือ</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDialogFileChange}
                    />
                  </label>
                </div>
              )}

              {/* Note / Caption Input */}
              <div className="space-y-2">
                {/* Category Selector: Food vs Exercise */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ประเภทการยืนยัน:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setDialogCategory('food');
                        const estCal = estimateCaloriesFromText(dialogNote);
                        setDialogCalories(estCal ? String(estCal) : '350');
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        dialogCategory === 'food'
                          ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>🍱 มื้ออาหาร (นับแคลกิน)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setDialogCategory('exercise');
                        const estEx = estimateExerciseBurnFromText(dialogNote, userWeight);
                        setDialogCalories(estEx ? String(estEx.calories) : '150');
                        setDialogMinutes(estEx ? String(estEx.minutes) : '30');
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        dialogCategory === 'exercise'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>🏃 ออกกำลังกาย (นับเผาผลาญ)</span>
                    </button>
                  </div>
                </div>

                {/* Sub-selector for Food meal type */}
                {dialogCategory === 'food' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      ช่วงมื้ออาหาร:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                      {(
                        [
                          { key: 'breakfast', label: '🌅 เช้า' },
                          { key: 'lunch', label: '☀️ กลางวัน' },
                          { key: 'dinner', label: '🌙 เย็น' },
                          { key: 'snack', label: '🍎 ของว่าง' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setDialogMealType(m.key)}
                          className={`py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                            dialogMealType === m.key
                              ? 'bg-pink-100 border-pink-400 text-pink-700 font-black'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note / Caption Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{dialogCategory === 'exercise' ? 'กิจกรรมออกกำลังกาย:' : 'ชื่อเมนูอาหาร / โน้ต:'}</span>
                    <span className="text-[10px] text-slate-400">
                      {dialogCategory === 'exercise' ? 'เช่น วิ่งลู่ 30 นาที, เต้นแอโรบิก' : 'เช่น ข้าวยำอกไก่, สลัดทูน่า'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={dialogNote}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDialogNote(val);
                      if (dialogCategory === 'exercise') {
                        const estEx = estimateExerciseBurnFromText(val, userWeight);
                        if (estEx) {
                          setDialogCalories(String(estEx.calories));
                          setDialogMinutes(String(estEx.minutes));
                        }
                      } else {
                        const estCal = estimateCaloriesFromText(val);
                        if (estCal) {
                          setDialogCalories(String(estCal));
                        }
                      }
                    }}
                    placeholder={
                      dialogCategory === 'exercise'
                        ? 'เช่น วิ่ง 30 นาที, กระโดดเชือก...'
                        : 'เช่น ข้าวกล้องอกไก่ย่าง, ผลไม้...'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Calories & Minutes Calculation Input */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      {dialogCategory === 'exercise' ? '🔥 เผาผลาญ (kcal)' : '🍱 แคลอรี่ (kcal)'}
                    </label>
                    <input
                      type="number"
                      value={dialogCalories}
                      onChange={(e) => setDialogCalories(e.target.value)}
                      placeholder={dialogCategory === 'exercise' ? '150' : '350'}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-black text-slate-800 bg-white focus:outline-none"
                    />
                  </div>

                  {dialogCategory === 'exercise' ? (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        ⏱️ เวลาทำ (นาที)
                      </label>
                      <input
                        type="number"
                        value={dialogMinutes}
                        onChange={(e) => setDialogMinutes(e.target.value)}
                        placeholder="30"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-black text-slate-800 bg-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center text-[11px] text-slate-500 font-medium">
                      <span>✨ จะถูกนับขึ้นยอด</span>
                      <span className="font-bold text-pink-600">"มื้ออาหาร & แคลอรี่"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dialog Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClosePhotoDialog}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ปิด
                </button>

                <button
                  type="button"
                  disabled={!dialogImagePreview}
                  onClick={handleSavePhotoConfirm}
                  className={`flex-1 py-2.5 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                    dialogImagePreview
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 cursor-pointer'
                      : 'bg-slate-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกยืนยันว่าทำ ✅</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FULLSCREEN PHOTO LIGHTBOX MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-3 border border-pink-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100">
                <span className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>{previewImage.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
              />
              <div className="pt-2 text-center text-xs text-emerald-700 font-black flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>หลักฐานยืนยันว่าทำจริงเรียบร้อยแล้ว ✅</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
