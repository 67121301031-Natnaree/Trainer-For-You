import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetId } from '../types';
import { PETS } from '../constants';
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Trophy,
  Footprints,
  Flame,
  ArrowRight,
  PartyPopper,
  Scale,
  Flag,
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface AdventureMapProps {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  selectedPet: PetId;
  xp?: number;
  level?: number;
  onOpenFoodModal: () => void;
  onOpenExerciseModal: () => void;
  onOpenWeightModal: () => void;
}

interface StepMilestone {
  stepIndex: number; // 0 is start, 1..totalSteps
  targetWeightKg: number;
  kgLostFromStart: number;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isGoal: boolean;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  startWeight,
  currentWeight,
  targetWeight,
  selectedPet,
  onOpenFoodModal,
  onOpenExerciseModal,
  onOpenWeightModal,
}) => {
  const [selectedStep, setSelectedStep] = useState<StepMilestone | null>(null);
  const pet = PETS[selectedPet] || PETS.rabbit;

  // Safe numerical baseline
  const safeStart = Number(startWeight) || Number(currentWeight) || 60;
  const safeCurrent = Number(currentWeight) || safeStart;
  const safeTarget = Number(targetWeight) || Math.max(35, safeStart - 5);

  // Total weight to lose: each 1 kg = 1 step
  // If user set target <= start, calculate steps. If maintaining/gaining, default to at least 3 milestone steps.
  const isWeightLossGoal = safeStart > safeTarget;
  const totalSteps = isWeightLossGoal
    ? Math.max(1, Math.round(safeStart - safeTarget))
    : 3;

  // Weight lost so far from start
  const weightDifference = safeStart - safeCurrent;
  const weightLost = isWeightLossGoal
    ? Math.max(0, Number(weightDifference.toFixed(1)))
    : 0;

  // Completed steps (1 kg = 1 step)
  const completedSteps = Math.min(totalSteps, Math.floor(weightLost));
  const remainingKgToGoal = Math.max(0, Number((safeCurrent - safeTarget).toFixed(1)));
  const remainingSteps = Math.max(0, totalSteps - completedSteps);
  const hasReachedGoal = safeCurrent <= safeTarget;

  // Next step's partial progress (e.g. lost 1.4 kg = 1 full step + 40% of next step)
  const nextStepProgress =
    completedSteps < totalSteps && weightLost > 0
      ? Math.round((weightLost - Math.floor(weightLost)) * 100)
      : 0;

  // Build the list of step milestones: 0 (Start) -> 1 -> 2 -> ... -> totalSteps (Goal Castle)
  const steps: StepMilestone[] = [];

  // Step 0: จุดเริ่มต้น
  steps.push({
    stepIndex: 0,
    targetWeightKg: Number(safeStart.toFixed(1)),
    kgLostFromStart: 0,
    title: 'จุดเริ่มต้นการผจญภัย',
    isCompleted: weightLost >= 0,
    isCurrent: completedSteps === 0 && !hasReachedGoal,
    isGoal: false,
  });

  // Steps 1 to totalSteps
  for (let i = 1; i <= totalSteps; i++) {
    const isGoal = i === totalSteps;
    const targetForStep = isWeightLossGoal
      ? Number((safeStart - i).toFixed(1))
      : Number(safeTarget.toFixed(1));

    const isCompleted = weightLost >= i || hasReachedGoal;
    const isCurrent = completedSteps === i && !hasReachedGoal;

    steps.push({
      stepIndex: i,
      targetWeightKg: targetForStep,
      kgLostFromStart: i,
      title: isGoal ? 'ปราสาทเส้นชัย (เป้าหมายสุขภาพดี)' : `ก้าวที่ ${i}: ลดได้ ${i} กิโลกรัม`,
      isCompleted,
      isCurrent,
      isGoal,
    });
  }

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-4 py-2">
      {/* Map Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
              <span>เส้นทางก้าวเดินสู่เป้าหมาย</span>
            </h2>
            <p className="text-xs text-pink-600 font-bold flex items-center gap-1">
              <span>✨ กฎของเกม:</span>
              <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md text-[11px]">
                ลดน้ำหนัก 1 โล = เดิน 1 ก้าว
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-black px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xs flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5" />
            <span>เดินแล้ว {completedSteps}/{totalSteps} ก้าว</span>
          </span>
        </div>
      </div>

      {/* Progress & Stat Banner */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 rounded-2xl p-3 sm:p-4 border border-pink-100 mb-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">🏁 เริ่มต้น:</span>
            <span className="text-slate-800 font-black">{safeStart} kg</span>
          </div>

          <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full border border-pink-200 shadow-2xs text-pink-700">
            <MapPin className="w-3.5 h-3.5 text-pink-500" />
            <span>ปัจจุบัน: <strong>{safeCurrent} kg</strong></span>
            {weightLost > 0 && (
              <span className="text-emerald-600 font-extrabold ml-1">
                (ลดแล้ว -{weightLost} kg)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">🏰 เป้าหมาย:</span>
            <span className="text-purple-700 font-black">{safeTarget} kg</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-white/80 h-3.5 rounded-full border border-pink-200 overflow-hidden relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, Math.max(5, (weightLost / totalSteps) * 100))}%`,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 rounded-full relative"
          >
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-black text-white drop-shadow-xs">
              🐾
            </div>
          </motion.div>
        </div>

        {/* Motivational Status Text */}
        <div className="mt-2 text-center text-xs">
          {hasReachedGoal ? (
            <span className="font-extrabold text-emerald-600 flex items-center justify-center gap-1">
              <PartyPopper className="w-4 h-4 text-emerald-500" />
              ยินดีด้วยสุดใจ! คุณเดินครบทุกก้าวและพิชิตเป้าหมาย {safeTarget} kg สำเร็จแล้ว! 🏆
            </span>
          ) : weightLost > 0 ? (
            <span className="font-bold text-purple-700">
              เดินหน้ามาแล้ว {completedSteps} ก้าว! เหลืออีกเพียง {remainingKgToGoal} กิโลกรัม ({remainingSteps} ก้าว) จะถึงปราสาทเป้าหมาย สู้ๆ นะ!
            </span>
          ) : (
            <span className="text-slate-600">
              เริ่มต้นก้าวแรกได้ทันที! เมื่อน้ำหนักลด 1 กิโลกรัมแรก น้อง {pet.thaiName.split(' ')[0]} จะเดินไปข้างหน้า 1 ก้าว 🌸
            </span>
          )}
        </div>
      </div>

      {/* Stepping Trail Path Container */}
      <div className="relative bg-gradient-to-b from-white via-pink-50/30 to-purple-50/40 rounded-3xl p-3 sm:p-5 border border-pink-100 shadow-sm overflow-hidden">
        {/* Winding Vertical Trail Line */}
        <div className="absolute left-8 sm:left-12 top-8 bottom-8 w-1.5 bg-gradient-to-b from-pink-200 via-purple-200 to-sky-200 rounded-full dashed-border" />

        <div className="flex flex-col gap-4 relative z-10">
          {steps.map((step) => {
            const isStart = step.stepIndex === 0;
            const isGoal = step.isGoal;

            return (
              <motion.div
                key={`step-${step.stepIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.stepIndex * 0.05 }}
                onClick={() => {
                  soundManager.playPop();
                  setSelectedStep(step);
                }}
                className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer border ${
                  step.isCurrent
                    ? 'bg-white border-pink-400 shadow-md ring-2 ring-pink-200/80 scale-[1.02]'
                    : step.isCompleted
                    ? 'bg-white/95 border-emerald-200 shadow-xs hover:border-emerald-300'
                    : 'bg-slate-50/70 border-slate-200/70 opacity-75 hover:opacity-90'
                }`}
              >
                {/* Step Node Icon on Trail */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-xs transition-transform ${
                      isGoal
                        ? step.isCompleted
                          ? 'bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 text-amber-700'
                          : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 text-purple-700'
                        : isStart
                        ? 'bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200 text-sky-700'
                        : step.isCompleted
                        ? 'bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-700'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isGoal ? (
                      '🏰'
                    ) : isStart ? (
                      '🏁'
                    ) : step.isCompleted ? (
                      '🐾'
                    ) : (
                      <span className="text-sm font-black text-slate-400">{step.stepIndex}</span>
                    )}
                  </div>

                  {/* Character Position Token if current step */}
                  {step.isCurrent && (
                    <motion.div
                      animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="absolute -top-3 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-1 rounded-full text-xs shadow-md border-2 border-white flex items-center justify-center"
                      title={`คุณอยู่ที่ก้าวนี้: ${pet.name}`}
                    >
                      <span className="text-xs">{pet.emoji}</span>
                    </motion.div>
                  )}

                  {/* Completed Checkmark */}
                  {step.isCompleted && !step.isCurrent && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full text-[10px] shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 truncate">
                      {isStart
                        ? '🏁 จุดเริ่มต้น (ก้าวที่ 0)'
                        : isGoal
                        ? '🏰 เส้นชัย: ปราสาทสุขภาพดี'
                        : `🐾 ก้าวที่ ${step.stepIndex} (-${step.kgLostFromStart} kg)`}
                    </h3>

                    {step.isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        สำเร็จ
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>
                      น้ำหนัก: <strong className="text-slate-700">{step.targetWeightKg} kg</strong>
                    </span>
                    {!isStart && (
                      <span className="text-[11px] text-pink-600 font-semibold">
                        (ลดได้ {step.kgLostFromStart} กิโลกรัม)
                      </span>
                    )}
                  </div>

                  {/* Status Pills */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {step.isCurrent ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-pink-500 text-white shadow-2xs animate-pulse flex items-center gap-1">
                        <span>📍 คุณกำลังอยู่ที่นี่!</span>
                        {nextStepProgress > 0 && (
                          <span className="bg-white/20 px-1 rounded text-[9px]">
                            +อีก {nextStepProgress}% สู่ก้าวถัดไป
                          </span>
                        )}
                      </span>
                    ) : step.isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✨ ก้าวผ่านมาแล้ว
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        รอชั่งน้ำหนักให้ถึง {step.targetWeightKg} kg
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Step Detail Modal */}
      <AnimatePresence>
        {selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-pink-100 text-center relative"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 border border-pink-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
                {selectedStep.isGoal ? '🏰' : selectedStep.stepIndex === 0 ? '🏁' : '🐾'}
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">
                {selectedStep.title}
              </h3>

              <div className="text-xs font-bold text-pink-600 mb-3 bg-pink-50 py-1.5 px-3 rounded-full inline-block">
                เป้าหมายน้ำหนักของก้าวนี้: {selectedStep.targetWeightKg} kg
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-4 px-2 leading-relaxed">
                {selectedStep.stepIndex === 0 ? (
                  'นี่คือก้าวแรกของการเดินทาง จุดเริ่มต้นของการรักและดูแลสุขภาพตนเอง!'
                ) : selectedStep.isGoal ? (
                  `ก้าวสุดท้ายสู่ปราสาทแห่งชัยชนะ! เมื่อน้ำหนักของคุณแตะ ${selectedStep.targetWeightKg} kg คุณจะพิชิตการผจญภัยรอบนี้อย่างเต็มภาคภูมิ!`
                ) : (
                  `ก้าวที่ ${selectedStep.stepIndex} สำเร็จเมื่อน้ำหนักลดลงครบ ${selectedStep.kgLostFromStart} กิโลกรัมจากจุดเริ่มต้น (${safeStart} ➔ ${selectedStep.targetWeightKg} kg)`
                )}
              </p>

              {/* Step Status summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-4 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">น้ำหนักปัจจุบันของคุณ:</span>
                  <strong className="text-slate-800">{safeCurrent} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">น้ำหนักเป้าหมายก้าวนี้:</span>
                  <strong className="text-purple-700">{selectedStep.targetWeightKg} kg</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">สถานะก้าวนี้:</span>
                  {selectedStep.isCompleted ? (
                    <span className="text-emerald-600 font-bold">✅ สำเร็จเรียบร้อยแล้ว</span>
                  ) : selectedStep.isCurrent ? (
                    <span className="text-pink-600 font-bold">📍 กำลังเดินอยู่ในก้าวนี้</span>
                  ) : (
                    <span className="text-amber-600 font-bold">
                      เหลืออีก {(safeCurrent - selectedStep.targetWeightKg).toFixed(1)} kg
                    </span>
                  )}
                </div>
              </div>

              {/* Action shortcut to log weight */}
              <div className="flex flex-col gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStep(null);
                    onOpenWeightModal();
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md transition-transform flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-4 h-4" />
                  เช็คอินน้ำหนักเพื่ออัปเดตก้าวเดิน ⚖️
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
