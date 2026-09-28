// Thai & International Food Calorie Estimation Helper

interface FoodCalorieRef {
  keywords: string[];
  cal: number;
}

const FOOD_DATABASE: FoodCalorieRef[] = [
  // ข้าว / อาหารจานเดียว
  { keywords: ['กะเพราไข่ดาว', 'กระเพราไข่ดาว'], cal: 650 },
  { keywords: ['กะเพรา', 'กระเพรา'], cal: 500 },
  { keywords: ['ข้าวไข่เจียว', 'ไข่เจียว'], cal: 450 },
  { keywords: ['ข้าวผัด', 'ผัดซีอิ๊ว'], cal: 550 },
  { keywords: ['ข้าวมันไก่ทอด'], cal: 650 },
  { keywords: ['ข้าวมันไก่', 'มันไก่'], cal: 580 },
  { keywords: ['ข้าวหมูแดง', 'ข้าวหมูกรอบ'], cal: 600 },
  { keywords: ['ข้าวขาหมู', 'ขาหมู'], cal: 650 },
  { keywords: ['ข้าวหมูทอด', 'หมูทอด'], cal: 550 },
  { keywords: ['ผัดไทย', 'ผัดไท'], cal: 580 },
  { keywords: ['ราดหน้า'], cal: 450 },
  { keywords: ['สุกี้แห้ง'], cal: 420 },
  { keywords: ['สุกี้น้ำ'], cal: 320 },
  { keywords: ['ก๋วยเตี๋ยวต้มยำ', 'ต้มยำน้ำข้น'], cal: 450 },
  { keywords: ['ก๋วยเตี๋ยวน้ำใส', 'เกาเหลา', 'ก๋วยเตี๋ยว'], cal: 350 },
  { keywords: ['บะหมี่', 'ก๋วยจั๊บ'], cal: 400 },
  { keywords: ['โจ๊ก', 'ข้าวต้ม'], cal: 250 },
  { keywords: ['ข้าวสวย', 'ข้าวกล้อง', 'ข้าวไรซ์เบอร์รี่'], cal: 180 },
  { keywords: ['ข้าวเหนียว'], cal: 160 },
  { keywords: ['หมูปิ้ง'], cal: 250 },
  { keywords: ['ไก่ย่าง'], cal: 220 },
  { keywords: ['ส้มตำ'], cal: 120 },
  { keywords: ['ยำ'], cal: 180 },
  { keywords: ['แกงจืด', 'ต้มจืด', 'ต้มยำน้ำใส'], cal: 160 },
  { keywords: ['แกงเขียวหวาน', 'พะแนง', 'มัสมั่น', 'แกงกะทิ'], cal: 450 },

  // สุขภาพ / คลีน
  { keywords: ['อกไก่', 'สลัดอกไก่'], cal: 280 },
  { keywords: ['สลัดผัก', 'สลัดโรล', 'สลัด'], cal: 180 },
  { keywords: ['ไข่ต้ม', 'ไข่ลวก'], cal: 75 },
  { keywords: ['ไข่ตุ๋น'], cal: 90 },
  { keywords: ['ไข่ดาว'], cal: 120 },
  { keywords: ['แซลมอน', 'ปลาแซลมอน', 'ปลาย่าง', 'ปลานึ่ง'], cal: 250 },
  { keywords: ['ทูน่า', 'แซนด์วิชทูน่า'], cal: 240 },
  { keywords: ['แซนด์วิช', 'แซนวิช'], cal: 280 },
  { keywords: ['ข้าวโอ๊ต', 'กราโนล่า'], cal: 200 },
  { keywords: ['โยเกิร์ต', 'กรีกโยเกิร์ต'], cal: 110 },
  { keywords: ['นมจืด', 'นมสด', 'นมถั่วเหลือง', 'น้ำเต้าหู้'], cal: 130 },

  // ผลไม้
  { keywords: ['กล้วยหอม'], cal: 105 },
  { keywords: ['กล้วยน้ำว้า'], cal: 75 },
  { keywords: ['แอปเปิ้ล', 'แอปเปิล'], cal: 80 },
  { keywords: ['ฝรั่ง'], cal: 60 },
  { keywords: ['แตงโม'], cal: 60 },
  { keywords: ['ส้ม'], cal: 60 },
  { keywords: ['มะละกอ'], cal: 70 },
  { keywords: ['สับปะรด'], cal: 70 },

  // ของว่าง & เครื่องดื่ม
  { keywords: ['ชาเขียวหวานน้อย', 'อเมริกาโน่เย็น', 'กาแฟดำ'], cal: 20 },
  { keywords: ['ชาเขียวนม', 'ชานมไข่มุก', 'ชานม', 'ชาไทย'], cal: 280 },
  { keywords: ['ลาเต้', 'คาปูชิโน่'], cal: 150 },
  { keywords: ['โกโก้'], cal: 220 },
  { keywords: ['ขนมปังโฮลวีท', 'ขนมปัง'], cal: 140 },
  { keywords: ['ถั่วอัลมอนด์', 'อัลมอนด์', 'ถั่ว'], cal: 150 },
  { keywords: ['คุกกี้', 'เค้ก', 'โดนัท', 'เบเกอรี่'], cal: 280 },
  { keywords: ['มันเทศ', 'มันหวาน'], cal: 120 },
];

/**
 * คำนวณแคลอรี่โดยประมาณจากข้อความที่ผู้ใช้กรอก
 * @param text เช่น "ข้าวกะเพราหมูสับ + ไข่ดาว"
 * @returns แคลอรี่โดยประมาณ (number) หรือ null หากเป็นค่าว่าง
 */
export function estimateCaloriesFromText(text: string): number | null {
  if (!text || !text.trim()) return null;

  const normalized = text.toLowerCase().trim();

  // If user explicitly wrote number like "450 kcal" or "500 แคล"
  const explicitNumberMatch = normalized.match(/(\d+)\s*(kcal|แคล|กิโลแคลอรี่)/i);
  if (explicitNumberMatch) {
    const val = parseInt(explicitNumberMatch[1], 10);
    if (!isNaN(val) && val > 0 && val < 5000) return val;
  }

  // Split by separators like +, และ, ,, กับ, หรือ
  const parts = normalized.split(/[+&,]|และ|กับ/).map((p) => p.trim()).filter(Boolean);

  let totalCal = 0;
  let matchedAny = false;

  for (const part of parts) {
    let partMatched = false;
    for (const item of FOOD_DATABASE) {
      if (item.keywords.some((kw) => part.includes(kw))) {
        totalCal += item.cal;
        partMatched = true;
        matchedAny = true;
        break;
      }
    }

    if (!partMatched) {
      // General heuristics based on word length if not matched
      if (part.includes('ข้าว') || part.includes('เส้น') || part.includes('หมี่')) {
        totalCal += 350;
        matchedAny = true;
      } else if (part.includes('แกง') || part.includes('ผัด') || part.includes('ทอด')) {
        totalCal += 300;
        matchedAny = true;
      } else if (part.includes('ต้ม') || part.includes('นึ่ง') || part.includes('ยำ')) {
        totalCal += 200;
        matchedAny = true;
      } else if (part.includes('ชา') || part.includes('นม') || part.includes('น้ำ')) {
        totalCal += 150;
        matchedAny = true;
      }
    }
  }

  if (matchedAny && totalCal > 0) {
    return totalCal;
  }

  // Fallback default for generic meal entry
  if (normalized.length >= 3) {
    return 350;
  }

  return null;
}
