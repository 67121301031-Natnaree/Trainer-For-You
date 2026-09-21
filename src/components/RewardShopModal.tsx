import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AccessoryItem } from '../types';
import { ACCESSORIES } from '../constants';
import { X, ShoppingBag, Coins, Sparkles, Check, Shirt } from 'lucide-react';
import { soundManager } from '../services/sound';

interface RewardShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  inventory: string[];
  equippedAccessoryId: string | null;
  onBuyAccessory: (item: AccessoryItem) => void;
  onEquipAccessory: (id: string | null) => void;
}

export const RewardShopModal: React.FC<RewardShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  inventory,
  equippedAccessoryId,
  onBuyAccessory,
  onEquipAccessory,
}) => {
  const [tab, setTab] = useState<'shop' | 'closet'>('shop');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = (item: AccessoryItem) => {
    if (inventory.includes(item.id)) return;
    if (coins < item.price) {
      setFeedbackMsg(`เหรียญไม่พอจ้า! ขาดอีก ${item.price - coins} Coins`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }
    soundManager.playCoin();
    onBuyAccessory(item);
    setFeedbackMsg(`ซื้อ ${item.name} สำเร็จ! เข้าไปแต่งตัวในตู้เสื้อผ้าได้เลย 🎀`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleEquipToggle = (id: string) => {
    soundManager.playPop();
    if (equippedAccessoryId === id) {
      onEquipAccessory(null); // unequip
      setFeedbackMsg('ถอดเครื่องประดับออกแล้ว');
    } else {
      onEquipAccessory(id); // equip
      setFeedbackMsg('สวมใส่เครื่องประดับให้น้องแล้ว น่ารักสุดๆ! ✨');
    }
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const purchasedItems = ACCESSORIES.filter((a) => inventory.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-100 via-pink-100 to-purple-100 px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                ร้านรางวัล & ตู้เสื้อผ้า
              </h2>
              <p className="text-xs text-amber-700 font-semibold">
                ใช้เหรียญ Coins ซื้อเครื่องประดับสุดน่ารัก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins indicator */}
            <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-xs sm:text-sm font-black text-amber-800">{coins}</span>
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
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => {
              soundManager.playPop();
              setTab('shop');
            }}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'shop'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            ร้านค้าไอเทม ({ACCESSORIES.length})
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setTab('closet');
            }}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'closet'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shirt className="w-4 h-4 text-pink-500" />
            ตู้เสื้อผ้าสัตว์เลี้ยง ({purchasedItems.length})
          </button>
        </div>

        {/* Notice/Toast banner */}
        {feedbackMsg && (
          <div className="bg-purple-100 text-purple-800 text-xs font-bold px-4 py-2 text-center transition-all animate-pulse">
            {feedbackMsg}
          </div>
        )}

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === 'shop' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {ACCESSORIES.map((item) => {
                const isOwned = inventory.includes(item.id);
                const isEquipped = equippedAccessoryId === item.id;
                const canAfford = coins >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-pink-50/90 border-pink-300 ring-2 ring-pink-200'
                        : isOwned
                        ? 'bg-purple-50/50 border-purple-200'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{item.emoji}</span>
                      {isEquipped ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-500 text-white rounded-full">
                          สวมใส่อยู่ ✨
                        </span>
                      ) : isOwned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full">
                          มีแล้วในตู้
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs font-black text-amber-700">
                          <Coins className="w-3 h-3 text-amber-500 fill-amber-400" />
                          {item.price}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {isOwned ? (
                      <button
                        onClick={() => handleEquipToggle(item.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                          isEquipped
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                        }`}
                      >
                        {isEquipped ? 'ถอดออก' : 'สวมใส่'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5 fill-current" />
                        ซื้อ {item.price} Coins
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Closet View
            <div className="flex flex-col gap-3">
              {purchasedItems.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-3xl mb-2">
                    🎀
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">
                    ยังไม่มีเครื่องประดับในตู้เสื้อผ้า
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    บันทึกอาหารและออกกำลังกายเพื่อสะสม Coins แล้วมาเลือกซื้อของน่ารักๆ ที่ร้านค้านะ!
                  </p>
                  <button
                    onClick={() => setTab('shop')}
                    className="mt-4 px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:bg-amber-600 transition-colors"
                  >
                    ไปช้อปปิ้งเลย 🛍️
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {purchasedItems.map((item) => {
                    const isEquipped = equippedAccessoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between ${
                          isEquipped
                            ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="text-3xl my-1">{item.emoji}</span>
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <button
                          onClick={() => handleEquipToggle(item.id)}
                          className={`w-full mt-2 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isEquipped
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-pink-500 text-white hover:bg-pink-600'
                          }`}
                        >
                          {isEquipped ? 'ถอดออก' : 'สวมใส่'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
