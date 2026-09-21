import { GameState, UserProfile } from '../types';

const STORAGE_KEY = 'trainer_for_you_state_v1';

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
  soundEnabled: true,
  hasSeenWelcome: true,
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
