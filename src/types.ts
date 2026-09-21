export type PetId =
  | 'rabbit'
  | 'cat'
  | 'dog'
  | 'panda'
  | 'fox'
  | 'bear'
  | 'koala'
  | 'hamster';

export type ActivityLevel =
  | 'sedentary' // นั่งทำงานเป็นส่วนใหญ่
  | 'light' // เคลื่อนไหวเล็กน้อยในชีวิตประจำวัน
  | 'moderate' // ออกกำลังกายสัปดาห์ละ 2-3 ครั้ง
  | 'active' // ออกกำลังกายสัปดาห์ละ 4-5 ครั้ง
  | 'very_active'; // นักกีฬา หรือใช้แรงงานหนัก

export interface UserProfile {
  nickname: string;
  age: number;
  gender?: 'female' | 'male' | 'other';
  startWeight?: number; // Starting weight (kg) when starting the adventure
  currentWeight: number; // kg
  height: number; // cm
  targetWeight: number; // kg
  activityLevel: ActivityLevel;
  createdAt: string;
}

export interface WeightStep {
  stepNumber: number;
  stepWeightKg: number;
  kgReducedFromStart: number;
  title: string;
  subtitle: string;
  emoji: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isGoal: boolean;
}

export interface PetInfo {
  id: PetId;
  name: string;
  thaiName: string;
  emoji: string;
  title: string;
  description: string;
  favoriteFood: string;
  quotes: string[];
}

export interface AccessoryItem {
  id: string;
  name: string;
  emoji: string;
  category: 'head' | 'neck' | 'face' | 'special';
  price: number;
  description: string;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLog {
  id: string;
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  note?: string;
  imageUrl?: string;
}

export interface ExerciseLog {
  id: string;
  timestamp: string;
  activityName: string;
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  estimatedCaloriesBurned: number;
  notes?: string;
}

export interface WeightLog {
  id: string;
  timestamp: string;
  weightKg: number;
  note?: string;
}

export interface GameStage {
  id: number;
  name: string;
  subtitle: string;
  emoji: string;
  requiredXp: number;
  requiredLevel: number;
  description: string;
  bgGradient: string;
}

export interface GameState {
  profile: UserProfile | null;
  xp: number;
  level: number;
  coins: number;
  selectedPet: PetId;
  equippedAccessory: string | null;
  equippedAccessoryId: string | null;
  inventory: string[];
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLog[];
  soundEnabled: boolean;
  hasSeenWelcome: boolean;
}
