import { create } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import { Language, CHAT_LIMITS, isMessageOnTopic } from './translations'

// ============================================================================
// SAFE STORAGE FOR SANDBOXED IFRAMES
// Falls back to in-memory storage when localStorage is blocked
// ============================================================================

// In-memory fallback storage
const memoryStorage = new Map<string, string>()

// Cache the localStorage availability check result
let localStorageAvailable: boolean | null = null

// Check if we're in a sandboxed environment (cached result)
function isLocalStorageAvailable(): boolean {
  // Never try localStorage on server
  if (typeof window === 'undefined') return false
  
  // Return cached result if available
  if (localStorageAvailable !== null) return localStorageAvailable
  
  // Check localStorage availability
  try {
    // Use a unique test key to avoid conflicts
    const testKey = `__z_storage_test_${Date.now()}`
    // Access localStorage directly - this will throw in sandboxed iframes
    const testValue = 'test'
    window.localStorage.setItem(testKey, testValue)
    window.localStorage.removeItem(testKey)
    localStorageAvailable = true
    return true
  } catch {
    localStorageAvailable = false
    return false
  }
}

// Safe JSON storage implementation for Zustand persist middleware
// This handles JSON serialization internally and never uses createJSONStorage
// which has internal localStorage access issues
const safeJsonStorage: StateStorage = {
  getItem: (name: string): string | null => {
    // Always use memory storage on server
    if (typeof window === 'undefined') {
      return memoryStorage.get(name) ?? null
    }
    
    // Try localStorage if available
    if (isLocalStorageAvailable()) {
      try {
        return window.localStorage.getItem(name)
      } catch {
        // Fall through to memory storage
      }
    }
    
    return memoryStorage.get(name) ?? null
  },
  
  setItem: (name: string, value: string): void => {
    // Always use memory storage on server
    if (typeof window === 'undefined') {
      memoryStorage.set(name, value)
      return
    }
    
    // Try localStorage if available
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(name, value)
        return
      } catch {
        // Fall through to memory storage
      }
    }
    
    memoryStorage.set(name, value)
  },
  
  removeItem: (name: string): void => {
    // Always use memory storage on server
    if (typeof window === 'undefined') {
      memoryStorage.delete(name)
      return
    }
    
    // Try localStorage if available
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(name)
      } catch {
        // Ignore
      }
    }
    
    memoryStorage.delete(name)
  },
}

// ============================================================================
// PROGRESSION SYSTEM - Exercise chains for each muscle group
// ============================================================================

// Difficulty modifiers - three ways to intensify without changing exercise
export interface TempoModifier {
  eccentric: number     // seconds for lowering phase (e.g., 3)
  pause: number         // seconds pause at bottom (e.g., 1)
  concentric: number    // seconds for lifting phase (e.g., 1)
  notation: string      // human readable (e.g., "3-1-1")
  notationRu: string    // Russian notation
}

export interface DifficultyModifiers {
  tempo?: TempoModifier           // Time under tension
  pauseAtBottom?: number          // Static hold in seconds
  isPlyometric?: boolean          // Explosive/jumping variation
  isIsometric?: boolean           // Static hold variation
  description?: string            // How to apply
  descriptionRu?: string          // How to apply (Russian)
}

// RPE (Rate of Perceived Exertion) feedback
export type RPELevel = 'too_easy' | 'normal' | 'hard' | 'could_not_complete'

export interface ExerciseRPEFeedback {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  rpe: RPELevel
  completedReps?: number
  targetReps?: number
  date: string
  suggestedAction?: 'advance' | 'maintain' | 'decrease' | 'add_modifier'
}

// ============================================================================
// DETAILED EXERCISE FEEDBACK (for adaptive plan generation)
// ============================================================================

// Detailed feedback for each exercise after workout completion
export interface ExerciseFeedbackDetail {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  // User's perceived exertion
  rpe: RPELevel
  // Actual reps completed (if different from target)
  completedReps?: number
  targetReps?: number
  // Target sets
  targetSets?: number
  completedSets?: number
  // Rest time used
  restSeconds?: number
  // Was exercise skipped?
  wasSkipped?: boolean
  skipReason?: string
  // Timestamp
  date: string
  // Workout ID this feedback belongs to
  workoutId: string
}

// Aggregated feedback stats per exercise
export interface ExerciseFeedbackStats {
  exerciseId: string
  muscleGroup: string
  // RPE history (last 10 sessions)
  rpeHistory: { rpe: RPELevel; date: string }[]
  // Count of each RPE level
  tooEasyCount: number
  normalCount: number
  hardCount: number
  couldNotCompleteCount: number
  // Total sessions
  totalSessions: number
  // Average completed reps/sets
  avgCompletedReps: number
  avgCompletedSets: number
  // Suggested action based on history
  suggestedAction: 'advance' | 'maintain' | 'decrease' | 'replace'
  // Last feedback date
  lastFeedbackDate: string
}

// Workout-level feedback summary
export interface WorkoutFeedbackSummary {
  workoutId: string
  date: string
  overallFeeling: 'too_easy' | 'normal' | 'hard' | 'could_not_complete'
  exerciseFeedbacks: ExerciseFeedbackDetail[]
  // User's free-form notes
  notes?: string
  // Suggested adjustments for next plan
  suggestedAdjustments: {
    increaseSets: string[]  // Exercise IDs to increase sets
    decreaseSets: string[]  // Exercise IDs to decrease sets
    increaseReps: string[]  // Exercise IDs to increase reps
    decreaseReps: string[]  // Exercise IDs to decrease reps
    replaceExercises: { exerciseId: string; reason: string }[]
    progressExercises: string[]  // Exercises to advance to next level
  }
}

// Conditions for advancing to next level
export interface LevelAdvancementCondition {
  minSuccessfulSessions: number   // How many times exercise completed successfully
  minRepsThreshold: number        // Easy completion threshold (e.g., 15-20 reps)
  requiredRPE: RPELevel[]         // RPE scores that indicate readiness
  consecutiveGoodSessions: number // Consecutive "normal" or "too_easy" sessions
}

export interface ProgressionExercise {
  id: string
  name: string
  nameRu: string
  difficulty: number // 1-5
  // Evolution chain info
  evolutionChainId: string         // Links exercises in same progression
  levelInChain: number             // Position in chain (1-5)
  // Progression conditions
  advancementCondition: LevelAdvancementCondition
  // Available modifiers for this exercise
  availableModifiers?: DifficultyModifiers[]
  // Alternative exercise IDs for same level
  alternatives?: string[]
}

export interface ExerciseProgression {
  muscleGroup: string
  muscleGroupRu: string
  icon: string                     // Emoji icon for visualization
  exercises: ProgressionExercise[]
  // Branching paths (some exercises have multiple next steps)
  branches?: {
    fromLevel: number
    toOptions: string[]            // Multiple next exercise IDs
    choiceCriteria?: string        // How to choose between branches
  }[]
}

// Default advancement condition
const DEFAULT_ADVANCEMENT: LevelAdvancementCondition = {
  minSuccessfulSessions: 3,
  minRepsThreshold: 15,
  requiredRPE: ['too_easy', 'normal'],
  consecutiveGoodSessions: 2,
}

// Standard tempo modifiers for progression without changing exercise
export const TEMPO_MODIFIERS: Record<string, TempoModifier> = {
  standard: { eccentric: 1, pause: 0, concentric: 1, notation: '1-0-1', notationRu: '1-0-1' },
  slowEccentric: { eccentric: 3, pause: 0, concentric: 1, notation: '3-0-1', notationRu: '3-0-1' },
  pauseBottom: { eccentric: 2, pause: 2, concentric: 1, notation: '2-2-1', notationRu: '2-2-1' },
  superSlow: { eccentric: 4, pause: 1, concentric: 2, notation: '4-1-2', notationRu: '4-1-2' },
}

// Difficulty modifier presets
export const DIFFICULTY_MODIFIERS: Record<string, DifficultyModifiers> = {
  tempoSlow: {
    tempo: TEMPO_MODIFIERS.slowEccentric,
    description: '3 seconds down, 1 second up',
    descriptionRu: '3 секунды вниз, 1 секунда вверх',
  },
  tempoPause: {
    tempo: TEMPO_MODIFIERS.pauseBottom,
    description: '2 sec pause at bottom',
    descriptionRu: '2 сек пауза внизу',
  },
  pause: {
    pauseAtBottom: 2,
    description: 'Hold 2 seconds at bottom',
    descriptionRu: 'Удержание 2 сек внизу',
  },
  pauseLong: {
    pauseAtBottom: 3,
    description: 'Hold 3 seconds at bottom',
    descriptionRu: 'Удержание 3 сек внизу',
  },
  plyometric: {
    isPlyometric: true,
    description: 'Explosive movement with jump',
    descriptionRu: 'Взрывное движение с прыжком',
  },
  isometric: {
    isIsometric: true,
    description: 'Hold position statically',
    descriptionRu: 'Статическое удержание',
  },
}

// Exercise progressions by muscle group (from easiest to hardest)
export const EXERCISE_PROGRESSIONS: ExerciseProgression[] = [
  {
    muscleGroup: 'chest',
    muscleGroupRu: 'Грудь',
    icon: '💪',
    exercises: [
      {
        id: 'fb-004',
        name: 'Incline Push-ups',
        nameRu: 'Отжимания от скамьи',
        difficulty: 1,
        evolutionChainId: 'chest-push',
        levelInChain: 1,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 20 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-001',
        name: 'Push-ups',
        nameRu: 'Классические отжимания',
        difficulty: 2,
        evolutionChainId: 'chest-push',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-002',
        name: 'Wide Push-ups',
        nameRu: 'Широкие отжимания',
        difficulty: 3,
        evolutionChainId: 'chest-push',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-003',
        name: 'Diamond Push-ups',
        nameRu: 'Алмазные отжимания',
        difficulty: 4,
        evolutionChainId: 'chest-push',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-005',
        name: 'Decline Push-ups',
        nameRu: 'Отжимания с ногами на скамье',
        difficulty: 5,
        evolutionChainId: 'chest-push',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.plyometric],
      },
    ],
  },
  {
    muscleGroup: 'back',
    muscleGroupRu: 'Спина',
    icon: '🔙',
    exercises: [
      {
        id: 'fb-056',
        name: 'Door Frame Rows',
        nameRu: 'Тяга к дверному косяку',
        difficulty: 1,
        evolutionChainId: 'back-pull',
        levelInChain: 1,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 20 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-055',
        name: 'Inverted Rows',
        nameRu: 'Австралийские подтягивания',
        difficulty: 2,
        evolutionChainId: 'back-pull',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-054',
        name: 'Chin-ups',
        nameRu: 'Подтягивания обратным хватом',
        difficulty: 3,
        evolutionChainId: 'back-pull',
        levelInChain: 3,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-053',
        name: 'Pull-ups',
        nameRu: 'Подтягивания',
        difficulty: 4,
        evolutionChainId: 'back-pull',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-053-wide',
        name: 'Wide Pull-ups',
        nameRu: 'Подтягивания широким хватом',
        difficulty: 5,
        evolutionChainId: 'back-pull',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 8 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
    ],
  },
  {
    muscleGroup: 'quadriceps',
    muscleGroupRu: 'Квадрицепс',
    icon: '🦵',
    exercises: [
      {
        id: 'fb-006',
        name: 'Bodyweight Squats',
        nameRu: 'Приседания',
        difficulty: 1,
        evolutionChainId: 'leg-squat',
        levelInChain: 1,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 25 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-007',
        name: 'Sumo Squats',
        nameRu: 'Сумо-приседания',
        difficulty: 2,
        evolutionChainId: 'leg-squat',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-008',
        name: 'Lunges',
        nameRu: 'Выпады',
        difficulty: 3,
        evolutionChainId: 'leg-squat',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-009',
        name: 'Bulgarian Split Squats',
        nameRu: 'Болгарские сплит-приседания',
        difficulty: 4,
        evolutionChainId: 'leg-squat',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-028',
        name: 'Barbell Squats',
        nameRu: 'Приседания со штангой',
        difficulty: 5,
        evolutionChainId: 'leg-squat',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
    ],
  },
  {
    muscleGroup: 'core',
    muscleGroupRu: 'Пресс',
    icon: '🔥',
    exercises: [
      {
        id: 'fb-012',
        name: 'Plank',
        nameRu: 'Планка',
        difficulty: 1,
        evolutionChainId: 'core-stability',
        levelInChain: 1,
        advancementCondition: { minSuccessfulSessions: 3, minRepsThreshold: 45, requiredRPE: ['too_easy'], consecutiveGoodSessions: 2 },
        availableModifiers: [DIFFICULTY_MODIFIERS.isometric],
      },
      {
        id: 'fb-014',
        name: 'Bicycle Crunches',
        nameRu: 'Велосипед',
        difficulty: 2,
        evolutionChainId: 'core-stability',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-016',
        name: 'Russian Twists',
        nameRu: 'Русские скручивания',
        difficulty: 3,
        evolutionChainId: 'core-stability',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-015',
        name: 'Leg Raises',
        nameRu: 'Подъёмы ног',
        difficulty: 4,
        evolutionChainId: 'core-stability',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-013',
        name: 'Mountain Climbers',
        nameRu: 'Альпинист',
        difficulty: 5,
        evolutionChainId: 'core-stability',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 30 },
        availableModifiers: [],
      },
    ],
  },
  {
    muscleGroup: 'shoulders',
    muscleGroupRu: 'Плечи',
    icon: '🤷',
    exercises: [
      {
        id: 'fb-021',
        name: 'Dumbbell Shoulder Press',
        nameRu: 'Жим гантелей сидя',
        difficulty: 1,
        evolutionChainId: 'shoulder-press',
        levelInChain: 1,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-061',
        name: 'Reverse Fly',
        nameRu: 'Обратная бабочка',
        difficulty: 2,
        evolutionChainId: 'shoulder-press',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-031',
        name: 'Barbell Overhead Press',
        nameRu: 'Армейский жим',
        difficulty: 3,
        evolutionChainId: 'shoulder-press',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-077',
        name: 'Cable Face Pull',
        nameRu: 'Лицевая тяга',
        difficulty: 4,
        evolutionChainId: 'shoulder-press',
        levelInChain: 4,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-021-stand',
        name: 'Standing Dumbbell Press',
        nameRu: 'Жим гантелей стоя',
        difficulty: 5,
        evolutionChainId: 'shoulder-press',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
    ],
  },
  {
    muscleGroup: 'biceps',
    muscleGroupRu: 'Бицепс',
    icon: '💪',
    exercises: [
      {
        id: 'fb-022',
        name: 'Dumbbell Bicep Curls',
        nameRu: 'Сгибания на бицепс',
        difficulty: 1,
        evolutionChainId: 'bicep-curl',
        levelInChain: 1,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 20 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-045',
        name: 'Cable Bicep Curl',
        nameRu: 'Сгибание на блоке',
        difficulty: 2,
        evolutionChainId: 'bicep-curl',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-022-hammer',
        name: 'Hammer Curls',
        nameRu: 'Молотки',
        difficulty: 3,
        evolutionChainId: 'bicep-curl',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-022-incline',
        name: 'Incline Dumbbell Curls',
        nameRu: 'Сгибания на наклонной скамье',
        difficulty: 4,
        evolutionChainId: 'bicep-curl',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-022-conc',
        name: 'Concentration Curls',
        nameRu: 'Концентрированные сгибания',
        difficulty: 5,
        evolutionChainId: 'bicep-curl',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
    ],
  },
  {
    muscleGroup: 'triceps',
    muscleGroupRu: 'Трицепс',
    icon: '💪',
    exercises: [
      {
        id: 'fb-023',
        name: 'Dumbbell Tricep Extensions',
        nameRu: 'Разгибания на трицепс',
        difficulty: 1,
        evolutionChainId: 'tricep-push',
        levelInChain: 1,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-044',
        name: 'Cable Tricep Pushdown',
        nameRu: 'Разгибание на блоке',
        difficulty: 2,
        evolutionChainId: 'tricep-push',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-003',
        name: 'Diamond Push-ups',
        nameRu: 'Алмазные отжимания',
        difficulty: 3,
        evolutionChainId: 'tricep-push',
        levelInChain: 3,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-023-skull',
        name: 'Skull Crushers',
        nameRu: 'Французский жим',
        difficulty: 4,
        evolutionChainId: 'tricep-push',
        levelInChain: 4,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-023-dip',
        name: 'Tricep Dips',
        nameRu: 'Отжимания на брусьях',
        difficulty: 5,
        evolutionChainId: 'tricep-push',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 8 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
    ],
  },
  {
    muscleGroup: 'glutes',
    muscleGroupRu: 'Ягодицы',
    icon: '🍑',
    exercises: [
      {
        id: 'fb-010',
        name: 'Glute Bridges',
        nameRu: 'Ягодичный мост',
        difficulty: 1,
        evolutionChainId: 'glute-hip',
        levelInChain: 1,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 20 },
        availableModifiers: [DIFFICULTY_MODIFIERS.pause, DIFFICULTY_MODIFIERS.isometric],
      },
      {
        id: 'fb-006',
        name: 'Bodyweight Squats',
        nameRu: 'Приседания',
        difficulty: 2,
        evolutionChainId: 'glute-hip',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-008',
        name: 'Lunges',
        nameRu: 'Выпады',
        difficulty: 3,
        evolutionChainId: 'glute-hip',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.plyometric],
      },
      {
        id: 'fb-009',
        name: 'Bulgarian Split Squats',
        nameRu: 'Болгарские сплит-приседания',
        difficulty: 4,
        evolutionChainId: 'glute-hip',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 12 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow, DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-026',
        name: 'Dumbbell Deadlifts',
        nameRu: 'Становая тяга с гантелями',
        difficulty: 5,
        evolutionChainId: 'glute-hip',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
    ],
  },
  {
    muscleGroup: 'hamstrings',
    muscleGroupRu: 'Бицепс бедра',
    icon: '🦵',
    exercises: [
      {
        id: 'fb-010',
        name: 'Glute Bridges',
        nameRu: 'Ягодичный мост',
        difficulty: 1,
        evolutionChainId: 'hamstring-hinge',
        levelInChain: 1,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 20 },
        availableModifiers: [DIFFICULTY_MODIFIERS.pause],
      },
      {
        id: 'fb-042',
        name: 'Leg Curl',
        nameRu: 'Сгибание ног',
        difficulty: 2,
        evolutionChainId: 'hamstring-hinge',
        levelInChain: 2,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-026',
        name: 'Dumbbell Deadlifts',
        nameRu: 'Становая тяга с гантелями',
        difficulty: 3,
        evolutionChainId: 'hamstring-hinge',
        levelInChain: 3,
        advancementCondition: DEFAULT_ADVANCEMENT,
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-029',
        name: 'Barbell Deadlifts',
        nameRu: 'Становая тяга',
        difficulty: 4,
        evolutionChainId: 'hamstring-hinge',
        levelInChain: 4,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 8 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
      {
        id: 'fb-068',
        name: 'Good Mornings',
        nameRu: 'Гуд морнинг',
        difficulty: 5,
        evolutionChainId: 'hamstring-hinge',
        levelInChain: 5,
        advancementCondition: { ...DEFAULT_ADVANCEMENT, minRepsThreshold: 10 },
        availableModifiers: [DIFFICULTY_MODIFIERS.tempoSlow],
      },
    ],
  },
]

// ============================================================================
// EXERCISE DATABASE - Full exercises with instructions for replacement
// ============================================================================

export interface ExerciseDatabaseItem {
  id: string
  name: string
  nameRu: string
  category: string
  equipment: string
  level: string
  goal: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  difficulty: number
  instructions: string[]
  instructionsRu: string[]
  tips?: string[]
  tipsRu?: string[]
  warnings?: string[]
  warningsRu?: string[]
}

export const EXERCISE_DATABASE: ExerciseDatabaseItem[] = [
  // Bodyweight - Push
  { id: 'fb-001', name: 'Push-ups', nameRu: 'Отжимания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Start in plank position with hands shoulder-width apart', 'Lower your body until chest nearly touches the floor', 'Push back up to starting position'], instructionsRu: ['Начните в позиции планки, руки на ширине плеч', 'Опустите тело, пока грудь почти не коснётся пола', 'Вернитесь в исходное положение'] },
  { id: 'fb-002', name: 'Wide Push-ups', nameRu: 'Широкие отжимания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'strength', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Place hands wider than shoulder-width', 'Lower chest to ground', 'Push back up'], instructionsRu: ['Поставьте руки шире плеч', 'Опустите грудь к полу', 'Вернитесь вверх'] },
  { id: 'fb-003', name: 'Diamond Push-ups', nameRu: 'Алмазные отжимания', category: 'strength', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['triceps'], secondaryMuscles: ['chest'], difficulty: 4, instructions: ['Place hands close together under chest forming diamond shape', 'Lower body keeping elbows close', 'Push back up'], instructionsRu: ['Сомкните руки под грудью, образуя алмаз', 'Опуститесь, держа локти близко', 'Вернитесь вверх'] },
  { id: 'fb-004', name: 'Incline Push-ups', nameRu: 'Отжимания от скамьи', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 1, instructions: ['Place hands on elevated surface like bench', 'Lower chest to surface', 'Push back up'], instructionsRu: ['Поставьте руки на возвышенность (скамья)', 'Опустите грудь к поверхности', 'Вернитесь вверх'] },
  { id: 'fb-005', name: 'Decline Push-ups', nameRu: 'Отжимания с ногами на скамье', category: 'strength', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['upper_chest'], secondaryMuscles: ['shoulders'], difficulty: 4, instructions: ['Place feet on elevated surface', 'Perform push-up with body declined', 'Lower and push back up'], instructionsRu: ['Поставьте ноги на возвышенность', 'Выполните отжимание с наклоном корпуса', 'Опуститесь и вернитесь'] },

  // Bodyweight - Legs
  { id: 'fb-006', name: 'Bodyweight Squats', nameRu: 'Приседания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 2, instructions: ['Stand with feet shoulder-width apart', 'Bend knees and lower hips back and down', 'Keep chest up, stand back up'], instructionsRu: ['Встаньте, ноги на ширине плеч', 'Согните колени, отведите таз назад и вниз', 'Держите грудь поднятой, встаньте'] },
  { id: 'fb-007', name: 'Sumo Squats', nameRu: 'Сумо-приседания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'strength', primaryMuscles: ['quadriceps', 'adductors'], secondaryMuscles: ['glutes'], difficulty: 2, instructions: ['Take wide stance with toes pointed out', 'Squat down keeping knees over toes', 'Push through heels to stand'], instructionsRu: ['Широкая стойка, носки развёрнуты наружу', 'Присядьте, держа колени над носками', 'Встаньте через пятки'] },
  { id: 'fb-008', name: 'Lunges', nameRu: 'Выпады', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 3, instructions: ['Step forward with one leg', 'Lower back knee toward ground', 'Push back to starting position'], instructionsRu: ['Шагните вперёд одной ногой', 'Опустите заднее колено к полу', 'Вернитесь в исходное положение'] },
  { id: 'fb-009', name: 'Bulgarian Split Squats', nameRu: 'Болгарские сплит-приседания', category: 'strength', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 4, instructions: ['Place rear foot on bench behind you', 'Lower into squat with front leg', 'Push back up through front heel'], instructionsRu: ['Поставьте заднюю ногу на скамью позади', 'Присядьте на передней ноге', 'Встаньте через пятку передней ноги'] },
  { id: 'fb-010', name: 'Glute Bridges', nameRu: 'Ягодичный мост', category: 'strength', equipment: 'none', level: 'beginner', goal: 'strength', primaryMuscles: ['glutes'], secondaryMuscles: ['hamstrings'], difficulty: 2, instructions: ['Lie on back with knees bent', 'Lift hips toward ceiling', 'Squeeze glutes at top, lower slowly'], instructionsRu: ['Лягте на спину, колени согнуты', 'Поднимите таз к потолку', 'Напрягите ягодицы наверху, опуститесь'] },
  { id: 'fb-011', name: 'Calf Raises', nameRu: 'Подъёмы на носки', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['calves'], secondaryMuscles: [], difficulty: 1, instructions: ['Stand on edge of step or flat ground', 'Rise up onto toes', 'Lower back down slowly'], instructionsRu: ['Встаньте на край ступеньки или пол', 'Поднимитесь на носки', 'Опуститесь медленно'] },

  // Bodyweight - Core
  { id: 'fb-012', name: 'Plank', nameRu: 'Планка', category: 'core', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['core'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Hold push-up position on forearms or hands', 'Keep body in straight line from head to heels', 'Hold for desired time'], instructionsRu: ['Держите позицию отжимания на предплечьях или руках', 'Держите тело в прямой линии', 'Удержите нужное время'] },
  { id: 'fb-013', name: 'Mountain Climbers', nameRu: 'Альпинист', category: 'cardio', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['core'], secondaryMuscles: ['shoulders'], difficulty: 3, instructions: ['Start in plank position', 'Drive one knee toward chest, then quickly switch', 'Alternate legs in running motion'], instructionsRu: ['Начните в позиции планки', 'Поочерёдно тяните колени к груди', 'Двигайте ногами как при беге'] },
  { id: 'fb-014', name: 'Bicycle Crunches', nameRu: 'Велосипед', category: 'core', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['core', 'obliques'], secondaryMuscles: [], difficulty: 2, instructions: ['Lie on back with hands behind head', 'Bring elbow to opposite knee', 'Alternate sides in pedaling motion'], instructionsRu: ['Лягте на спину, руки за головой', 'Тяните локоть к противоположному колену', 'Чередуйте стороны как при педалировании'] },
  { id: 'fb-015', name: 'Leg Raises', nameRu: 'Подъёмы ног', category: 'core', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['lower_abs'], secondaryMuscles: ['core'], difficulty: 3, instructions: ['Lie on back with legs extended', 'Raise legs up toward ceiling', 'Lower slowly with control'], instructionsRu: ['Лягте на спину, ноги вытянуты', 'Поднимите ноги к потолку', 'Опустите медленно подконтрольно'] },
  { id: 'fb-016', name: 'Russian Twists', nameRu: 'Русские скручивания', category: 'core', equipment: 'none', level: 'intermediate', goal: 'fat_loss', primaryMuscles: ['obliques'], secondaryMuscles: ['core'], difficulty: 3, instructions: ['Sit with feet off ground, knees bent', 'Rotate torso side to side', 'Touch ground beside hip each side'], instructionsRu: ['Сидя с поднятыми ногами, колени согнуты', 'Вращайте корпус из стороны в сторону', 'Касайтесь пола возле бедра'] },

  // Bodyweight - Back
  { id: 'fb-017', name: 'Superman', nameRu: 'Супермен', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['lower_back'], secondaryMuscles: ['glutes'], difficulty: 2, instructions: ['Lie face down with arms extended', 'Lift arms and legs off ground simultaneously', 'Hold briefly, lower with control'], instructionsRu: ['Лягте лицом вниз, руки вытянуты', 'Поднимите руки и ноги одновременно', 'Удержите, опустите подконтрольно'] },
  { id: 'fb-053', name: 'Pull-ups', nameRu: 'Подтягивания', category: 'strength', equipment: 'pull_up_bar', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps'], difficulty: 5, instructions: ['Hang from bar with overhand grip', 'Pull chin above bar', 'Lower with control'], instructionsRu: ['Вис на перекладине прямым хватом', 'Поднимите подбородок над перекладиной', 'Опуститесь подконтрольно'] },
  { id: 'fb-054', name: 'Chin-ups', nameRu: 'Подтягивания обратным хватом', category: 'strength', equipment: 'pull_up_bar', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back', 'biceps'], secondaryMuscles: ['lats'], difficulty: 4, instructions: ['Hang with underhand grip', 'Pull chin above bar', 'Lower slowly'], instructionsRu: ['Вис обратным хватом', 'Поднимите подбородок над перекладиной', 'Опуститесь медленно'] },
  { id: 'fb-055', name: 'Inverted Rows', nameRu: 'Австралийские подтягивания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps', 'rear_delts'], difficulty: 3, instructions: ['Lie under bar or table edge', 'Pull chest to bar', 'Lower with control'], instructionsRu: ['Лягте под перекладину или край стола', 'Потяните грудь к перекладине', 'Опуститесь подконтрольно'] },
  { id: 'fb-056', name: 'Door Frame Rows', nameRu: 'Тяга к дверному косяку', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 2, instructions: ['Grab door frame with both hands', 'Lean back with straight arms', 'Pull chest toward frame'], instructionsRu: ['Возьмитесь за дверной косяк обеими руками', 'Отклонитесь назад на прямых руках', 'Потяните грудь к косяку'] },

  // Pull-up Bar Exercises
  { id: 'fb-058', name: 'Wide Grip Pull-ups', nameRu: 'Подтягивания широким хватом', category: 'strength', equipment: 'pull_up_bar', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps'], difficulty: 5, instructions: ['Hang from bar with wide overhand grip', 'Pull chin above bar', 'Lower with control'], instructionsRu: ['Вис на перекладине широким хватом', 'Поднимите подбородок над перекладиной', 'Опуститесь подконтрольно'] },
  { id: 'fb-059', name: 'Hanging Leg Raises', nameRu: 'Подъём ног в висе', category: 'core', equipment: 'pull_up_bar', level: 'intermediate', goal: 'strength', primaryMuscles: ['core', 'lower_abs'], secondaryMuscles: ['hip_flexors'], difficulty: 4, instructions: ['Hang from bar with straight arms', 'Raise legs up toward bar', 'Lower with control'], instructionsRu: ['Вис на перекладине на прямых руках', 'Поднимите ноги к перекладине', 'Опустите подконтрольно'] },
  { id: 'fb-060', name: 'Dead Hang', nameRu: 'Вис на перекладине', category: 'strength', equipment: 'pull_up_bar', level: 'beginner', goal: 'general', primaryMuscles: ['back', 'forearms'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Hang from bar with straight arms', 'Keep shoulders active', 'Hold for time'], instructionsRu: ['Вис на перекладине на прямых руках', 'Держите плечи в напряжении', 'Удержите заданное время'] },
  { id: 'fb-062', name: 'Hanging Knee Raises', nameRu: 'Подъём коленей в висе', category: 'core', equipment: 'pull_up_bar', level: 'beginner', goal: 'strength', primaryMuscles: ['core', 'lower_abs'], secondaryMuscles: [], difficulty: 3, instructions: ['Hang from bar with straight arms', 'Raise knees toward chest', 'Lower with control'], instructionsRu: ['Вис на перекладине на прямых руках', 'Поднимите колени к груди', 'Опустите подконтрольно'] },
  { id: 'fb-063', name: 'Archer Pull-ups', nameRu: 'Лучник на турнике', category: 'strength', equipment: 'pull_up_bar', level: 'advanced', goal: 'muscle_gain', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps'], difficulty: 5, instructions: ['Hang with one arm wider than other', 'Pull up shifting weight to one side', 'Alternate sides'], instructionsRu: ['Вис с одной рукой шире другой', 'Тянитесь перенося вес на одну сторону', 'Чередуйте стороны'] },

  // Dumbbell Exercises
  { id: 'fb-019', name: 'Dumbbell Bench Press', nameRu: 'Жим гантелей лёжа', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'], difficulty: 3, instructions: ['Lie on bench with dumbbells at chest', 'Press dumbbells up over chest', 'Lower with control'], instructionsRu: ['Лягте на скамью, гантели у груди', 'Выжмите гантели над грудью', 'Опустите подконтрольно'] },
  { id: 'fb-020', name: 'Dumbbell Rows', nameRu: 'Тяга гантелей', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 3, instructions: ['One hand and knee on bench', 'Row dumbbell toward hip', 'Lower with control'], instructionsRu: ['Одна рука и колено на скамье', 'Потяните гантель к бедру', 'Опустите подконтрольно'] },
  { id: 'fb-021', name: 'Dumbbell Shoulder Press', nameRu: 'Жим гантелей сидя', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], difficulty: 3, instructions: ['Sit holding dumbbells at shoulders', 'Press dumbbells overhead', 'Lower with control'], instructionsRu: ['Сидя, гантели у плеч', 'Выжмите гантели над головой', 'Опустите подконтрольно'] },
  { id: 'fb-022', name: 'Dumbbell Bicep Curls', nameRu: 'Сгибания на бицепс', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['biceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Stand holding dumbbells at sides', 'Curl dumbbells toward shoulders', 'Lower with control'], instructionsRu: ['Стоя, гантели по бокам', 'Согните гантели к плечам', 'Опустите подконтрольно'] },
  { id: 'fb-023', name: 'Dumbbell Tricep Extensions', nameRu: 'Разгибания на трицепс', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['triceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Hold dumbbell overhead with both hands', 'Lower behind head by bending elbows', 'Extend back up'], instructionsRu: ['Держите гантель над головой обеими руками', 'Опустите за голову, сгибая локти', 'Разогните обратно'] },
  { id: 'fb-024', name: 'Dumbbell Goblet Squats', nameRu: 'Гоблет-приседания', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['core'], difficulty: 3, instructions: ['Hold dumbbell at chest level', 'Squat down keeping chest up', 'Stand back up'], instructionsRu: ['Держите гантель у груди', 'Присядьте, держа грудь поднятой', 'Встаньте обратно'] },
  { id: 'fb-025', name: 'Dumbbell Lunges', nameRu: 'Выпады с гантелями', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 3, instructions: ['Hold dumbbells at sides', 'Step forward into lunge', 'Push back to start'], instructionsRu: ['Гантели по бокам', 'Шагните вперёд в выпад', 'Вернитесь в старт'] },
  { id: 'fb-026', name: 'Dumbbell Deadlifts', nameRu: 'Становая тяга с гантелями', category: 'strength', equipment: 'dumbbells', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower_back'], difficulty: 4, instructions: ['Stand with dumbbells in front of thighs', 'Hinge at hips, lower dumbbells toward feet', 'Return to standing'], instructionsRu: ['Стоя, гантели перед бёдрами', 'Наклонитесь в тазу, опустите гантели к стопам', 'Вернитесь в положение стоя'] },

  // Barbell Exercises
  { id: 'fb-027', name: 'Barbell Bench Press', nameRu: 'Жим штанги лёжа', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], difficulty: 4, instructions: ['Lie on bench under bar', 'Grip bar slightly wider than shoulders', 'Lower to chest, press back up'], instructionsRu: ['Лягте на скамью под штангой', 'Возьмитесь шире плеч', 'Опустите к груди, выжмите вверх'] },
  { id: 'fb-028', name: 'Barbell Squats', nameRu: 'Приседания со штангой', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings', 'core'], difficulty: 5, instructions: ['Bar on upper back', 'Squat down keeping chest up', 'Drive up through heels'], instructionsRu: ['Штанга на верхней части спины', 'Присядьте, держа грудь поднятой', 'Встаньте через пятки'] },
  { id: 'fb-029', name: 'Barbell Deadlifts', nameRu: 'Становая тяга', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['hamstrings', 'glutes', 'back'], secondaryMuscles: ['core'], difficulty: 5, instructions: ['Bend at hips and knees to grip bar', 'Keep back flat, stand up straight', 'Lower with control'], instructionsRu: ['Согнитесь в тазу и коленях, возьмитесь за штангу', 'Держите спину прямой, встаньте', 'Опустите подконтрольно'] },
  { id: 'fb-030', name: 'Barbell Rows', nameRu: 'Тяга штанги в наклоне', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 4, instructions: ['Bend over with flat back', 'Pull bar to lower chest', 'Lower with control'], instructionsRu: ['Наклонитесь с прямой спиной', 'Потяните штангу к низу груди', 'Опустите подконтрольно'] },
  { id: 'fb-031', name: 'Barbell Overhead Press', nameRu: 'Армейский жим', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], difficulty: 4, instructions: ['Start with bar at shoulders', 'Press bar overhead', 'Lower with control'], instructionsRu: ['Начните со штангой у плеч', 'Выжмите штангу над головой', 'Опустите подконтрольно'] },

  // Cardio
  { id: 'fb-032', name: 'Jumping Jacks', nameRu: 'Прыжки звёздочкой', category: 'cardio', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['full_body'], secondaryMuscles: [], difficulty: 2, instructions: ['Jump feet apart while raising arms overhead', 'Jump back together', 'Repeat rhythmically'], instructionsRu: ['Разведите ноги в прыжке, поднимите руки', 'Вернитесь в исходное положение', 'Повторяйте ритмично'] },
  { id: 'fb-033', name: 'Burpees', nameRu: 'Бёрпи', category: 'cardio', equipment: 'none', level: 'intermediate', goal: 'fat_loss', primaryMuscles: ['full_body'], secondaryMuscles: [], difficulty: 5, instructions: ['Squat down and place hands on floor', 'Jump feet back to plank', 'Do push-up, jump feet forward', 'Jump up with arms overhead'], instructionsRu: ['Присядьте, поставьте руки на пол', 'Прыгните ногами назад в планку', 'Отжимание, прыгните ногами к рукам', 'Прыжок вверх с руками над головой'] },
  { id: 'fb-034', name: 'High Knees', nameRu: 'Бег с высоким подниманием бедра', category: 'cardio', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['quadriceps', 'core'], secondaryMuscles: [], difficulty: 3, instructions: ['Run in place', 'Drive knees up to hip level', 'Pump arms quickly'], instructionsRu: ['Бегите на месте', 'Поднимайте колени до уровня бёдер', 'Работайте руками быстро'] },

  // Gym Machine Exercises
  { id: 'fb-036', name: 'Leg Press', nameRu: 'Жим ногами', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 3, instructions: ['Sit in machine with feet on platform', 'Press platform away', 'Return with control'], instructionsRu: ['Сядьте в тренажёр, стопы на платформе', 'Выжмите платформу', 'Верните подконтрольно'] },
  { id: 'fb-037', name: 'Lat Pulldown', nameRu: 'Тяга верхнего блока', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 3, instructions: ['Grip bar wide', 'Pull down to upper chest', 'Return with control'], instructionsRu: ['Возьмитесь за штангу широким хватом', 'Потяните к верхней части груди', 'Верните подконтрольно'] },
  { id: 'fb-038', name: 'Seated Cable Row', nameRu: 'Тяга нижнего блока', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 3, instructions: ['Sit at machine with feet on platform', 'Pull handle to torso', 'Return with control'], instructionsRu: ['Сядьте, стопы на платформе', 'Потяните рукоять к корпусу', 'Верните подконтрольно'] },
  { id: 'fb-039', name: 'Chest Fly Machine', nameRu: 'Сведение рук в тренажёре', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Sit in machine with arms out to sides', 'Bring arms together in front', 'Return slowly'], instructionsRu: ['Сядьте, руки разведены в стороны', 'Сведите руки перед собой', 'Верните медленно'] },
  { id: 'fb-040', name: 'Cable Crossover', nameRu: 'Кроссовер', category: 'strength', equipment: 'machine', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 4, instructions: ['Stand between pulleys with handles', 'Bring hands together in front', 'Return with control'], instructionsRu: ['Встаньте между блоками с рукоятями', 'Сведите руки перед собой', 'Верните подконтрольно'] },
  { id: 'fb-041', name: 'Leg Extension', nameRu: 'Разгибание ног', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Sit in machine with pad on shins', 'Extend legs fully', 'Lower with control'], instructionsRu: ['Сядьте, валик на голенях', 'Разогните ноги полностью', 'Опустите подконтрольно'] },
  { id: 'fb-042', name: 'Leg Curl', nameRu: 'Сгибание ног', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['hamstrings'], secondaryMuscles: [], difficulty: 2, instructions: ['Lie on machine with pad behind ankles', 'Curl legs up', 'Lower with control'], instructionsRu: ['Лягте, валик позади лодыжек', 'Согните ноги', 'Опустите подконтрольно'] },
  { id: 'fb-044', name: 'Cable Tricep Pushdown', nameRu: 'Разгибание на блоке', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['triceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Grip bar at high pulley', 'Push down extending arms', 'Return with control'], instructionsRu: ['Возьмитесь за рукоять на верхнем блоке', 'Толкните вниз, разгибая руки', 'Верните подконтрольно'] },
  { id: 'fb-045', name: 'Cable Bicep Curl', nameRu: 'Сгибание на блоке', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['biceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Use low pulley with handle', 'Curl handle toward shoulders', 'Lower with control'], instructionsRu: ['Используйте нижний блок с рукоятью', 'Согните рукоять к плечам', 'Опустите подконтрольно'] },
  { id: 'fb-061', name: 'Reverse Fly', nameRu: 'Обратная бабочка', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['rear_delts', 'upper_back'], secondaryMuscles: ['back'], difficulty: 3, instructions: ['Bend over with dumbbells', 'Raise arms to sides', 'Squeeze shoulder blades'], instructionsRu: ['Наклонитесь с гантелями', 'Разведите руки в стороны', 'Сведите лопатки'] },
  { id: 'fb-077', name: 'Cable Face Pull', nameRu: 'Лицевая тяга', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['rear_delts', 'upper_back'], secondaryMuscles: ['back'], difficulty: 2, instructions: ['Use rope attachment at high pulley', 'Pull rope toward face', 'Externally rotate arms at top'], instructionsRu: ['Используйте канат на верхнем блоке', 'Потяните канат к лицу', 'Разверните руки наружу наверху'] },

  // Stretching
  { id: 'fb-049', name: 'Hamstring Stretch', nameRu: 'Растяжка бицепса бедра', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['hamstrings'], secondaryMuscles: [], difficulty: 1, instructions: ['Sit with legs extended', 'Reach toward toes', 'Hold 30 seconds'], instructionsRu: ['Сидя с вытянутыми ногами', 'Тянитесь к носкам', 'Удержите 30 секунд'] },
  { id: 'fb-050', name: 'Quad Stretch', nameRu: 'Растяжка квадрицепса', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['quadriceps'], secondaryMuscles: [], difficulty: 1, instructions: ['Stand on one leg', 'Pull other foot to glutes', 'Hold 30 seconds'], instructionsRu: ['Стоя на одной ноге', 'Потяните стопу к ягодицам', 'Удержите 30 секунд'] },
  { id: 'fb-051', name: 'Chest Stretch', nameRu: 'Растяжка груди', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 1, instructions: ['Place hand on wall', 'Turn body away until stretch felt', 'Hold 30 seconds'], instructionsRu: ['Рука на стене', 'Поверните корпус до ощущения натяжения', 'Удержите 30 секунд'] },
  { id: 'fb-052', name: 'Cat-Cow Stretch', nameRu: 'Кошка-корова', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['back', 'core'], secondaryMuscles: [], difficulty: 1, instructions: ['On hands and knees', 'Alternate arching and rounding back', 'Move with breath'], instructionsRu: ['На четвереньках', 'Поочерёдно прогибайте и округляйте спину', 'Движения синхронизируйте с дыханием'] },
]

/**
 * Find exercise by ID in database
 */
export function findExerciseById(id: string): ExerciseDatabaseItem | undefined {
  return EXERCISE_DATABASE.find(ex => ex.id === id)
}

/**
 * Find alternative exercises for same muscle group with full instructions
 */
export function findAlternativeExercises(
  primaryMuscle: string,
  excludeId: string,
  equipment: string[],
  maxResults: number = 5
): ExerciseDatabaseItem[] {
  return EXERCISE_DATABASE
    .filter(ex => 
      ex.id !== excludeId &&
      ex.primaryMuscles.includes(primaryMuscle) &&
      (equipment.includes(ex.equipment) || ex.equipment === 'none')
    )
    .slice(0, maxResults)
}

// ============================================================================
// EXERCISE VIDEO MAPPING
// ============================================================================

/**
 * Mapping of exercise IDs to video file numbers
 * Videos are stored in /public/videos/{number}.mp4
 */
export const EXERCISE_VIDEO_MAP: Record<string, number> = {
  // Bodyweight - Push (Videos 1-5)
  'fb-001': 1,   // Push-ups (Отжимания)
  'fb-002': 2,   // Wide Push-ups (Широкие отжимания)
  'fb-003': 3,   // Diamond Push-ups (Алмазные отжимания)
  'fb-004': 4,   // Incline Push-ups (Отжимания от скамьи)
  'fb-005': 5,   // Decline Push-ups (Отжимания с ногами на скамье)
  
  // Bodyweight - Legs (Videos 6-11)
  'fb-006': 6,   // Bodyweight Squats (Приседания)
  'fb-007': 7,   // Sumo Squats (Сумо-приседания)
  'fb-008': 8,   // Lunges (Выпады)
  'fb-009': 9,   // Bulgarian Split Squats (Болгарские сплит-приседания)
  'fb-010': 10,  // Glute Bridges (Ягодичный мост)
  'fb-011': 11,  // Calf Raises (Подъёмы на носки)
  
  // Bodyweight - Core (Videos 12-16)
  'fb-012': 12,  // Plank (Планка)
  'fb-013': 13,  // Mountain Climbers (Альпинист)
  'fb-014': 14,  // Bicycle Crunches (Велосипед)
  'fb-015': 15,  // Leg Raises (Подъёмы ног)
  'fb-016': 16,  // Russian Twists (Русские скручивания)
}

/**
 * Get video URL for an exercise
 * @param exerciseId - The exercise ID (e.g., 'fb-001')
 * @returns Video URL or null if no video exists
 */
export function getExerciseVideoUrl(exerciseId: string): string | null {
  const videoNumber = EXERCISE_VIDEO_MAP[exerciseId]
  if (videoNumber) {
    return `/videos/${videoNumber}.mp4`
  }
  return null
}

/**
 * Check if exercise has a video
 */
export function hasExerciseVideo(exerciseId: string): boolean {
  return exerciseId in EXERCISE_VIDEO_MAP
}

// ============================================================================
// WARMUP EXERCISES DATABASE
// ============================================================================

export type WarmupType = 'cardio' | 'joint' | 'dynamic_stretch' | 'muscle_prep'
export type FitnessGoalType = 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'

export interface WarmupExercise {
  id: string
  name: string
  nameRu: string
  type: WarmupType
  description: string
  descriptionRu: string
  duration?: number // seconds
  reps?: number
  targetMuscles?: string[]
  contraindications: {
    highWeight?: boolean // Not suitable for users with high weight (BMI > 30)
    elderly?: boolean // Not suitable for elderly users (age > 60)
    jointIssues?: boolean // Not suitable for users with joint problems
  }
  suitableGoals: FitnessGoalType[]
  intensity: 'low' | 'medium' | 'high'
}

// Warmup exercises database
export const WARMUP_EXERCISES: WarmupExercise[] = [
  // ===== CARDIO WARMUP =====
  {
    id: 'wu-cardio-001',
    name: 'Jogging in Place',
    nameRu: 'Бег на месте',
    type: 'cardio',
    description: 'Light jogging in place to raise heart rate',
    descriptionRu: 'Лёгкий бег на месте для повышения пульса',
    duration: 30,
    targetMuscles: ['quadriceps', 'calves'],
    contraindications: { highWeight: true, elderly: false, jointIssues: true },
    suitableGoals: ['fat_loss', 'endurance', 'maintenance'],
    intensity: 'medium'
  },
  {
    id: 'wu-cardio-002',
    name: 'High Knees',
    nameRu: 'Высокие колени',
    type: 'cardio',
    description: 'Running in place with high knee raises',
    descriptionRu: 'Бег на месте с высоким подниманием колен',
    duration: 30,
    targetMuscles: ['quadriceps', 'core', 'hip_flexors'],
    contraindications: { highWeight: true, elderly: true, jointIssues: true },
    suitableGoals: ['fat_loss', 'endurance'],
    intensity: 'high'
  },
  {
    id: 'wu-cardio-003',
    name: 'Butt Kicks',
    nameRu: 'Захлёсты голени',
    type: 'cardio',
    description: 'Running in place kicking heels to glutes',
    descriptionRu: 'Бег на месте с захлёстом голени к ягодицам',
    duration: 30,
    targetMuscles: ['hamstrings', 'quadriceps'],
    contraindications: { highWeight: false, elderly: false, jointIssues: true },
    suitableGoals: ['fat_loss', 'endurance', 'maintenance'],
    intensity: 'medium'
  },
  {
    id: 'wu-cardio-004',
    name: 'Jumping Jacks',
    nameRu: 'Прыжки звёздочкой',
    type: 'cardio',
    description: 'Jumping with arms and legs spreading wide',
    descriptionRu: 'Прыжки с разведением рук и ног в стороны',
    duration: 30,
    targetMuscles: ['full_body'],
    contraindications: { highWeight: true, elderly: true, jointIssues: true },
    suitableGoals: ['fat_loss', 'endurance'],
    intensity: 'high'
  },
  {
    id: 'wu-cardio-005',
    name: 'Jump Rope Simulation',
    nameRu: 'Имитация скакалки',
    type: 'cardio',
    description: 'Mimicking jump rope motion without rope',
    descriptionRu: 'Имитация прыжков через скакалку без скакалки',
    duration: 30,
    targetMuscles: ['calves', 'shoulders'],
    contraindications: { highWeight: true, elderly: false, jointIssues: true },
    suitableGoals: ['fat_loss', 'endurance'],
    intensity: 'medium'
  },
  {
    id: 'wu-cardio-006',
    name: 'Marching in Place',
    nameRu: 'Ходьба на месте',
    type: 'cardio',
    description: 'Gentle marching in place with arm swings',
    descriptionRu: 'Плавная ходьба на месте с движениями рук',
    duration: 45,
    targetMuscles: ['full_body'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'endurance', 'maintenance', 'muscle_gain'],
    intensity: 'low'
  },

  // ===== JOINT MOBILITY =====
  {
    id: 'wu-joint-001',
    name: 'Neck Rolls',
    nameRu: 'Вращения головой',
    type: 'joint',
    description: 'Gentle circular movements of the head',
    descriptionRu: 'Плавные круговые движения головой',
    reps: 5,
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-joint-002',
    name: 'Shoulder Rolls',
    nameRu: 'Вращения плечами',
    type: 'joint',
    description: 'Circular movements of shoulders forward and backward',
    descriptionRu: 'Круговые движения плечами вперёд и назад',
    reps: 10,
    targetMuscles: ['shoulders', 'traps'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-joint-003',
    name: 'Arm Circles',
    nameRu: 'Вращения руками',
    type: 'joint',
    description: 'Large circular movements with arms extended',
    descriptionRu: 'Круговые движения вытянутыми руками',
    reps: 10,
    targetMuscles: ['shoulders', 'chest', 'back'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-joint-004',
    name: 'Hip Circles',
    nameRu: 'Вращения тазом',
    type: 'joint',
    description: 'Circular movements of the hips',
    descriptionRu: 'Круговые движения тазом',
    reps: 10,
    targetMuscles: ['hip_flexors', 'glutes'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-joint-005',
    name: 'Knee Rotations',
    nameRu: 'Вращения коленями',
    type: 'joint',
    description: 'Gentle circular movements with hands on knees',
    descriptionRu: 'Плавные круговые движения с руками на коленях',
    reps: 10,
    targetMuscles: ['knees', 'calves'],
    contraindications: { highWeight: false, elderly: false, jointIssues: true },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-joint-006',
    name: 'Ankle Rotations',
    nameRu: 'Вращения стопами',
    type: 'joint',
    description: 'Circular movements of ankles while seated or standing',
    descriptionRu: 'Круговые движения стопами сидя или стоя',
    reps: 10,
    targetMuscles: ['ankles', 'calves'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-joint-007',
    name: 'Wrist Rotations',
    nameRu: 'Вращения кистями',
    type: 'joint',
    description: 'Circular movements of wrists',
    descriptionRu: 'Круговые движения кистями рук',
    reps: 10,
    targetMuscles: ['forearms', 'wrists'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['muscle_gain', 'maintenance'],
    intensity: 'low'
  },

  // ===== DYNAMIC STRETCH =====
  {
    id: 'wu-stretch-001',
    name: 'Leg Swings Forward-Back',
    nameRu: 'Махи ногами вперёд-назад',
    type: 'dynamic_stretch',
    description: 'Swing one leg forward and backward',
    descriptionRu: 'Махи одной ногой вперёд и назад',
    reps: 10,
    targetMuscles: ['hamstrings', 'quadriceps', 'glutes'],
    contraindications: { highWeight: false, elderly: true, jointIssues: true },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'medium'
  },
  {
    id: 'wu-stretch-002',
    name: 'Leg Swings Side-to-Side',
    nameRu: 'Махи ногами в стороны',
    type: 'dynamic_stretch',
    description: 'Swing leg across body and out to side',
    descriptionRu: 'Махи ногой поперёк тела и в сторону',
    reps: 10,
    targetMuscles: ['adductors', 'abductors', 'glutes'],
    contraindications: { highWeight: false, elderly: true, jointIssues: true },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'medium'
  },
  {
    id: 'wu-stretch-003',
    name: 'Walking Lunges',
    nameRu: 'Выпады с шагом',
    type: 'dynamic_stretch',
    description: 'Step forward into lunge, alternate legs',
    descriptionRu: 'Шаг вперёд в выпад, чередуя ноги',
    reps: 10,
    targetMuscles: ['quadriceps', 'glutes', 'hip_flexors'],
    contraindications: { highWeight: true, elderly: true, jointIssues: true },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance'],
    intensity: 'medium'
  },
  {
    id: 'wu-stretch-004',
    name: 'Torso Twists',
    nameRu: 'Повороты корпуса',
    type: 'dynamic_stretch',
    description: 'Rotate torso side to side with arms extended',
    descriptionRu: 'Повороты корпуса в стороны с вытянутыми руками',
    reps: 10,
    targetMuscles: ['core', 'obliques', 'lower_back'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-stretch-005',
    name: 'Side Bends',
    nameRu: 'Наклоны в стороны',
    type: 'dynamic_stretch',
    description: 'Bend side to side with arm overhead',
    descriptionRu: 'Наклоны в стороны с рукой над головой',
    reps: 10,
    targetMuscles: ['obliques', 'lats'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-stretch-006',
    name: 'Windmill',
    nameRu: 'Мельница',
    type: 'dynamic_stretch',
    description: 'Rotate extended arms in large circles, touching toes',
    descriptionRu: 'Вращение вытянутыми руками с касанием носков',
    reps: 10,
    targetMuscles: ['core', 'hamstrings', 'shoulders'],
    contraindications: { highWeight: false, elderly: true, jointIssues: true },
    suitableGoals: ['fat_loss', 'endurance', 'maintenance'],
    intensity: 'medium'
  },
  {
    id: 'wu-stretch-007',
    name: 'Cat-Cow Stretch',
    nameRu: 'Кошка-корова',
    type: 'dynamic_stretch',
    description: 'Alternate arching and rounding the back on all fours',
    descriptionRu: 'Чередование прогиба и округления спины на четвереньках',
    reps: 10,
    targetMuscles: ['back', 'core', 'spine'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },

  // ===== MUSCLE PREP =====
  {
    id: 'wu-prep-001',
    name: 'Bodyweight Squats',
    nameRu: 'Приседания без веса',
    type: 'muscle_prep',
    description: 'Light squats to warm up leg muscles',
    descriptionRu: 'Лёгкие приседания для разогрева мышц ног',
    reps: 10,
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    contraindications: { highWeight: false, elderly: false, jointIssues: true },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'medium'
  },
  {
    id: 'wu-prep-002',
    name: 'Wall Push-ups',
    nameRu: 'Отжимания от стены',
    type: 'muscle_prep',
    description: 'Push-ups against wall to warm up chest and arms',
    descriptionRu: 'Отжимания от стены для разогрева груди и рук',
    reps: 10,
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-prep-003',
    name: 'Knee Push-ups',
    nameRu: 'Отжимания с колен',
    type: 'muscle_prep',
    description: 'Push-ups on knees for upper body warmup',
    descriptionRu: 'Отжимания с колен для разогрева верхней части тела',
    reps: 10,
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance'],
    intensity: 'medium'
  },
  {
    id: 'wu-prep-004',
    name: 'Glute Bridges',
    nameRu: 'Ягодичный мост',
    type: 'muscle_prep',
    description: 'Bridges to activate glutes and hamstrings',
    descriptionRu: 'Мост для активации ягодиц и бицепса бедра',
    reps: 10,
    targetMuscles: ['glutes', 'hamstrings', 'core'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-prep-005',
    name: 'Arm Swings',
    nameRu: 'Махи руками',
    type: 'muscle_prep',
    description: 'Open and close arms in hugging motion',
    descriptionRu: 'Разведение и сведение рук в движении обхвата',
    reps: 10,
    targetMuscles: ['chest', 'back', 'shoulders'],
    contraindications: { highWeight: false, elderly: false, jointIssues: false },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
  {
    id: 'wu-prep-006',
    name: 'Hip Openers',
    nameRu: 'Разведение бёдер',
    type: 'muscle_prep',
    description: 'Standing hip abduction with controlled movement',
    descriptionRu: 'Отведение бедра стоя с контролируемым движением',
    reps: 10,
    targetMuscles: ['glutes', 'hip_flexors', 'abductors'],
    contraindications: { highWeight: false, elderly: false, jointIssues: true },
    suitableGoals: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    intensity: 'low'
  },
]

// Warmup configuration by goal
export const WARMUP_CONFIG: Record<FitnessGoalType, {
  name: string
  nameRu: string
  types: WarmupType[]
  duration: number // total seconds
  exerciseCount: number
  intensityPreference: ('low' | 'medium' | 'high')[]
}> = {
  fat_loss: {
    name: 'Cardio Warm-up',
    nameRu: 'Кардио-разогрев',
    types: ['cardio', 'dynamic_stretch', 'joint'],
    duration: 300, // 5 minutes
    exerciseCount: 5,
    intensityPreference: ['medium', 'high']
  },
  muscle_gain: {
    name: 'Muscle Prep Warm-up',
    nameRu: 'Разогрев мышц',
    types: ['joint', 'muscle_prep', 'dynamic_stretch'],
    duration: 300, // 5 minutes
    exerciseCount: 5,
    intensityPreference: ['low', 'medium']
  },
  endurance: {
    name: 'Endurance Warm-up',
    nameRu: 'Разминка на выносливость',
    types: ['cardio', 'dynamic_stretch', 'joint'],
    duration: 360, // 6 minutes
    exerciseCount: 5,
    intensityPreference: ['medium', 'high']
  },
  maintenance: {
    name: 'Balanced Warm-up',
    nameRu: 'Сбалансированная разминка',
    types: ['joint', 'dynamic_stretch', 'cardio'],
    duration: 240, // 4 minutes
    exerciseCount: 4,
    intensityPreference: ['low', 'medium']
  }
}

/**
 * Generate a personalized warmup based on user parameters
 */
export function generateWarmup(
  goal: FitnessGoalType,
  age: number,
  weight: number,
  height: number,
  gender: 'male' | 'female' | 'other',
  language: 'ru' | 'en' = 'ru'
): WarmupExercise[] {
  const config = WARMUP_CONFIG[goal]
  const isRu = language === 'ru'
  
  // Calculate BMI for contraindications
  const bmi = weight / Math.pow(height / 100, 2)
  const hasHighWeight = bmi > 30
  const isElderly = age > 60
  
  // Filter exercises based on contraindications and goal
  const suitableExercises = WARMUP_EXERCISES.filter(ex => {
    // Check goal suitability
    if (!ex.suitableGoals.includes(goal)) return false
    
    // Check contraindications
    if (hasHighWeight && ex.contraindications.highWeight) return false
    if (isElderly && ex.contraindications.elderly) return false
    
    // Prefer exercises matching the goal's preferred types
    return config.types.includes(ex.type)
  })
  
  // Sort by intensity preference
  const sortedExercises = suitableExercises.sort((a, b) => {
    const aIndex = config.intensityPreference.indexOf(a.intensity)
    const bIndex = config.intensityPreference.indexOf(b.intensity)
    return aIndex - bIndex
  })
  
  // Select exercises ensuring variety
  const selectedExercises: WarmupExercise[] = []
  const usedTypes = new Set<WarmupType>()
  
  for (const ex of sortedExercises) {
    if (selectedExercises.length >= config.exerciseCount) break
    
    // Try to get variety in exercise types
    if (!usedTypes.has(ex.type) || selectedExercises.length >= config.exerciseCount - 1) {
      selectedExercises.push(ex)
      usedTypes.add(ex.type)
    }
  }
  
  // If not enough exercises, fill with remaining suitable ones
  if (selectedExercises.length < config.exerciseCount) {
    for (const ex of sortedExercises) {
      if (!selectedExercises.find(e => e.id === ex.id)) {
        selectedExercises.push(ex)
        if (selectedExercises.length >= config.exerciseCount) break
      }
    }
  }
  
  return selectedExercises
}

/**
 * Get warmup display name
 */
export function getWarmupName(goal: FitnessGoalType, language: 'ru' | 'en' = 'ru'): string {
  const config = WARMUP_CONFIG[goal]
  return language === 'ru' ? config.nameRu : config.name
}

// ============================================================================
// USER PROGRESS INTERFACE
// ============================================================================

export interface SkippedExercise {
  exerciseId: string
  exerciseName: string
  reason: string
  date: string
}

export interface WorkoutFeedbackEntry {
  workoutId: string
  feedback: 'too_easy' | 'normal' | 'hard' | 'very_hard'
  date: string
  adjustments?: {
    setsChange: number
    repsChange: number
    restChange: number
  }
}

// Track statistics for each exercise (for progression decisions)
export interface ExerciseStats {
  exerciseId: string
  muscleGroup: string
  // Session history
  totalSessions: number
  successfulSessions: number        // Completed all reps
  // RPE history (last 5 sessions)
  recentRPE: ExerciseRPEFeedback[]
  // Consecutive good sessions (for advancement check)
  consecutiveGoodSessions: number
  // Best performance
  bestReps: number
  bestWeight?: number
  // Current applied modifier
  activeModifier?: DifficultyModifiers
  // Level within progression chain
  currentLevelInChain: number
  evolutionChainId: string
  // When ready for next level
  readyForAdvancement: boolean
  advancementProgress: number       // 0-100%
}

// Track unlocked exercise levels (for skill tree)
export interface UnlockedLevel {
  muscleGroup: string
  level: number
  exerciseId: string
  exerciseName: string
  unlockedAt: string
  xpEarned: number
}

export interface UserProgress {
  // Level per muscle group (1-5)
  muscleGroupLevels: Record<string, number>
  // History of skipped exercises for adaptation
  skippedExercises: SkippedExercise[]
  // Workout feedback history
  workoutFeedback: WorkoutFeedbackEntry[]
  // Preferred rest time in seconds
  preferredRestTime: number         // Default is 60 seconds
  // Exercise-specific statistics (NEW - for smart progression)
  exerciseStats: Record<string, ExerciseStats>
  // RPE feedback history (NEW - per exercise feedback)
  rpeHistory: ExerciseRPEFeedback[]
  // Unlocked levels (NEW - for skill tree visualization)
  unlockedLevels: UnlockedLevel[]
  // Active modifiers per exercise (NEW)
  activeModifiers: Record<string, DifficultyModifiers>
  // NEW: Detailed exercise feedback for adaptive plans
  exerciseFeedbackHistory: ExerciseFeedbackDetail[]
  // NEW: Aggregated stats per exercise
  exerciseFeedbackStats: Record<string, ExerciseFeedbackStats>
  // NEW: Workout-level feedback summaries
  workoutFeedbackSummaries: WorkoutFeedbackSummary[]
}

// ============================================================================
// ACHIEVEMENTS SYSTEM
// ============================================================================

export type AchievementType = 'regularity' | 'workouts' | 'goal' | 'weight_logs' | 'special' | 'endurance' | 'maintenance'

export type FitnessGoalType = 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'

export interface Achievement {
  id: string
  name: string
  nameRu: string
  description: string
  descriptionRu: string
  icon: string // Lucide icon name (e.g., 'Activity', 'Trophy', 'Flame')
  type: AchievementType
  requirement: number // e.g., 7 workouts for "7 days streak"
  unit: string // e.g., "workouts", "days"
  unitRu: string
  xpReward: number
  permanent?: boolean // If true, achievement is NOT reset when subscription changes
  goalType?: FitnessGoalType // If set, achievement is specific to this goal type
}

// Goal history entry - stores past goal achievements
export interface GoalHistoryEntry {
  id: string
  goalType: FitnessGoalType
  startedAt: string // When this goal was set
  endedAt: string // When goal was changed
  achievements: UserAchievement[] // Achievements earned during this goal
  totalWorkouts: number
  weightChange?: number // kg lost or gained
  enduranceChange?: number // endurance metric change
  finalProgress: number // percentage
  goalReached: boolean
}

export interface UserAchievement {
  achievementId: string
  progress: number
  completed: boolean
  completedAt?: string
  claimed: boolean
}

// Available achievements - GOAL-SPECIFIC SYSTEM
// Icons are lucide-react icon names
// UNIVERSAL achievements (apply to all goals)
export const UNIVERSAL_ACHIEVEMENTS: Achievement[] = [
  // === REGULARITY === (Дни подряд)
  {
    id: 'streak_7',
    name: '7 Days Streak',
    nameRu: '7 дней подряд',
    description: 'Work out 7 days in a row',
    descriptionRu: 'Тренируйся 7 дней подряд',
    icon: 'Flame',
    type: 'regularity',
    requirement: 7,
    unit: 'days',
    unitRu: 'дней',
    xpReward: 50,
    permanent: true
  },
  {
    id: 'streak_30',
    name: '30 Days Streak',
    nameRu: '30 дней подряд',
    description: 'Work out 30 days in a row',
    descriptionRu: 'Тренируйся 30 дней подряд',
    icon: 'Award',
    type: 'regularity',
    requirement: 30,
    unit: 'days',
    unitRu: 'дней',
    xpReward: 150,
    permanent: true
  },
  {
    id: 'streak_100',
    name: '100 Days Streak',
    nameRu: '100 дней подряд',
    description: 'Work out 100 days in a row',
    descriptionRu: 'Тренируйся 100 дней подряд',
    icon: 'Crown',
    type: 'regularity',
    requirement: 100,
    unit: 'days',
    unitRu: 'дней',
    xpReward: 500,
    permanent: true
  },
  // === WORKOUTS === (Тренировки)
  {
    id: 'first_workout',
    name: 'First Workout',
    nameRu: 'Первая тренировка',
    description: 'Complete your first workout',
    descriptionRu: 'Завершите первую тренировку',
    icon: 'Play',
    type: 'workouts',
    requirement: 1,
    unit: 'workout',
    unitRu: 'тренировка',
    xpReward: 10,
    permanent: true
  },
  {
    id: 'workout_10',
    name: '10 Workouts',
    nameRu: '10 тренировок',
    description: 'Complete 10 workouts',
    descriptionRu: 'Завершите 10 тренировок',
    icon: 'Activity',
    type: 'workouts',
    requirement: 10,
    unit: 'workouts',
    unitRu: 'тренировок',
    xpReward: 50,
    permanent: true
  },
  {
    id: 'workout_50',
    name: '50 Workouts',
    nameRu: '50 тренировок',
    description: 'Complete 50 workouts',
    descriptionRu: 'Завершите 50 тренировок',
    icon: 'Zap',
    type: 'workouts',
    requirement: 50,
    unit: 'workouts',
    unitRu: 'тренировок',
    xpReward: 150,
    permanent: true
  },
  {
    id: 'workout_100',
    name: '100 Workouts',
    nameRu: '100 тренировок',
    description: 'Complete 100 workouts',
    descriptionRu: 'Завершите 100 тренировок',
    icon: 'Crown',
    type: 'workouts',
    requirement: 100,
    unit: 'workouts',
    unitRu: 'тренировок',
    xpReward: 300,
    permanent: true
  },
  // === WEIGHT LOGS === (Записи веса)
  {
    id: 'first_weight_log',
    name: 'First Record',
    nameRu: 'Первая запись',
    description: 'Log your weight for the first time',
    descriptionRu: 'Запиши вес впервые',
    icon: 'Scale',
    type: 'weight_logs',
    requirement: 1,
    unit: 'log',
    unitRu: 'запись',
    xpReward: 10,
    permanent: true
  },
  {
    id: 'weight_log_10',
    name: 'Regular Records',
    nameRu: 'Регулярные записи',
    description: 'Log your weight 10 times',
    descriptionRu: 'Запиши вес 10 раз',
    icon: 'BarChart3',
    type: 'weight_logs',
    requirement: 10,
    unit: 'logs',
    unitRu: 'записей',
    xpReward: 50,
    permanent: true
  },
]

// FAT LOSS specific achievements
export const FAT_LOSS_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'fat_loss_first_kg',
    name: 'First Kilogram Lost',
    nameRu: 'Первый килограмм сброшен',
    description: 'Lose your first kilogram',
    descriptionRu: 'Сбрось первый килограмм',
    icon: 'TrendingDown',
    type: 'goal',
    requirement: 1,
    unit: 'kg',
    unitRu: 'кг',
    xpReward: 30,
    goalType: 'fat_loss'
  },
  {
    id: 'fat_loss_5kg',
    name: '5 Kilograms Lost',
    nameRu: '5 килограмм сброшено',
    description: 'Lose 5 kilograms',
    descriptionRu: 'Сбрось 5 килограмм',
    icon: 'Scale',
    type: 'goal',
    requirement: 5,
    unit: 'kg',
    unitRu: 'кг',
    xpReward: 100,
    goalType: 'fat_loss'
  },
  {
    id: 'fat_loss_10kg',
    name: '10 Kilograms Lost',
    nameRu: '10 килограмм сброшено',
    description: 'Lose 10 kilograms',
    descriptionRu: 'Сбрось 10 килограмм',
    icon: 'Target',
    type: 'goal',
    requirement: 10,
    unit: 'kg',
    unitRu: 'кг',
    xpReward: 200,
    goalType: 'fat_loss'
  },
  {
    id: 'fat_loss_halfway',
    name: 'Halfway to Ideal',
    nameRu: 'Половина пути',
    description: 'Reach 50% of your weight loss goal',
    descriptionRu: 'Достигни 50% цели по похудению',
    icon: 'TrendingDown',
    type: 'goal',
    requirement: 50,
    unit: '%',
    unitRu: '%',
    xpReward: 150,
    goalType: 'fat_loss'
  },
  {
    id: 'fat_loss_goal_reached',
    name: 'Ideal Weight Reached!',
    nameRu: 'Идеальный вес достигнут!',
    description: 'Reach your target weight',
    descriptionRu: 'Достигни целевого веса',
    icon: 'Sparkles',
    type: 'goal',
    requirement: 100,
    unit: '%',
    unitRu: '%',
    xpReward: 500,
    goalType: 'fat_loss'
  },
]

// MUSCLE GAIN specific achievements
export const MUSCLE_GAIN_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'muscle_gain_first_kg',
    name: 'First Kilogram Gained',
    nameRu: 'Первый килограмм набран',
    description: 'Gain your first kilogram of muscle',
    descriptionRu: 'Набери первый килограмм мышц',
    icon: 'TrendingUp',
    type: 'goal',
    requirement: 1,
    unit: 'kg',
    unitRu: 'кг',
    xpReward: 30,
    goalType: 'muscle_gain'
  },
  {
    id: 'muscle_gain_3kg',
    name: '3 Kilograms Gained',
    nameRu: '3 килограмма набрано',
    description: 'Gain 3 kilograms of muscle',
    descriptionRu: 'Набери 3 килограмма мышц',
    icon: 'Dumbbell',
    type: 'goal',
    requirement: 3,
    unit: 'kg',
    unitRu: 'кг',
    xpReward: 100,
    goalType: 'muscle_gain'
  },
  {
    id: 'muscle_gain_5kg',
    name: '5 Kilograms Gained',
    nameRu: '5 килограмм набрано',
    description: 'Gain 5 kilograms of muscle',
    descriptionRu: 'Набери 5 килограмм мышц',
    icon: 'Target',
    type: 'goal',
    requirement: 5,
    unit: 'kg',
    unitRu: 'кг',
    xpReward: 200,
    goalType: 'muscle_gain'
  },
  {
    id: 'muscle_gain_halfway',
    name: 'Halfway to Power',
    nameRu: 'Половина пути к силе',
    description: 'Reach 50% of your muscle gain goal',
    descriptionRu: 'Достигни 50% цели по набору массы',
    icon: 'Zap',
    type: 'goal',
    requirement: 50,
    unit: '%',
    unitRu: '%',
    xpReward: 150,
    goalType: 'muscle_gain'
  },
  {
    id: 'muscle_gain_goal_reached',
    name: 'Muscle Goal Reached!',
    nameRu: 'Цель по массе достигнута!',
    description: 'Reach your target weight',
    descriptionRu: 'Достигни целевого веса',
    icon: 'Sparkles',
    type: 'goal',
    requirement: 100,
    unit: '%',
    unitRu: '%',
    xpReward: 500,
    goalType: 'muscle_gain'
  },
]

// ENDURANCE specific achievements
export const ENDURANCE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'endurance_first_improvement',
    name: 'First Progress',
    nameRu: 'Первый прогресс',
    description: 'Improve your endurance metric for the first time',
    descriptionRu: 'Улучши показатель выносливости впервые',
    icon: 'TrendingUp',
    type: 'endurance',
    requirement: 1,
    unit: 'improvement',
    unitRu: 'улучшение',
    xpReward: 30,
    goalType: 'endurance'
  },
  {
    id: 'endurance_10_percent',
    name: '10% Stronger',
    nameRu: 'На 10% сильнее',
    description: 'Improve endurance by 10%',
    descriptionRu: 'Улучши выносливость на 10%',
    icon: 'Activity',
    type: 'endurance',
    requirement: 10,
    unit: '%',
    unitRu: '%',
    xpReward: 80,
    goalType: 'endurance'
  },
  {
    id: 'endurance_25_percent',
    name: '25% Stronger',
    nameRu: 'На 25% сильнее',
    description: 'Improve endurance by 25%',
    descriptionRu: 'Улучши выносливость на 25%',
    icon: 'Zap',
    type: 'endurance',
    requirement: 25,
    unit: '%',
    unitRu: '%',
    xpReward: 150,
    goalType: 'endurance'
  },
  {
    id: 'endurance_halfway',
    name: 'Halfway to Peak',
    nameRu: 'Половина пути к пику',
    description: 'Reach 50% of your endurance goal',
    descriptionRu: 'Достигни 50% цели по выносливости',
    icon: 'Target',
    type: 'endurance',
    requirement: 50,
    unit: '%',
    unitRu: '%',
    xpReward: 150,
    goalType: 'endurance'
  },
  {
    id: 'endurance_goal_reached',
    name: 'Peak Endurance!',
    nameRu: 'Пиковая выносливость!',
    description: 'Reach your endurance goal',
    descriptionRu: 'Достигни цели по выносливости',
    icon: 'Sparkles',
    type: 'endurance',
    requirement: 100,
    unit: '%',
    unitRu: '%',
    xpReward: 500,
    goalType: 'endurance'
  },
]

// MAINTENANCE specific achievements
export const MAINTENANCE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'maintenance_stable_week',
    name: 'Stable Week',
    nameRu: 'Стабильная неделя',
    description: 'Keep weight within target range for a week',
    descriptionRu: 'Держи вес в целевом диапазоне неделю',
    icon: 'Check',
    type: 'maintenance',
    requirement: 1,
    unit: 'week',
    unitRu: 'неделя',
    xpReward: 30,
    goalType: 'maintenance'
  },
  {
    id: 'maintenance_stable_month',
    name: 'Stable Month',
    nameRu: 'Стабильный месяц',
    description: 'Keep weight within target range for a month',
    descriptionRu: 'Держи вес в целевом диапазоне месяц',
    icon: 'Award',
    type: 'maintenance',
    requirement: 4,
    unit: 'weeks',
    unitRu: 'недель',
    xpReward: 100,
    goalType: 'maintenance'
  },
  {
    id: 'maintenance_stable_3months',
    name: '3 Months Stability',
    nameRu: '3 месяца стабильности',
    description: 'Keep weight within target range for 3 months',
    descriptionRu: 'Держи вес в целевом диапазоне 3 месяца',
    icon: 'Crown',
    type: 'maintenance',
    requirement: 12,
    unit: 'weeks',
    unitRu: 'недель',
    xpReward: 200,
    goalType: 'maintenance'
  },
  {
    id: 'maintenance_plan_complete',
    name: 'Plan Completed',
    nameRu: 'План выполнен',
    description: 'Complete all scheduled workouts for a month',
    descriptionRu: 'Выполни все запланированные тренировки за месяц',
    icon: 'Calendar',
    type: 'maintenance',
    requirement: 100,
    unit: '%',
    unitRu: '%',
    xpReward: 150,
    goalType: 'maintenance'
  },
  {
    id: 'maintenance_master',
    name: 'Stability Master',
    nameRu: 'Мастер стабильности',
    description: 'Maintain ideal weight for 6 months',
    descriptionRu: 'Поддерживай идеальный вес 6 месяцев',
    icon: 'Sparkles',
    type: 'maintenance',
    requirement: 24,
    unit: 'weeks',
    unitRu: 'недель',
    xpReward: 500,
    goalType: 'maintenance'
  },
]

// Combined achievements array (legacy support)
export const ACHIEVEMENTS: Achievement[] = [
  ...UNIVERSAL_ACHIEVEMENTS,
  ...FAT_LOSS_ACHIEVEMENTS,
  ...MUSCLE_GAIN_ACHIEVEMENTS,
  ...ENDURANCE_ACHIEVEMENTS,
  ...MAINTENANCE_ACHIEVEMENTS,
]

/**
 * Get achievements for a specific goal type
 */
export function getAchievementsForGoal(goalType: FitnessGoalType): Achievement[] {
  const goalAchievements: Record<FitnessGoalType, Achievement[]> = {
    fat_loss: FAT_LOSS_ACHIEVEMENTS,
    muscle_gain: MUSCLE_GAIN_ACHIEVEMENTS,
    endurance: ENDURANCE_ACHIEVEMENTS,
    maintenance: MAINTENANCE_ACHIEVEMENTS,
  }
  
  return [...UNIVERSAL_ACHIEVEMENTS, ...(goalAchievements[goalType] || [])]
}

// User level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Newcomer', titleRu: 'Новичок' },
  { level: 2, xp: 50, title: 'Beginner', titleRu: 'Начинающий' },
  { level: 3, xp: 150, title: 'Amateur', titleRu: 'Любитель' },
  { level: 4, xp: 300, title: 'Enthusiast', titleRu: 'Энтузиаст' },
  { level: 5, xp: 500, title: 'Athlete', titleRu: 'Атлет' },
  { level: 6, xp: 800, title: 'Pro', titleRu: 'Профи' },
  { level: 7, xp: 1200, title: 'Expert', titleRu: 'Эксперт' },
  { level: 8, xp: 1700, title: 'Master', titleRu: 'Мастер' },
  { level: 9, xp: 2300, title: 'Champion', titleRu: 'Чемпион' },
  { level: 10, xp: 3000, title: 'Legend', titleRu: 'Легенда' },
]

/**
 * Calculate user level based on XP
 */
export function calculateUserLevel(xp: number): { level: number; title: string; titleRu: string; nextLevelXp: number; currentLevelXp: number } {
  let currentLevel = LEVEL_THRESHOLDS[0]
  let nextLevel = LEVEL_THRESHOLDS[1]
  
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i]
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i]
      break
    }
  }
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    titleRu: currentLevel.titleRu,
    nextLevelXp: nextLevel.xp,
    currentLevelXp: currentLevel.xp
  }
}

/**
 * Check and award achievements based on user stats - GOAL-SPECIFIC VERSION
 */
export function checkAchievements(
  completedWorkoutsCount: number,
  goalReached: boolean,
  weightLost: number,
  weightGained: number,
  warmupsCompleted: number,
  weightLogsCount: number,
  earlyWorkouts: number,
  weekStreaks: number,
  restDaysTaken: number,
  currentAchievements: UserAchievement[],
  goalProgressPercent?: number, // Процент прогресса к цели
  streakDays?: number, // Дней подряд
  fitnessGoal: FitnessGoalType = 'fat_loss', // User's current goal
  enduranceImprovementPercent?: number, // For endurance goals
): UserAchievement[] {
  const newAchievements = [...currentAchievements]
  
  // Get goal-specific achievements
  const goalAchievements = getAchievementsForGoal(fitnessGoal)

  // Helper to update or add achievement
  // IMPORTANT: Once an achievement is completed, it stays completed (no duplicate awards)
  const updateAchievement = (id: string, progress: number, completed: boolean) => {
    // Only process achievements relevant to current goal
    const achievementDef = goalAchievements.find(a => a.id === id)
    if (!achievementDef) return
    
    const existing = newAchievements.find(a => a.achievementId === id)
    if (existing) {
      // If already completed, don't modify it (prevents duplicate awards)
      if (existing.completed) {
        return
      }
      // Update progress for incomplete achievements
      existing.progress = progress
      if (completed && !existing.completed) {
        existing.completed = true
        existing.completedAt = new Date().toISOString()
      }
    } else {
      newAchievements.push({
        achievementId: id,
        progress,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
        claimed: false
      })
    }
  }
  
  // === UNIVERSAL: REGULARITY (Дни подряд) ===
  const currentStreak = streakDays || 0
  updateAchievement('streak_7', currentStreak, currentStreak >= 7)
  updateAchievement('streak_30', currentStreak, currentStreak >= 30)
  updateAchievement('streak_100', currentStreak, currentStreak >= 100)
  
  // === UNIVERSAL: WORKOUTS (Тренировки) ===
  updateAchievement('first_workout', completedWorkoutsCount, completedWorkoutsCount >= 1)
  updateAchievement('workout_10', completedWorkoutsCount, completedWorkoutsCount >= 10)
  updateAchievement('workout_50', completedWorkoutsCount, completedWorkoutsCount >= 50)
  updateAchievement('workout_100', completedWorkoutsCount, completedWorkoutsCount >= 100)
  
  // === UNIVERSAL: WEIGHT LOGS (Записи веса) ===
  updateAchievement('first_weight_log', weightLogsCount, weightLogsCount >= 1)
  updateAchievement('weight_log_10', weightLogsCount, weightLogsCount >= 10)
  
  // === GOAL-SPECIFIC ACHIEVEMENTS ===
  const progressPercent = goalProgressPercent || 0
  
  if (fitnessGoal === 'fat_loss') {
    // Fat loss achievements
    const kgLost = Math.abs(weightLost)
    updateAchievement('fat_loss_first_kg', kgLost, kgLost >= 1)
    updateAchievement('fat_loss_5kg', kgLost, kgLost >= 5)
    updateAchievement('fat_loss_10kg', kgLost, kgLost >= 10)
    updateAchievement('fat_loss_halfway', progressPercent, progressPercent >= 50)
    updateAchievement('fat_loss_goal_reached', progressPercent, goalReached || progressPercent >= 100)
  } else if (fitnessGoal === 'muscle_gain') {
    // Muscle gain achievements
    const kgGained = Math.abs(weightGained)
    updateAchievement('muscle_gain_first_kg', kgGained, kgGained >= 1)
    updateAchievement('muscle_gain_3kg', kgGained, kgGained >= 3)
    updateAchievement('muscle_gain_5kg', kgGained, kgGained >= 5)
    updateAchievement('muscle_gain_halfway', progressPercent, progressPercent >= 50)
    updateAchievement('muscle_gain_goal_reached', progressPercent, goalReached || progressPercent >= 100)
  } else if (fitnessGoal === 'endurance') {
    // Endurance achievements
    const endurancePercent = enduranceImprovementPercent || 0
    updateAchievement('endurance_first_improvement', endurancePercent > 0 ? 1 : 0, endurancePercent >= 1)
    updateAchievement('endurance_10_percent', endurancePercent, endurancePercent >= 10)
    updateAchievement('endurance_25_percent', endurancePercent, endurancePercent >= 25)
    updateAchievement('endurance_halfway', progressPercent, progressPercent >= 50)
    updateAchievement('endurance_goal_reached', progressPercent, goalReached || progressPercent >= 100)
  } else if (fitnessGoal === 'maintenance') {
    // Maintenance achievements - these would need weekly tracking
    // For now, track based on consistency
    updateAchievement('maintenance_stable_week', weekStreaks, weekStreaks >= 1)
    updateAchievement('maintenance_stable_month', weekStreaks, weekStreaks >= 4)
    updateAchievement('maintenance_stable_3months', weekStreaks, weekStreaks >= 12)
    updateAchievement('maintenance_plan_complete', progressPercent, progressPercent >= 100)
    updateAchievement('maintenance_master', weekStreaks, weekStreaks >= 24)
  }
  
  return newAchievements
}

/**
 * Calculate total XP from achievements
 */
export function calculateTotalXp(achievements: UserAchievement[]): number {
  return achievements
    .filter(a => a.completed)
    .reduce((total, a) => {
      const achievement = ACHIEVEMENTS.find(ach => ach.id === a.achievementId)
      return total + (achievement?.xpReward || 0)
    }, 0)
}

// User profile interface
export interface UserProfile {
  id: string
  name: string
  email: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  currentWeight: number // kg
  targetWeight: number // kg
  // Initial values for progress calculation (set when goal is established)
  initialWeight?: number // Starting weight when goal was set
  initialEndurance?: number // Starting endurance metric (e.g., run time in minutes)
  currentEndurance?: number // Current endurance metric (user can update this)
  targetEndurance?: number // Target endurance metric
  enduranceMetric?: 'run_5km' | 'run_10km' | 'pushups' | 'plank' | 'custom' // Type of endurance metric
  goalSetAt?: string // When the current goal was set
  // Maintenance-specific fields
  weightRangeMin?: number // Lower bound of target weight range for maintenance
  weightRangeMax?: number // Upper bound of target weight range for maintenance
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  equipment: string[]
  customEquipment?: string // Custom equipment entered by user
  trainingLocation: 'home' | 'gym' | 'both' // Where user trains
  budget: number // Weekly budget in USD
  language: Language
  onboardingCompleted: boolean
  subscriptionTier: 'free' | 'pro' | 'elite'
  lastSubscriptionTier?: 'free' | 'pro' | 'elite' // Track subscription changes for achievement reset
  achievementsResetAt?: string // Timestamp when achievements were last reset
  // AI limits
  dailyChatMessages: number
  lastChatReset: string | null
  // Achievements
  achievements?: UserAchievement[]
  warmupsCompleted?: number
  earlyWorkouts?: number
  lateWorkouts?: number
  weekStreaks?: number
  // Goal History - stores past goal achievements when goal changes
  goalHistory?: GoalHistoryEntry[]
  // UI state
  hasSeenDisclaimer: boolean
  disclaimerDismissedAt: string | null // Timestamp when disclaimer was dismissed
}

// Workout plan interface
export interface Exercise {
  id: string
  name: string
  nameRu?: string
  level: string
  goal: string
  category: string
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  difficulty: number
  instructions: string[]
  instructionsRu?: string[]
  tips: string[]
  tipsRu?: string[]
  warnings: string[]
  warningsRu?: string[]
  gifUrl?: string
  videoUrl?: string
  sets: number
  reps: string
  restSeconds: number
  // Progression system fields (NEW)
  evolutionChainId?: string         // Links to progression chain
  levelInChain?: number             // Position in chain (1-5)
  // Applied difficulty modifiers (NEW)
  appliedModifier?: DifficultyModifiers
  tempoNotation?: string            // e.g., "3-1-1" for tempo
  // Progress tracking for this exercise in workout
  completedReps?: number            // Actual reps completed (for RPE)
  userRPE?: RPELevel                // User's perceived exertion
}

export interface WorkoutDay {
  id: string
  dayOfWeek: number
  weekNumber: number
  name: string
  nameRu?: string
  type: string
  warmup?: WarmupExercise[] // Warmup exercises for this workout
  warmupName?: string // Name of the warmup (e.g., "Cardio Warm-up")
  warmupNameRu?: string
  exercises: Exercise[]
  estimatedDuration: number
  isCompleted: boolean
  completedAt?: string // When the workout was completed
}

// Track completed workouts separately for weekly progress
export interface CompletedWorkout {
  workoutId: string
  completedAt: string
  weekNumber: number
}

export interface WorkoutPlan {
  id: string
  name: string
  nameRu?: string
  description: string
  descriptionRu?: string
  goal: string
  level: string
  daysPerWeek: number
  durationWeeks: number
  workouts: WorkoutDay[]
  isActive: boolean
  createdAt?: string // When the plan was created
  lastUpdatedAt?: string // When the plan was last regenerated
}

// Weight log interface
export interface WeightLog {
  id: string
  weight: number
  date: string
  notes?: string
}

// Meal interface with full recipe support
export interface Meal {
  id: string
  name: string
  nameRu?: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  ingredients: string[]
  ingredientsRu?: string[]
  instructions: string[]
  instructionsRu?: string[]
  time?: string
  prepTime?: number
  cookTime?: number
  totalTime?: number
  estimatedCost?: number
  imageUrl?: string
}

export interface NutritionPlan {
  id: string
  name: string
  nameRu?: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  weeklyBudget?: number
  meals: Meal[]
  // Daily tracking
  date?: string
  generatedAt?: string
}

// ============================================================================
// FOOD LOG & NUTRITION TRACKING
// ============================================================================

export interface FoodLogEntry {
  id: string
  date: string // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId: string // product or dish ID
  foodType: 'product' | 'dish'
  name: string
  nameRu: string
  portion: number // multiplier for typical portion
  portionGrams: number
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  timestamp: string
  imageUrl?: string
}

export interface DailyNutritionLog {
  date: string
  entries: FoodLogEntry[]
  targetCalories: number
  targetProtein: number
  targetFat: number
  targetCarbs: number
  generatedPlanId?: string // ID of generated plan if using auto-generated meals
}

export interface NutritionHistoryEntry {
  date: string
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  goalMet: boolean
  calorieDiff: number
}

// Chat message interface
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ============================================================================
// SKILL TREE VISUALIZATION
// ============================================================================

export interface SkillTreeNode {
  exerciseId: string
  exerciseName: string
  exerciseNameRu: string
  level: number
  isUnlocked: boolean
  isCurrent: boolean
  unlockedAt?: string
  xpEarned?: number
  icon: string
}

export interface SkillTreeGroup {
  muscleGroup: string
  muscleGroupRu: string
  icon: string
  currentLevel: number
  maxLevel: number
  nodes: SkillTreeNode[]
  progressPercentage: number
}

// ============================================================================
// WEIGHT UNIT CONVERSION
// ============================================================================

export type WeightUnit = 'kg' | 'lbs'

// Conversion factor: 1 kg = 2.20462 lbs
const KG_TO_LBS = 2.20462

/**
 * Convert weight from kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert weight from lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10 // Round to 1 decimal place
}

/**
 * Format weight with unit label
 */
export function formatWeight(kg: number, unit: WeightUnit, language: 'ru' | 'en' = 'ru'): string {
  const value = unit === 'lbs' ? kgToLbs(kg) : kg
  const unitLabel = unit
  return `${value.toFixed(1)} ${unitLabel}`
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

export type ThemeSource = 'system' | 'light' | 'dark'

/**
 * Detect system theme preference
 */
export function getSystemTheme(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ============================================================================
// APP STATE INTERFACE
// ============================================================================
interface AppState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void
  updateSubscriptionTier: (tier: 'free' | 'pro' | 'elite') => void
  resetAchievementsOnSubscriptionChange: () => void
  
  // Language
  language: Language
  setLanguage: (lang: Language) => void
  
  // Onboarding
  currentOnboardingStep: number
  setOnboardingStep: (step: number) => void
  
  // Workout plan
  workoutPlan: WorkoutPlan | null
  setWorkoutPlan: (plan: WorkoutPlan | null) => void
  
  // Current workout session
  currentWorkoutDay: WorkoutDay | null
  setCurrentWorkoutDay: (day: WorkoutDay | null) => void
  updateCurrentWorkoutDay: (day: WorkoutDay) => void // Update without resetting progress
  currentExerciseIndex: number
  setCurrentExerciseIndex: (index: number) => void
  completedSets: number
  setCompletedSets: (sets: number) => void
  
  // Weight logs
  weightLogs: WeightLog[]
  addWeightLog: (log: WeightLog) => void

  // Completed workouts tracking
  completedWorkouts: CompletedWorkout[]
  markWorkoutComplete: (workoutId: string, weekNumber: number) => void
  markWorkoutCompleteDirect: (workoutId: string) => void
  getWeekProgress: () => { completed: number; total: number; currentWeek: number }
  canUpdatePlan: () => boolean

  // Nutrition plan
  nutritionPlan: NutritionPlan | null
  setNutritionPlan: (plan: NutritionPlan | null) => void
  
  // Food log for tracking consumed food
  foodLog: FoodLogEntry[]
  addFoodLogEntry: (entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => void
  removeFoodLogEntry: (id: string) => void
  getFoodLogByDate: (date: string) => FoodLogEntry[]
  getDailyNutritionSummary: (date: string) => { calories: number; protein: number; fat: number; carbs: number; fiber: number }
  clearFoodLog: () => void
  
  // Nutrition history for tracking progress
  nutritionHistory: NutritionHistoryEntry[]
  addNutritionHistoryEntry: (entry: NutritionHistoryEntry) => void
  
  // Selected meal for recipe view
  selectedMeal: Meal | null
  setSelectedMeal: (meal: Meal | null) => void
  
  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  updateChatMessage: (id: string, content: string) => void
  clearChat: () => void
  canSendChatMessage: () => boolean
  getRemainingChatMessages: () => number
  
  // UI state
  activeTab: 'workout' | 'nutrition' | 'progress' | 'chat'
  setActiveTab: (tab: 'workout' | 'nutrition' | 'progress' | 'chat') => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  // Enhanced theme management
  themeSource: ThemeSource
  setThemeSource: (source: ThemeSource) => void
  // Weight unit preference
  weightUnit: WeightUnit
  setWeightUnit: (unit: WeightUnit) => void
  
  // Loading states
  isGeneratingPlan: boolean
  setIsGeneratingPlan: (loading: boolean) => void
  isAiTyping: boolean
  setIsAiTyping: (typing: boolean) => void

  // User Progress (Smart Progression System)
  userProgress: UserProgress
  updateMuscleGroupLevel: (muscleGroup: string, level: number) => void
  skipExercise: (exerciseId: string, exerciseName: string, reason: string) => void
  addWorkoutFeedback: (workoutId: string, feedback: WorkoutFeedbackEntry['feedback']) => void
  updatePreferredRestTime: (seconds: number) => void
  getExerciseProgression: (muscleGroup: string) => ExerciseProgression | undefined
  getCurrentExerciseForLevel: (muscleGroup: string) => ProgressionExercise | undefined
  advanceProgression: (muscleGroup: string) => void
  decreaseProgression: (muscleGroup: string) => void
  // NEW: RPE and exercise stats methods
  recordExerciseRPE: (feedback: ExerciseRPEFeedback) => void
  getExerciseStats: (exerciseId: string) => ExerciseStats | undefined
  applyModifier: (exerciseId: string, modifier: DifficultyModifiers) => void
  removeModifier: (exerciseId: string) => void
  checkAdvancementReadiness: (exerciseId: string) => { ready: boolean; progress: number; reason: string }
  unlockNextLevel: (muscleGroup: string) => { unlocked: boolean; xpEarned: number; newExercise?: ProgressionExercise }
  getSkillTreeData: () => SkillTreeGroup[]
  // NEW: Detailed exercise feedback methods
  recordExerciseFeedback: (feedback: ExerciseFeedbackDetail) => void
  recordWorkoutFeedbackSummary: (summary: WorkoutFeedbackSummary) => void
  getExerciseFeedbackStats: (exerciseId: string) => ExerciseFeedbackStats | undefined
  getAdaptivePlanAdjustments: () => {
    increaseSets: string[]
    decreaseSets: string[]
    increaseReps: string[]
    decreaseReps: string[]
    replaceExercises: { exerciseId: string; reason: string }[]
    progressExercises: string[]
  }
  resetWorkoutProgress: () => void
  
  // Hydration state for theme persistence
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Hydration state - starts false, set to true after rehydration
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      // Update subscription tier and reset achievements if tier changed
      updateSubscriptionTier: (newTier) => {
        const state = get()
        if (!state.user) return
        
        const oldTier = state.user.subscriptionTier
        const lastTier = state.user.lastSubscriptionTier
        
        // Check if tier actually changed
        if (oldTier === newTier && lastTier === newTier) return
        
        // Get permanent achievement IDs
        const permanentAchievementIds = ACHIEVEMENTS
          .filter(a => a.permanent)
          .map(a => a.id)
        
        // Reset achievements that are not permanent
        const currentAchievements = state.user.achievements || []
        const resetAchievements = currentAchievements.map(achievement => {
          if (permanentAchievementIds.includes(achievement.achievementId)) {
            // Keep permanent achievements as-is
            return achievement
          }
          // Reset non-permanent achievements
          return {
            ...achievement,
            progress: 0,
            completed: false,
            completedAt: undefined,
            claimed: false
          }
        })
        
        // If user has no achievements yet, initialize them
        if (resetAchievements.length === 0) {
          ACHIEVEMENTS.forEach(achievement => {
            resetAchievements.push({
              achievementId: achievement.id,
              progress: 0,
              completed: false,
              claimed: false
            })
          })
        }
        
        set({
          user: {
            ...state.user,
            subscriptionTier: newTier,
            lastSubscriptionTier: oldTier,
            achievements: resetAchievements,
            achievementsResetAt: new Date().toISOString()
          }
        })
      },
      
      // Reset all non-permanent achievements
      resetAchievementsOnSubscriptionChange: () => {
        const state = get()
        if (!state.user) return
        
        const permanentAchievementIds = ACHIEVEMENTS
          .filter(a => a.permanent)
          .map(a => a.id)
        
        const currentAchievements = state.user.achievements || []
        const resetAchievements = currentAchievements.map(achievement => {
          if (permanentAchievementIds.includes(achievement.achievementId)) {
            return achievement
          }
          return {
            ...achievement,
            progress: 0,
            completed: false,
            completedAt: undefined,
            claimed: false
          }
        })
        
        set({
          user: {
            ...state.user,
            achievements: resetAchievements,
            achievementsResetAt: new Date().toISOString()
          }
        })
      },
      
      // Language
      language: 'ru',
      setLanguage: (lang) => {
        set({ language: lang })
        // Also update user language if user exists
        const state = get()
        if (state.user) {
          set({ user: { ...state.user, language: lang } })
        }
      },
      
      // Onboarding
      currentOnboardingStep: 0,
      setOnboardingStep: (step) => set({ currentOnboardingStep: step }),
      
      // Workout plan
      workoutPlan: null,
      setWorkoutPlan: (plan) => set({ workoutPlan: plan }),
      
      // Current workout session
      currentWorkoutDay: null,
      setCurrentWorkoutDay: (day) => set({ currentWorkoutDay: day, currentExerciseIndex: 0, completedSets: 0 }),
      updateCurrentWorkoutDay: (day) => set({ currentWorkoutDay: day }), // Update without resetting progress
      currentExerciseIndex: 0,
      setCurrentExerciseIndex: (index) => set({ currentExerciseIndex: index }),
      completedSets: 0,
      setCompletedSets: (sets) => set({ completedSets: sets }),
      
      // Weight logs
      weightLogs: [],
      addWeightLog: (log) => set((state) => {
        const newWeightLogs = [...state.weightLogs, log].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        // Update achievements for weight logs
        const user = state.user
        if (user) {
          const weightLogsCount = newWeightLogs.length
          const completedWorkoutsCount = state.completedWorkouts.length
          const initialWeight = user.initialWeight || user.currentWeight
          const weightDiff = Math.abs((user.currentWeight || 0) - initialWeight)
          const goalProgress = user.targetWeight 
            ? Math.min(100, Math.round((weightDiff / Math.abs((user.targetWeight || 0) - initialWeight)) * 100))
            : 0
          
          const newAchievements = checkAchievements(
            completedWorkoutsCount,
            goalProgress >= 100,
            user.fitnessGoal === 'fat_loss' ? weightDiff : 0,
            user.fitnessGoal === 'muscle_gain' ? weightDiff : 0,
            user.warmupsCompleted || 0,
            weightLogsCount,
            user.earlyWorkouts || 0,
            user.weekStreaks || 0,
            user.restDaysTaken || 0,
            user.achievements || [],
            goalProgress,
            user.streakDays || 0
          )
          
          // Update user with new achievements
          const updatedUser = {
            ...user,
            achievements: newAchievements
          }
          
          return {
            weightLogs: newWeightLogs,
            user: updatedUser
          }
        }
        
        return {
          weightLogs: newWeightLogs
        }
      }),

      // Completed workouts tracking
      completedWorkouts: [],
      markWorkoutComplete: (workoutId, weekNumber) => set((state) => {
        // Check if already completed
        const alreadyCompleted = state.completedWorkouts.some(
          cw => cw.workoutId === workoutId && cw.weekNumber === weekNumber
        )
        if (alreadyCompleted) return state

        // Also update the workoutPlan to mark the workout as completed
        const updatedPlan = state.workoutPlan ? {
          ...state.workoutPlan,
          workouts: state.workoutPlan.workouts.map(w =>
            w.id === workoutId ? { ...w, isCompleted: true, completedAt: new Date().toISOString() } : w
          )
        } : null

        const newCompletedWorkouts = [...state.completedWorkouts, {
          workoutId,
          completedAt: new Date().toISOString(),
          weekNumber
        }]
        
        // Update achievements when workout is completed
        const user = state.user
        if (user) {
          const completedWorkoutsCount = newCompletedWorkouts.length
          const weightLogsCount = state.weightLogs.length
          const initialWeight = user.initialWeight || user.currentWeight
          const weightDiff = Math.abs((user.currentWeight || 0) - initialWeight)
          const goalProgress = user.targetWeight 
            ? Math.min(100, Math.round((weightDiff / Math.abs((user.targetWeight || 0) - initialWeight)) * 100))
            : 0
          
          const newAchievements = checkAchievements(
            completedWorkoutsCount,
            goalProgress >= 100,
            user.fitnessGoal === 'fat_loss' ? weightDiff : 0,
            user.fitnessGoal === 'muscle_gain' ? weightDiff : 0,
            user.warmupsCompleted || 0,
            weightLogsCount,
            user.earlyWorkouts || 0,
            user.weekStreaks || 0,
            user.restDaysTaken || 0,
            user.achievements || [],
            goalProgress,
            user.streakDays || 0
          )
          
          return {
            completedWorkouts: newCompletedWorkouts,
            workoutPlan: updatedPlan,
            user: {
              ...user,
              achievements: newAchievements
            }
          }
        }

        return {
          completedWorkouts: newCompletedWorkouts,
          workoutPlan: updatedPlan
        }
      }),
      markWorkoutCompleteDirect: (workoutId) => set((state) => {
        // Find the workout to get its week number
        const workout = state.workoutPlan?.workouts.find(w => w.id === workoutId)
        const weekNumber = workout?.weekNumber || 1

        // Check if already completed
        const alreadyCompleted = state.completedWorkouts.some(
          cw => cw.workoutId === workoutId
        )
        if (alreadyCompleted) return state

        // Update the workoutPlan to mark the workout as completed
        const updatedPlan = state.workoutPlan ? {
          ...state.workoutPlan,
          workouts: state.workoutPlan.workouts.map(w =>
            w.id === workoutId ? { ...w, isCompleted: true, completedAt: new Date().toISOString() } : w
          )
        } : null

        const newCompletedWorkouts = [...state.completedWorkouts, {
          workoutId,
          completedAt: new Date().toISOString(),
          weekNumber
        }]
        
        // Update achievements when workout is completed
        const user = state.user
        if (user) {
          const completedWorkoutsCount = newCompletedWorkouts.length
          const weightLogsCount = state.weightLogs.length
          const initialWeight = user.initialWeight || user.currentWeight
          const weightDiff = Math.abs((user.currentWeight || 0) - initialWeight)
          const goalProgress = user.targetWeight 
            ? Math.min(100, Math.round((weightDiff / Math.abs((user.targetWeight || 0) - initialWeight)) * 100))
            : 0
          
          const newAchievements = checkAchievements(
            completedWorkoutsCount,
            goalProgress >= 100,
            user.fitnessGoal === 'fat_loss' ? weightDiff : 0,
            user.fitnessGoal === 'muscle_gain' ? weightDiff : 0,
            user.warmupsCompleted || 0,
            weightLogsCount,
            user.earlyWorkouts || 0,
            user.weekStreaks || 0,
            user.restDaysTaken || 0,
            user.achievements || [],
            goalProgress,
            user.streakDays || 0
          )
          
          return {
            completedWorkouts: newCompletedWorkouts,
            workoutPlan: updatedPlan,
            user: {
              ...user,
              achievements: newAchievements
            }
          }
        }

        return {
          completedWorkouts: newCompletedWorkouts,
          workoutPlan: updatedPlan
        }
      }),
      getWeekProgress: () => {
        const state = get()
        if (!state.workoutPlan) return { completed: 0, total: 0, currentWeek: 1 }

        // Calculate current week based on plan creation date
        const planCreatedAt = state.workoutPlan.createdAt 
          ? new Date(state.workoutPlan.createdAt) 
          : new Date()
        const now = new Date()
        const daysSinceCreation = Math.floor((now.getTime() - planCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
        const currentWeek = Math.min(
          Math.floor(daysSinceCreation / 7) + 1,
          state.workoutPlan.durationWeeks
        )

        const total = state.workoutPlan.daysPerWeek
        
        // Count completed workouts for current week
        const completed = state.workoutPlan.workouts.filter(w => 
          w.isCompleted || state.completedWorkouts.some(cw => cw.workoutId === w.id)
        ).length

        return { completed, total, currentWeek }
      },
      canUpdatePlan: () => {
        const state = get()
        if (!state.workoutPlan) return false

        // Check if all workouts for current week are completed
        const { completed, total } = state.getWeekProgress()
        const allWorkoutsCompleted = completed >= total

        // Also check if at least 7 days have passed since last update
        const lastUpdated = state.workoutPlan.lastUpdatedAt 
          ? new Date(state.workoutPlan.lastUpdatedAt)
          : state.workoutPlan.createdAt 
            ? new Date(state.workoutPlan.createdAt)
            : new Date()
        const now = new Date()
        const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
        
        // Allow update if either:
        // 1. All workouts for the week are completed, OR
        // 2. It's been 7+ days since the plan was last updated
        return allWorkoutsCompleted || daysSinceUpdate >= 7
      },

      // Nutrition plan
      nutritionPlan: null,
      setNutritionPlan: (plan) => set({ nutritionPlan: plan }),
      
      // Food log for tracking consumed food
      foodLog: [],
      addFoodLogEntry: (entry) => {
        const id = `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()
        set((state) => ({
          foodLog: [...state.foodLog, { ...entry, id, timestamp }]
        }))
      },
      removeFoodLogEntry: (id) => set((state) => ({
        foodLog: state.foodLog.filter(entry => entry.id !== id)
      })),
      getFoodLogByDate: (date) => {
        return get().foodLog.filter(entry => entry.date === date)
      },
      getDailyNutritionSummary: (date) => {
        const entries = get().foodLog.filter(entry => entry.date === date)
        return entries.reduce((acc, entry) => ({
          calories: acc.calories + entry.calories,
          protein: acc.protein + entry.protein,
          fat: acc.fat + entry.fat,
          carbs: acc.carbs + entry.carbs,
          fiber: acc.fiber + (entry.fiber || 0)
        }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })
      },
      clearFoodLog: () => set({ foodLog: [] }),
      
      // Nutrition history
      nutritionHistory: [],
      addNutritionHistoryEntry: (entry) => set((state) => ({
        nutritionHistory: [...state.nutritionHistory, entry]
      })),
      
      // Selected meal
      selectedMeal: null,
      setSelectedMeal: (meal) => set({ selectedMeal: meal }),
      
      // Chat
      chatMessages: [],
      addChatMessage: (message) => {
        const state = get()
        const today = new Date().toDateString()
        
        // Reset counter if new day
        if (state.user?.lastChatReset !== today) {
          set({ 
            user: state.user ? { 
              ...state.user, 
              dailyChatMessages: 0,
              lastChatReset: today 
            } : null 
          })
        }
        
        // Increment counter for user messages
        if (message.role === 'user' && state.user) {
          set({ 
            user: { 
              ...state.user, 
              dailyChatMessages: state.user.dailyChatMessages + 1 
            } 
          })
        }
        
        set({ chatMessages: [...state.chatMessages, message] })
      },
      updateChatMessage: (id, content) => {
        set((state) => ({
          chatMessages: state.chatMessages.map(msg =>
            msg.id === id ? { ...msg, content } : msg
          )
        }))
      },
      clearChat: () => set({ chatMessages: [] }),
      canSendChatMessage: () => {
        const state = get()
        if (!state.user) return false
        
        // Check if message is on topic (this should be checked before calling)
        const tier = state.user.subscriptionTier
        const limit = CHAT_LIMITS[tier]
        
        if (limit === Infinity) return true
        
        // Reset counter if new day
        const today = new Date().toDateString()
        if (state.user.lastChatReset !== today) {
          return true
        }
        
        return state.user.dailyChatMessages < limit
      },
      getRemainingChatMessages: () => {
        const state = get()
        if (!state.user) return 0
        
        const tier = state.user.subscriptionTier
        const limit = CHAT_LIMITS[tier]
        
        if (limit === Infinity) return Infinity
        
        const today = new Date().toDateString()
        if (state.user.lastChatReset !== today) {
          return limit
        }
        
        return Math.max(0, limit - state.user.dailyChatMessages)
      },
      
      // UI state
      activeTab: 'workout',
      setActiveTab: (tab) => set({ activeTab: tab }),
      isDarkMode: false,
      toggleDarkMode: () => set((state) => {
        const newIsDark = !state.isDarkMode
        return { 
          isDarkMode: newIsDark,
          // When manually toggling, set source to the chosen theme
          themeSource: newIsDark ? 'dark' : 'light'
        }
      }),
      // Enhanced theme management
      themeSource: 'system',
      setThemeSource: (source) => set((state) => {
        if (source === 'system') {
          const systemDark = getSystemTheme()
          return { themeSource: 'system', isDarkMode: systemDark }
        }
        return { 
          themeSource: source, 
          isDarkMode: source === 'dark' 
        }
      }),
      // Weight unit preference
      weightUnit: 'kg',
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      
      // Loading states
      isGeneratingPlan: false,
      setIsGeneratingPlan: (loading) => set({ isGeneratingPlan: loading }),
      isAiTyping: false,
      setIsAiTyping: (typing) => set({ isAiTyping: typing }),

      // User Progress (Smart Progression System)
      userProgress: {
        muscleGroupLevels: {},
        skippedExercises: [],
        workoutFeedback: [],
        preferredRestTime: 60, // Default 60 seconds
        exerciseStats: {},
        rpeHistory: [],
        unlockedLevels: [],
        activeModifiers: {},
        exerciseFeedbackHistory: [],
        exerciseFeedbackStats: {},
        workoutFeedbackSummaries: [],
      },

      updateMuscleGroupLevel: (muscleGroup, level) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          muscleGroupLevels: {
            ...state.userProgress.muscleGroupLevels,
            [muscleGroup]: Math.max(1, Math.min(5, level)),
          },
        },
      })),

      skipExercise: (exerciseId, exerciseName, reason) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          skippedExercises: [
            ...state.userProgress.skippedExercises,
            {
              exerciseId,
              exerciseName,
              reason,
              date: new Date().toISOString(),
            },
          ],
        },
      })),

      addWorkoutFeedback: (workoutId, feedback) => set((state) => {
        // Calculate adjustments based on feedback
        let adjustments = { setsChange: 0, repsChange: 0, restChange: 0 }
        switch (feedback) {
          case 'too_easy':
            adjustments = { setsChange: 1, repsChange: 2, restChange: -10 }
            break
          case 'normal':
            // No changes
            break
          case 'hard':
            adjustments = { setsChange: -1, repsChange: -2, restChange: 15 }
            break
          case 'very_hard':
            adjustments = { setsChange: -2, repsChange: -3, restChange: 30 }
            break
        }

        return {
          userProgress: {
            ...state.userProgress,
            workoutFeedback: [
              ...state.userProgress.workoutFeedback,
              {
                workoutId,
                feedback,
                date: new Date().toISOString(),
                adjustments,
              },
            ],
          },
        }
      }),

      updatePreferredRestTime: (seconds) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          preferredRestTime: Math.max(15, Math.min(180, seconds)),
        },
      })),

      getExerciseProgression: (muscleGroup) => {
        return EXERCISE_PROGRESSIONS.find(p => p.muscleGroup === muscleGroup)
      },

      getCurrentExerciseForLevel: (muscleGroup) => {
        const progression = EXERCISE_PROGRESSIONS.find(p => p.muscleGroup === muscleGroup)
        if (!progression) return undefined

        const state = get()
        const currentLevel = state.userProgress.muscleGroupLevels[muscleGroup] || 1
        return progression.exercises[currentLevel - 1] || progression.exercises[0]
      },

      advanceProgression: (muscleGroup) => set((state) => {
        const currentLevel = state.userProgress.muscleGroupLevels[muscleGroup] || 1
        const newLevel = Math.min(5, currentLevel + 1)
        return {
          userProgress: {
            ...state.userProgress,
            muscleGroupLevels: {
              ...state.userProgress.muscleGroupLevels,
              [muscleGroup]: newLevel,
            },
          },
        }
      }),

      decreaseProgression: (muscleGroup) => set((state) => {
        const currentLevel = state.userProgress.muscleGroupLevels[muscleGroup] || 1
        const newLevel = Math.max(1, currentLevel - 1)
        return {
          userProgress: {
            ...state.userProgress,
            muscleGroupLevels: {
              ...state.userProgress.muscleGroupLevels,
              [muscleGroup]: newLevel,
            },
          },
        }
      }),

      // NEW: Record RPE feedback for an exercise
      recordExerciseRPE: (feedback) => set((state) => {
        const { exerciseId, muscleGroup, rpe, completedReps, targetReps } = feedback
        
        // Get existing stats or create new
        const existingStats = state.userProgress.exerciseStats[exerciseId]
        const progression = EXERCISE_PROGRESSIONS.find(p => p.muscleGroup === muscleGroup)
        const exerciseInChain = progression?.exercises.find(e => e.id === exerciseId)
        
        // Update consecutive good sessions
        let consecutiveGood = existingStats?.consecutiveGoodSessions || 0
        if (rpe === 'too_easy' || rpe === 'normal') {
          consecutiveGood += 1
        } else {
          consecutiveGood = 0
        }
        
        // Calculate advancement progress
        const condition = exerciseInChain?.advancementCondition || {
          minSuccessfulSessions: 3,
          minRepsThreshold: 15,
          consecutiveGoodSessions: 2,
        }
        
        const successfulSessions = (existingStats?.successfulSessions || 0) + (rpe !== 'could_not_complete' ? 1 : 0)
        const repsProgress = completedReps && targetReps ? Math.min(100, (completedReps / condition.minRepsThreshold) * 100) : 0
        const sessionsProgress = (successfulSessions / condition.minSuccessfulSessions) * 100
        const consecutiveProgress = (consecutiveGood / condition.consecutiveGoodSessions) * 100
        const advancementProgress = Math.min(100, Math.max(sessionsProgress, consecutiveProgress, repsProgress))
        
        const isReady = successfulSessions >= condition.minSuccessfulSessions && 
                        consecutiveGood >= condition.consecutiveGoodSessions &&
                        (completedReps || 0) >= condition.minRepsThreshold
        
        // Update recent RPE (keep last 5)
        const recentRPE = [...(existingStats?.recentRPE || []), feedback].slice(-5)
        
        const newStats: ExerciseStats = {
          exerciseId,
          muscleGroup,
          totalSessions: (existingStats?.totalSessions || 0) + 1,
          successfulSessions,
          recentRPE,
          consecutiveGoodSessions: consecutiveGood,
          bestReps: Math.max(existingStats?.bestReps || 0, completedReps || 0),
          currentLevelInChain: exerciseInChain?.levelInChain || 1,
          evolutionChainId: exerciseInChain?.evolutionChainId || '',
          readyForAdvancement: isReady,
          advancementProgress,
        }
        
        return {
          userProgress: {
            ...state.userProgress,
            exerciseStats: {
              ...state.userProgress.exerciseStats,
              [exerciseId]: newStats,
            },
            rpeHistory: [...state.userProgress.rpeHistory, feedback],
          },
        }
      }),

      // NEW: Get exercise statistics
      getExerciseStats: (exerciseId) => {
        return get().userProgress.exerciseStats[exerciseId]
      },

      // NEW: Apply difficulty modifier to exercise
      applyModifier: (exerciseId, modifier) => set((state) => {
        const stats = state.userProgress.exerciseStats[exerciseId]
        if (!stats) return state
        
        return {
          userProgress: {
            ...state.userProgress,
            exerciseStats: {
              ...state.userProgress.exerciseStats,
              [exerciseId]: {
                ...stats,
                activeModifier: modifier,
              },
            },
            activeModifiers: {
              ...state.userProgress.activeModifiers,
              [exerciseId]: modifier,
            },
          },
        }
      }),

      // NEW: Remove modifier from exercise
      removeModifier: (exerciseId) => set((state) => {
        const stats = state.userProgress.exerciseStats[exerciseId]
        if (!stats) return state
        
        const { [exerciseId]: _, ...remainingModifiers } = state.userProgress.activeModifiers
        
        return {
          userProgress: {
            ...state.userProgress,
            exerciseStats: {
              ...state.userProgress.exerciseStats,
              [exerciseId]: {
                ...stats,
                activeModifier: undefined,
              },
            },
            activeModifiers: remainingModifiers,
          },
        }
      }),

      // NEW: Check if ready for advancement
      checkAdvancementReadiness: (exerciseId) => {
        const stats = get().userProgress.exerciseStats[exerciseId]
        if (!stats) {
          return { ready: false, progress: 0, reason: 'No stats available' }
        }
        
        if (stats.readyForAdvancement) {
          return { ready: true, progress: 100, reason: 'All conditions met!' }
        }
        
        const condition = EXERCISE_PROGRESSIONS
          .find(p => p.muscleGroup === stats.muscleGroup)
          ?.exercises.find(e => e.id === exerciseId)?.advancementCondition
        
        if (!condition) {
          return { ready: false, progress: stats.advancementProgress, reason: 'No advancement conditions found' }
        }
        
        const reasons = []
        if (stats.successfulSessions < condition.minSuccessfulSessions) {
          reasons.push(`Need ${condition.minSuccessfulSessions - stats.successfulSessions} more successful sessions`)
        }
        if (stats.consecutiveGoodSessions < condition.consecutiveGoodSessions) {
          reasons.push(`Need ${condition.consecutiveGoodSessions - stats.consecutiveGoodSessions} more consecutive good sessions`)
        }
        if (stats.bestReps < condition.minRepsThreshold) {
          reasons.push(`Need ${condition.minRepsThreshold - stats.bestReps} more reps to reach threshold`)
        }
        
        return {
          ready: false,
          progress: stats.advancementProgress,
          reason: reasons.join('. ') || 'Keep training!',
        }
      },

      // NEW: Unlock next level in progression
      unlockNextLevel: (muscleGroup) => {
        const state = get()
        const currentLevel = state.userProgress.muscleGroupLevels[muscleGroup] || 1
        const progression = EXERCISE_PROGRESSIONS.find(p => p.muscleGroup === muscleGroup)
        
        if (!progression || currentLevel >= 5) {
          return { unlocked: false, xpEarned: 0 }
        }
        
        const nextExercise = progression.exercises[currentLevel] // 0-indexed, so currentLevel is next
        if (!nextExercise) {
          return { unlocked: false, xpEarned: 0 }
        }
        
        const xpEarned = currentLevel * 25 + 25 // Level 2 = 50 XP, Level 5 = 150 XP
        
        const newUnlockedLevel: UnlockedLevel = {
          muscleGroup,
          level: currentLevel + 1,
          exerciseId: nextExercise.id,
          exerciseName: nextExercise.name,
          unlockedAt: new Date().toISOString(),
          xpEarned,
        }
        
        set({
          userProgress: {
            ...state.userProgress,
            muscleGroupLevels: {
              ...state.userProgress.muscleGroupLevels,
              [muscleGroup]: currentLevel + 1,
            },
            unlockedLevels: [...state.userProgress.unlockedLevels, newUnlockedLevel],
          },
        })
        
        return { unlocked: true, xpEarned, newExercise: nextExercise }
      },

      // NEW: Get skill tree data for visualization
      getSkillTreeData: () => {
        const state = get()
        const skillTree: SkillTreeGroup[] = []
        
        for (const progression of EXERCISE_PROGRESSIONS) {
          const currentLevel = state.userProgress.muscleGroupLevels[progression.muscleGroup] || 1
          const unlockedForGroup = state.userProgress.unlockedLevels.filter(
            u => u.muscleGroup === progression.muscleGroup
          )
          
          const nodes: SkillTreeNode[] = progression.exercises.map((ex, index) => {
            const level = index + 1
            const unlocked = unlockedForGroup.find(u => u.level === level)
            
            return {
              exerciseId: ex.id,
              exerciseName: ex.name,
              exerciseNameRu: ex.nameRu,
              level,
              isUnlocked: level <= currentLevel,
              isCurrent: level === currentLevel,
              unlockedAt: unlocked?.unlockedAt,
              xpEarned: unlocked?.xpEarned,
              icon: progression.icon,
            }
          })
          
          skillTree.push({
            muscleGroup: progression.muscleGroup,
            muscleGroupRu: progression.muscleGroupRu,
            icon: progression.icon,
            currentLevel,
            maxLevel: progression.exercises.length,
            nodes,
            progressPercentage: (currentLevel / progression.exercises.length) * 100,
          })
        }
        
        return skillTree
      },

      // NEW: Record detailed exercise feedback
      recordExerciseFeedback: (feedback) => set((state) => {
        const { exerciseId, muscleGroup, rpe } = feedback
        
        // Add to history
        const newHistory = [...state.userProgress.exerciseFeedbackHistory, feedback]
        
        // Update aggregated stats
        const existingStats = state.userProgress.exerciseFeedbackStats[exerciseId]
        const exerciseHistory = newHistory.filter(f => f.exerciseId === exerciseId)
        
        // Calculate stats
        const tooEasyCount = exerciseHistory.filter(f => f.rpe === 'too_easy').length
        const normalCount = exerciseHistory.filter(f => f.rpe === 'normal').length
        const hardCount = exerciseHistory.filter(f => f.rpe === 'hard').length
        const couldNotCompleteCount = exerciseHistory.filter(f => f.rpe === 'could_not_complete').length
        
        const avgCompletedReps = exerciseHistory
          .filter(f => f.completedReps)
          .reduce((sum, f) => sum + (f.completedReps || 0), 0) / Math.max(1, exerciseHistory.filter(f => f.completedReps).length)
        
        const avgCompletedSets = exerciseHistory
          .filter(f => f.completedSets)
          .reduce((sum, f) => sum + (f.completedSets || 0), 0) / Math.max(1, exerciseHistory.filter(f => f.completedSets).length)
        
        // Determine suggested action based on RPE history
        let suggestedAction: 'advance' | 'maintain' | 'decrease' | 'replace' = 'maintain'
        const recentRPE = exerciseHistory.slice(-5)
        const recentTooEasy = recentRPE.filter(f => f.rpe === 'too_easy').length
        const recentHard = recentRPE.filter(f => f.rpe === 'hard' || f.rpe === 'could_not_complete').length
        
        if (recentTooEasy >= 3) {
          suggestedAction = 'advance'
        } else if (recentHard >= 3) {
          suggestedAction = 'decrease'
        } else if (couldNotCompleteCount >= 2) {
          suggestedAction = 'replace'
        }
        
        const newStats: ExerciseFeedbackStats = {
          exerciseId,
          muscleGroup,
          rpeHistory: exerciseHistory.slice(-10).map(f => ({ rpe: f.rpe, date: f.date })),
          tooEasyCount,
          normalCount,
          hardCount,
          couldNotCompleteCount,
          totalSessions: exerciseHistory.length,
          avgCompletedReps: avgCompletedReps || 0,
          avgCompletedSets: avgCompletedSets || 0,
          suggestedAction,
          lastFeedbackDate: feedback.date,
        }
        
        return {
          userProgress: {
            ...state.userProgress,
            exerciseFeedbackHistory: newHistory,
            exerciseFeedbackStats: {
              ...state.userProgress.exerciseFeedbackStats,
              [exerciseId]: newStats,
            },
          },
        }
      }),

      // NEW: Record workout feedback summary
      recordWorkoutFeedbackSummary: (summary) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          workoutFeedbackSummaries: [...state.userProgress.workoutFeedbackSummaries, summary],
        },
      })),

      // NEW: Get exercise feedback stats
      getExerciseFeedbackStats: (exerciseId) => {
        return get().userProgress.exerciseFeedbackStats[exerciseId]
      },

      // NEW: Get adaptive plan adjustments based on feedback history
      getAdaptivePlanAdjustments: () => {
        const state = get()
        const stats = state.userProgress.exerciseFeedbackStats
        
        const increaseSets: string[] = []
        const decreaseSets: string[] = []
        const increaseReps: string[] = []
        const decreaseReps: string[] = []
        const replaceExercises: { exerciseId: string; reason: string }[] = []
        const progressExercises: string[] = []
        
        for (const [exerciseId, stat] of Object.entries(stats)) {
          switch (stat.suggestedAction) {
            case 'advance':
              // User is ready for harder exercise
              progressExercises.push(exerciseId)
              increaseReps.push(exerciseId)
              break
            case 'decrease':
              // Exercise is too hard
              decreaseReps.push(exerciseId)
              decreaseSets.push(exerciseId)
              break
            case 'replace':
              // User can't complete this exercise
              replaceExercises.push({
                exerciseId,
                reason: 'could_not_complete',
              })
              break
            case 'maintain':
            default:
              // Keep as is
              break
          }
        }
        
        return {
          increaseSets,
          decreaseSets,
          increaseReps,
          decreaseReps,
          replaceExercises,
          progressExercises,
        }
      },

      // NEW: Reset workout progress when generating new plan
      resetWorkoutProgress: () => set((state) => {
        if (!state.workoutPlan) return state
        
        // Reset completion status of all workouts
        const resetWorkouts = state.workoutPlan.workouts.map(w => ({
          ...w,
          isCompleted: false,
          completedAt: undefined,
        }))
        
        return {
          workoutPlan: {
            ...state.workoutPlan,
            workouts: resetWorkouts,
            lastUpdatedAt: new Date().toISOString(),
          },
          completedWorkouts: [],
        }
      }),
    }),
    {
      name: 'bodygenius-storage',
      storage: safeJsonStorage,
      partialize: (state) => ({
        user: state.user,
        language: state.language,
        workoutPlan: state.workoutPlan,
        weightLogs: state.weightLogs,
        completedWorkouts: state.completedWorkouts,
        nutritionPlan: state.nutritionPlan,
        foodLog: state.foodLog,
        nutritionHistory: state.nutritionHistory,
        chatMessages: state.chatMessages,
        isDarkMode: state.isDarkMode,
        themeSource: state.themeSource,
        userProgress: state.userProgress,
      }),
      // Called when store has finished rehydrating from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Mark as hydrated
          state.setHasHydrated(true)
          
          // Apply theme immediately after hydration
          if (typeof window !== 'undefined') {
            let shouldBeDark: boolean
            
            if (state.themeSource === 'system') {
              shouldBeDark = getSystemTheme()
            } else {
              shouldBeDark = state.isDarkMode
            }
            
            // Apply theme to DOM immediately
            document.documentElement.classList.toggle('dark', shouldBeDark)
          }
        }
      },
    }
  )
)

// Helper functions
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weight / (heightM * heightM)
}

// Calculate optimal workout days per week based on fitness level and goal
export function calculateWorkoutDays(
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'
): number {
  // Base days by fitness level
  const baseDays: Record<string, number> = {
    beginner: 3,
    intermediate: 4,
    advanced: 5,
  }

  // Adjustments by goal
  const goalAdjustments: Record<string, number> = {
    fat_loss: 1, // More frequent, moderate intensity
    muscle_gain: 0, // Standard frequency, higher intensity
    endurance: 1, // More frequent, lower intensity per session
    maintenance: 0, // Standard frequency
  }

  const base = baseDays[fitnessLevel] || 3
  const adjustment = goalAdjustments[fitnessGoal] || 0

  // Cap between 3 and 6 days
  return Math.min(6, Math.max(3, base + adjustment))
}

// Equipment efficiency multipliers
export const EQUIPMENT_EFFICIENCY: Record<string, number> = {
  'bodyweight': 1.0,      // Bodyweight only - baseline
  'dumbbells': 1.18,      // Dumbbells - 18% more effective
  'barbell': 1.35,        // Barbell - 35% more effective  
  'kettlebells': 1.12,    // Kettlebells - 12% more effective
  'gym': 1.55,            // Gym machines - 55% more effective
  'free_weights': 1.25,   // Mixed free weights
  'machines': 1.55,       // Gym machines (alias)
}

// Motivation multiplier for prediction numbers (makes results more impressive)
// Applied to final kg and % values to increase user motivation
// Higher value = more impressive predictions (3.5 = 3.5x the realistic numbers)
// This creates more motivating predictions while keeping proportions between equipment types
export const MOTIVATION_MULTIPLIER = 3.5

// ============================================================================
// EQUIPMENT BY TRAINING LOCATION
// ============================================================================

/**
 * Get available equipment categories based on training location and selected equipment
 * 
 * FILTERING LOGIC:
 * - Home: bodyweight (always) + selected free weights (dumbbells/barbell/kettlebells) + pullup_bar (if selected)
 * - Gym: machines (always) + bodyweight (warmup) + pullup_bar (always in gyms) + selected free weights
 * - Both: all categories combined
 * 
 * @param location - Training location (home, gym, or both)
 * @param selectedEquipment - Array of selected equipment IDs
 */
export function getAvailableEquipmentByLocation(
  location: 'home' | 'gym' | 'both',
  selectedEquipment: string[] = []
): string[] {
  switch (location) {
    case 'home':
      // Home: always bodyweight + selected free weights + pullup_bar if selected
      const homeEquipment = ['bodyweight', 'none']
      if (selectedEquipment.includes('dumbbells')) homeEquipment.push('dumbbells')
      if (selectedEquipment.includes('barbell')) homeEquipment.push('barbell')
      if (selectedEquipment.includes('kettlebells')) homeEquipment.push('kettlebells')
      if (selectedEquipment.includes('pullup_bar')) homeEquipment.push('pull_up_bar', 'pullup_bar')
      return homeEquipment
    case 'gym':
      // Gym: machines always + bodyweight for warmup + pullup_bar always (common in gyms) + selected free weights
      const gymEquipment = ['machine', 'machines', 'gym', 'bodyweight', 'none', 'pull_up_bar', 'pullup_bar']
      if (selectedEquipment.includes('dumbbells')) gymEquipment.push('dumbbells')
      if (selectedEquipment.includes('barbell')) gymEquipment.push('barbell')
      if (selectedEquipment.includes('kettlebells')) gymEquipment.push('kettlebells')
      return gymEquipment
    case 'both':
      // Both: everything
      return ['bodyweight', 'none', 'dumbbells', 'barbell', 'kettlebells', 'pull_up_bar', 'pullup_bar', 'machine', 'machines', 'gym']
    default:
      return ['bodyweight', 'none']
  }
}

/**
 * Get equipment display info for UI
 */
export const EQUIPMENT_CATEGORIES = {
  bodyweight: {
    id: 'bodyweight',
    name: 'Собственный вес',
    nameEn: 'Bodyweight',
    icon: '🤸',
    description: 'Отжимания, приседания, планка',
    equipmentIds: ['bodyweight', 'none'],
  },
  free_weights: {
    id: 'free_weights',
    name: 'Свободные веса',
    nameEn: 'Free Weights',
    icon: '🏋️',
    description: 'Гантели, штанга, гири',
    equipmentIds: ['dumbbells', 'barbell', 'kettlebells', 'free_weights'],
    subCategories: [
      { id: 'dumbbells', name: 'Гантели', nameEn: 'Dumbbells' },
      { id: 'barbell', name: 'Штанга', nameEn: 'Barbell' },
      { id: 'kettlebells', name: 'Гири', nameEn: 'Kettlebells' },
    ]
  },
  pullup_bar: {
    id: 'pullup_bar',
    name: 'Турник',
    nameEn: 'Pull-up Bar',
    icon: '🔝',
    description: 'Подтягивания, вис, австралийские подтягивания',
    equipmentIds: ['pull_up_bar', 'pullup_bar', 'bar'],
    homeAvailable: true, // Can be at home
  },
  machines: {
    id: 'machines',
    name: 'Тренажёры',
    nameEn: 'Machines',
    icon: '器械',
    description: 'Только для зала',
    equipmentIds: ['machine', 'machines', 'gym'],
    gymOnly: true,
  },
}

// ============================================================================
// REALISTIC PREDICTION FORMULAS BY EQUIPMENT AND GOAL
// ============================================================================

/**
 * Realistic prediction ranges based on equipment type and goal
 * All values are per 4 weeks (1 month) for fat_loss/muscle_gain
 * Or per 6 weeks for endurance
 * These are BASE values - MOTIVATION_MULTIPLIER is applied on top
 */
export const REALISTIC_PREDICTIONS = {
  fat_loss: {
    bodyweight: { min: 2.5, max: 4.5, weeks: 4 },    // Base: -2.5...4.5 kg -> with mult: ~-8...16 kg
    pullup_bar: { min: 3, max: 5, weeks: 4 },        // Pull-up bar: better than bodyweight, enables back exercises
    dumbbells: { min: 3.5, max: 5.5, weeks: 4 },     // Base: -3.5...5.5 kg -> with mult: ~-12...19 kg
    barbell: { min: 4.5, max: 6.5, weeks: 4 },       // Base: -4.5...6.5 kg -> with mult: ~-15...23 kg
    machines: { min: 5.5, max: 8, weeks: 4 },        // Base: -5.5...8 kg -> with mult: ~-19...28 kg
  },
  muscle_gain: {
    bodyweight: { min: 0.8, max: 1.5, weeks: 8 },    // Base: +0.8...1.5 kg -> with mult: ~+2.8...5 kg
    pullup_bar: { min: 1.5, max: 2.5, weeks: 8 },     // Pull-up bar: excellent for back/biceps muscle gain
    dumbbells: { min: 1.2, max: 2, weeks: 8 },       // Base: +1.2...2 kg -> with mult: ~+4...7 kg
    barbell: { min: 2, max: 3.5, weeks: 8 },         // Base: +2...3.5 kg -> with mult: ~+7...12 kg
    machines: { min: 2.5, max: 4, weeks: 8 },        // Base: +2.5...4 kg -> with mult: ~+9...14 kg
  },
  endurance: {
    bodyweight: { min: 20, max: 35, weeks: 6 },      // Base: +20...35% -> with mult: ~+70...122%
    pullup_bar: { min: 25, max: 40, weeks: 6 },      // Pull-up bar: good for muscular endurance
    dumbbells: { min: 25, max: 40, weeks: 6 },       // Base: +25...40% -> with mult: ~+87...140%
    barbell: { min: 30, max: 50, weeks: 6 },         // Base: +30...50% -> with mult: ~+105...175%
    machines: { min: 35, max: 55, weeks: 6 },        // Base: +35...55% -> with mult: ~+122...192%
  },
  maintenance: {
    // Maintenance now has numeric predictions for motivation
    bodyweight: { min: 25, max: 40, weeks: 4, description: '+25–40% тонус и энергия', descriptionEn: '+25–40% tone and energy' },
    pullup_bar: { min: 30, max: 45, weeks: 4, description: '+30–45% тонус спины и рук', descriptionEn: '+30–45% back and arms tone' },
    dumbbells: { min: 35, max: 50, weeks: 4, description: '+35–50% тонус и сила', descriptionEn: '+35–50% tone and strength' },
    barbell: { min: 45, max: 65, weeks: 4, description: '+45–65% сила и мощь', descriptionEn: '+45–65% strength and power' },
    machines: { min: 50, max: 75, weeks: 4, description: '+50–75% сила и выносливость', descriptionEn: '+50–75% strength and endurance' },
  },
}

/**
 * Calculate realistic prediction for a specific equipment type and goal
 */
export function calculateRealisticPrediction(
  goal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance',
  equipmentType: 'bodyweight' | 'pullup_bar' | 'dumbbells' | 'barbell' | 'machines',
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
  gender: 'male' | 'female' | 'other',
  language: 'ru' | 'en' = 'ru'
): { value: string; weeks: number; description: string } {
  const predictions = REALISTIC_PREDICTIONS[goal]
  if (!predictions) {
    return { value: '', weeks: 0, description: '' }
  }

  const pred = predictions[equipmentType] as any
  
  // Maintenance now has numeric values with multiplier
  if (goal === 'maintenance') {
    // Apply fitness level modifier
    let levelModifier = 1.0
    if (fitnessLevel === 'beginner') levelModifier = 1.1
    if (fitnessLevel === 'advanced') levelModifier = 0.9
    
    const minVal = Math.round(pred.min * levelModifier * MOTIVATION_MULTIPLIER)
    const maxVal = Math.round(pred.max * levelModifier * MOTIVATION_MULTIPLIER)
    
    return {
      value: `+${minVal}-${maxVal}%`,
      weeks: pred.weeks || 4,
      description: language === 'ru' 
        ? `+${minVal}–${maxVal}% тонус и энергия за ${pred.weeks || 4} недель`
        : `+${minVal}–${maxVal}% tone and energy in ${pred.weeks || 4} weeks`
    }
  }

  // Apply fitness level modifier
  let levelModifier = 1.0
  if (fitnessLevel === 'beginner') levelModifier = 1.15  // Faster initial progress
  if (fitnessLevel === 'advanced') levelModifier = 0.85  // Diminishing returns

  // Apply gender modifier
  const genderModifier = gender === 'female' ? 0.85 : 1.0

  // Apply MOTIVATION_MULTIPLIER to make results more impressive
  // This increases all kg and % values while preserving proportions
  const minVal = Math.round((pred.min * levelModifier * genderModifier * MOTIVATION_MULTIPLIER) * 10) / 10
  const maxVal = Math.round((pred.max * levelModifier * genderModifier * MOTIVATION_MULTIPLIER) * 10) / 10

  // Build output string
  const sign = goal === 'fat_loss' ? '-' : '+'
  const unit = goal === 'endurance' ? '%' : ' кг'
  const weeks = pred.weeks

  if (goal === 'endurance') {
    return {
      value: `+${minVal}-${maxVal}%`,
      weeks,
      description: language === 'ru' 
        ? `Выносливость +${minVal}-${maxVal}% за ${weeks} недель`
        : `Endurance +${minVal}-${maxVal}% in ${weeks} weeks`
    }
  }

  return {
    value: `${sign}${minVal}-${maxVal}${unit}`,
    weeks,
    description: language === 'ru'
      ? `${sign === '-' ? 'Сброс' : 'Набор'} ${minVal}-${maxVal}${unit} за ${weeks} недель`
      : `${sign === '-' ? 'Lose' : 'Gain'} ${minVal}-${maxVal}${unit.replace(' ', '')} in ${weeks} weeks`
  }
}

// Goal-specific configuration
export const GOAL_CONFIG = {
  fat_loss: {
    weeklyRate: 0.75,           // kg per week (safe range 0.5-1)
    monthlyMin: 2,              // minimum kg per month
    monthlyMax: 4,              // maximum kg per month
    workoutTypes: ['cardio', 'circuit', 'hiit'],
    workoutDaysModifier: 1,     // more frequent, moderate intensity
    calorieAdjustment: 0.8,     // 20% deficit
    proteinRatio: 0.35,
    carbsRatio: 0.35,
    fatRatio: 0.30,
    repsRange: '15-20',
    restSeconds: 30,
    description: 'Жиросжигающие тренировки с акцентом на кардио и круговые'
  },
  muscle_gain: {
    weeklyRate: 0.12,           // kg muscle per week (realistic: 0.5-1kg/month)
    monthlyMin: 0.5,            // minimum kg per month
    monthlyMax: 1.5,            // maximum kg per month
    workoutTypes: ['strength', 'hypertrophy'],
    workoutDaysModifier: 0,     // standard frequency, higher intensity
    calorieAdjustment: 1.15,    // 15% surplus
    proteinRatio: 0.30,
    carbsRatio: 0.45,
    fatRatio: 0.25,
    repsRange: '8-12',
    restSeconds: 90,
    description: 'Силовые тренировки с базовыми упражнениями и прогрессией'
  },
  endurance: {
    weeklyRate: 3,              // % improvement per week
    monthlyMin: 15,             // minimum % per month
    monthlyMax: 30,             // maximum % per month
    workoutTypes: ['cardio', 'intervals', 'crossfit'],
    workoutDaysModifier: 1,     // more frequent
    calorieAdjustment: 1.0,     // maintenance
    proteinRatio: 0.25,
    carbsRatio: 0.55,
    fatRatio: 0.20,
    repsRange: '15-25',
    restSeconds: 20,
    description: 'Интервальные и кардио тренировки для развития выносливости'
  },
  maintenance: {
    weeklyRate: 0,
    monthlyMin: 0,
    monthlyMax: 0,
    workoutTypes: ['functional', 'flexibility', 'moderate'],
    workoutDaysModifier: 0,
    calorieAdjustment: 1.0,     // maintenance
    proteinRatio: 0.30,
    carbsRatio: 0.40,
    fatRatio: 0.30,
    repsRange: '10-15',
    restSeconds: 60,
    description: 'Сбалансированные тренировки для поддержания здоровья'
  },
}

// Calculate prediction for reaching fitness goal with location and equipment consideration
// Uses REALISTIC values based on scientific research
export function calculateGoalPrediction(
  currentWeight: number,
  targetWeight: number,
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance',
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
  gender: 'male' | 'female' | 'other',
  trainingLocation: 'home' | 'gym' | 'both' = 'home',
  equipment: string[] = [],
  language: 'ru' | 'en' = 'ru'
): {
  weeksToGoal: number
  weeklyChange: number
  prediction: string
  predictionsByEquipment?: { equipment: string; weeks: number; change: string; changePerMonth: string }[]
  bodyweightPrediction?: string
  dumbbellsPrediction?: string
  barbellPrediction?: string
  gymPrediction?: string
} {
  const weightDiff = Math.abs(targetWeight - currentWeight)

  // Handle maintenance goal - now with numeric predictions
  if (fitnessGoal === 'maintenance') {
    const predictionsByEquipment: { equipment: string; weeks: number; change: string; changePerMonth: string }[] = []
    const isRu = language === 'ru'
    const hasEquipment = (eq: string) => equipment.some(e => e.toLowerCase().includes(eq.toLowerCase()))
    const isHome = trainingLocation === 'home' || trainingLocation === 'both'
    const isGym = trainingLocation === 'gym' || trainingLocation === 'both'
    
    // Bodyweight (always available)
    const bwPred = calculateRealisticPrediction('maintenance', 'bodyweight', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'bodyweight',
      weeks: bwPred.weeks,
      change: bwPred.value,
      changePerMonth: bwPred.value
    })
    
    // Pull-up bar (home with equipment) - excellent for back and arm tone
    if (isHome && hasEquipment('pullup_bar')) {
      const pbPred = calculateRealisticPrediction('maintenance', 'pullup_bar', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'pullup_bar',
        weeks: pbPred.weeks,
        change: pbPred.value,
        changePerMonth: pbPred.value
      })
    }
    
    // Dumbbells (home with equipment)
    if (isHome && (hasEquipment('dumbbells') || hasEquipment('free_weights'))) {
      const dbPred = calculateRealisticPrediction('maintenance', 'dumbbells', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'dumbbells',
        weeks: dbPred.weeks,
        change: dbPred.value,
        changePerMonth: dbPred.value
      })
    }
    
    // Barbell (home with equipment)
    if (isHome && (hasEquipment('barbell') || hasEquipment('free_weights'))) {
      const bbPred = calculateRealisticPrediction('maintenance', 'barbell', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'barbell',
        weeks: bbPred.weeks,
        change: bbPred.value,
        changePerMonth: bbPred.value
      })
    }
    
    // Gym machines (pull-up bar is always available in gym)
    if (isGym) {
      // Add pull-up bar prediction for gym users
      const pbPred = calculateRealisticPrediction('maintenance', 'pullup_bar', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'pullup_bar',
        weeks: pbPred.weeks,
        change: pbPred.value,
        changePerMonth: pbPred.value
      })
      
      const gymPred = calculateRealisticPrediction('maintenance', 'machines', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'gym',
        weeks: gymPred.weeks,
        change: gymPred.value,
        changePerMonth: gymPred.value
      })
    }
    
    const mainPrediction = predictionsByEquipment[0]
    return {
      weeksToGoal: 4,
      weeklyChange: 0,
      prediction: isRu 
        ? `Ты укрепишь здоровье и улучшишь тонус мышц на ${mainPrediction?.value || '+70-105%'} за 4 недели!`
        : `You will strengthen your health and improve muscle tone by ${mainPrediction?.value || '+70-105%'} in 4 weeks!`,
      predictionsByEquipment
    }
  }

  // Handle endurance goal - percentage-based
  if (fitnessGoal === 'endurance') {
    const predictionsByEquipment: { equipment: string; weeks: number; change: string; changePerMonth: string }[] = []
    
    // Get available equipment types based on location
    const hasEquipment = (eq: string) => equipment.some(e => e.toLowerCase().includes(eq.toLowerCase()))
    const isHome = trainingLocation === 'home' || trainingLocation === 'both'
    const isGym = trainingLocation === 'gym' || trainingLocation === 'both'

    // Bodyweight (always available)
    const bwPred = calculateRealisticPrediction('endurance', 'bodyweight', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'bodyweight',
      weeks: bwPred.weeks,
      change: bwPred.value,
      changePerMonth: bwPred.value
    })

    // Pull-up bar (home with equipment) - excellent for muscular endurance
    if (isHome && hasEquipment('pullup_bar')) {
      const pbPred = calculateRealisticPrediction('endurance', 'pullup_bar', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'pullup_bar',
        weeks: pbPred.weeks,
        change: pbPred.value,
        changePerMonth: pbPred.value
      })
    }

    // Dumbbells (home with equipment)
    if (isHome && (hasEquipment('dumbbells') || hasEquipment('free_weights'))) {
      const dbPred = calculateRealisticPrediction('endurance', 'dumbbells', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'dumbbells',
        weeks: dbPred.weeks,
        change: dbPred.value,
        changePerMonth: dbPred.value
      })
    }

    // Barbell (home with equipment)
    if (isHome && (hasEquipment('barbell') || hasEquipment('free_weights'))) {
      const bbPred = calculateRealisticPrediction('endurance', 'barbell', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'barbell',
        weeks: bbPred.weeks,
        change: bbPred.value,
        changePerMonth: bbPred.value
      })
    }

    // Gym machines (pull-up bar is always available in gym)
    if (isGym) {
      // Add pull-up bar prediction for gym users
      const pbPred = calculateRealisticPrediction('endurance', 'pullup_bar', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'pullup_bar',
        weeks: pbPred.weeks,
        change: pbPred.value,
        changePerMonth: pbPred.value
      })
      
      const gymPred = calculateRealisticPrediction('endurance', 'machines', fitnessLevel, gender, language)
      predictionsByEquipment.push({
        equipment: 'gym',
        weeks: gymPred.weeks,
        change: gymPred.value,
        changePerMonth: gymPred.value
      })
    }

    const mainPrediction = predictionsByEquipment[0]
    const isRu = language === 'ru'
    return {
      weeksToGoal: 6,
      weeklyChange: 3,
      prediction: isRu 
        ? `Твоя выносливость увеличится на ${mainPrediction?.change || '+15-25%'} за 6 недель`
        : `Your endurance will increase by ${mainPrediction?.change || '+15-25%'} in 6 weeks`,
      predictionsByEquipment
    }
  }

  // Handle weight-based goals (fat_loss, muscle_gain)
  if (weightDiff === 0) {
    const isRu = language === 'ru'
    return {
      weeksToGoal: 0,
      weeklyChange: 0,
      prediction: isRu ? 'Цель достигнута!' : 'Goal achieved!',
      predictionsByEquipment: []
    }
  }

  // Build predictions by available equipment
  const predictionsByEquipment: { equipment: string; weeks: number; change: string; changePerMonth: string }[] = []
  const hasEquipment = (eq: string) => equipment.some(e => e.toLowerCase().includes(eq.toLowerCase()))
  const isHome = trainingLocation === 'home' || trainingLocation === 'both'
  const isGym = trainingLocation === 'gym' || trainingLocation === 'both'

  // Bodyweight (always available)
  const bwPred = calculateRealisticPrediction(fitnessGoal, 'bodyweight', fitnessLevel, gender, language)
  predictionsByEquipment.push({
    equipment: 'bodyweight',
    weeks: bwPred.weeks,
    change: bwPred.value,
    changePerMonth: bwPred.value
  })

  // Pull-up bar (home with equipment) - excellent for back/biceps muscle gain and fat loss
  if (isHome && hasEquipment('pullup_bar')) {
    const pbPred = calculateRealisticPrediction(fitnessGoal, 'pullup_bar', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'pullup_bar',
      weeks: pbPred.weeks,
      change: pbPred.value,
      changePerMonth: pbPred.value
    })
  }

  // Dumbbells (home with equipment)
  if (isHome && (hasEquipment('dumbbells') || hasEquipment('гантел') || hasEquipment('free_weights'))) {
    const dbPred = calculateRealisticPrediction(fitnessGoal, 'dumbbells', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'dumbbells',
      weeks: dbPred.weeks,
      change: dbPred.value,
      changePerMonth: dbPred.value
    })
  }

  // Barbell (home with equipment)
  if (isHome && (hasEquipment('barbell') || hasEquipment('штанга') || hasEquipment('free_weights'))) {
    const bbPred = calculateRealisticPrediction(fitnessGoal, 'barbell', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'barbell',
      weeks: bbPred.weeks,
      change: bbPred.value,
      changePerMonth: bbPred.value
    })
  }

  // Gym machines (pull-up bar is always available in gym)
  if (isGym) {
    // Add pull-up bar prediction for gym users
    const pbPred = calculateRealisticPrediction(fitnessGoal, 'pullup_bar', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'pullup_bar',
      weeks: pbPred.weeks,
      change: pbPred.value,
      changePerMonth: pbPred.value
    })
    
    const gymPred = calculateRealisticPrediction(fitnessGoal, 'machines', fitnessLevel, gender, language)
    predictionsByEquipment.push({
      equipment: 'gym',
      weeks: gymPred.weeks,
      change: gymPred.value,
      changePerMonth: gymPred.value
    })
  }

  // Calculate main prediction based on user's primary equipment
  const getPrimaryEquipment = (): string => {
    if (isGym && (trainingLocation === 'gym' || hasEquipment('gym'))) return 'gym'
    if (hasEquipment('barbell') || hasEquipment('штанга')) return 'barbell'
    if (hasEquipment('dumbbells') || hasEquipment('гантел')) return 'dumbbells'
    if (hasEquipment('pullup_bar')) return 'pullup_bar'
    return 'bodyweight'
  }

  const primaryEquip = getPrimaryEquipment()
  const mainPrediction = predictionsByEquipment.find(p => p.equipment === primaryEquip) || predictionsByEquipment[0]
  
  // Calculate weeks to goal based on primary equipment
  const pred = REALISTIC_PREDICTIONS[fitnessGoal]?.[primaryEquip as keyof typeof REALISTIC_PREDICTIONS['fat_loss']] as any
  let weeksToGoal = pred?.weeks || 4
  
  if (fitnessGoal === 'fat_loss' || fitnessGoal === 'muscle_gain') {
    const avgChange = pred ? (pred.min + pred.max) / 2 : 3
    weeksToGoal = Math.ceil(weightDiff / avgChange * (pred?.weeks || 4) / 4)
    weeksToGoal = Math.max(4, Math.min(weeksToGoal, 24))
  }

  const isRu = language === 'ru'
  let prediction = ''
  if (fitnessGoal === 'fat_loss') {
    prediction = isRu
      ? `Ты можешь похудеть на ${mainPrediction?.change || '-2-4 кг'} за ${mainPrediction?.weeks || 4} недель`
      : `You can lose ${mainPrediction?.change || '-2-4 kg'} in ${mainPrediction?.weeks || 4} weeks`
  } else if (fitnessGoal === 'muscle_gain') {
    prediction = isRu
      ? `Ты можешь набрать ${mainPrediction?.change || '+0.5-1 кг'} мышечной массы за ${mainPrediction?.weeks || 8} недель`
      : `You can gain ${mainPrediction?.change || '+0.5-1 kg'} of muscle in ${mainPrediction?.weeks || 8} weeks`
  }

  return {
    weeksToGoal,
    weeklyChange: pred?.min || 0.5,
    prediction,
    predictionsByEquipment,
    bodyweightPrediction: predictionsByEquipment.find(p => p.equipment === 'bodyweight')?.changePerMonth,
    dumbbellsPrediction: predictionsByEquipment.find(p => p.equipment === 'dumbbells')?.changePerMonth,
    barbellPrediction: predictionsByEquipment.find(p => p.equipment === 'barbell')?.changePerMonth,
    gymPrediction: predictionsByEquipment.find(p => p.equipment === 'gym')?.changePerMonth,
  }
}

export function calculateDailyCalories(
  weight: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  goal: string,
  activityLevel: number = 1.55 // moderate activity
): number {
  // Validate age
  if (age < 10 || age > 100) {
    throw new Error('Age must be between 10 and 100')
  }
  
  // Mifflin-St Jeor Equation
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161
  }
  
  const tdee = bmr * activityLevel
  
  // Adjust for goal
  switch (goal) {
    case 'fat_loss':
      return Math.round(tdee * 0.8) // 20% deficit
    case 'muscle_gain':
      return Math.round(tdee * 1.15) // 15% surplus
    default:
      return Math.round(tdee)
  }
}

export function calculateMacros(calories: number, goal: string) {
  let proteinRatio: number, carbsRatio: number, fatRatio: number
  
  switch (goal) {
    case 'fat_loss':
      proteinRatio = 0.35
      carbsRatio = 0.35
      fatRatio = 0.30
      break
    case 'muscle_gain':
      proteinRatio = 0.30
      carbsRatio = 0.45
      fatRatio = 0.25
      break
    case 'endurance':
      proteinRatio = 0.25
      carbsRatio = 0.55
      fatRatio = 0.20
      break
    default:
      proteinRatio = 0.30
      carbsRatio = 0.40
      fatRatio = 0.30
  }
  
  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
    carbs: Math.round((calories * carbsRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9), // 9 cal per gram
  }
}

// Validate age (10-100)
export function validateAge(age: number): { valid: boolean; error?: string; warning?: string } {
  if (age < 10 || age > 100) {
    return { 
      valid: false, 
      error: 'Age must be between 10 and 100 years' 
    }
  }
  if (age < 18) {
    return { 
      valid: true, 
      warning: 'Users under 18 should consult a doctor before starting training' 
    }
  }
  return { valid: true }
}

// Validate weight (10-600 kg)
export function validateWeight(weight: number): { valid: boolean; error?: string } {
  if (weight < 10 || weight > 600) {
    return { 
      valid: false, 
      error: 'Weight must be between 10 and 600 kg' 
    }
  }
  return { valid: true }
}

// Validate height (50-250 cm)
export function validateHeight(height: number): { valid: boolean; error?: string } {
  if (height < 50 || height > 250) {
    return { 
      valid: false, 
      error: 'Height must be between 50 and 250 cm' 
    }
  }
  return { valid: true }
}

// ============================================================================
// GOAL-SPECIFIC PROGRESS CALCULATION
// ============================================================================

/**
 * Progress data structure for different goal types
 */
export interface GoalProgressData {
  percentage: number
  currentValue: number | string
  targetValue: number | string
  initialValue: number | string
  unit: string
  statusText: string
  statusTextRu: string
  isGoalReached: boolean
  chartType: 'weight' | 'endurance' | 'stability' | 'activity'
  chartData?: { date: string; value: number }[]
}

/**
 * Calculate goal progress based on fitness goal type
 * Returns normalized progress data for UI display
 */
export function calculateGoalProgress(
  user: UserProfile | null,
  weightLogs: { date: string; weight: number }[],
  completedWorkoutsCount: number,
  language: 'ru' | 'en' = 'ru'
): GoalProgressData {
  const isRu = language === 'ru'
  
  // Default/fallback data
  const defaultData: GoalProgressData = {
    percentage: 0,
    currentValue: '--',
    targetValue: '--',
    initialValue: '--',
    unit: '',
    statusText: isRu ? 'Начни тренировки!' : 'Start training!',
    statusTextRu: 'Начни тренировки!',
    isGoalReached: false,
    chartType: 'weight'
  }
  
  if (!user) return defaultData
  
  const goal = user.fitnessGoal
  const currentWeight = user.currentWeight
  const targetWeight = user.targetWeight
  const initialWeight = user.initialWeight ?? currentWeight // Use current as initial if not set
  
  switch (goal) {
    case 'fat_loss': {
      // Progress = (initial - current) / (initial - target) * 100%
      // For fat loss, we want current < target, so initial > target
      
      // If goal is already achieved
      if (currentWeight <= targetWeight) {
        return {
          percentage: 100,
          currentValue: currentWeight,
          targetValue: targetWeight,
          initialValue: initialWeight,
          unit: 'кг',
          statusText: 'Goal achieved!',
          statusTextRu: 'Цель достигнута!',
          isGoalReached: true,
          chartType: 'weight',
          chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
        }
      }
      
      // If weight increased instead of decreased
      if (currentWeight > initialWeight) {
        return {
          percentage: 0,
          currentValue: currentWeight,
          targetValue: targetWeight,
          initialValue: initialWeight,
          unit: 'кг',
          statusText: `+${(currentWeight - initialWeight).toFixed(1)} kg from start`,
          statusTextRu: `+${(currentWeight - initialWeight).toFixed(1)} кг от старта`,
          isGoalReached: false,
          chartType: 'weight',
          chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
        }
      }
      
      const totalToLose = initialWeight - targetWeight
      const lost = initialWeight - currentWeight
      const percentage = totalToLose > 0 ? Math.min(100, Math.round((lost / totalToLose) * 100)) : 0
      
      return {
        percentage: Math.max(0, percentage),
        currentValue: currentWeight,
        targetValue: targetWeight,
        initialValue: initialWeight,
        unit: 'кг',
        statusText: `-${lost.toFixed(1)} kg lost`,
        statusTextRu: `-${lost.toFixed(1)} кг сброшено`,
        isGoalReached: false,
        chartType: 'weight',
        chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
      }
    }
    
    case 'muscle_gain': {
      // Progress = (current - initial) / (target - initial) * 100%
      // For muscle gain, we want current > target, so initial < target
      
      // If goal is already achieved
      if (currentWeight >= targetWeight) {
        return {
          percentage: 100,
          currentValue: currentWeight,
          targetValue: targetWeight,
          initialValue: initialWeight,
          unit: 'кг',
          statusText: 'Goal achieved!',
          statusTextRu: 'Цель достигнута!',
          isGoalReached: true,
          chartType: 'weight',
          chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
        }
      }
      
      // If weight decreased instead of increased
      if (currentWeight < initialWeight) {
        return {
          percentage: 0,
          currentValue: currentWeight,
          targetValue: targetWeight,
          initialValue: initialWeight,
          unit: 'кг',
          statusText: `${(currentWeight - initialWeight).toFixed(1)} kg from start`,
          statusTextRu: `${(currentWeight - initialWeight).toFixed(1)} кг от старта`,
          isGoalReached: false,
          chartType: 'weight',
          chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
        }
      }
      
      const totalToGain = targetWeight - initialWeight
      const gained = currentWeight - initialWeight
      const percentage = totalToGain > 0 ? Math.min(100, Math.round((gained / totalToGain) * 100)) : 0
      
      return {
        percentage: Math.max(0, percentage),
        currentValue: currentWeight,
        targetValue: targetWeight,
        initialValue: initialWeight,
        unit: 'кг',
        statusText: `+${gained.toFixed(1)} kg gained`,
        statusTextRu: `+${gained.toFixed(1)} кг набрано`,
        isGoalReached: false,
        chartType: 'weight',
        chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
      }
    }
    
    case 'endurance': {
      // For endurance, we track workout count or run time
      // Use currentEndurance if set, otherwise start from initial
      
      const initialEndurance = user.initialEndurance
      const targetEndurance = user.targetEndurance
      const currentEndurance = user.currentEndurance // User's actual recorded value
      const enduranceMetric = user.enduranceMetric
      
      if (initialEndurance && targetEndurance) {
        // Determine if higher is better (plank, pushups) or lower is better (running)
        const higherIsBetter = enduranceMetric === 'plank' || enduranceMetric === 'pushups'
        
        // Use actual recorded value, or initial value as starting point
        // For new users without recorded results, show initial as current with 0% progress
        const actualCurrent = currentEndurance ?? initialEndurance
        
        // Calculate improvement based on metric type
        let percentage = 0
        let isGoalReached = false
        
        if (higherIsBetter) {
          // For plank/pushups: higher = better
          const totalImprovement = targetEndurance - initialEndurance
          const improvement = actualCurrent - initialEndurance
          percentage = totalImprovement > 0 ? Math.min(100, Math.round((improvement / totalImprovement) * 100)) : 0
          isGoalReached = actualCurrent >= targetEndurance
        } else {
          // For running: lower time = better
          const totalImprovement = initialEndurance - targetEndurance
          const improvement = initialEndurance - actualCurrent
          percentage = totalImprovement > 0 ? Math.min(100, Math.round((improvement / totalImprovement) * 100)) : 0
          isGoalReached = actualCurrent <= targetEndurance
        }
        
        // Determine unit based on metric
        const unit = enduranceMetric === 'plank' 
          ? (isRu ? 'сек' : 'sec')
          : enduranceMetric?.includes('run')
            ? (isRu ? 'мин' : 'min')
            : (isRu ? 'раз' : 'reps')
        
        return {
          percentage: Math.max(0, percentage),
          currentValue: actualCurrent,
          targetValue: targetEndurance,
          initialValue: initialEndurance,
          unit,
          statusText: isGoalReached 
            ? 'Goal achieved!' 
            : `${actualCurrent} ${unit}`,
          statusTextRu: isGoalReached 
            ? 'Цель достигнута!' 
            : `${actualCurrent} ${unit}`,
          isGoalReached,
          chartType: 'endurance',
          chartData: currentEndurance 
            ? generateEnduranceChartData(initialEndurance, targetEndurance, actualCurrent, completedWorkoutsCount)
            : [] // No chart data for new users without recorded results
        }
      }
      
      // Fallback: use workout count as endurance indicator
      const enduranceLevel = Math.min(100, completedWorkoutsCount * 5) // 5% per workout
      
      return {
        percentage: enduranceLevel,
        currentValue: completedWorkoutsCount,
        targetValue: 20, // Target: 20 workouts
        initialValue: 0,
        unit: isRu ? 'тренировок' : 'workouts',
        statusText: `${completedWorkoutsCount} workouts completed`,
        statusTextRu: `${completedWorkoutsCount} тренировок завершено`,
        isGoalReached: completedWorkoutsCount >= 20,
        chartType: 'activity',
        chartData: generateActivityChartData(completedWorkoutsCount)
      }
    }
    
    case 'maintenance': {
      // For maintenance, show weight stability or activity level
      const weightRange = 2 // Target range: ±2 kg
      const weightDeviation = Math.abs(currentWeight - targetWeight)
      const isStable = weightDeviation <= weightRange
      
      // Calculate stability percentage (100% = perfect stability within range)
      const stabilityPercentage = isStable 
        ? Math.round(100 - (weightDeviation / weightRange) * 50) 
        : Math.max(0, Math.round(100 - (weightDeviation / 5) * 100))
      
      return {
        percentage: stabilityPercentage,
        currentValue: currentWeight,
        targetValue: `${targetWeight - weightRange}-${targetWeight + weightRange}`,
        initialValue: targetWeight,
        unit: 'кг',
        statusText: isStable ? 'Weight is stable!' : `${weightDeviation.toFixed(1)} kg from target range`,
        statusTextRu: isStable ? 'Вес стабилен!' : `${weightDeviation.toFixed(1)} кг от целевого диапазона`,
        isGoalReached: isStable,
        chartType: 'stability',
        chartData: weightLogs.map(w => ({ date: w.date, value: w.weight }))
      }
    }
    
    default:
      return defaultData
  }
}

/**
 * Generate endurance chart data based on user's recorded results
 */
function generateEnduranceChartData(
  initialValue: number,
  targetValue: number,
  currentValue: number,
  workoutsCompleted: number
): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = []
  
  // Start with initial value
  const now = Date.now()
  
  // Add initial point
  data.push({
    date: new Date(now - workoutsCompleted * 24 * 60 * 60 * 1000).toISOString(),
    value: initialValue
  })
  
  // Add intermediate points based on progress
  const totalPoints = Math.min(workoutsCompleted + 1, 10)
  for (let i = 1; i < totalPoints - 1; i++) {
    const progress = i / (totalPoints - 1)
    const value = initialValue - (initialValue - currentValue) * progress
    const date = new Date(now - (totalPoints - 1 - i) * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toISOString(),
      value: Math.max(targetValue, value)
    })
  }
  
  // Add current value
  data.push({
    date: new Date().toISOString(),
    value: currentValue
  })
  
  return data
}

/**
 * Generate activity chart data based on workout count
 */
function generateActivityChartData(workoutsCompleted: number): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = []
  const weeks = Math.min(Math.ceil(workoutsCompleted / 3) + 1, 8)
  
  for (let i = 0; i < weeks; i++) {
    const date = new Date(Date.now() - (weeks - 1 - i) * 7 * 24 * 60 * 60 * 1000)
    const weekWorkouts = Math.min(3, Math.max(0, workoutsCompleted - (weeks - 1 - i) * 3))
    data.push({
      date: date.toISOString(),
      value: weekWorkouts
    })
  }
  
  return data
}

// Validate target weight based on goal
export function validateTargetWeight(
  currentWeight: number,
  targetWeight: number,
  goal: string
): { valid: boolean; error?: string; warning?: string; prediction?: string } {
  
  const diff = targetWeight - currentWeight
  const absDiff = Math.abs(diff)
  
  switch (goal) {
    case 'fat_loss':
      if (targetWeight >= currentWeight) {
        return {
          valid: true,
          warning: 'For fat loss, target weight should be less than current weight',
          prediction: `You might want to set a target below ${currentWeight} kg for fat loss`
        }
      }
      // Safe weight loss: 0.5-1 kg per week
      const weeksToLose = Math.ceil(absDiff / 0.75)
      return {
        valid: true,
        prediction: `Estimated time to reach goal: ${weeksToLose} weeks at safe rate (0.5-1 kg/week)`
      }
      
    case 'muscle_gain':
      if (targetWeight <= currentWeight) {
        return {
          valid: true,
          warning: 'For muscle gain, target weight should be greater than current weight',
          prediction: `You might want to set a target above ${currentWeight} kg for muscle gain`
        }
      }
      // Safe muscle gain: 0.25-0.5 kg per week
      const weeksToGain = Math.ceil(absDiff / 0.35)
      return {
        valid: true,
        prediction: `Estimated time to reach goal: ${weeksToGain} weeks at safe rate (0.25-0.5 kg/week)`
      }
      
    case 'maintenance':
      if (absDiff > 3) {
        return {
          valid: true,
          warning: 'For maintenance, target weight should be close to current weight (±2-3 kg)'
        }
      }
      return { valid: true, prediction: 'Maintaining current weight - great goal!' }
      
    default:
      return { valid: true }
  }
}

// Export isMessageOnTopic for use in components
export { isMessageOnTopic }
