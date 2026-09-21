import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WeightLog, UserProfile } from '../types';
import { X, Sparkles, Check, TrendingDown, TrendingUp, Minus, Castle, Heart } from 'lucide-react';
import { soundManager } from '../services/sound';

interface WeightCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  weightLogs: WeightLog[];
  onSaveWeight: (log: Omit<WeightLog, 'id'>) => void;
}

export const WeightCheckInModal: React.FC<WeightCheckInModalProps> = ({
  isOpen,
  onClose,
  profile,
  weightLogs,
  onSaveWeight,
}) => {
  const latestWeight =
    weightLogs.length > 0
      ? weightLogs[weightLogs.length - 1].weightKg
      : profile?.currentWeight || 55;

  const [weightInput, setWeightInput] = useState<number | ''>(latestWeight);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const targetWeight = profile?.targetWeight || 50;
  const startWeight = profile?.startWeight || profile?.currentWeight || latestWeight;

  // Path progress toward Goal Castle (1 kg = 1 step)
  const isLoss = startWeight > targetWeight;
  const totalSteps = isLoss ? Math.max(1, Math.round(startWeight - targetWeight)) : 3;
  const currentWeightNum = Number(weightInput || latestWeight);
  const weightLost = isLoss ? Math.max(0, startWeight - currentWeightNum) : 0;
  const currentSteps = Math.min(totalSteps, Math.floor(weightLost));

  const totalDistance = Math.abs(startWeight - targetWeight);
  const currentDistance = Math.abs(currentWeightNum - targetWeight);
  const progressPercent =
    totalDistance === 0
      ? 100
      : Math.min(100, Math.max(8, Math.round(((totalDistance - currentDistance) / totalDistance) * 100)));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput || Number(weightInput) < 20 || Number(weightInput) > 300) return;

    soundManager.playLevelUp();
    onSaveWeight({
      timestamp: new Date(date).toISOString(),
      weightKg: Number(weightInput),
      note: note.trim() || undefined,
    });

    onClose();
  };

  // Recent 7 weight entries for SVG line visualization
  const sortedLogs = [...weightLogs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const recentLogs = sortedLogs.slice(-7);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-pink-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-100 via-pink-100 to-purple-100 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                เช็คอินน้ำหนัก (Weight Check-in)
              </h2>
              <p className="text-xs text-sky-600 font-semibold">
                บันทึกสถิติด้วยความรักและอ่อนโยนต่อร่างกาย
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
        <form onSubmit={handleSave} className="p-4 sm:p-6 flex flex-col gap-4 text-sm text-slate-700">
          {/* Path toward Goal Castle 🏰 */}
          <div className="bg-gradient-to-r from-sky-50 via-pink-50 to-purple-50 p-4 rounded-3xl border border-sky-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1 text-slate-500">
                จุดเริ่มต้น: {startWeight} kg
              </span>
              <span className="flex items-center gap-1 text-purple-700 font-extrabold">
                <Castle className="w-4 h-4 text-purple-500" />
                ปราสาทเป้าหมาย: {targetWeight} kg
              </span>
            </div>

            {/* Castle Path Track */}
            <div className="relative w-full h-5 bg-white rounded-full p-1 border border-pink-200 shadow-inner flex items-center">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-pink-400 to-purple-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute text-lg -top-3 transition-all duration-700 pointer-events-none"
                style={{ left: `calc(${Math.min(92, progressPercent)}% - 10px)` }}
              >
                🏃‍♀️
              </div>
            </div>

            <div className="mt-2 text-center text-xs text-slate-600 font-medium">
              🐾 <strong>ลด 1 โล เดิน 1 ก้าว:</strong>{' '}
              {weightLost > 0 ? (
                <span>
                  เดินหน้ามาแล้ว <strong className="text-pink-600 font-bold">{currentSteps}/{totalSteps} ก้าว</strong> (ลดได้ {weightLost.toFixed(1)} kg)
                </span>
              ) : (
                <span>ลดครบ 1 กิโลกรัมแรกเพื่อก้าวเดินก้าวแรกทันที!</span>
              )}
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                น้ำหนักที่ชั่งได้ (กก.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="250"
                  required
                  value={weightInput}
                  onChange={(e) =>
                    setWeightInput(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-base font-extrabold text-slate-800 text-center"
                />
                <span className="text-xs text-slate-400 font-bold">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่ชั่ง
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm bg-white text-center"
              />
            </div>
          </div>

          {/* Gentle & Encouraging Reassurance Box */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-2.5 text-xs text-sky-900 leading-relaxed">
            <Heart className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sky-800">คำเตือนใจแสนอบอุ่น:</div>
              น้ำหนักเป็นเพียงตัวเลขที่สะท้อนน้ำในร่างกาย การย่อย และมวลกล้ามเนื้อ ไม่ว่าน้ำหนักจะขึ้นหรือลง <strong className="text-pink-600">ไม่มีการหัก XP ใดๆ ทั้งสิ้น</strong> ขอให้ภูมิใจที่คุณรักและใส่ใจสุขภาพนะ 🌸
            </div>
          </div>

          {/* SVG Weight Trend Chart */}
          {recentLogs.length > 1 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-600">
                📈 แนวโน้มน้ำหนักย้อนหลัง:
              </span>
              <WeightChart logs={recentLogs} targetWeight={targetWeight} />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              บันทึกสั้นๆ (เช่น ชั่งตอนเช้าหลังตื่นนอน)
            </label>
            <input
              type="text"
              placeholder="ความรู้สึกวันนี้..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Reward Notification */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-700 bg-sky-100/60 py-2.5 rounded-2xl">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>เช็คอินวันนี้ รับทันที:</span>
            <span className="text-pink-600">⭐ +25 XP</span>
            <span>•</span>
            <span className="text-amber-600">🪙 +10 Coins</span>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            บันทึกน้ำหนัก
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// Simple, responsive SVG Weight Trend Chart
const WeightChart: React.FC<{ logs: WeightLog[]; targetWeight: number }> = ({
  logs,
  targetWeight,
}) => {
  const weights = logs.map((l) => l.weightKg);
  const minW = Math.min(...weights, targetWeight) - 1;
  const maxW = Math.max(...weights, targetWeight) + 1;
  const range = maxW - minW || 1;

  const width = 380;
  const height = 100;
  const padding = 20;

  const points = logs.map((l, i) => {
    const x = padding + (i / (logs.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((l.weightKg - minW) / range) * (height - padding * 2);
    return { x, y, weight: l.weightKg, date: l.timestamp.split('T')[0].slice(5) };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E2E8F0"
          strokeWidth="1"
        />

        {/* Target line */}
        <line
          x1={padding}
          y1={height - padding - ((targetWeight - minW) / range) * (height - padding * 2)}
          x2={width - padding}
          y2={height - padding - ((targetWeight - minW) / range) * (height - padding * 2)}
          stroke="#C084FC"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />

        {/* Trend line */}
        <path d={pathD} fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
            <text
              x={p.x}
              y={p.y - 7}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-700"
            >
              {p.weight}
            </text>
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className="text-[8px] font-medium fill-slate-400"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
