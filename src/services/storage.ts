import { GameState, UserProfile, MealPlanDay } from '../types';

const STORAGE_KEY = 'trainer_for_you_state_v2';

export const DEFAULT_WEEKLY_MEAL_PLAN: MealPlanDay[] = [
  {
    dayIndex: 0,
    dayName: 'จันทร์',
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
  },
  {
    dayIndex: 1,
    dayName: 'อังคาร',
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
  },
  {
    dayIndex: 2,
    dayName: 'พุธ',
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
  },
  {
    dayIndex: 3,
    dayName: 'พฤหัสบดี',
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
  },
  {
    dayIndex: 4,
    dayName: 'ศุกร์',
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
  },
  {
    dayIndex: 5,
    dayName: 'เสาร์',
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
  },
  {
    dayIndex: 6,
    dayName: 'อาทิตย์',
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
  },
];

export const DEFAULT_STUDENT_PROFILE: UserProfile = {
  nickname: 'นักศึกษา',
  age: 20,
  gender: 'female',
  currentWeight: 58,
  startWeight: 58,
  height: 165,
  targetWeight: 54,
  activityLevel: 'moderate',
  createdAt: new Date().toISOString(),
};

export const INITIAL_STATE: GameState = {
  profile: DEFAULT_STUDENT_PROFILE,
  xp: 0,
  level: 1,
  coins: 50, // Initial welcoming pocket coins!
  selectedPet: 'rabbit',
  equippedAccessory: null,
  equippedAccessoryId: null,
  inventory: [],
  foodLogs: [],
  exerciseLogs: [],
  weightLogs: [
    {
      id: 'initial-weight',
      timestamp: new Date().toISOString(),
      weightKg: 58,
      note: 'น้ำหนักเริ่มต้นการเดินทาง',
    },
  ],
  plans: [
    {
      id: 'default-plan-1',
      date: new Date().toISOString().slice(0, 10),
      title: 'ดื่มน้ำให้ครบ 8 แก้ว (2 ลิตร)',
      category: 'water',
      targetValue: '8 แก้ว',
      isCompleted: false,
    },
    {
      id: 'default-plan-2',
      date: new Date().toISOString().slice(0, 10),
      title: 'เดินยืดเส้นยืดสายหรือออกกำลังกาย 20 นาที',
      category: 'exercise',
      targetValue: '20 นาที',
      isCompleted: false,
    },
  ],
  weeklyMealPlan: DEFAULT_WEEKLY_MEAL_PLAN,
  soundEnabled: true,
  hasSeenWelcome: false,
};

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      hasSeenWelcome: typeof parsed.hasSeenWelcome === 'boolean' ? parsed.hasSeenWelcome : false,
      weeklyMealPlan: parsed.weeklyMealPlan && parsed.weeklyMealPlan.length > 0 ? parsed.weeklyMealPlan : DEFAULT_WEEKLY_MEAL_PLAN,
      profile: parsed.profile || DEFAULT_STUDENT_PROFILE,
      // calculate level accurately: Level = Math.floor(xp / 100) + 1
      level: Math.floor((parsed.xp || 0) / 100) + 1,
    };
  } catch (e) {
    console.error('Failed to parse saved game state:', e);
    return INITIAL_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

export function resetGameStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}

export const resetGameState = resetGameStorage;
