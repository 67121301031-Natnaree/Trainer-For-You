import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, FoodLog } from '../types';
import { X, Camera, Sparkles, Plus, Trash2, Edit3, AlertCircle, Check, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { soundManager } from '../services/sound';

interface FoodAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFoodLog: (log: Omit<FoodLog, 'id' | 'timestamp'>) => void;
}

export const FoodAnalyzerModal: React.FC<FoodAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onSaveFoodLog,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [aiNote, setAiNote] = useState<string>('');

  // Parsed and user-editable food items
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset example meals popular with Thai students
  const examplePrompts = [
    'ข้าวกะเพราไก่ไข่ดาว 1 จาน',
    'หมูปิ้ง 3 ไม้ ข้าวเหนียว 1 ห่อ',
    'ลาเต้เย็นหวานน้อย 1 แก้ว',
    'กล้วย 2 ลูก',
    'ข้าว 2 ทัพพี อกไก่ 150 กรัม',
    'ส้มตำไทย ข้าวเหนียว ไก่ย่าง 1 น่อง',
  ];

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setApiError('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setApiError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedImage) {
      setApiError('กรุณาพิมพ์ชื่ออาหาร หรืออัปโหลดรูปภาพอาหาร');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    soundManager.playPop();

    try {
      const payload: any = {};
      if (inputText.trim()) {
        payload.text = inputText.trim();
      }
      if (selectedImage) {
        payload.imageBase64 = selectedImage;
        const mimeMatch = selectedImage.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,/);
        payload.mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      }

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();

      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const formattedItems: FoodItem[] = data.items.map((it: any, idx: number) => ({
          id: `item-${Date.now()}-${idx}`,
          name: it.name || 'อาหาร',
          portion: it.portion || '1 จาน',
          calories: Number(it.calories) || 0,
          protein: Number(it.protein) || 0,
          carbs: Number(it.carbs) || 0,
          fat: Number(it.fat) || 0,
        }));
        setItems(formattedItems);
        setAiNote(data.note || 'ค่าประมาณโภชนาการ');
        setAnalysisDone(true);
        soundManager.playCoin();
      } else {
        throw new Error('ไม่พบข้อมูลรายการอาหารจาก AI กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err: any) {
      console.error('Food analysis error:', err);
      setApiError(err.message || 'ไม่สามารถติดต่อ AI เพื่อวิเคราะห์อาหารได้ในขณะนี้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof Omit<FoodItem, 'id'>,
    value: string | number
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleAddItem = () => {
    soundManager.playPop();
    const newItem: FoodItem = {
      id: `custom-${Date.now()}`,
      name: 'อาหารเพิ่มเติม',
      portion: '1 ที่',
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 2,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    soundManager.playPop();
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculated totals from currently editable items
  const totals = items.reduce(
    (acc, cur) => ({
      calories: acc.calories + (Number(cur.calories) || 0),
      protein: acc.protein + (Number(cur.protein) || 0),
      carbs: acc.carbs + (Number(cur.carbs) || 0),
      fat: acc.fat + (Number(cur.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleSave = () => {
    if (items.length === 0) {
      setApiError('กรุณามีอย่างน้อย 1 รายการอาหาร');
      return;
    }

    soundManager.playLevelUp();
    onSaveFoodLog({
      mealType,
      items,
      total: totals,
      note: aiNote,
      imageUrl: selectedImage || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100/80 via-purple-100/70 to-sky-100/80 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍱</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                AI Food Analyzer
              </h2>
              <p className="text-xs text-pink-600 font-semibold">
                พิมพ์ชื่ออาหาร หรือถ่ายรูปให้ Gemini วิเคราะห์
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-sm text-slate-700">
          {/* Meal Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              เลือกมื้ออาหาร
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'breakfast' as const, label: '🌅 มื้อเช้า' },
                { id: 'lunch' as const, label: '☀️ มื้อเที่ยง' },
                { id: 'dinner' as const, label: '🌙 มื้อเย็น' },
                { id: 'snack' as const, label: '🧋 ของว่าง' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundManager.playPop();
                    setMealType(m.id);
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-2xl border transition-all truncate text-center ${
                    mealType === m.id
                      ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-pink-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input 1: Text Field & Prompt suggestions */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              1. ⌨️ พิมพ์ชื่ออาหารหรือส่วนผสม
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="เช่น ข้าวกะเพราไก่ไข่ดาว 1 จาน, หมูปิ้ง 3 ไม้ ข้าวเหนียว 1 ห่อ"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAnalyze();
                  }
                }}
              />
            </div>

            {/* Quick Thai Food Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">
                ตัวอย่างเมนู:
              </span>
              {examplePrompts.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    soundManager.playPop();
                    setInputText(ex);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors border border-pink-100 font-medium"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

            {/* Input 2: Photo Upload or Camera */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center justify-between">
              <span>2. 📸 ถ่ายรูป หรือเลือกรูปจากอัลบั้ม (Multimodal)</span>
              {selectedImage && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> เลือกรูปเรียบร้อย
                </span>
              )}
            </label>

            {/* Hidden native input for Camera */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Hidden native input for Photo Album / Gallery */}
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                className={`p-4 rounded-3xl border-2 border-dashed transition-all text-center ${
                  isDragging
                    ? 'border-pink-500 bg-pink-100/70 scale-[1.01]'
                    : 'border-pink-200/90 bg-gradient-to-b from-pink-50/40 to-purple-50/30 hover:border-pink-300'
                }`}
              >
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  {/* Option A: Take Photo with Camera */}
                  <button
                    id="btn-take-photo-camera"
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      cameraInputRef.current?.click();
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-pink-200/80 hover:border-pink-300 shadow-xs hover:shadow-sm transition-all flex flex-col items-center justify-center gap-1.5 text-slate-700 hover:text-pink-600 group cursor-pointer active:scale-98"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-100 transition-all">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-pink-600">
                      ถ่ายรูปด้วยกล้อง
                    </span>
                    <span className="text-[10px] text-slate-400">
                      เปิดกล้องถ่ายสด
                    </span>
                  </button>

                  {/* Option B: Choose from Album / Gallery */}
                  <button
                    id="btn-choose-from-album"
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      galleryInputRef.current?.click();
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-purple-200/80 hover:border-purple-300 shadow-xs hover:shadow-sm transition-all flex flex-col items-center justify-center gap-1.5 text-slate-700 hover:text-purple-600 group cursor-pointer active:scale-98"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-purple-600">
                      เลือกจากอัลบั้ม
                    </span>
                    <span className="text-[10px] text-slate-400">
                      คลังภาพในเครื่อง
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                  <Upload className="w-3.5 h-3.5" />
                  <span>หรือลากไฟล์ภาพอาหารมาวางในกรอบนี้ได้</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-pink-200 bg-slate-900/5 p-2 flex flex-col items-center gap-2">
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/10 flex items-center justify-center max-h-52">
                  <img
                    src={selectedImage}
                    alt="Food Preview"
                    className="object-contain max-h-52 w-full rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedImage(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/65 hover:bg-black/85 text-white rounded-full transition-colors shadow-sm"
                    title="ลบรูป"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick actions when image is loaded */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    id="btn-change-image-album"
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      galleryInputRef.current?.click();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-200 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    เปลี่ยนรูปจากอัลบั้ม
                  </button>
                  <button
                    id="btn-retake-photo-camera"
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      cameraInputRef.current?.click();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-pink-200 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    ถ่ายรูปใหม่
                  </button>
                  <button
                    id="btn-remove-selected-image"
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedImage(null);
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold border border-rose-200 transition-colors"
                    title="ลบรูปภาพนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <motion.button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
              isLoading || (!inputText.trim() && !selectedImage)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white shadow-pink-200 hover:shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gemini AI กำลังวิเคราะห์คุณค่าอาหาร...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                เริ่มวิเคราะห์อาหารด้วย AI
              </>
            )}
          </motion.button>

          {/* Error Banner */}
          {apiError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {/* Mandatory Nutritional Disclaimer */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
            <span className="text-base flex-shrink-0">⚠️</span>
            <div>
              <div className="font-bold text-amber-800">ข้อควรทราบสำคัญ:</div>
              “ข้อมูลโภชนาการจาก AI เป็นค่าประมาณ สูตรอาหาร ปริมาณ น้ำมัน ซอส และส่วนผสม อาจทำให้ค่าจริงแตกต่างกัน กรุณาตรวจสอบ และแก้ไขข้อมูลก่อนบันทึก”
            </div>
          </div>

          {/* Results & User Editable Table */}
          {analysisDone && items.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-pink-500" />
                  รายการอาหารที่วิเคราะห์ได้ (สามารถแก้ไขตัวเลขได้ตามจริง):
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
                </button>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2.5">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm">🍽️</span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs w-full"
                          placeholder="ชื่ออาหาร"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.portion}
                        onChange={(e) => handleItemChange(idx, 'portion', e.target.value)}
                        className="text-xs text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 w-24 text-center"
                        placeholder="ปริมาณ (1 จาน)"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Macro Nutrients Row */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-pink-500 font-bold">🔥 แคลอรี</div>
                        <input
                          type="number"
                          value={item.calories}
                          onChange={(e) =>
                            handleItemChange(idx, 'calories', Number(e.target.value) || 0)
                          }
                          className="w-full text-center font-bold text-slate-800 text-xs mt-0.5 focus:outline-none"
                        />
                        <div className="text-[9px] text-slate-400">kcal</div>
                      </div>

                      <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-rose-500 font-bold">🥩 โปรตีน</div>
                        <input
                          type="number"
                          value={item.protein}
                          onChange={(e) =>
                            handleItemChange(idx, 'protein', Number(e.target.value) || 0)
                          }
                          className="w-full text-center font-bold text-slate-800 text-xs mt-0.5 focus:outline-none"
                        />
                        <div className="text-[9px] text-slate-400">g</div>
                      </div>

                      <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-amber-500 font-bold">🍚 คาร์บ</div>
                        <input
                          type="number"
                          value={item.carbs}
                          onChange={(e) =>
                            handleItemChange(idx, 'carbs', Number(e.target.value) || 0)
                          }
                          className="w-full text-center font-bold text-slate-800 text-xs mt-0.5 focus:outline-none"
                        />
                        <div className="text-[9px] text-slate-400">g</div>
                      </div>

                      <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-emerald-500 font-bold">🥑 ไขมัน</div>
                        <input
                          type="number"
                          value={item.fat}
                          onChange={(e) =>
                            handleItemChange(idx, 'fat', Number(e.target.value) || 0)
                          }
                          className="w-full text-center font-bold text-slate-800 text-xs mt-0.5 focus:outline-none"
                        />
                        <div className="text-[9px] text-slate-400">g</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary Bar */}
              <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>📊 รวมทั้งมื้อนี้:</span>
                  <span className="text-pink-600 font-extrabold text-sm">
                    {totals.calories} kcal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">โปรตีน</span>
                    <span className="font-bold text-rose-600">{totals.protein} g</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">คาร์โบไฮเดรต</span>
                    <span className="font-bold text-amber-600">{totals.carbs} g</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">ไขมัน</span>
                    <span className="font-bold text-emerald-600">{totals.fat} g</span>
                  </div>
                </div>
              </div>

              {/* Reward Bonus Notification */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 py-2 rounded-2xl">
                <span>✨ บันทึกมื้อนี้ รับทันที:</span>
                <span className="text-pink-600">⭐ +30 XP</span>
                <span>•</span>
                <span className="text-amber-600">🪙 +15 Coins</span>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-5 h-5" />
                บันทึกลงสมุดผจญภัย
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
