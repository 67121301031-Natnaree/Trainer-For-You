import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExerciseLog } from '../types';
import {
  X,
  Sparkles,
  Check,
  Activity,
  Clock,
  Flame,
  Calendar,
  Lock,
  Search,
  Sliders,
  Table,
  Info,
  ChevronDown,
  Dumbbell,
  Scale,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { soundManager } from '../services/sound';
import {
  EXERCISE_DATABASE,
  EXERCISE_CATEGORIES,
  calculateExerciseBurn,
  getBmiBrackets,
  getExerciseDatabase,
  STANDARD_WEIGHT_BENCHMARKS,
  ExerciseItem,
} from '../services/exerciseDatabase';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExercise: (log: Omit<ExerciseLog, 'id'>) => void;
  userWeight?: number;
  userHeight?: number;
  userBmi?: { value: number; label: string; color: string; bg: string };
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  onSaveExercise,
  userWeight = 58,
  userHeight = 165,
  userBmi = { value: 21.3, label: 'น้ำหนักสมส่วน', color: 'text-emerald-600', bg: 'bg-emerald-100' },
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'table'>('log');
  const [exercisesList, setExercisesList] = useState<ExerciseItem[]>(getExerciseDatabase);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('jogging');
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [exerciseImage, setExerciseImage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table display options
  const [tableComparisonMode, setTableComparisonMode] = useState<'weight' | 'bmi'>('weight');
  const [tableTimeMinutes, setTableTimeMinutes] = useState<number>(30);

  // Reload database on open and reset photo
  useEffect(() => {
    if (isOpen) {
      setExercisesList(getExerciseDatabase());
    } else {
      setExerciseImage(null);
    }
  }, [isOpen]);

  // Handle Photo Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setExerciseImage(reader.result as string);
        soundManager.playLevelUp();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercisesList.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [exercisesList, selectedCategory, searchQuery]);

  const currentExercise =
    exercisesList.find((e) => e.id === selectedExerciseId) || exercisesList[0] || EXERCISE_DATABASE[0];

  // Calculate live burn based on user's exact body weight (tied to BMI)
  const estimatedBurn = calculateExerciseBurn(
    currentExercise.met,
    userWeight,
    duration,
    intensity
  );

  // BMI Benchmark Brackets
  const bmiBrackets = useMemo(() => {
    return getBmiBrackets(userWeight, userHeight);
  }, [userWeight, userHeight]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playLevelUp();

    onSaveExercise({
      timestamp: new Date(date).toISOString(),
      activityName: currentExercise.name,
      durationMinutes: duration,
      intensity,
      estimatedCaloriesBurned: estimatedBurn,
      notes: notes.trim()
        ? `${notes.trim()} (คำนวณตาม BMI: ${userBmi.value}, น้ำหนัก: ${userWeight} kg)`
        : `คำนวณตาม BMI: ${userBmi.value} (นน. ${userWeight} kg)`,
      imageUrl: exerciseImage || undefined,
    });

    setExerciseImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-sky-100 px-4 sm:px-6 py-3.5 border-b border-pink-200/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🏃‍♀️</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800 leading-tight flex items-center gap-1.5">
                <span>บันทึก & ตารางเผาผลาญการออกกำลังกาย</span>
              </h2>
              <p className="text-[11px] text-purple-700 font-bold">
                สูตรคำนวณ METs สอดคล้องกับน้ำหนักตัวและตารางสาธารณสุข
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BMI Lock Status Bar */}
        <div className="bg-purple-900 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-700 text-yellow-300">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-black text-yellow-300">
                🔒 ล็อกคำนวณตาม BMI ของคุณ: {userBmi.value} ({userBmi.label})
              </span>
              <span className="text-purple-200 text-[11px] ml-2 font-medium hidden sm:inline">
                • น้ำหนักอ้างอิง: {userWeight} กก. (สูง {userHeight} ซม.)
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 pt-2 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playPop();
                setActiveTab('log');
              }}
              className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'log'
                  ? 'border-purple-600 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>บันทึกกิจกรรม & คำนวณแคล</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playPop();
                setActiveTab('table');
              }}
              className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'table'
                  ? 'border-purple-600 text-purple-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>ตารางเทียบแคลอรี่ตามเกณฑ์ (ในไฟล์)</span>
            </button>
          </div>

          {activeTab === 'table' && (
            <div className="hidden sm:flex items-center gap-2 pb-2">
              {/* Duration switch (30m vs 60m) */}
              <div className="bg-white rounded-xl border border-purple-200 p-0.5 flex text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTableTimeMinutes(30)}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    tableTimeMinutes === 30 ? 'bg-purple-600 text-white' : 'text-slate-600'
                  }`}
                >
                  30 นาที
                </button>
                <button
                  type="button"
                  onClick={() => setTableTimeMinutes(60)}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    tableTimeMinutes === 60 ? 'bg-purple-600 text-white' : 'text-slate-600'
                  }`}
                >
                  1 ชม. (60น.)
                </button>
              </div>

              {/* Comparison Mode Switch */}
              <div className="bg-white rounded-xl border border-purple-200 p-0.5 flex text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTableComparisonMode('weight')}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    tableComparisonMode === 'weight'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600'
                  }`}
                >
                  เกณฑ์ นน. (50-80kg)
                </button>
                <button
                  type="button"
                  onClick={() => setTableComparisonMode('bmi')}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    tableComparisonMode === 'bmi'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600'
                  }`}
                >
                  เกณฑ์ BMI
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'table' ? (
            /* TAB 2: Full Benchmark Comparison Table like in the document / image */
            <div className="space-y-4">
              {/* Mobile controls for table options */}
              <div className="flex sm:hidden items-center justify-between gap-2 p-2 bg-purple-50 rounded-xl border border-purple-200 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-purple-900 text-[11px]">เวลา:</span>
                  <button
                    type="button"
                    onClick={() => setTableTimeMinutes(30)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      tableTimeMinutes === 30 ? 'bg-purple-600 text-white' : 'bg-white'
                    }`}
                  >
                    30น.
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableTimeMinutes(60)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      tableTimeMinutes === 60 ? 'bg-purple-600 text-white' : 'bg-white'
                    }`}
                  >
                    60น.
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-purple-900 text-[11px]">โหมด:</span>
                  <button
                    type="button"
                    onClick={() => setTableComparisonMode('weight')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      tableComparisonMode === 'weight' ? 'bg-purple-600 text-white' : 'bg-white'
                    }`}
                  >
                    เกณฑ์ นน.
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableComparisonMode('bmi')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      tableComparisonMode === 'bmi' ? 'bg-purple-600 text-white' : 'bg-white'
                    }`}
                  >
                    เกณฑ์ BMI
                  </button>
                </div>
              </div>

              {/* Table Info Banner (Without the edit button circled by user) */}
              <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-purple-900">
                  <p className="font-black text-sm mb-0.5">
                    ตารางการเผาผลาญพลังงาน (กิโลแคลอรี) ต่อ {tableTimeMinutes} นาที{' '}
                    {tableComparisonMode === 'weight'
                      ? 'ตามน้ำหนักตัวมาตรฐาน (50, 60, 70, 80 กก.)'
                      : 'ตามระดับดัชนีมวลกาย (BMI)'}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    คำนวณด้วยสูตรมาตรฐานวิทยาศาสตร์การกีฬา: <code className="bg-purple-100/80 px-1 py-0.5 rounded font-bold text-purple-900">METs × นน.(กก.) × เวลา(ชม.)</code>{' '}
                    แถบคอลัมน์สีม่วงคือ **น้ำหนักและ BMI ของคุณ ({userWeight} kg)**
                  </p>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-2xl border border-purple-200/90 shadow-2xs bg-white">
                <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-purple-100/90 text-purple-950 font-black border-b border-purple-200 text-[11px]">
                      <th className="p-3">กิจกรรมการออกกำลังกาย</th>
                      <th className="p-2 text-center w-16">METs</th>
                      <th className="p-3 text-center bg-purple-600 text-white font-black">
                        🌟 นน.คุณ ({userWeight} kg)
                      </th>

                      {tableComparisonMode === 'weight' ? (
                        /* Standard Weight Tiers 50, 60, 70, 80 kg (Typical in Thai handouts) */
                        STANDARD_WEIGHT_BENCHMARKS.map((w) => {
                          const isClose = Math.abs(userWeight - w) < 5;
                          return (
                            <th
                              key={w}
                              className={`p-2 text-center ${
                                isClose
                                  ? 'bg-purple-200/70 text-purple-900 font-black'
                                  : 'text-slate-600 font-bold'
                              }`}
                            >
                              <div>นน. {w} กก.</div>
                              <div className="text-[9px] font-normal text-slate-500">
                                {tableTimeMinutes} นาที
                              </div>
                            </th>
                          );
                        })
                      ) : (
                        /* BMI Benchmark Tiers */
                        bmiBrackets.map((b) => (
                          <th
                            key={b.bmiRange}
                            className={`p-2 text-center ${
                              b.isUserBracket
                                ? 'bg-purple-200/70 text-purple-900 font-black'
                                : 'text-slate-600 font-bold'
                              }`}
                          >
                            <div>BMI {b.bmiRange}</div>
                            <div className="text-[9px] font-normal text-slate-500">
                              (~{b.representativeWeightKg} kg)
                            </div>
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {exercisesList.map((item) => {
                      const userBurn = calculateExerciseBurn(
                        item.met,
                        userWeight,
                        tableTimeMinutes,
                        'moderate'
                      );
                      const isSelected = selectedExerciseId === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            soundManager.playPop();
                            setSelectedExerciseId(item.id);
                            setActiveTab('log');
                          }}
                          className={`hover:bg-purple-50/70 cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50/90 font-bold' : ''
                          }`}
                        >
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{item.emoji}</span>
                              <div>
                                <div className="font-extrabold text-slate-800">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {item.categoryName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-center text-slate-500 font-bold">
                            {item.met.toFixed(1)}
                          </td>
                          <td className="p-2.5 text-center font-black text-purple-800 bg-purple-50">
                            <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 font-black">
                              {userBurn} kcal
                            </span>
                          </td>

                          {tableComparisonMode === 'weight' ? (
                            STANDARD_WEIGHT_BENCHMARKS.map((w) => {
                              const burnVal = calculateExerciseBurn(
                                item.met,
                                w,
                                tableTimeMinutes,
                                'moderate'
                              );
                              const isClose = Math.abs(userWeight - w) < 5;
                              return (
                                <td
                                  key={w}
                                  className={`p-2 text-center ${
                                    isClose
                                      ? 'bg-purple-100/50 font-black text-purple-900'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {burnVal}
                                </td>
                              );
                            })
                          ) : (
                            bmiBrackets.map((b) => {
                              const bBurn = calculateExerciseBurn(
                                item.met,
                                b.representativeWeightKg,
                                tableTimeMinutes,
                                'moderate'
                              );
                              return (
                                <td
                                  key={b.bmiRange}
                                  className={`p-2 text-center ${
                                    b.isUserBracket
                                      ? 'bg-purple-100/50 font-black text-purple-900'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {bBurn}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Table Tip (Clean without the edit link circled by user) */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 py-1">
                <span>💡 คลิกที่แถวกิจกรรมใดก็ได้ เพื่อเลือกไปบันทึกและถ่ายรูปยืนยันได้ทันที</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('log')}
                  className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ไปหน้าบันทึก & ถ่ายรูปยืนยัน</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB 1: Log Activity Form */
            <form onSubmit={handleSave} className="flex flex-col gap-4 text-sm text-slate-700">
              {/* Category Filter & Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-extrabold text-slate-700">
                    เลือกกิจกรรมออกกำลังกาย
                  </label>
                  <div className="relative w-44 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหา เช่น วิ่ง, โยคะ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {EXERCISE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="mr-1">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Grid Selector */}
              <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                {filteredExercises.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  const quickBurn30 = calculateExerciseBurn(ex.met, userWeight, 30, 'moderate');

                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedExerciseId(ex.id);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-2xl flex-shrink-0">{ex.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-800 truncate">
                            {ex.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {ex.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-purple-700">~{quickBurn30}</span>
                        <div className="text-[9px] text-slate-400">kcal/30น.</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Exercise Summary Banner */}
              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentExercise.emoji}</span>
                  <div>
                    <div className="font-black text-purple-950 text-xs sm:text-sm">
                      {currentExercise.name}
                    </div>
                    <div className="text-[10px] text-purple-700">
                      ค่า METs: {currentExercise.met} • {currentExercise.categoryName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500">ระดับแนะนำ:</span>
                  <div className="text-[11px] font-black text-purple-700">
                    {currentExercise.recommendedIntensity === 'vigorous'
                      ? '🔥 หนักสะใจ'
                      : currentExercise.recommendedIntensity === 'moderate'
                      ? '⚡ ปานกลาง'
                      : '🌱 เบาสบาย'}
                  </div>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>ระยะเวลาที่ออกกำลังกาย</span>
                  </label>
                  <span className="font-black text-purple-700 text-sm">
                    {duration} นาที{' '}
                    <span className="text-[10px] text-slate-400">
                      ({(duration / 60).toFixed(1)} ชม.)
                    </span>
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold">กดเลือกเร็ว:</span>
                  {[15, 20, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setDuration(mins);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        duration === mins
                          ? 'bg-purple-600 text-white font-black'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50'
                      }`}
                    >
                      {mins} น.
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Intensity Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ระดับความเข้มข้น (Intensity)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'light' as const, label: '🌱 เบาสบาย', desc: '×0.85' },
                      { id: 'moderate' as const, label: '⚡ กำลังดี', desc: '×1.0' },
                      { id: 'vigorous' as const, label: '🔥 สะใจ', desc: '×1.25' },
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
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-100 border-purple-500 text-purple-950 font-black ring-1 ring-purple-300'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50/50'
                          }`}
                        >
                          <div className="text-[11px] font-bold">{lvl.label}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{lvl.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    วันที่ทำกิจกรรม
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Live Estimated Calories Display & Calculation Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl shadow-xs">
                      🔥
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        พลังงานที่เผาผลาญประมาณการ
                      </div>
                      <div className="text-[10px] text-purple-700 font-bold">
                        🔒 คำนวณเฉพาะบุคคล: นน. {userWeight} กก. (BMI {userBmi.value})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-purple-900">
                      ~{estimatedBurn}
                    </span>
                    <span className="text-xs font-extrabold text-purple-700 ml-1">kcal</span>
                  </div>
                </div>

                {/* Formula Breakdown Toggle */}
                <div className="pt-2 border-t border-purple-200/70 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                    className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      สูตรคำนวณมาตรฐาน: METs ({currentExercise.met}) × น้ำหนัก ({userWeight} kg) × (
                      {duration}/60 ชม.)
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showFormulaDetails ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showFormulaDetails && (
                    <div className="mt-1.5 p-2 bg-white/80 rounded-xl text-[10px] text-slate-600 leading-relaxed">
                      💡 อ้างอิงตามสูตรสาธารณสุขสากล (Compendium of Physical Activities): การใช้พลังงาน = ค่าแรงต้านของกิจกรรม (MET) คูณด้วยน้ำหนักตัวของผู้ใช้ และระยะเวลาที่ออกกำลังกาย โดยสำหรับผู้ที่มี BMI {userBmi.value} น้ำหนัก {userWeight} กิโลกรัม จะได้อัตราการเผาผลาญที่เที่ยงตรง ไม่ใช่ค่าเฉลี่ยสุ่มทั่วไป
                    </div>
                  )}
                </div>
              </div>

              {/* 📸 ส่วนถ่ายรูป / แนบรูปภาพยืนยันการออกกำลังกาย (Photo Verification Proof) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-pink-50/70 border border-purple-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>📸 ถ่ายรูป / แนบรูปภาพยืนยันการออกกำลังกาย</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                    ✨ +10 Coins โบนัสมีรูป
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ถ่ายรูปหน้าปัดลู่วิ่ง, สมาร์ทวอทช์ (Apple Watch/Garmin), เหงื่อ, รูปวิว หรือเซลฟี่เพื่อยืนยัน
                </p>

                {!exerciseImage ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* ปุ่ม 1: ถ่ายรูปด้วยกล้อง */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50/60 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs group"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-600 transition-colors">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-purple-900">📷 เปิดกล้องถ่ายรูป</span>
                      <span className="text-[10px] text-slate-400">ถ่ายรูปหน้าปัด/นาฬิกา</span>
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </button>

                    {/* ปุ่ม 2: เลือกรูปจากอัลบั้ม */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-2xl border-2 border-dashed border-pink-300 hover:border-pink-500 bg-white hover:bg-pink-50/60 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs group"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center text-pink-600 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-pink-900">🖼️ เลือกรูปจากเครื่อง</span>
                      <span className="text-[10px] text-slate-400">จากคลังภาพ / อัลบั้ม</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-purple-400 bg-slate-900 shadow-md">
                    <img
                      src={exerciseImage}
                      alt="Exercise Proof"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playPop();
                          setExerciseImage(null);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบรูป</span>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 border border-white/20">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>มีรูปหลักฐานยืนยันความสำเร็จแล้ว ✅ (+10 Coins)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกความรู้สึก / สถานที่ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  placeholder="เช่น วิ่งรอบสนามหอพัก รู้สึกเหงื่อออกสดชื่นมาก!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Gamification Rewards */}
              <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-purple-700 bg-purple-100/70 py-2.5 rounded-2xl">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>บันทึกการออกกำลังกาย รับทันที:</span>
                <span className="text-pink-600">⭐ +40 XP</span>
                <span>•</span>
                <span className="text-amber-600">🪙 +20 Coins</span>
                {exerciseImage && (
                  <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full">
                    +10 โบนัสรูปภาพ!
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>บันทึกผลการออกกำลังกาย</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
