import { PetInfo, PetId, AccessoryItem, GameStage } from './types';

export const PETS: Record<PetId, PetInfo> = {
  rabbit: {
    id: 'rabbit',
    name: 'Mochi',
    thaiName: 'กระต่ายโมจิ 🐰',
    emoji: '🐰',
    title: 'ผู้พิทักษ์ความกระฉับกระเฉง',
    description: 'ร่าเริง ชอบกระโดด และชอบกินผักผลไม้สดใหม่เสมอ!',
    favoriteFood: 'เบบี้แครอท & สมูทตี้ผลไม้',
    quotes: [
      'วันนี้เราไปผจญภัยกันไหม 🌸',
      'ฮึบๆ ก้าวทีละนิดก็เข้าใกล้เป้าหมายแล้วนะ!',
      'อย่าลืมดื่มน้ำให้สดชื่นนะคนเก่ง 💧',
      'กินข้าวอร่อยๆ แล้วมาเติมพลังกันเถอะ ✨',
      'เธอเก่งมากเลยนะวันนี้ 🐰💖',
    ],
  },
  cat: {
    id: 'cat',
    name: 'Neko',
    thaiName: 'แมวเหมียวเนโกะ 🐱',
    emoji: '🐱',
    title: 'จอมสบายใจแห่งสายลม',
    description: 'ชอบเดินเล่นชิลๆ ยืดเหงือก ยืดตัว และนอนหลับพักผ่อนให้เพียงพอ',
    favoriteFood: 'ปลาแซลมอนย่าง & นมข้าวโอ๊ต',
    quotes: [
      'เหมียว~ วันนี้อารมณ์ดีจัง ไปเดินเล่นด้วยกันนะ 🐾',
      'ค่อยเป็นค่อยไป ไม่ต้องรีบร้อนนะ เมี้ยว 🌸',
      'ถ้าเหนื่อยก็ยืดเส้นยืดสายหน่อยนะ!',
      'พักผ่อนให้เพียงพอก็เป็นการดูแลตัวเองนะ 💤',
      'อยู่ข้างๆ เสมอนะคนเก่ง 🐱✨',
    ],
  },
  dog: {
    id: 'dog',
    name: 'Lucky',
    thaiName: 'น้องหมาลักกี้ 🐶',
    emoji: '🐶',
    title: 'เพื่อนแท้ผู้กระตือรือร้น',
    description: 'พลังบวกเต็มเปี่ยม พร้อมส่งเสียงเชียร์ทุกครั้งที่คุณขยับร่างกาย!',
    favoriteFood: 'อกไก่ต้มฉีก & ข้าวกล้องนุ่มๆ',
    quotes: [
      'โฮ่ง! พร้อมลุยไปด้วยกันแล้วจ้า ลุยเลย! 🎾',
      'เย่ๆ วันนี้เราทำได้ยอดเยี่ยมที่สุดเลย!',
      'แค่ขยับเบาๆ ก็ถือว่าได้ดูแลตัวเองแล้วนะ 🐶⭐',
      'เชื่อมั่นในตัวเองนะ สู้ๆ ไปด้วยกัน!',
      'ลักกี้ภูมิใจในตัวเธอมากๆ เลยนะ! 💖',
    ],
  },
  panda: {
    id: 'panda',
    name: 'BaoBao',
    thaiName: 'แพนด้าเปาเปา 🐼',
    emoji: '🐼',
    title: 'ปรมาจารย์แห่งความสมดุล',
    description: 'ใจเย็น อบอุ่น เชื่อว่าความสม่ำเสมอชนะทุกสิ่ง',
    favoriteFood: 'หน่อไม้อ่อน & สลัดเต้าหู้',
    quotes: [
      'ความสุขอยู่ที่สมดุล กินอิ่ม นอนหลับ สดใส 🐼🎋',
      'ก้าวช้าๆ แต่มั่นคง เดี๋ยวก็ถึงยอดเขาเอง',
      'อย่าลืมหายใจเข้าลึกๆ ผ่อนคลายนะ',
      'วันนี้เปาเปามีพลังใจมาแจกให้เต็มเปี่ยมเลย 🌸',
      'รอยยิ้มของเธอทำให้ทั้งวันสดใสขึ้นนะ ✨',
    ],
  },
  fox: {
    id: 'fox',
    name: 'Kitsune',
    thaiName: 'จิ้งจอกคิทสึเนะ 🦊',
    emoji: '🦊',
    title: 'นักสำรวจผู้เฉลียวฉลาด',
    description: 'คล่องแคล่ว ว่องไว รู้จักวางแผนมื้ออาหารอย่างชาญฉลาด',
    favoriteFood: 'เบอร์รี่สด & ข้าวหน้าแซลมอน',
    quotes: [
      'ฉลาดเลือก ทานอาหารที่มีประโยชน์กันนะ 🦊🍁',
      'ทุกการขยับคือคะแนนประสบการณ์ชีวิต!',
      'เราค้นพบเส้นทางใหม่ในการดูแลตัวเองแล้วล่ะ',
      'มีสมาธิ และสนุกไปกับมันนะ!',
      'ความพยายามไม่เคยทรยศใคร ลุยไปด้วยกันนะ ✨',
    ],
  },
  bear: {
    id: 'bear',
    name: 'Kuma',
    thaiName: 'หมีคุมะ 🐻',
    emoji: '🐻',
    title: 'ผู้พิทักษ์ความแข็งแรง',
    description: 'ตัวใหญ่ใจดี อบอุ่น ชอบออกกำลังกายเสริมกล้ามเนื้อ',
    favoriteFood: 'ข้าวโอ๊ตน้ำผึ้ง & ถั่วอัลมอนด์',
    quotes: [
      'ฮึดๆ ร่างกายแข็งแรง จิตใจก็สดชื่น 🐻🍯',
      'กล้ามเนื้อของเรากำลังเติบโตอย่างมั่นคงนะ',
      'ทานโปรตีนให้เพียงพอเพื่อซ่อมแซมร่างกายกัน!',
      'กอดให้กำลังใจตัวโตๆ เลยนะ!',
      'วันนี้ทำได้ดีมาก ภูมิใจในตัวเธอที่สุด 🌸',
    ],
  },
  koala: {
    id: 'koala',
    name: 'Lulu',
    thaiName: 'โคอาลาลูลู่ 🐨',
    emoji: '🐨',
    title: 'ผู้รักความสงบและรื่นรมย์',
    description: 'รักการพักผ่อนที่มีคุณภาพ ลดความเครียด เพื่อสุขภาพยืนยาว',
    favoriteFood: 'ยอดชาเขียว & ผลไม้รสหวานธรรมชาติ',
    quotes: [
      'สุขภาพจิตที่ดีคือจุดเริ่มต้นของสุขภาพกายนะ 🐨🌿',
      'อย่าลืมพักสายตาจากการอ่านหนังสือบ้างนะ!',
      'ใจเย็นๆ ค่อยๆ ปรับพฤติกรรมทีละนิด',
      'อยู่ตรงนี้คอยเชียร์และให้กำลังใจเสมอจ้ะ 💚',
      'วันนี้ยิ้มให้ตัวเองรึยังนะ? ยิ้มหวานๆ ซิ 🌸',
    ],
  },
  hamster: {
    id: 'hamster',
    name: 'Puri',
    thaiName: 'แฮมสเตอร์พูริ 🐹',
    emoji: '🐹',
    title: 'จิ๋วแต่แจ๋วผู้ไม่เคยหยุดวิ่ง',
    description: 'ตัวเล็กแก้มตุ่ย ชอบวิ่งวงล้อเก็บสะสมพลังงานดีๆ ไว้ใช้',
    favoriteFood: 'เมล็ดทานตะวัน & เมลอนหวานฉ่ำ',
    quotes: [
      'จิ๋วแต่แจ๋ว วิ่งดุ๊กดิ๊กเก็บพลังงานกัน! 🐹🌻',
      'สะสมแต้มสุขภาพทีละนิด เป็นกอบเป็นกำแน่นอน!',
      'เติมพลังให้อิ่มท้องแบบพอดีๆ แล้วไปวิ่งเล่นกัน',
      'พูริส่งหัวใจดวงโตให้เลยนะ ปิ้วๆ 💖',
      'สนุกกับทุกๆ วันของการผจญภัยนะ!',
    ],
  },
};

export const ACCESSORIES: AccessoryItem[] = [
  {
    id: 'pink_bow',
    name: 'โบว์ชมพูพาสเทล',
    emoji: '🎀',
    category: 'head',
    price: 30,
    description: 'โบว์สีชมพูหวานละมุน เพิ่มความน่ารักสดใส +100%',
  },
  {
    id: 'cherry_blossom',
    name: 'ดอกซากุระนำโชค',
    emoji: '🌸',
    category: 'head',
    price: 45,
    description: 'กลีบดอกซากุระแห่งฤดูใบไม้ผลิ สดชื่นตลอดทั้งวัน',
  },
  {
    id: 'royal_crown',
    name: 'มงกุฎเจ้าชายน้อย',
    emoji: '👑',
    category: 'head',
    price: 100,
    description: 'มงกุฎทองประกาย สำหรับแชมเปี้ยนผู้รักสุขภาพ',
  },
  {
    id: 'adventurer_cap',
    name: 'หมวกแก๊ปนักผจญภัย',
    emoji: '🧢',
    category: 'head',
    price: 40,
    description: 'หมวกแก๊ปสีฟ้าสดใส กันแดด พร้อมออกสำรวจโลกกว้าง',
  },
  {
    id: 'sparkle_star',
    name: 'ดาวประกายแสง',
    emoji: '⭐',
    category: 'face',
    price: 50,
    description: 'ดวงดาวส่องสว่างเคียงข้างแก้ม เติมความวิบวับ',
  },
  {
    id: 'lavender_scarf',
    name: 'ผ้าพันคอลาเวนเดอร์',
    emoji: '💜',
    category: 'neck',
    price: 60,
    description: 'ผ้าพันคอทอมือนุ่มฟู กลิ่นหอมลาเวนเดอร์ชวนผ่อนคลาย',
  },
  {
    id: 'cute_glasses',
    name: 'แว่นตานักศึกษาสุดคิ้วท์',
    emoji: '👓',
    category: 'face',
    price: 55,
    description: 'แว่นตาทรงกลม เพิ่มลุคนักศึกษาตั้งใจเรียนและรักสุขภาพ',
  },
  {
    id: 'magic_leaf',
    name: 'ใบไม้วิเศษแห่งพงไพร',
    emoji: '🌿',
    category: 'head',
    price: 35,
    description: 'ใบไม้อ่อนสีเขียวสดใส ได้รับพรจากเทพารักษ์แห่งป่า',
  },
];

export const ADVENTURE_STAGES: GameStage[] = [
  {
    id: 1,
    name: '🏡 หมู่บ้านสุขภาพ',
    subtitle: 'Healthy Village',
    emoji: '🏡',
    requiredXp: 0,
    requiredLevel: 1,
    description: 'จุดเริ่มต้นการผจญภัย เรียนรู้การทานอาหารและขยับตัวอย่างมีความสุข',
    bgGradient: 'from-pink-100 to-rose-50',
  },
  {
    id: 2,
    name: '🌳 ป่าโภชนาการ',
    subtitle: 'Nutrition Forest',
    emoji: '🌳',
    requiredXp: 100,
    requiredLevel: 2,
    description: 'ดินแดนแห่งความหลากหลายของอาหาร ดื่มน้ำเพียงพอ และทานผักผลไม้หลากสี',
    bgGradient: 'from-emerald-100 to-teal-50',
  },
  {
    id: 3,
    name: '🏃 ภูเขาออกกำลังกาย',
    subtitle: 'Fitness Mountain',
    emoji: '🏃',
    requiredXp: 200,
    requiredLevel: 3,
    description: 'เส้นทางท้าทายความแข็งแกร่ง เสริมสร้างกล้ามเนื้อและหัวใจให้กระปรี้กระเปร่า',
    bgGradient: 'from-sky-100 to-indigo-50',
  },
  {
    id: 4,
    name: '🏰 ปราสาทเป้าหมาย',
    subtitle: 'Goal Castle',
    emoji: '🏰',
    requiredXp: 300,
    requiredLevel: 4,
    description: 'จุดหมายปลายทางแห่งความสำเร็จ สุขภาพแข็งแรงและมีความสุขอย่างยั่งยืน',
    bgGradient: 'from-purple-100 to-pink-50',
  },
  {
    id: 5,
    name: '🌈 แดนสวรรค์สุขภาพ',
    subtitle: 'Health Paradise',
    emoji: '🌈',
    requiredXp: 400,
    requiredLevel: 5,
    description: 'ดินแดนแห่งการรักษานิสัยที่ดีตลอดไป ฉลองความสำเร็จร่วมกับสัตว์เลี้ยงคู่ใจ!',
    bgGradient: 'from-amber-100 to-pink-50',
  },
];

// Helper calculations for student health profile
export function calculateLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

export function calculateBMI(
  weightKg: number,
  heightCm: number
): { value: number; label: string; color: string; bg: string } {
  if (!weightKg || !heightCm || heightCm <= 0)
    return { value: 0, label: '-', color: 'text-slate-500', bg: 'bg-slate-100' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { value: bmi, label: 'น้ำหนักน้อยกว่าเกณฑ์ปกติ', color: 'text-amber-600', bg: 'bg-amber-100' };
  } else if (bmi < 23) {
    return { value: bmi, label: 'น้ำหนักสมส่วนตามเกณฑ์เอเชีย', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  } else if (bmi < 25) {
    return { value: bmi, label: 'น้ำหนักเกินเกณฑ์เล็กน้อย', color: 'text-sky-600', bg: 'bg-sky-100' };
  } else if (bmi < 30) {
    return { value: bmi, label: 'เข้าข่ายท้วม / ควรดูแลสุขภาพ', color: 'text-purple-600', bg: 'bg-purple-100' };
  } else {
    return { value: bmi, label: 'ควรปรึกษาผู้เชี่ยวชาญสุขภาพ', color: 'text-rose-600', bg: 'bg-rose-100' };
  }
}

// BMR (Mifflin-St Jeor Formula - Standard Medical Formula)
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender?: 'female' | 'male' | 'other' | string
): number {
  if (!weightKg || !heightCm || !age) return 0;
  // Male: 10*W + 6.25*H - 5*A + 5
  // Female: 10*W + 6.25*H - 5*A - 161
  // Other/Neutral: average
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  } else if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  // Neutral baseline default
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);
}

// TDEE based on activity level
export function calculateTDEE(bmr: number, activityLevel: string): number {
  if (!bmr) return 0;
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

// Healthy Calorie recommendation range without extreme deficits
export function calculateCalorieRange(
  tdee: number,
  currentWeight: number,
  targetWeight: number
): { min: number; max: number; description: string } {
  if (!tdee) return { min: 1400, max: 1800, description: 'ช่วงพลังงานเฉลี่ยที่แนะนำ' };

  if (targetWeight < currentWeight) {
    // Gentle safe deficit (never below 1200 kcal for safety)
    const min = Math.max(1200, Math.round(tdee - 400));
    const max = Math.max(min + 150, Math.round(tdee - 200));
    return {
      min,
      max,
      description:
        'ช่วงพลังงานสำหรับค่อยๆ ปรับสมดุลอย่างปลอดภัย ไม่ควรอดอาหารต่ำกว่านี้เพื่อรักษาระบบเผาผลาญและความสดชื่นในการเรียน',
    };
  } else if (targetWeight > currentWeight) {
    const min = Math.round(tdee + 200);
    const max = Math.round(tdee + 450);
    return {
      min,
      max,
      description:
        'ช่วงพลังงานสำหรับการสร้างกล้ามเนื้อและเพิ่มน้ำหนักอย่างมีสุขภาพดี เสริมโปรตีนและคาร์โบไฮเดรตเชิงซ้อน',
    };
  } else {
    const min = Math.round(tdee - 100);
    const max = Math.round(tdee + 100);
    return {
      min,
      max,
      description:
        'ช่วงพลังงานสำหรับรักษาสมดุลน้ำหนักเดิมให้คงที่ ร่างกายมีพลังงานสม่ำเสมอตลอดวัน',
    };
  }
}
