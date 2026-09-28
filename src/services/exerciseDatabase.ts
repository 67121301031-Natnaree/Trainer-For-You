// Thai Standard Exercise & Calorie Database linked to Body Weight & BMI
// Grounded on Compendium of Physical Activities and Thai Department of Health (กรมอนามัย / สสส.)

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'cardio' | 'sports' | 'strength' | 'flexibility' | 'daily';
  categoryName: string;
  emoji: string;
  met: number;
  description: string;
  recommendedIntensity: 'light' | 'moderate' | 'vigorous';
  keywords: string[];
}

export const EXERCISE_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด', emoji: '🌟' },
  { id: 'cardio', label: 'คาร์ดิโอ & วิ่ง', emoji: '🏃' },
  { id: 'sports', label: 'กีฬา & กิจกรรม', emoji: '🏸' },
  { id: 'strength', label: 'เวท & บอดี้เวท', emoji: '🏋️' },
  { id: 'flexibility', label: 'ยืดเหยียด & โยคะ', emoji: '🧘' },
  { id: 'daily', label: 'กิจกรรมชีวิตประจำวัน', emoji: '🧹' },
] as const;

export const EXERCISE_DATABASE: ExerciseItem[] = [
  // 1. คาร์ดิโอ & วิ่ง
  {
    id: 'walk_brisk',
    name: 'เดินเร็ว (Brisk Walking 5.5-6 km/h)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🚶‍♀️',
    met: 4.3,
    description: 'ก้าวเท้ารวดเร็ว แกว่งแขนกระฉับกระเฉง เผาผลาญไขมันและถนอมข้อต่อ',
    recommendedIntensity: 'moderate',
    keywords: ['เดินเร็ว', 'เดินไว', 'เดินชัน', 'brisk walk'],
  },
  {
    id: 'walk_casual',
    name: 'เดินช้า / เดินเล่น (3.5 km/h)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🚶',
    met: 3.0,
    description: 'เดินผ่อนคลาย เดินไปเรียน เดินรอบสวน เหมาะสำหรับเริ่มต้นขยับร่างกาย',
    recommendedIntensity: 'light',
    keywords: ['เดินเล่น', 'เดินช้า', 'เดินชิว', 'เดินผ่อนคลาย', 'เดิน'],
  },
  {
    id: 'jogging',
    name: 'วิ่งเหยาะๆ / จ็อกกิ้ง (Jogging 8 km/h)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🏃',
    met: 7.0,
    description: 'วิ่งก้าวสม่ำเสมอ ฝึกความอดทนของปอดและหัวใจ กระตุ้นระบบเผาผลาญ',
    recommendedIntensity: 'moderate',
    keywords: ['วิ่งเหยาะ', 'จ๊อกกิ้ง', 'จ็อกกิ้ง', 'jogging', 'วิ่ง'],
  },
  {
    id: 'running_fast',
    name: 'วิ่งเร็ว / วิ่งต่อเนื่อง (10-12 km/h)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '⚡',
    met: 10.0,
    description: 'วิ่งสปีดสูง หัวใจเต้นแรง เผาผลาญแคลอรี่สูงมากในเวลาสั้น',
    recommendedIntensity: 'vigorous',
    keywords: ['วิ่งเร็ว', 'สปีด', 'วิ่งลู่', 'วิ่งแข่ง', 'tempo run'],
  },
  {
    id: 'cycling_moderate',
    name: 'ปั่นจักรยานทั่วไป (15-18 km/h)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🚴',
    met: 6.0,
    description: 'ปั่นสบายๆ รับลม หรือปั่นจักรยานฟิตเนส เผาผลาญไขมันได้ต่อเนื่อง',
    recommendedIntensity: 'moderate',
    keywords: ['ปั่นจักรยาน', 'ขี่จักรยาน', 'จักรยาน', 'ปั่นจักรยานช้า', 'cycling'],
  },
  {
    id: 'cycling_fast',
    name: 'ปั่นจักรยานเร็ว / สปินนิ่งไบค์',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🚴‍♂️',
    met: 8.5,
    description: 'ปั่นคลาสสปินนิ่ง หรือปั่นต้านแรงลม ช่วยบริหารกล้ามเนื้อขาและหัวใจ',
    recommendedIntensity: 'vigorous',
    keywords: ['สปินนิ่ง', 'spinning', 'ปั่นจักรยานเร็ว', 'ปั่นเร็ว'],
  },
  {
    id: 'swimming',
    name: 'ว่ายน้ำ (ฟรีสไตล์ / กบ ต่อเนื่อง)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🏊',
    met: 7.5,
    description: 'ออกกำลังกายแบบไร้แรงกระแทก ใช้กล้ามเนื้อทุกส่วนของร่างกายอย่างปลอดภัย',
    recommendedIntensity: 'moderate',
    keywords: ['ว่ายน้ำ', 'ว่ายน้ำฟรีสไตล์', 'ท่ากบ', 'swimming'],
  },
  {
    id: 'jump_rope',
    name: 'กระโดดเชือก (Jump Rope)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🪢',
    met: 10.0,
    description: 'การออกกำลังกายที่เบิร์นสูงเป็นอันดับต้นๆ ฝึกความคล่องแคล่วและน่อง',
    recommendedIntensity: 'vigorous',
    keywords: ['กระโดดเชือก', 'โดดเชือก', 'jump rope', 'skipping'],
  },
  {
    id: 'aerobic_dance',
    name: 'เต้นแอโรบิก / ซุมบ้า (Zumba)',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '💃',
    met: 6.5,
    description: 'ขยับตามจังหวะเพลง สนุกสนาน คลายเครียด ปลุกพลังความสดชื่น',
    recommendedIntensity: 'moderate',
    keywords: ['เต้นแอโรบิก', 'แอโรบิก', 'ซุมบ้า', 'zumba', 'เต้น'],
  },
  {
    id: 'hiit',
    name: 'คาร์ดิโอ HIIT / เซอร์กิต',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🔥',
    met: 8.5,
    description: 'ออกกำลังกายหนักสลับเบา เผาผลาญไขมันต่อเนื่องหลังออกกำลัง (Afterburn)',
    recommendedIntensity: 'vigorous',
    keywords: ['hiit', 'เซอร์กิต', 'ทาบาตะ', 'tabata', 'ฮิต'],
  },
  {
    id: 'stair_climbing',
    name: 'เดินขึ้นบันได / เครื่องเดินบันได',
    category: 'cardio',
    categoryName: 'คาร์ดิโอ & วิ่ง',
    emoji: '🪜',
    met: 8.0,
    description: 'เพิ่มแรงต้านของแรงโน้มถ่วง กระชับกล้ามเนื้อสะโพกและต้นขา',
    recommendedIntensity: 'vigorous',
    keywords: ['เดินขึ้นบันได', 'ขึ้นบันได', 'บันได', 'stair'],
  },

  // 2. กีฬา & กิจกรรม
  {
    id: 'badminton',
    name: 'แบดมินตัน (Badminton)',
    category: 'sports',
    categoryName: 'กีฬา & กิจกรรม',
    emoji: '🏸',
    met: 5.5,
    description: 'กีฬาตีลูกขนไก่ ยอดนิยม ขยับเคลื่อนไหวรอบทิศทาง ฝึกสายตาและความไว',
    recommendedIntensity: 'moderate',
    keywords: ['แบดมินตัน', 'ตีแบด', 'แบด', 'badminton'],
  },
  {
    id: 'basketball_football',
    name: 'บาสเกตบอล / ฟุตบอล / ฟุตซอล',
    category: 'sports',
    categoryName: 'กีฬา & กิจกรรม',
    emoji: '⚽',
    met: 7.5,
    description: 'กีฬาทีม วิ่งเปลี่ยนทิศทาง รวดเร็ว เสริมสร้างความแข็งแรงและความสามัคคี',
    recommendedIntensity: 'vigorous',
    keywords: ['บาสเกตบอล', 'บาส', 'ฟุตบอล', 'ฟุตซอล', 'เตะบอล'],
  },
  {
    id: 'boxing',
    name: 'ชกมวย / มวยไทย / บอดี้คอมแบท',
    category: 'sports',
    categoryName: 'กีฬา & กิจกรรม',
    emoji: '🥊',
    met: 8.5,
    description: 'ออกหมัดเตะต่อย ปลดปล่อยความตึงเครียด ฝึกพลังแขนขาและแกนกลางลำตัว',
    recommendedIntensity: 'vigorous',
    keywords: ['มวย', 'มวยไทย', 'ชกมวย', 'บอดี้คอมแบท', 'boxing'],
  },
  {
    id: 'table_tennis',
    name: 'ปิงปอง / เทเบิลเทนนิส',
    category: 'sports',
    categoryName: 'กีฬา & กิจกรรม',
    emoji: '🏓',
    met: 4.0,
    description: 'กีฬาเคลื่อนไหวแขนขาแบบรวดเร็ว ฝึกสมาธิและความคล่องตัว',
    recommendedIntensity: 'light',
    keywords: ['ปิงปอง', 'เทเบิลเทนนิส', 'table tennis'],
  },

  // 3. เวท & เสริมสร้างกล้ามเนื้อ
  {
    id: 'weight_training',
    name: 'เวทเทรนนิ่ง / เล่นเวท (ดัมเบล / บาร์เบล)',
    category: 'strength',
    categoryName: 'เวท & บอดี้เวท',
    emoji: '🏋️',
    met: 5.0,
    description: 'สร้างกล้ามเนื้อ เพิ่มอัตราการเผาผลาญพื้นฐาน (BMR) ทำให้หุ่นกระชับเฟิร์ม',
    recommendedIntensity: 'moderate',
    keywords: ['เวท', 'เวทเทรนนิ่ง', 'ยกเวท', 'ดัมเบล', 'weight training'],
  },
  {
    id: 'bodyweight',
    name: 'บอดี้เวท (วิดพื้น / สควอท / แพลงก์)',
    category: 'strength',
    categoryName: 'เวท & บอดี้เวท',
    emoji: '🤸',
    met: 5.5,
    description: 'ใช้น้ำหนักตัวสร้างแรงต้าน ไม่ต้องมีอุปกรณ์ ทำได้สะดวกในห้องนอนหรือหอพัก',
    recommendedIntensity: 'moderate',
    keywords: ['บอดี้เวท', 'วิดพื้น', 'สควอท', 'แพลงก์', 'bodyweight', 'push up', 'squat'],
  },
  {
    id: 'pilates',
    name: 'พิลาทิส (Pilates / Reformer)',
    category: 'strength',
    categoryName: 'เวท & บอดี้เวท',
    emoji: '✨',
    met: 3.5,
    description: 'ปรับสรีระ แกนกลางลำตัว ปรับบุคลิกภาพ ลดอาการปวดหลังจากนั่งเรียน',
    recommendedIntensity: 'light',
    keywords: ['พิลาทิส', 'pilates', 'รีฟอร์มเมอร์'],
  },

  // 4. ยืดเหยียด & โยคะ
  {
    id: 'yoga',
    name: 'โยคะ / ยืดกล้ามเนื้อ (Yoga & Stretching)',
    category: 'flexibility',
    categoryName: 'ยืดเหยียด & โยคะ',
    emoji: '🧘',
    met: 3.0,
    description: 'ฝึกการหายใจลึก ยืดเหยียดผ่อนคลายกล้ามเนื้อ ลดอาการออฟฟิศซินโดรม',
    recommendedIntensity: 'light',
    keywords: ['โยคะ', 'ยืดเหยียด', 'ยืดกล้ามเนื้อ', 'yoga', 'stretching'],
  },
  {
    id: 'hula_hoop',
    name: 'ฮูลาฮูป / กายบริหารเบาๆ',
    category: 'flexibility',
    categoryName: 'ยืดเหยียด & โยคะ',
    emoji: '⭕',
    met: 4.5,
    description: 'หมุนฮูลาฮูปพร้อมดูซีรีส์ กระชับรอบเอวและกระตุ้นการเคลื่อนไหว',
    recommendedIntensity: 'light',
    keywords: ['ฮูลาฮูป', 'ฮูลาฮุป', 'หมุนฮูป', 'hula hoop'],
  },

  // 5. กิจวัตรประจำวัน
  {
    id: 'housework',
    name: 'ทำงานบ้าน / กวาดบ้าน / ถูห้อง',
    category: 'daily',
    categoryName: 'กิจกรรมชีวิตประจำวัน',
    emoji: '🧹',
    met: 3.3,
    description: 'ขยับตัวทำความสะอาดห้องพัก ขยับตัวตลอดเวลา นับเป็นการเผาผลาญจริง',
    recommendedIntensity: 'light',
    keywords: ['กวาดบ้าน', 'ถูบ้าน', 'ทำงานบ้าน', 'ล้างจาน', 'ทำความสะอาดห้อง', 'ซักผ้า'],
  },
  {
    id: 'gardening',
    name: 'จัดสวน / รดน้ำต้นไม้ / ยกของ',
    category: 'daily',
    categoryName: 'กิจกรรมชีวิตประจำวัน',
    emoji: '🪴',
    met: 3.8,
    description: 'เคลื่อนไหวยกของ ย้ายกระถางต้นไม้ ได้สัมผัสธรรมชาติและเหงื่อซึมเบาๆ',
    recommendedIntensity: 'light',
    keywords: ['รดน้ำต้นไม้', 'จัดสวน', 'ยกของ', 'จัดห้อง'],
  },
];

export const STANDARD_WEIGHT_BENCHMARKS = [50, 60, 70, 80] as const;

const CUSTOM_EXERCISES_KEY = 'trainer_custom_exercises_v2';

export function getExerciseDatabase(): ExerciseItem[] {
  try {
    const saved = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback to default
  }
  return EXERCISE_DATABASE;
}

export function saveCustomExerciseDatabase(items: ExerciseItem[]): void {
  try {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save custom exercises', e);
  }
}

export function resetCustomExerciseDatabase(): ExerciseItem[] {
  try {
    localStorage.removeItem(CUSTOM_EXERCISES_KEY);
  } catch (e) {
    console.error('Failed to reset custom exercises', e);
  }
  return EXERCISE_DATABASE;
}

/**
 * คำนวณแคลอรี่ที่เผาผลาญ อิงตามน้ำหนักตัวจริง (ซึ่งสัมพันธ์กับ BMI โดยตรง)
 * สูตรวิทยาศาสตร์การแพทย์สากล (Compendium of Physical Activities):
 * Calories Burned = MET × Weight (kg) × (Duration (minutes) / 60) × IntensityMultiplier
 */
export function calculateExerciseBurn(
  met: number,
  weightKg: number,
  durationMinutes: number,
  intensity: 'light' | 'moderate' | 'vigorous' = 'moderate'
): number {
  if (!met || !weightKg || !durationMinutes || weightKg <= 0 || durationMinutes <= 0) {
    return 0;
  }

  const intensityMultipliers = {
    light: 0.85,
    moderate: 1.0,
    vigorous: 1.25,
  };

  const multiplier = intensityMultipliers[intensity] || 1.0;
  const burned = met * weightKg * (durationMinutes / 60) * multiplier;
  return Math.round(burned);
}

export interface BmiBracketBenchmark {
  label: string;
  bmiRange: string;
  representativeWeightKg: number;
  isUserBracket: boolean;
  userBmiValue: number;
}

/**
 * สร้างตารางเทียบเกณฑ์ BMI 5 ระดับตามมาตรฐานเอเชีย (Asian BMI Criteria)
 * พร้อมคำนวณน้ำหนักตัวแทนเพื่อเปรียบเทียบแคลอรี่ที่เผาผลาญต่อ 30 นาที
 */
export function getBmiBrackets(
  currentWeight: number,
  heightCm: number
): BmiBracketBenchmark[] {
  const heightM = (heightCm || 165) / 100;
  const h2 = heightM * heightM;
  const currentBmi = currentWeight && h2 > 0 ? Number((currentWeight / h2).toFixed(1)) : 21.0;

  const brackets = [
    {
      label: 'น้ำหนักน้อยกว่าเกณฑ์',
      bmiRange: '< 18.5',
      representativeWeightKg: Math.round(17.5 * h2),
      match: currentBmi < 18.5,
    },
    {
      label: 'น้ำหนักสมส่วน (ปกติ)',
      bmiRange: '18.5 - 22.9',
      representativeWeightKg: Math.round(21.0 * h2),
      match: currentBmi >= 18.5 && currentBmi < 23,
    },
    {
      label: 'น้ำหนักเกินเกณฑ์',
      bmiRange: '23.0 - 24.9',
      representativeWeightKg: Math.round(24.0 * h2),
      match: currentBmi >= 23 && currentBmi < 25,
    },
    {
      label: 'ท้วม / อ้วนระดับ 1',
      bmiRange: '25.0 - 29.9',
      representativeWeightKg: Math.round(27.5 * h2),
      match: currentBmi >= 25 && currentBmi < 30,
    },
    {
      label: 'อ้วนระดับ 2 ขึ้นไป',
      bmiRange: '≥ 30.0',
      representativeWeightKg: Math.round(32.0 * h2),
      match: currentBmi >= 30,
    },
  ];

  return brackets.map((b) => ({
    label: b.label,
    bmiRange: b.bmiRange,
    representativeWeightKg: b.representativeWeightKg,
    isUserBracket: b.match,
    userBmiValue: currentBmi,
  }));
}

/**
 * วิเคราะห์ข้อความกิจกรรมที่พิมพ์ เช่น "วิ่ง 30 นาที" หรือ "เดินเร็ว 45 นาที"
 * แล้วคำนวณแคลอรี่ที่เผาผลาญตามน้ำหนักตัว/BMI ของผู้ใช้
 */
export function estimateExerciseBurnFromText(
  text: string,
  weightKg: number
): { activityName: string; calories: number; minutes: number; emoji: string } | null {
  if (!text || !text.trim() || !weightKg) return null;

  const normalized = text.toLowerCase().trim();

  // 1. ดึงระยะเวลาเป็นนาที ถ้าผู้ใช้พิมพ์ เช่น "30 นาที" หรือ "45 min" หรือ "1 ชั่วโมง"
  let minutes = 30; // default 30 mins
  const hourMatch = normalized.match(/(\d+(\.\d+)?)\s*(ชั่วโมง|ชม|hr|hour)/);
  if (hourMatch) {
    minutes = Math.round(parseFloat(hourMatch[1]) * 60);
  } else {
    const minMatch = normalized.match(/(\d+)\s*(นาที|min)/);
    if (minMatch) {
      minutes = parseInt(minMatch[1], 10);
    }
  }

  // 2. ถ้าผู้ใช้พิมพ์แคลอรี่มาตรงๆ เช่น "250 kcal"
  const explicitCalMatch = normalized.match(/(\d+)\s*(kcal|แคล|กิโลแคลอรี่)/i);
  if (explicitCalMatch) {
    const cal = parseInt(explicitCalMatch[1], 10);
    if (!isNaN(cal) && cal > 0 && cal < 4000) {
      return {
        activityName: text.trim(),
        calories: cal,
        minutes,
        emoji: '🏃',
      };
    }
  }

  // 3. ค้นหากิจกรรมจากฐานข้อมูล
  const currentDb = getExerciseDatabase();
  for (const item of currentDb) {
    if (
      normalized.includes(item.name.toLowerCase()) ||
      item.keywords.some((kw) => normalized.includes(kw.toLowerCase()))
    ) {
      const calories = calculateExerciseBurn(item.met, weightKg, minutes, 'moderate');
      return {
        activityName: item.name,
        calories,
        minutes,
        emoji: item.emoji,
      };
    }
  }

  // Fallback ถ้ามีคำว่า "ออกกำลังกาย" หรือ "ขยับ"
  if (
    normalized.includes('ออกกำลังกาย') ||
    normalized.includes('ฟิตเนส') ||
    normalized.includes('ขยับ')
  ) {
    const calories = calculateExerciseBurn(5.0, weightKg, minutes, 'moderate');
    return {
      activityName: 'ออกกำลังกายทั่วไป',
      calories,
      minutes,
      emoji: '🏃',
    };
  }

  return null;
}
