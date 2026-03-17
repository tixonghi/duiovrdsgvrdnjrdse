'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Utensils, TrendingUp, MessageCircle, Moon, Sun,
  ChevronRight, Check, Target, Activity, User, Zap, Crown,
  Play, Pause, RotateCcw, Send, X, Sparkles, Heart, Award,
  Flame, Clock, ChefHat, AlertCircle, Wallet, Languages,
  Settings, BarChart3, Home, Menu, Weight, RefreshCw, SkipForward,
  Minus, Plus, ThumbsUp, ThumbsDown, Meh, Angry, ArrowRightLeft, Calendar,
  CalendarCheck, TrendingDown, Scale, LineChart as LineChartIcon, Lock
} from 'lucide-react'
import {
  useAppStore,
  calculateDailyCalories,
  calculateMacros,
  validateAge,
  isMessageOnTopic,
  calculateWorkoutDays,
  calculateGoalPrediction,
  calculateGoalProgress,
  getAvailableEquipmentByLocation,
  EQUIPMENT_CATEGORIES,
  type UserProfile,
  type WorkoutDay,
  type Exercise,
  type Meal,
  type CompletedWorkout,
  type UserProgress,
  type SkippedExercise,
  type WorkoutFeedbackEntry,
  type GoalProgressData,
  type WarmupExercise,
  type UserAchievement,
  type ExerciseFeedbackDetail,
  type WorkoutFeedbackSummary,
  type GoalHistoryEntry,
  getAchievementsForGoal,
  EXERCISE_PROGRESSIONS,
  type ExerciseProgression,
  type ProgressionExercise,
  ACHIEVEMENTS,
  LEVEL_THRESHOLDS,
  calculateUserLevel,
  calculateTotalXp,
  EXERCISE_DATABASE,
  findAlternativeExercises,
  type ExerciseDatabaseItem,
  // NEW: Progression system imports
  type RPELevel,
  type ExerciseRPEFeedback,
  type DifficultyModifiers,
  type SkillTreeGroup,
  type SkillTreeNode,
  DIFFICULTY_MODIFIERS,
  // Exercise video mapping
  getExerciseVideoUrl,
  hasExerciseVideo,
  // Theme and weight unit
  type WeightUnit,
  type ThemeSource,
  kgToLbs,
  lbsToKg,
  formatWeight,
  getSystemTheme,
} from '@/lib/store'
import {
  translations,
  t,
  Language,
  BUDGET_OPTIONS,
  CHAT_LIMITS
} from '@/lib/translations'
import {
  formatPrice,
  formatBudget,
  formatMealCost,
  getSubscriptionPrice,
  getBudgetOptions
} from '@/lib/currency'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'

// ============================================================================
// CONSTANTS
// ============================================================================

const ONBOARDING_STEPS = [
  { id: 'welcome', titleKey: 'onboarding.welcome.title', subtitleKey: 'onboarding.welcome.subtitle' },
  { id: 'language', titleKey: 'onboarding.language.title', subtitleKey: 'onboarding.language.subtitle' },
  { id: 'basics', titleKey: 'onboarding.basics.title', subtitleKey: 'onboarding.basics.subtitle' },
  { id: 'goals', titleKey: 'onboarding.goals.title', subtitleKey: 'onboarding.goals.subtitle' },
  { id: 'body', titleKey: 'onboarding.body.title', subtitleKey: 'onboarding.body.subtitle' },
  { id: 'level', titleKey: 'onboarding.level.title', subtitleKey: 'onboarding.level.subtitle' },
  { id: 'equipment', titleKey: 'onboarding.equipment.title', subtitleKey: 'onboarding.equipment.subtitle' },
]

// Exercises that require full-body visibility (vertical movement like squats, lunges, push-ups)
// For these, we use object-contain to show the full person without cropping
const TALL_FRAME_EXERCISES = [
  'fb-001',  // Push-ups (Отжимания)
  'fb-002',  // Wide Push-ups (Широкие отжимания)
  'fb-003',  // Diamond Push-ups (Алмазные отжимания)
  'fb-004',  // Incline Push-ups (Отжимания от скамьи)
  'fb-005',  // Decline Push-ups (Отжимания с ногами на скамье)
  'fb-006',  // Bodyweight Squats (Приседания)
  'fb-007',  // Sumo Squats (Сумо-приседания)
  'fb-008',  // Lunges (Выпады)
  'fb-009',  // Bulgarian Split Squats (Болгарские сплит-приседания)
  'fb-024',  // Dumbbell Goblet Squats (Гоблет-приседания)
  'fb-025',  // Dumbbell Lunges (Выпады с гантелями)
  'fb-026',  // Dumbbell Deadlifts (Становая тяга с гантелями)
  'fb-028',  // Barbell Squats (Приседания со штангой)
  'fb-029',  // Barbell Deadlifts (Становая тяга)
]


// Subscription plans in USD
const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    nameKey: 'subscription.free',
    price: 'Free',
    periodKey: '',
    features: [
      'subscription.trial',
      'subscription.basicWorkouts',
      'subscription.noAdaptation',
      'subscription.chatLimits.free',
    ],
  },
  {
    id: 'pro',
    nameKey: 'Pro',
    price: '$5',
    periodKey: 'subscription.perMonth',
    features: [
      'subscription.allWorkouts',
      'subscription.mealPlans',
      'subscription.monthlyAdaptation',
      'subscription.support',
      'subscription.chatLimits.pro',
    ],
    popular: true,
  },
  {
    id: 'elite',
    nameKey: 'Elite',
    price: '$10',
    periodKey: 'subscription.perMonth',
    features: [
      'subscription.weeklyAdaptation',
      'subscription.aiChat247',
      'subscription.fridgeAnalysis',
      'subscription.prioritySupport',
      'subscription.chatLimits.elite',
    ],
  },
]

// ============================================================================
// PROGRESS BAR COLOR HELPER - Unified color logic for progress bars
// ============================================================================

/**
 * Get progress bar color class based on percentage
 * 0-25%: red (needs attention)
 * 26-50%: orange (below average)
 * 51-75%: amber/yellow (good progress)
 * 76-100%: green (excellent)
 */
function getProgressBarColorClass(percentage: number, isGoalReached: boolean = false): string {
  if (isGoalReached || percentage >= 76) {
    return 'bg-gradient-to-r from-emerald-500 to-emerald-400'
  }
  if (percentage >= 51) {
    return 'bg-gradient-to-r from-amber-500 to-amber-400'
  }
  if (percentage >= 26) {
    return 'bg-gradient-to-r from-orange-500 to-orange-400'
  }
  return 'bg-gradient-to-r from-rose-500 to-rose-400'
}

/**
 * Get progress bar text color class based on percentage
 */
function getProgressTextClass(percentage: number, isGoalReached: boolean = false): string {
  if (isGoalReached || percentage >= 76) {
    return 'text-emerald-500'
  }
  if (percentage >= 51) {
    return 'text-amber-500'
  }
  if (percentage >= 26) {
    return 'text-orange-500'
  }
  return 'text-rose-500'
}

/**
 * Get progress status label
 */
function getProgressStatusLabel(percentage: number, isGoalReached: boolean, language: 'ru' | 'en'): string {
  if (isGoalReached) {
    return language === 'ru' ? 'Цель достигнута!' : 'Goal reached!'
  }
  if (percentage >= 76) {
    return language === 'ru' ? 'Отлично!' : 'Excellent!'
  }
  if (percentage >= 51) {
    return language === 'ru' ? 'Хороший прогресс' : 'Good progress'
  }
  if (percentage >= 26) {
    return language === 'ru' ? 'Есть прогресс' : 'Making progress'
  }
  return language === 'ru' ? 'Начало пути' : 'Just started'
}

// ============================================================================
// WEIGHT STABILITY SCALE COMPONENT (for maintenance goal)
// ============================================================================

interface WeightStabilityScaleProps {
  currentWeight: number
  targetWeight: number
  language: 'ru' | 'en'
}

function WeightStabilityScale({ currentWeight, targetWeight, language }: WeightStabilityScaleProps) {
  // Calculate the range and position
  const range = 5 // ±5 kg from target
  const minWeight = targetWeight - range
  const maxWeight = targetWeight + range
  
  // Calculate position percentage (0-100)
  const position = Math.max(0, Math.min(100, ((currentWeight - minWeight) / (maxWeight - minWeight)) * 100))
  
  // Determine zone and color
  const getZoneInfo = () => {
    const diff = currentWeight - targetWeight
    const absDiff = Math.abs(diff)
    
    if (absDiff <= 1) {
      // Green zone - within ±1 kg
      return {
        zone: 'green',
        markerColor: 'bg-green-500',
        ringColor: 'ring-green-500/30',
        textColor: 'text-green-500',
        label: language === 'ru' ? 'Идеально' : 'Perfect',
        description: language === 'ru' ? 'Вес в целевом диапазоне' : 'Weight in target range'
      }
    } else if (absDiff <= 2) {
      // Yellow zone - within ±2 kg
      return {
        zone: 'yellow',
        markerColor: 'bg-amber-500',
        ringColor: 'ring-amber-500/30',
        textColor: 'text-amber-500',
        label: language === 'ru' ? 'Хорошо' : 'Good',
        description: language === 'ru' ? 'Близко к целевому' : 'Close to target'
      }
    } else {
      // Red zone - more than ±2 kg
      return {
        zone: 'red',
        markerColor: 'bg-red-500',
        ringColor: 'ring-red-500/30',
        textColor: 'text-red-500',
        label: language === 'ru' ? 'Внимание' : 'Attention',
        description: language === 'ru' ? 'Вне целевого диапазона' : 'Outside target range'
      }
    }
  }
  
  const zoneInfo = getZoneInfo()
  
  return (
    <div className="mb-4">
      {/* Visual Scale */}
      <div className="relative h-8 mb-1">
        {/* Scale background with gradient */}
        <div className="absolute inset-y-0 left-0 right-0 rounded-full overflow-hidden">
          {/* Red zone (left) */}
          <div className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-red-500 to-red-400" />
          {/* Yellow zone (left) */}
          <div className="absolute inset-y-0 left-[20%] w-[15%] bg-gradient-to-r from-red-400 to-amber-400" />
          {/* Green zone (center) */}
          <div className="absolute inset-y-0 left-[35%] w-[30%] bg-gradient-to-r from-amber-400 via-green-500 to-amber-400" />
          {/* Yellow zone (right) */}
          <div className="absolute inset-y-0 right-[20%] w-[15%] bg-gradient-to-r from-amber-400 to-red-400" />
          {/* Red zone (right) */}
          <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-r from-red-400 to-red-500" />
        </div>
        
        {/* Position marker */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${zoneInfo.markerColor} ring-4 ${zoneInfo.ringColor} shadow-lg z-10`}
          style={{ left: `calc(${position}% - 12px)` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        />
      </div>
      
      {/* Scale labels - positioned exactly under scale zones */}
      <div className="relative h-5 text-xs text-muted-foreground">
        {/* Min weight - left edge (0%) */}
        <span className="absolute left-0 -translate-x-0">{(targetWeight - 5).toFixed(0)}</span>
        {/* Yellow boundary left - at 20% */}
        <span className="absolute left-[20%] -translate-x-1/2">{(targetWeight - 3).toFixed(0)}</span>
        {/* Target weight - center (50%) */}
        <span className="absolute left-1/2 -translate-x-1/2 text-green-500 font-medium">{targetWeight.toFixed(0)}</span>
        {/* Yellow boundary right - at 80% */}
        <span className="absolute left-[80%] -translate-x-1/2">{(targetWeight + 3).toFixed(0)}</span>
        {/* Max weight - right edge (100%) */}
        <span className="absolute right-0 translate-x-0">{(targetWeight + 5).toFixed(0)}</span>
      </div>
      
      {/* Zone legend */}
      <div className="flex items-center justify-center gap-4 text-xs mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{language === 'ru' ? 'Норма' : 'Normal'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">{language === 'ru' ? 'Близко' : 'Close'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">{language === 'ru' ? 'Внимание' : 'Alert'}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CIRCULAR PROGRESS COMPONENT
// ============================================================================

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  currentValue: number | string
  unit?: string
  label?: string
  language: 'ru' | 'en'
  isGoalReached?: boolean
  color?: 'primary' | 'green' | 'yellow' | 'orange' | 'red'
  showPercentage?: boolean
  children?: React.ReactNode
  autoColor?: boolean // Automatically determine color based on percentage
}

function CircularProgress({ 
  percentage, 
  size = 140, 
  strokeWidth = 10,
  currentValue,
  unit = '',
  label,
  language,
  isGoalReached = false,
  color = 'primary',
  showPercentage = true,
  children,
  autoColor = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  // Track previous percentage for smooth animation
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  
  useEffect(() => {
    // Animate to new percentage
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 50)
    return () => clearTimeout(timer)
  }, [percentage])
  
  const animatedOffset = circumference - (animatedPercentage / 100) * circumference
  
  // Auto-determine color based on percentage
  // Red: 0-25% (poor), Orange: 26-50% (below avg), Yellow: 51-75% (avg), Green: 76-100% (excellent)
  const getAutoColor = (): 'green' | 'yellow' | 'orange' | 'red' => {
    if (isGoalReached || percentage >= 76) return 'green'
    if (percentage >= 51) return 'yellow'
    if (percentage >= 26) return 'orange'
    return 'red'
  }

  // Vibrant, high-contrast colors that work in both light and dark themes
  const colorClasses = {
    primary: { stroke: 'stroke-primary', bg: 'stroke-primary/20', text: 'text-primary' },
    green: { stroke: 'stroke-emerald-500', bg: 'stroke-emerald-500/25', text: 'text-emerald-500' },
    yellow: { stroke: 'stroke-amber-400', bg: 'stroke-amber-400/25', text: 'text-amber-400' },
    orange: { stroke: 'stroke-orange-500', bg: 'stroke-orange-500/25', text: 'text-orange-500' },
    red: { stroke: 'stroke-rose-500', bg: 'stroke-rose-500/25', text: 'text-rose-500' },
  }

  // Use auto color if enabled, otherwise use provided color
  const effectiveColor = autoColor ? getAutoColor() : color
  const colors = colorClasses[isGoalReached ? 'green' : effectiveColor]

  // Get status label based on progress zones
  const getStatusLabel = () => {
    if (isGoalReached || percentage >= 76) {
      return language === 'ru' ? 'Отлично!' : 'Excellent!'
    }
    if (percentage >= 51) {
      return language === 'ru' ? 'Хорошо' : 'Good'
    }
    if (percentage >= 26) {
      return language === 'ru' ? 'Прогресс' : 'Progress'
    }
    return language === 'ru' ? 'Начало' : 'Starting'
  }
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={colors.bg}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors.stroke}
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animatedOffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        {children || (
          <>
            <span className="text-2xl font-bold">{currentValue}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            {showPercentage && (
              <span className={`text-sm font-medium ${colors.text}`}>
                {isGoalReached 
                  ? (language === 'ru' ? 'Цель!' : 'Goal!') 
                  : getStatusLabel()}
              </span>
            )}
            {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ACHIEVEMENT TILE COMPONENT (Compact)
// ============================================================================

interface AchievementTileProps {
  achievement: typeof ACHIEVEMENTS[0]
  userAchievement?: UserAchievement
  language: 'ru' | 'en'
  onClick?: () => void
}

function AchievementTile({ achievement, userAchievement, language, onClick }: AchievementTileProps) {
  const progress = userAchievement?.progress || 0
  const completed = userAchievement?.completed || false
  const claimed = userAchievement?.claimed || false
  const percentage = Math.min(100, (progress / achievement.requirement) * 100)
  
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
        completed 
          ? 'bg-primary/10 border-2 border-primary/30 hover:border-primary/50' 
          : 'bg-secondary/30 border-2 border-transparent hover:border-border'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Circular progress background */}
      <div className="relative w-14 h-14">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted/30"
          />
          <motion.circle
            cx="18" cy="18" r="15.5"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className={completed ? 'stroke-primary' : 'stroke-primary/60'}
            style={{
              strokeDasharray: `${percentage} 100`,
            }}
            initial={{ strokeDasharray: '0 100' }}
            animate={{ strokeDasharray: `${percentage} 100` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Icon in center */}
        <div className={`absolute inset-0 flex items-center justify-center text-xl ${
          completed ? '' : 'opacity-70'
        }`}>
          {achievement.icon}
        </div>
        
        {/* Claim indicator */}
        {completed && !claimed && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"
          >
            <span className="text-[10px] text-white font-bold">!</span>
          </motion.div>
        )}
      </div>
      
      {/* Name */}
      <p className="text-xs font-medium mt-2 text-center leading-tight line-clamp-2">
        {language === 'ru' ? achievement.nameRu : achievement.name}
      </p>
      
      {/* XP */}
      <span className="text-[10px] text-amber-500 font-medium mt-0.5">+{achievement.xpReward} XP</span>
    </motion.button>
  )
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function BodyGeniusApp() {
  const {
    user, setUser, updateUser, updateSubscriptionTier,
    language, setLanguage,
    currentOnboardingStep, setOnboardingStep,
    workoutPlan, setWorkoutPlan,
    currentWorkoutDay, setCurrentWorkoutDay, updateCurrentWorkoutDay,
    currentExerciseIndex, setCurrentExerciseIndex,
    completedSets, setCompletedSets,
    weightLogs, addWeightLog,
    completedWorkouts, markWorkoutComplete, markWorkoutCompleteDirect, getWeekProgress, canUpdatePlan,
    nutritionPlan, setNutritionPlan,
    selectedMeal, setSelectedMeal,
    chatMessages, addChatMessage, updateChatMessage, clearChat,
    canSendChatMessage, getRemainingChatMessages,
    activeTab, setActiveTab,
    isDarkMode, toggleDarkMode,
    isGeneratingPlan, setIsGeneratingPlan,
    isAiTyping, setIsAiTyping,
    // Hydration state for theme
    _hasHydrated,
    // Achievements
    resetAchievementsOnSubscriptionChange,
    // User Progress (Smart Progression System)
    userProgress, updateMuscleGroupLevel, skipExercise, addWorkoutFeedback,
    updatePreferredRestTime, getExerciseProgression, getCurrentExerciseForLevel,
    advanceProgression, decreaseProgression,
    // NEW: RPE and skill tree methods
    recordExerciseRPE, getExerciseStats, applyModifier, removeModifier,
    checkAdvancementReadiness, unlockNextLevel, getSkillTreeData,
    // NEW: Detailed exercise feedback methods
    recordExerciseFeedback, recordWorkoutFeedbackSummary, getExerciseFeedbackStats,
    getAdaptivePlanAdjustments, resetWorkoutProgress,
    // Theme and weight unit
    themeSource, setThemeSource,
    weightUnit, setWeightUnit,
  } = useAppStore()

  // Local state
  const [onboardingData, setOnboardingData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    age: 25,
    gender: 'male',
    height: 175,
    currentWeight: 75,
    targetWeight: 70,
    fitnessGoal: 'fat_loss',
    fitnessLevel: 'beginner',
    equipment: [],
    trainingLocation: 'home',
    budget: 50, // USD per week
    language: 'ru',
    // Endurance-specific fields
    initialEndurance: 30, // Current endurance metric (e.g., run time in minutes)
    targetEndurance: 25, // Target endurance metric
    enduranceMetric: 'run_5km', // Type of endurance metric
    // Maintenance-specific fields
    weightRangeMin: undefined, // Lower bound of target weight range
    weightRangeMax: undefined, // Upper bound of target weight range
  })
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [showSubscription, setShowSubscription] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [ageError, setAgeError] = useState<string | null>(null)
  const [ageWarning, setAgeWarning] = useState<string | null>(null)
  const [customBudget, setCustomBudget] = useState('')
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [targetWeightWarning, setTargetWeightWarning] = useState<string | null>(null)
  const [heightError, setHeightError] = useState<string | null>(null)
  const [weightError, setWeightError] = useState<string | null>(null)
  const [targetWeightError, setTargetWeightError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [aiPrediction, setAiPrediction] = useState<string | null>(null)
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false)
  const [showFridgeAnalysis, setShowFridgeAnalysis] = useState(false)
  const [fridgeProducts, setFridgeProducts] = useState<{id: string; name: string; nameRu: string; category: string; calories: number; protein: number; carbs: number; fat: number; available: boolean}[]>([])
  const [fridgeRecipes, setFridgeRecipes] = useState<any[]>([])
  const [isAnalyzingFridge, setIsAnalyzingFridge] = useState(false)
  const [isPredictionHidden, setIsPredictionHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('predictionHidden') === 'true'
      } catch {
        return false
      }
    }
    return false
  })
  const [customEquipmentInput, setCustomEquipmentInput] = useState('')

  // New states for Smart Progression System
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  
  // NEW: Skill Tree visualization
  const [showSkillTree, setShowSkillTree] = useState(false)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  
  // NEW: Level up notification
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ muscleGroup: string; newLevel: number; exerciseName: string } | null>(null)
  
  // Endurance result modal
  const [showEnduranceModal, setShowEnduranceModal] = useState(false)
  const [newEnduranceValue, setNewEnduranceValue] = useState('')
  
  // Achievement detail modal
  const [selectedAchievement, setSelectedAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  
  // Achievement notification
  const [achievementNotification, setAchievementNotification] = useState<typeof ACHIEVEMENTS[0] | null>(null)
  const [showAchievementNotification, setShowAchievementNotification] = useState(false)
  
  // Profile settings states
  const [pendingGoalChange, setPendingGoalChange] = useState<'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance' | null>(null)
  const [showGoalConfirmModal, setShowGoalConfirmModal] = useState(false)
  const [settingsNotification, setSettingsNotification] = useState<{ show: boolean; type: string }>({ show: false, type: '' })
  const [showAchievementsResetNotification, setShowAchievementsResetNotification] = useState(false)

  // Plan generation error state
  const [planGenerationError, setPlanGenerationError] = useState<string | null>(null)
  const [planGenerationRetryCount, setPlanGenerationRetryCount] = useState(0)

  // Track previous achievements to detect new ones
  // Using useRef to avoid infinite re-render loop (useState in useEffect dependencies causes loop)
  const prevCompletedAchievementIdsRef = useRef<Set<string>>(new Set())

  // Show notification when new achievement is earned (only once per achievement)
  useEffect(() => {
    if (user?.achievements) {
      // Get current completed achievement IDs
      const currentCompletedIds = new Set(
        user.achievements
          .filter(a => a.completed)
          .map(a => a.achievementId)
      )

      // Find newly completed achievements (in current but not in previous)
      const prevIds = prevCompletedAchievementIdsRef.current
      const newIds = [...currentCompletedIds].filter(id => !prevIds.has(id))

      if (newIds.length > 0 && prevIds.size > 0) {
        // Find the first newly completed achievement
        const newAchievementId = newIds[0]
        const newAchievement = user.achievements.find(a => a.achievementId === newAchievementId)

        if (newAchievement) {
          const achievement = ACHIEVEMENTS.find(a => a.id === newAchievement.achievementId)
          if (achievement) {
            setAchievementNotification(achievement)
            setShowAchievementNotification(true)
            // Auto-hide after 4 seconds
            setTimeout(() => {
              setShowAchievementNotification(false)
              setTimeout(() => setAchievementNotification(null), 300)
            }, 4000)
          }
        }
      }

      // Update ref (doesn't trigger re-render)
      prevCompletedAchievementIdsRef.current = currentCompletedIds
    }
  }, [user?.achievements])
  
  // Progress display preference
  const [useCircularProgress, setUseCircularProgress] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('useCircularProgress') !== 'false'
      } catch {
        return true
      }
    }
    return true
  })
  
  // Motivational quotes state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [isQuoteAnimating, setIsQuoteAnimating] = useState(false)
  
  // Motivational quotes
  const MOTIVATIONAL_QUOTES = [
    { ru: 'Начни сегодня! Каждая тренировка — это шаг к лучшей версии себя.', en: 'Start today! Every workout is a step towards a better version of yourself.' },
    { ru: 'Ты уже сделал первый шаг, продолжай!', en: 'You have already taken the first step, keep going!' },
    { ru: 'Даже маленькая тренировка лучше, чем её отсутствие.', en: 'Even a small workout is better than no workout at all.' },
    { ru: 'Твоё тело способно на большее, чем ты думаешь.', en: 'Your body is capable of more than you think.' },
    { ru: 'Сегодня ты становишься сильнее, чем вчера.', en: 'Today you are becoming stronger than yesterday.' },
    { ru: 'Не останавливайся — результат уже близко.', en: "Don't stop — the result is already close." },
    { ru: 'Каждая капля пота приближает тебя к цели.', en: 'Every drop of sweat brings you closer to your goal.' },
    { ru: 'Ты — автор своего тела. Пиши лучшую версию.', en: 'You are the author of your body. Write the best version.' },
    { ru: 'Мотивация приходит во время действия. Начни прямо сейчас.', en: 'Motivation comes during action. Start right now.' },
    { ru: 'Поверь в себя — и ты сможешь всё.', en: 'Believe in yourself — and you can do anything.' },
    { ru: 'Твои усилия не напрасны, они накапливаются.', en: 'Your efforts are not in vain, they accumulate.' },
    { ru: 'Сегодняшняя тренировка — завтрашний результат.', en: "Today's workout — tomorrow's result." },
    { ru: 'Не жди идеального момента, создай его.', en: "Don't wait for the perfect moment, create it." },
    { ru: 'Ты сильнее своих отговорок.', en: 'You are stronger than your excuses.' },
    { ru: 'Каждый день — новый шанс стать лучше.', en: 'Every day is a new chance to become better.' },
  ]
  
  // Auto-rotate quotes every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsQuoteAnimating(true)
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
        setIsQuoteAnimating(false)
      }, 300)
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [MOTIVATIONAL_QUOTES.length])
  
  // Navigate quotes manually
  const nextQuote = () => {
    setIsQuoteAnimating(true)
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
      setIsQuoteAnimating(false)
    }, 200)
  }
  
  const prevQuote = () => {
    setIsQuoteAnimating(true)
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length)
      setIsQuoteAnimating(false)
    }, 200)
  }
  
  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      const container = document.getElementById('chat-messages-container')
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight
        }, 100)
      }
    }
  }, [chatMessages.length, chatMessages[chatMessages.length - 1]?.content])
  const [currentRestTime, setCurrentRestTime] = useState(60) // Current workout rest time
  const [alternativeExercises, setAlternativeExercises] = useState<Exercise[]>([])
  const [completedWorkoutId, setCompletedWorkoutId] = useState<string | null>(null)

  // Video preloading - preload next exercise video
  useEffect(() => {
    if (!currentWorkoutDay || currentExerciseIndex === undefined) return
    
    // Preload current exercise video
    const currentExercise = currentWorkoutDay.exercises[currentExerciseIndex]
    if (currentExercise?.id && hasExerciseVideo(currentExercise.id)) {
      const videoUrl = getExerciseVideoUrl(currentExercise.id)
      if (videoUrl) {
        const video = document.createElement('video')
        video.src = videoUrl
        video.preload = 'auto'
      }
    }
    
    // Preload next exercise video
    const nextIndex = currentExerciseIndex + 1
    if (nextIndex < currentWorkoutDay.exercises.length) {
      const nextExercise = currentWorkoutDay.exercises[nextIndex]
      if (nextExercise?.id && hasExerciseVideo(nextExercise.id)) {
        const nextVideoUrl = getExerciseVideoUrl(nextExercise.id)
        if (nextVideoUrl) {
          // Create hidden video element to preload
          const preloadVideo = document.createElement('video')
          preloadVideo.src = nextVideoUrl
          preloadVideo.preload = 'auto'
          preloadVideo.style.display = 'none'
          document.body.appendChild(preloadVideo)
          // Remove after preloading
          setTimeout(() => {
            document.body.removeChild(preloadVideo)
          }, 5000)
        }
      }
    }
  }, [currentWorkoutDay, currentExerciseIndex])

  // NEW: Detailed exercise feedback states
  const [exerciseFeedbacks, setExerciseFeedbacks] = useState<Record<string, { rpe: 'too_easy' | 'normal' | 'hard' | 'could_not_complete'; notes?: string }>>({})
  const [overallWorkoutFeeling, setOverallWorkoutFeeling] = useState<'too_easy' | 'normal' | 'hard' | 'could_not_complete' | null>(null)
  const [showNewPlanNotification, setShowNewPlanNotification] = useState(false)

  // Warmup states
  const [isWarmupPhase, setIsWarmupPhase] = useState(true) // Start with warmup
  const [warmupExerciseIndex, setWarmupExerciseIndex] = useState(0)
  const [warmupTimer, setWarmupTimer] = useState<number | null>(null) // Timer for timed exercises
  const [isWarmupTimerRunning, setIsWarmupTimerRunning] = useState(false)
  const [warmupSkipped, setWarmupSkipped] = useState(false)

  // Detect desktop vs mobile
  const [isDesktop, setIsDesktop] = useState(false)
  
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const getText = (key: string): string => t(key, language)

  // Theme toggle handler with immediate DOM manipulation for instant visual feedback
  const handleThemeToggle = useCallback(() => {
    // Calculate what the new theme will be
    const newIsDark = !isDarkMode
    
    // Immediately apply to DOM for instant visual feedback (no waiting for React re-render)
    document.documentElement.classList.toggle('dark', newIsDark)
    
    // Then update the store (which will also update themeSource)
    toggleDarkMode()
  }, [isDarkMode, toggleDarkMode])

  // Helper function to display weight in selected unit
  const displayWeight = useCallback((kgValue: number | undefined | null): string => {
    if (kgValue === undefined || kgValue === null) return '--'
    const value = weightUnit === 'lbs' ? kgToLbs(kgValue) : kgValue
    return value.toFixed(1)
  }, [weightUnit])

  // Helper to get weight unit label
  const weightUnitLabel = weightUnit

  // Apply dark mode with system preference detection
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark: boolean
      
      if (themeSource === 'system') {
        shouldBeDark = getSystemTheme()
      } else {
        shouldBeDark = themeSource === 'dark'
      }
      
      document.documentElement.classList.toggle('dark', shouldBeDark)
    }
    
    // Apply initial theme
    applyTheme()
    
    // Listen for system theme changes when using system preference
    if (themeSource === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        if (themeSource === 'system') {
          const systemDark = mediaQuery.matches
          document.documentElement.classList.toggle('dark', systemDark)
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [isDarkMode, themeSource])

  // Manage disclaimer visibility
  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem('disclaimerDismissedAt')
      if (dismissedAt) {
        const dismissedTime = new Date(dismissedAt).getTime()
        const now = new Date().getTime()
        const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60)
        if (hoursPassed < 24) {
          setShowDisclaimer(false)
        }
      }
    } catch {
      // localStorage not available in sandboxed iframe
    }
  }, [])

  const dismissDisclaimer = () => {
    const now = new Date().toISOString()
    try {
      localStorage.setItem('disclaimerDismissedAt', now)
    } catch {
      // localStorage not available in sandboxed iframe
    }
    setShowDisclaimer(false)
  }

  // Fetch AI prediction for goal
  const fetchAiPrediction = useCallback(async () => {
    if (!onboardingData.currentWeight || !onboardingData.targetWeight ||
        !onboardingData.fitnessGoal || !onboardingData.fitnessLevel) {
      return
    }

    setIsLoadingPrediction(true)
    try {
      const response = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: onboardingData.age,
          gender: onboardingData.gender,
          currentWeight: onboardingData.currentWeight,
          targetWeight: onboardingData.targetWeight,
          height: onboardingData.height,
          fitnessGoal: onboardingData.fitnessGoal,
          fitnessLevel: onboardingData.fitnessLevel,
          trainingLocation: onboardingData.trainingLocation,
          equipment: onboardingData.equipment,
          language: language,
        }),
      })

      const data = await response.json()
      if (data.prediction) {
        setAiPrediction(data.prediction)
      }
    } catch (error) {
      console.error('Failed to fetch prediction:', error)
      // Fallback to calculated prediction
      setAiPrediction(calculateGoalPrediction(
        onboardingData.currentWeight,
        onboardingData.targetWeight,
        onboardingData.fitnessGoal as 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance',
        onboardingData.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
        onboardingData.gender as 'male' | 'female' | 'other',
        onboardingData.trainingLocation as 'home' | 'gym' | 'both',
        onboardingData.equipment || []
      ).prediction)
    } finally {
      setIsLoadingPrediction(false)
    }
  }, [onboardingData, language])

  // Fetch prediction when relevant data changes during onboarding
  useEffect(() => {
    if (currentOnboardingStep === 6 && onboardingData.fitnessGoal && onboardingData.fitnessLevel) {
      fetchAiPrediction()
    }
  }, [currentOnboardingStep, onboardingData.fitnessGoal, onboardingData.fitnessLevel, fetchAiPrediction])

  // Load AI prediction for logged-in users
  useEffect(() => {
    if (user?.onboardingCompleted && user.fitnessGoal && !aiPrediction) {
      const loadUserPrediction = async () => {
        setIsLoadingPrediction(true)
        try {
          const response = await fetch('/api/prediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              age: user.age,
              gender: user.gender,
              currentWeight: user.currentWeight,
              targetWeight: user.targetWeight,
              height: user.height,
              fitnessGoal: user.fitnessGoal,
              fitnessLevel: user.fitnessLevel,
              trainingLocation: user.trainingLocation,
              equipment: user.equipment,
              language: language,
            }),
          })
          const data = await response.json()
          if (data.prediction) {
            setAiPrediction(data.prediction)
          }
        } catch (error) {
          console.error('Failed to load user prediction:', error)
        } finally {
          setIsLoadingPrediction(false)
        }
      }
      loadUserPrediction()
    }
  }, [user, language, aiPrediction])

  // Validate target weight based on goal
  const validateTargetWeightByGoal = (currentWeight: number, targetWeight: number, goal: string) => {
    const diff = targetWeight - currentWeight
    
    if (goal === 'fat_loss' && targetWeight >= currentWeight) {
      return language === 'ru' 
        ? `Для похудения целевой вес должен быть меньше текущего (${currentWeight} кг)`
        : `For fat loss, target weight should be less than current (${currentWeight} kg)`
    }
    if (goal === 'muscle_gain' && targetWeight <= currentWeight) {
      return language === 'ru'
        ? `Для набора массы целевой вес должен быть больше текущего (${currentWeight} кг)`
        : `For muscle gain, target weight should be more than current (${currentWeight} kg)`
    }
    if (goal === 'maintenance' && Math.abs(diff) > 3) {
      return language === 'ru'
        ? `Для поддержания веса целевой вес должен быть близок к текущему (±2-3 кг)`
        : `For maintenance, target weight should be close to current (±2-3 kg)`
    }
    return null
  }

  // Get estimated time to reach goal
  const getEstimatedTime = (currentWeight: number, targetWeight: number, goal: string): string | null => {
    const diff = Math.abs(targetWeight - currentWeight)
    if (diff === 0) return null
    
    let weeks: number
    if (goal === 'fat_loss') {
      weeks = Math.ceil(diff / 0.75)
    } else if (goal === 'muscle_gain') {
      weeks = Math.ceil(diff / 0.35)
    } else {
      return null
    }
    
    return language === 'ru'
      ? `${weeks} недель`
      : `${weeks} weeks`
  }

  // Generate workout plan with timeout and retry
  const generateWorkoutPlan = useCallback(async (retryAttempt = 0) => {
    if (!user) return

    // Clear previous error
    setPlanGenerationError(null)
    
    // Calculate optimal workout days based on level and goal
    const daysPerWeek = calculateWorkoutDays(user.fitnessLevel, user.fitnessGoal)

    setIsGeneratingPlan(true)

    // Get adaptive adjustments from feedback history
    const adaptiveAdjustments = getAdaptivePlanAdjustments()

    // Timeout configuration (10 seconds)
    const TIMEOUT_MS = 10000
    const MAX_RETRIES = 2

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            age: user.age,
            gender: user.gender,
            currentWeight: user.currentWeight,
            targetWeight: user.targetWeight,
            height: user.height,
            fitnessGoal: user.fitnessGoal,
            fitnessLevel: user.fitnessLevel,
            equipment: user.equipment,
            language: user.language,
            trainingLocation: user.trainingLocation,
          },
          daysPerWeek,
          userProgress: {
            muscleGroupLevels: userProgress.muscleGroupLevels,
            skippedExercises: userProgress.skippedExercises,
            workoutFeedback: userProgress.workoutFeedback,
            preferredRestTime: userProgress.preferredRestTime,
            // NEW: Pass detailed feedback stats
            exerciseFeedbackStats: userProgress.exerciseFeedbackStats,
            exerciseFeedbackHistory: userProgress.exerciseFeedbackHistory,
            workoutFeedbackSummaries: userProgress.workoutFeedbackSummaries,
          },
          // NEW: Pass adaptive adjustments
          adaptiveAdjustments,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      if (data.plan) {
        setWorkoutPlan(data.plan)
        setPlanGenerationRetryCount(0) // Reset retry count on success
        // Reset workout progress for new plan
        resetWorkoutProgress()
        // Show notification if there was previous feedback
        if (userProgress.exerciseFeedbackHistory.length > 0) {
          setShowNewPlanNotification(true)
          setTimeout(() => setShowNewPlanNotification(false), 5000)
        }
      } else {
        throw new Error('No plan in response')
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      // Check if it was a timeout
      if (error.name === 'AbortError') {
        const errorMsg = language === 'ru' 
          ? 'Превышено время ожидания. Проверьте подключение и попробуйте снова.'
          : 'Request timed out. Please check your connection and try again.'
        
        // Auto retry if we haven't exhausted retries
        if (retryAttempt < MAX_RETRIES) {
          console.log(`[Generate Plan] Timeout, retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
          setPlanGenerationRetryCount(retryAttempt + 1)
          // Wait 500ms before retry
          await new Promise(resolve => setTimeout(resolve, 500))
          return generateWorkoutPlan(retryAttempt + 1)
        }
        
        setPlanGenerationError(errorMsg)
        console.error('[Generate Plan] Timeout after retries:', error)
      } else {
        // Other errors
        const errorMsg = language === 'ru'
          ? 'Не удалось обновить план. Попробуйте ещё раз позже.'
          : 'Failed to update plan. Please try again later.'
        
        // Auto retry for network errors
        if (retryAttempt < MAX_RETRIES && (error.message?.includes('network') || error.message?.includes('fetch'))) {
          console.log(`[Generate Plan] Network error, retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
          setPlanGenerationRetryCount(retryAttempt + 1)
          await new Promise(resolve => setTimeout(resolve, 500))
          return generateWorkoutPlan(retryAttempt + 1)
        }
        
        setPlanGenerationError(errorMsg)
        console.error('[Generate Plan] Error:', error)
      }
    } finally {
      clearTimeout(timeoutId)
      setIsGeneratingPlan(false)
    }
  }, [user, setWorkoutPlan, setIsGeneratingPlan, userProgress, getAdaptivePlanAdjustments, resetWorkoutProgress, language])

  // Generate nutrition plan with proper currency handling
  const generateNutritionPlan = useCallback(async () => {
    if (!user) return
    
    const calories = calculateDailyCalories(
      user.currentWeight,
      user.height,
      user.age,
      user.gender,
      user.fitnessGoal
    )
    const macros = calculateMacros(calories, user.fitnessGoal)
    
    try {
      const response = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories: calories,
          targetProtein: macros.protein,
          targetCarbs: macros.carbs,
          targetFat: macros.fat,
          mealsPerDay: 4,
          weeklyBudget: user.budget,
          language: user.language,
        }),
      })
      
      const data = await response.json()
      if (data.mealPlan) {
        setNutritionPlan({
          id: `nutrition-${Date.now()}`,
          name: data.mealPlan.name,
          targetCalories: calories,
          targetProtein: macros.protein,
          targetCarbs: macros.carbs,
          targetFat: macros.fat,
          weeklyBudget: user.budget,
          meals: data.mealPlan.meals,
        })
      }
    } catch (error) {
      console.error('Failed to generate nutrition plan:', error)
    }
  }, [user, setNutritionPlan])

  // Analyze fridge contents
  const analyzeFridge = async () => {
    if (!user) return
    setIsAnalyzingFridge(true)
    setShowFridgeAnalysis(true)
    
    try {
      const calories = calculateDailyCalories(
        user.currentWeight,
        user.height,
        user.age,
        user.gender,
        user.fitnessGoal
      )
      const macros = calculateMacros(calories, user.fitnessGoal)

      const response = await fetch('/api/analyze-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            age: user.age,
            gender: user.gender,
            currentWeight: user.currentWeight,
            targetWeight: user.targetWeight,
            height: user.height,
            fitnessGoal: user.fitnessGoal,
            fitnessLevel: user.fitnessLevel,
            language: language,
            targetCalories: calories,
            targetProtein: macros.protein,
          }
        })
      })
      
      const data = await response.json()
      setFridgeProducts(data.products || [])
      setFridgeRecipes(data.recipes || [])
    } catch (error) {
      console.error('Fridge analysis failed:', error)
    } finally {
      setIsAnalyzingFridge(false)
    }
  }

  // Complete onboarding
  const completeOnboarding = async () => {
    const ageValidation = validateAge(onboardingData.age || 0)
    if (!ageValidation.valid) {
      setAgeError(ageValidation.error || '')
      return
    }
    
    // Convert weights from display unit to kg for storage
    const convertToKg = (value: number | undefined): number | undefined => {
      if (value === undefined) return undefined
      return weightUnit === 'lbs' ? lbsToKg(value) : value
    }
    
    const currentWeight = convertToKg(onboardingData.currentWeight) || 75
    const targetWeight = convertToKg(onboardingData.targetWeight) || currentWeight
    const weightRangeMin = convertToKg(onboardingData.weightRangeMin)
    const weightRangeMax = convertToKg(onboardingData.weightRangeMax)
    const fitnessGoal = onboardingData.fitnessGoal as 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'
    
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: onboardingData.name || (language === 'ru' ? 'Пользователь' : 'User'),
      email: onboardingData.email || '',
      age: onboardingData.age || 25,
      gender: onboardingData.gender as 'male' | 'female' | 'other',
      height: onboardingData.height || 175,
      currentWeight: currentWeight,
      targetWeight: targetWeight,
      // Set initial values for progress tracking
      initialWeight: currentWeight, // Store starting weight for progress calculation
      initialEndurance: fitnessGoal === 'endurance' ? (onboardingData.initialEndurance || 30) : undefined,
      targetEndurance: fitnessGoal === 'endurance' ? (onboardingData.targetEndurance || 25) : undefined,
      enduranceMetric: fitnessGoal === 'endurance' ? (onboardingData.enduranceMetric as 'run_5km' | 'run_10km' | 'pushups' | 'plank') : undefined,
      goalSetAt: new Date().toISOString(), // When the goal was set
      // Maintenance-specific fields
      weightRangeMin: fitnessGoal === 'maintenance' ? (weightRangeMin ?? currentWeight - 2) : undefined,
      weightRangeMax: fitnessGoal === 'maintenance' ? (weightRangeMax ?? currentWeight + 2) : undefined,
      fitnessGoal: fitnessGoal,
      fitnessLevel: onboardingData.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
      equipment: onboardingData.equipment || [],
      customEquipment: customEquipmentInput || undefined,
      trainingLocation: onboardingData.trainingLocation || 'home',
      budget: onboardingData.budget || 50,
      language: language,
      onboardingCompleted: true,
      subscriptionTier: 'free',
      dailyChatMessages: 0,
      lastChatReset: null,
      hasSeenDisclaimer: false,
      disclaimerDismissedAt: null,
      // Initialize achievements array with all achievements at 0 progress
      achievements: ACHIEVEMENTS.map(a => ({
        achievementId: a.id,
        progress: 0,
        completed: false,
        claimed: false,
      })),
    }
    
    setUser(newUser)
    
    addWeightLog({
      id: `weight-${Date.now()}`,
      weight: newUser.currentWeight,
      date: new Date().toISOString(),
    })
  }

  // Send chat message
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    if (!canSendChatMessage()) {
      const limitMsg = language === 'ru'
        ? 'Дневной лимит сообщений исчерпан. Обнови подписку для большего!'
        : 'Daily message limit reached. Upgrade for more!'
      addChatMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: limitMsg,
        timestamp: new Date().toISOString(),
      })
      setChatInput('')
      return
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    setChatInput('')
    setIsAiTyping(true)

    const aiMessageId = `msg-${Date.now()}-ai`
    addChatMessage({
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    })

    // Add timeout to prevent infinite loading
    const CHAT_TIMEOUT_MS = 45000 // 45 seconds for AI response
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

    try {
      // Use new Groq AI endpoint with key rotation
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userContext: user ? {
            fitnessGoal: user.fitnessGoal,
            fitnessLevel: user.fitnessLevel,
            currentWeight: user.currentWeight,
            targetWeight: user.targetWeight,
            height: user.height,
            age: user.age,
            gender: user.gender,
            equipment: user.equipment,
          } : undefined,
          userId: user?.id || 'anonymous',
          language: language,
        }),
        signal: controller.signal,
      })
      
      if (!response.ok) {
        clearTimeout(timeoutId)
        // Try to get error message from response
        let errorMsg = language === 'ru'
          ? 'Сервис временно недоступен. Попробуй позже.'
          : 'Service temporarily unavailable. Try again later.'
        try {
          const errorData = await response.json()
          if (errorData.error) errorMsg = errorData.error
        } catch {}
        throw new Error(errorMsg)
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          updateChatMessage(aiMessageId, fullContent)
        }
      }
      
      clearTimeout(timeoutId)
      
      // If response is empty, show fallback
      if (!fullContent.trim()) {
        const fallback = getGoalSpecificFallback()
        updateChatMessage(aiMessageId, fallback)
      }
      
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('Chat error:', error)
      
      // Handle timeout specifically
      let errorMessage: string
      if (error.name === 'AbortError') {
        errorMessage = language === 'ru'
          ? '⏱ Превышено время ожидания. Попробуй ещё раз — я отвечу быстрее!'
          : '⏱ Request timed out. Try again — I\'ll respond faster!'
      } else {
        errorMessage = error.message || (language === 'ru'
          ? 'Произошла ошибка. Попробуй переформулировать вопрос.'
          : 'An error occurred. Try rephrasing your question.')
      }
      updateChatMessage(aiMessageId, errorMessage)
    } finally {
      clearTimeout(timeoutId)
      setIsAiTyping(false)
    }
  }

  // Get fallback response based on user's goal
  const getGoalSpecificFallback = (): string => {
    const goal = user?.fitnessGoal || 'maintenance'
    const fallbacks: Record<string, { ru: string; en: string }> = {
      fat_loss: {
        ru: 'Для похудения важен дефицит калорий (15-20%) и регулярные тренировки. Сочетай кардио с силовыми для лучшего результата!',
        en: 'For fat loss, maintain a calorie deficit (15-20%) and regular workouts. Combine cardio with strength training!'
      },
      muscle_gain: {
        ru: 'Для набора массы нужен профицит калорий (+10-15%) и белок 1.8-2г/кг. Тренируйся интенсивно 3-4 раза в неделю!',
        en: 'For muscle gain, maintain a calorie surplus (+10-15%) and 1.8-2g/kg protein. Train intensely 3-4 times a week!'
      },
      endurance: {
        ru: 'Для выносливости важны регулярные кардиотренировки с постепенным увеличением нагрузки. Не забывай про восстановление!',
        en: 'For endurance, regular cardio with progressive overload is key. Don\'t forget recovery!'
      },
      maintenance: {
        ru: 'Для поддержания формы важна регулярность и сбалансированное питание. Двигайся каждый день!',
        en: 'For maintenance, consistency and balanced nutrition are key. Stay active every day!'
      }
    }
    return language === 'ru' ? fallbacks[goal].ru : fallbacks[goal].en
  }

  // Log new weight
  const logNewWeight = () => {
    const weight = parseFloat(newWeight)
    if (isNaN(weight) || weight <= 0) return
    
    addWeightLog({
      id: `weight-${Date.now()}`,
      weight,
      date: new Date().toISOString(),
    })
    
    if (user) {
      updateUser({ currentWeight: weight })
    }
    
    setNewWeight('')
    setShowWeightModal(false)
  }
  
  // Log new endurance result
  const logEnduranceResult = () => {
    const value = parseFloat(newEnduranceValue)
    if (isNaN(value) || value <= 0) return
    
    if (user) {
      // Update current endurance value
      const currentEndurance = user.initialEndurance || value
      updateUser({ 
        currentEndurance: value,
        // Set initial if not set
        initialEndurance: user.initialEndurance || value
      })
    }
    
    setNewEnduranceValue('')
    setShowEnduranceModal(false)
  }
  
  // Toggle progress display type
  const toggleProgressType = () => {
    const newValue = !useCircularProgress
    setUseCircularProgress(newValue)
    try {
      localStorage.setItem('useCircularProgress', String(newValue))
    } catch {
      // localStorage not available in sandboxed iframe
    }
  }
  
  // Show settings notification
  const showSettingsNotification = (type: string) => {
    setSettingsNotification({ show: true, type })
    setTimeout(() => {
      setSettingsNotification({ show: false, type: '' })
    }, 3000)
  }
  
  // Confirm goal change
  const confirmGoalChange = async () => {
    if (!pendingGoalChange || !user) return
    
    // Calculate current progress before changing
    const currentGoalProgress = calculateGoalProgress(user, weightLogs, completedWorkouts.length, language)
    const weightChange = user.initialWeight ? user.currentWeight - user.initialWeight : 0
    
    // Create history entry for the current goal
    const historyEntry: GoalHistoryEntry = {
      id: `goal-history-${Date.now()}`,
      goalType: user.fitnessGoal,
      startedAt: user.goalSetAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      achievements: user.achievements?.filter(a => a.completed) || [],
      totalWorkouts: completedWorkouts.length,
      weightChange: weightChange,
      enduranceChange: user.initialEndurance && user.currentEndurance 
        ? user.initialEndurance - user.currentEndurance 
        : undefined,
      finalProgress: currentGoalProgress.percentage,
      goalReached: currentGoalProgress.isGoalReached,
    }
    
    // Save to goal history
    const existingHistory = user.goalHistory || []
    
    // Get new goal's achievements (empty progress for new goal)
    const newGoalAchievements = getAchievementsForGoal(pendingGoalChange).map(achievement => ({
      achievementId: achievement.id,
      progress: 0,
      completed: false,
      claimed: false,
    }))
    
    // Update user with new goal, reset progress, and save history
    updateUser({ 
      fitnessGoal: pendingGoalChange,
      goalSetAt: new Date().toISOString(),
      // Reset goal-specific progress
      initialWeight: user.currentWeight,
      initialEndurance: user.currentEndurance,
      // Save history
      goalHistory: [...existingHistory, historyEntry],
      // Reset achievements for new goal
      achievements: newGoalAchievements,
    })
    
    // Regenerate plans
    await generateWorkoutPlan()
    await generateNutritionPlan()
    
    setShowGoalConfirmModal(false)
    setPendingGoalChange(null)
    showSettingsNotification('goal')
  }

  // Start workout
  const startWorkout = (day: WorkoutDay) => {
    setCurrentWorkoutDay(day)
    setCurrentExerciseIndex(0)
    setCompletedSets(0)
    setCurrentRestTime(userProgress.preferredRestTime)
    // Reset warmup states
    setIsWarmupPhase(true)
    setWarmupExerciseIndex(0)
    setWarmupTimer(null)
    setIsWarmupTimerRunning(false)
    setWarmupSkipped(false)
  }

  // Warmup timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isWarmupTimerRunning && warmupTimer !== null && warmupTimer > 0) {
      interval = setInterval(() => {
        setWarmupTimer(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1
          }
          return prev
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isWarmupTimerRunning, warmupTimer])

  // Start warmup timer for a timed exercise
  const startWarmupTimer = (duration: number) => {
    setWarmupTimer(duration)
    setIsWarmupTimerRunning(true)
  }

  // Complete current warmup exercise
  const completeWarmupExercise = () => {
    if (!currentWorkoutDay?.warmup) return
    
    setIsWarmupTimerRunning(false)
    setWarmupTimer(null)
    
    if (warmupExerciseIndex + 1 >= currentWorkoutDay.warmup.length) {
      // Warmup complete, move to main workout
      setIsWarmupPhase(false)
    } else {
      setWarmupExerciseIndex(warmupExerciseIndex + 1)
    }
  }

  // Skip warmup entirely
  const skipWarmup = () => {
    setIsWarmupPhase(false)
    setIsWarmupTimerRunning(false)
    setWarmupTimer(null)
    setWarmupSkipped(true)
  }

  // Complete current set - simplified without RPE modal per exercise
  const completeSet = () => {
    if (!currentWorkoutDay) return

    const currentExercise = currentWorkoutDay.exercises[currentExerciseIndex]
    if (!currentExercise) return

    if (completedSets + 1 >= currentExercise.sets) {
      // Exercise completed - move to next exercise or finish workout
      if (currentExerciseIndex + 1 < currentWorkoutDay.exercises.length) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCompletedSets(0)
      } else {
        // Workout completed - show feedback modal
        setCompletedWorkoutId(currentWorkoutDay.id)
        markWorkoutComplete(currentWorkoutDay.id, currentWorkoutDay.weekNumber || 1)
        setShowFeedbackModal(true)
      }
    } else {
      setCompletedSets(completedSets + 1)
    }
  }

  // Skip exercise with reason
  const handleSkipExercise = (reason: string) => {
    if (!currentWorkoutDay) return
    
    const currentExercise = currentWorkoutDay.exercises[currentExerciseIndex]
    if (!currentExercise) return

    // Save skip to progress
    skipExercise(currentExercise.id, getLocalizedName(currentExercise), reason)
    
    // Move to next exercise or finish
    if (currentExerciseIndex + 1 < currentWorkoutDay.exercises.length) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setCompletedSets(0)
    } else {
      // Workout completed
      setCompletedWorkoutId(currentWorkoutDay.id)
      markWorkoutComplete(currentWorkoutDay.id, currentWorkoutDay.weekNumber || 1)
      setShowFeedbackModal(true)
    }
    
    setShowSkipModal(false)
  }

  // Replace exercise with alternative
  const handleReplaceExercise = (newExercise: Exercise) => {
    if (!currentWorkoutDay) return

    // Update the workout day with the new exercise (preserve progress)
    const updatedExercises = [...currentWorkoutDay.exercises]
    updatedExercises[currentExerciseIndex] = {
      ...newExercise,
      sets: updatedExercises[currentExerciseIndex].sets,
      reps: updatedExercises[currentExerciseIndex].reps,
      restSeconds: currentRestTime,
    }

    // Use updateCurrentWorkoutDay to preserve progress (currentExerciseIndex, completedSets)
    updateCurrentWorkoutDay({
      ...currentWorkoutDay,
      exercises: updatedExercises,
    })
    
    // Reset only the sets for the replaced exercise
    setCompletedSets(0)
    
    setShowReplaceModal(false)
  }

  // Get alternative exercises for same muscle group
  const getAlternativeExercises = useCallback((): Exercise[] => {
    if (!currentWorkoutDay || !user) return []

    const currentExercise = currentWorkoutDay.exercises[currentExerciseIndex]
    if (!currentExercise) return []

    // Get muscle group from current exercise
    const primaryMuscle = currentExercise.primaryMuscles?.[0] || ''
    
    // Get user's available equipment
    const equipment = user.trainingLocation === 'gym' 
      ? ['machine', 'dumbbells', 'barbell', 'none']
      : ['none', 'dumbbells', 'barbell']
    
    // Find alternatives in the exercise database with full instructions
    const alternatives = findAlternativeExercises(primaryMuscle, currentExercise.id, equipment, 5)
    
    // Convert to Exercise format with all details
    return alternatives.map((ex: ExerciseDatabaseItem) => ({
      id: ex.id,
      name: ex.name,
      nameRu: ex.nameRu,
      level: user.fitnessLevel,
      goal: user.fitnessGoal,
      category: ex.category,
      equipment: ex.equipment,
      primaryMuscles: ex.primaryMuscles,
      secondaryMuscles: ex.secondaryMuscles,
      difficulty: ex.difficulty,
      instructions: ex.instructions,
      instructionsRu: ex.instructionsRu,
      tips: ex.tips || [],
      tipsRu: ex.tipsRu || [],
      warnings: ex.warnings || [],
      warningsRu: ex.warningsRu || [],
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      restSeconds: currentRestTime,
    }))
  }, [currentWorkoutDay, currentExerciseIndex, user, currentRestTime])

  // Handle workout feedback
  const handleWorkoutFeedback = (feedback: WorkoutFeedbackEntry['feedback']) => {
    if (!completedWorkoutId) return

    addWorkoutFeedback(completedWorkoutId, feedback)
    setOverallWorkoutFeeling(feedback)

    // Don't close modal yet - show detailed exercise feedback
  }

  // NEW: Handle detailed exercise feedback submission
  const handleDetailedFeedbackSubmit = () => {
    if (!completedWorkoutId || !currentWorkoutDay) return

    const exerciseFeedbackDetails: ExerciseFeedbackDetail[] = []
    const now = new Date().toISOString()

    // Create feedback for each exercise
    currentWorkoutDay.exercises.forEach(ex => {
      const feedback = exerciseFeedbacks[ex.id]
      if (feedback) {
        exerciseFeedbackDetails.push({
          exerciseId: ex.id,
          exerciseName: getLocalizedName(ex),
          muscleGroup: ex.primaryMuscles?.[0] || 'general',
          rpe: feedback.rpe,
          targetReps: typeof ex.reps === 'string' ? parseInt(ex.reps) || 10 : ex.reps,
          targetSets: ex.sets,
          date: now,
          workoutId: completedWorkoutId,
        })

        // Record each exercise feedback
        recordExerciseFeedback({
          exerciseId: ex.id,
          exerciseName: getLocalizedName(ex),
          muscleGroup: ex.primaryMuscles?.[0] || 'general',
          rpe: feedback.rpe,
          targetReps: typeof ex.reps === 'string' ? parseInt(ex.reps) || 10 : ex.reps,
          targetSets: ex.sets,
          date: now,
          workoutId: completedWorkoutId,
        })

        // Adjust progression based on individual exercise feedback
        if (feedback.rpe === 'too_easy') {
          ex.primaryMuscles?.forEach(muscle => {
            advanceProgression(muscle)
          })
        } else if (feedback.rpe === 'hard' || feedback.rpe === 'could_not_complete') {
          ex.primaryMuscles?.forEach(muscle => {
            decreaseProgression(muscle)
          })
        }
      }
    })

    // Create workout summary
    const summary: WorkoutFeedbackSummary = {
      workoutId: completedWorkoutId,
      date: now,
      overallFeeling: overallWorkoutFeeling || 'normal',
      exerciseFeedbacks: exerciseFeedbackDetails,
      suggestedAdjustments: {
        increaseSets: exerciseFeedbackDetails.filter(f => f.rpe === 'too_easy').map(f => f.exerciseId),
        decreaseSets: exerciseFeedbackDetails.filter(f => f.rpe === 'hard').map(f => f.exerciseId),
        increaseReps: exerciseFeedbackDetails.filter(f => f.rpe === 'too_easy').map(f => f.exerciseId),
        decreaseReps: exerciseFeedbackDetails.filter(f => f.rpe === 'hard' || f.rpe === 'could_not_complete').map(f => f.exerciseId),
        replaceExercises: exerciseFeedbackDetails.filter(f => f.rpe === 'could_not_complete').map(f => ({ exerciseId: f.exerciseId, reason: 'could_not_complete' })),
        progressExercises: exerciseFeedbackDetails.filter(f => f.rpe === 'too_easy').map(f => f.exerciseId),
      },
    }

    recordWorkoutFeedbackSummary(summary)

    // Close modals and reset workout
    setShowFeedbackModal(false)
    setCurrentWorkoutDay(null)
    setCompletedWorkoutId(null)
    setExerciseFeedbacks({})
    setOverallWorkoutFeeling(null)
  }

  // Adjust rest time
  const adjustRestTime = (delta: number) => {
    const newTime = Math.max(15, Math.min(180, currentRestTime + delta))
    setCurrentRestTime(newTime)
    updatePreferredRestTime(newTime)
  }

  // Validate age on change
  const handleAgeChange = (value: number) => {
    setOnboardingData({ ...onboardingData, age: value })
    const validation = validateAge(value)
    setAgeError(validation.valid ? null : validation.error || null)
    setAgeWarning(validation.warning || null)
  }

  // Get localized name
  const getLocalizedName = (item: { name: string; nameRu?: string | null }): string => {
    return language === 'ru' ? (item.nameRu || item.name) : item.name
  }

  // Get localized instructions
  const getLocalizedInstructions = (item: { instructions: string[]; instructionsRu?: string[] }): string[] => {
    return language === 'ru' && item.instructionsRu?.length 
      ? item.instructionsRu 
      : item.instructions
  }

  // Calculate goal progress using the new goal-specific function
  const goalProgress: GoalProgressData = useMemo(() => {
    return calculateGoalProgress(user, weightLogs, completedWorkouts.length, language)
  }, [user, weightLogs, completedWorkouts.length, language])
  
  // Legacy progress percentage for backwards compatibility
  const progressPercentage = goalProgress.percentage

  // Get budget display in USD
  const getBudgetDisplay = useCallback((budget: number): string => {
    return `$${budget}`
  }, [])

  // ============================================================================
  // SIDEBAR NAVIGATION (Desktop)
  // ============================================================================

  const SidebarNav = () => (
    <aside
      className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">BodyGenius</h1>
            <p className="text-xs text-muted-foreground">AI Fitness</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {[
          { id: 'dashboard', icon: Home, label: language === 'ru' ? 'Главная' : 'Dashboard' },
          { id: 'workout', icon: Dumbbell, label: getText('tabs.workout') },
          { id: 'nutrition', icon: Utensils, label: getText('tabs.nutrition') },
          { id: 'progress', icon: TrendingUp, label: getText('tabs.progress') },
          { id: 'chat', icon: MessageCircle, label: getText('tabs.chat') },
        ].map((item, index) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.1, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl relative ${
                isActive
                  ? 'nav-btn-active text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              style={{ transition: 'background-color 0.2s, color 0.2s' }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isActive ? 5 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              {item.label}
            </motion.button>
          )
        })}
      </nav>

      {/* User Profile */}
      <motion.div 
        className="p-4 border-t border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.subscriptionTier || 'Free'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setShowSettings(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors press-scale-smooth"
          >
            <Settings className="w-4 h-4" />
            {language === 'ru' ? 'Настройки' : 'Settings'}
          </motion.button>
          <motion.button
            onClick={handleThemeToggle}
            whileHover={{ scale: 1.08, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors icon-btn-hover"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </aside>
  )

  // ============================================================================
  // BOTTOM NAVIGATION (Mobile)
  // ============================================================================

  const BottomNav = () => {
    // Подсчёт полученных достижений для счётчика
    const earnedAchievements = user?.achievements?.filter(a => a.completed).length || 0
    
    return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {[
          { id: 'dashboard', icon: Home },
          { id: 'workout', icon: Dumbbell },
          { id: 'nutrition', icon: Utensils },
          { id: 'progress', icon: TrendingUp },
          { id: 'chat', icon: MessageCircle },
        ].map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const labels: Record<string, { ru: string; en: string }> = {
            dashboard: { ru: 'Главная', en: 'Home' },
            workout: { ru: 'Тренир.', en: 'Workout' },
            nutrition: { ru: 'Питание', en: 'Nutrition' },
            progress: { ru: 'Прогресс', en: 'Progress' },
            chat: { ru: 'Чат', en: 'Chat' },
          }
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors relative press-scale-smooth ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span 
                className={`text-[10px] font-medium transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-70'}`}
              >
                {language === 'ru' ? labels[item.id].ru : labels[item.id].en}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
        <button
          onClick={() => setShowSettings(true)}
          className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground press-scale-smooth"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">{language === 'ru' ? 'Ещё' : 'More'}</span>
        </button>
      </div>
    </nav>
    )
  }

  // ============================================================================
  // ONBOARDING SCREENS
  // ============================================================================

  if (!user?.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentOnboardingStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex-1 flex flex-col p-6 pt-12 max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {currentOnboardingStep === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                {/* Theme Toggle - Top Right */}
                <div className="absolute top-6 right-6">
                  <motion.button
                    onClick={handleThemeToggle}
                    whileHover={{ scale: 1.08, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors"
                    title={isDarkMode 
                      ? (language === 'ru' ? 'Включить светлую тему' : 'Switch to light theme')
                      : (language === 'ru' ? 'Включить тёмную тему' : 'Switch to dark theme')
                    }
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isDarkMode ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.div>
                  </motion.button>
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-8"
                >
                  <Dumbbell className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-3 tracking-tight">BodyGenius AI</h1>
                <p className="text-muted-foreground text-lg mb-12 max-w-xs">
                  {getText('onboarding.welcome.subtitle')}
                </p>
                <div className="space-y-3 w-full">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="w-full py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98]"
                  >
                    {getText('onboarding.welcome.startSetup')}
                  </button>
                  <button
                    onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                    className="w-full py-4 px-6 rounded-xl bg-secondary text-foreground font-medium flex items-center justify-center gap-2"
                  >
                    <Languages className="w-5 h-5" />
                    {language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Language Step */}
            {currentOnboardingStep === 1 && (
              <motion.div
                key="language"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col relative"
              >
                {/* Theme Toggle - Top Right */}
                <div className="absolute -top-4 right-0">
                  <motion.button
                    onClick={handleThemeToggle}
                    whileHover={{ scale: 1.08, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors"
                    title={isDarkMode 
                      ? (language === 'ru' ? 'Включить светлую тему' : 'Switch to light theme')
                      : (language === 'ru' ? 'Включить тёмную тему' : 'Switch to dark theme')
                    }
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isDarkMode ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </motion.div>
                  </motion.button>
                </div>

                <h2 className="text-2xl font-bold mb-2">{getText('onboarding.language.title')}</h2>
                <p className="text-muted-foreground mb-8">{getText('onboarding.language.subtitle')}</p>
                
                <div className="space-y-3 flex-1">
                  {[
                    { code: 'ru', name: 'Русский', desc: 'Основной язык', flag: '🇷🇺' },
                    { code: 'en', name: 'English', desc: 'Main language', flag: '🇬🇧' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as Language)
                        setOnboardingData({ ...onboardingData, language: lang.code as Language })
                      }}
                      className={`w-full p-5 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        language === lang.code
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <span className="text-3xl">{lang.flag}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{lang.name}</p>
                        <p className="text-sm text-muted-foreground">{lang.desc}</p>
                      </div>
                      {language === lang.code && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setOnboardingStep(0)}
                    className="py-4 px-6 rounded-xl bg-secondary font-medium"
                  >
                    {getText('common.back')}
                  </button>
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="flex-1 py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98]"
                  >
                    {getText('common.next')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Basics Step */}
            {currentOnboardingStep === 2 && (
              <motion.div
                key="basics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-2xl font-bold mb-2">{getText('onboarding.basics.title')}</h2>
                <p className="text-muted-foreground mb-8">{getText('onboarding.basics.subtitle')}</p>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.basics.name')}</label>
                    <input
                      type="text"
                      value={onboardingData.name || ''}
                      onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                      placeholder={getText('onboarding.basics.namePlaceholder')}
                      className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.basics.age')}</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={onboardingData.age || ''}
                      onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3.5 rounded-xl border ${
                        ageError ? 'border-red-500' : 'border-border'
                      } bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                    />
                    {ageError && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {ageError}
                      </p>
                    )}
                    {ageWarning && !ageError && (
                      <p className="text-amber-500 text-sm mt-2">{ageWarning}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">{getText('onboarding.basics.gender')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'male', label: getText('onboarding.basics.male') },
                        { id: 'female', label: getText('onboarding.basics.female') },
                        { id: 'other', label: getText('onboarding.basics.other') },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setOnboardingData({ ...onboardingData, gender: option.id as 'male' | 'female' | 'other' })}
                          className={`py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                            onboardingData.gender === option.id
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="py-4 px-6 rounded-xl bg-secondary font-medium"
                  >
                    {getText('common.back')}
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    disabled={!!ageError}
                    className="flex-1 py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getText('common.next')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Goals Step - Step 3: ONLY fitness goal selection */}
            {currentOnboardingStep === 3 && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-2xl font-bold mb-2">{getText('onboarding.goals.title')}</h2>
                <p className="text-muted-foreground mb-6">{getText('onboarding.goals.subtitle')}</p>
                
                <div className="space-y-5 flex-1 overflow-auto">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">{getText('onboarding.goals.mainGoal')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { 
                          id: 'fat_loss', 
                          labelKey: 'onboarding.goals.fatLoss', 
                          descKey: 'onboarding.goals.fatLossDesc', 
                          icon: Flame,
                          gradient: 'from-orange-500 to-red-500',
                          bgGradient: 'from-orange-500/20 to-red-500/20',
                          shadowColor: 'shadow-orange-500/25',
                          emoji: '🔥'
                        },
                        { 
                          id: 'muscle_gain', 
                          labelKey: 'onboarding.goals.muscleGain', 
                          descKey: 'onboarding.goals.muscleGainDesc', 
                          icon: Dumbbell,
                          gradient: 'from-blue-500 to-indigo-500',
                          bgGradient: 'from-blue-500/20 to-indigo-500/20',
                          shadowColor: 'shadow-blue-500/25',
                          emoji: '💪'
                        },
                        { 
                          id: 'endurance', 
                          labelKey: 'onboarding.goals.endurance', 
                          descKey: 'onboarding.goals.enduranceDesc', 
                          icon: Activity,
                          gradient: 'from-green-500 to-emerald-500',
                          bgGradient: 'from-green-500/20 to-emerald-500/20',
                          shadowColor: 'shadow-green-500/25',
                          emoji: '🏃'
                        },
                        { 
                          id: 'maintenance', 
                          labelKey: 'onboarding.goals.maintenance', 
                          descKey: 'onboarding.goals.maintenanceDesc', 
                          icon: Heart,
                          gradient: 'from-pink-500 to-rose-500',
                          bgGradient: 'from-pink-500/20 to-rose-500/20',
                          shadowColor: 'shadow-pink-500/25',
                          emoji: '❤️'
                        },
                      ].map((goal) => {
                        const Icon = goal.icon
                        const isSelected = onboardingData.fitnessGoal === goal.id
                        return (
                          <motion.button
                            key={goal.id}
                            onClick={() => {
                              setOnboardingData({ ...onboardingData, fitnessGoal: goal.id as 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance' })
                              if (onboardingData.currentWeight && onboardingData.targetWeight) {
                                setTargetWeightWarning(validateTargetWeightByGoal(onboardingData.currentWeight, onboardingData.targetWeight, goal.id))
                              }
                            }}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden ${
                              isSelected
                                ? `border-transparent bg-gradient-to-br ${goal.bgGradient} shadow-lg ${goal.shadowColor}`
                                : 'border-border bg-card hover:border-primary/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Gradient background overlay when selected */}
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-br ${goal.gradient} opacity-5`} />
                            )}
                            
                            {/* Icon container with gradient */}
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                              isSelected 
                                ? `bg-gradient-to-br ${goal.gradient} shadow-lg`
                                : 'bg-secondary'
                            }`}>
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                            </div>
                            
                            {/* Text */}
                            <p className={`relative font-semibold text-sm mb-1 ${
                              isSelected ? 'text-foreground' : ''
                            }`}>
                              {t(goal.labelKey, language)}
                            </p>
                            <p className="relative text-xs text-muted-foreground line-clamp-2">
                              {t(goal.descKey, language)}
                            </p>
                            
                            {/* Selected checkmark */}
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${goal.gradient} flex items-center justify-center shadow-md`}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="py-4 px-6 rounded-xl bg-secondary font-medium"
                  >
                    {getText('common.back')}
                  </button>
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="flex-1 py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98]"
                  >
                    {getText('common.next')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Body Parameters Step - Step 4: DYNAMIC based on goal */}
            {currentOnboardingStep === 4 && (
              <motion.div
                key="body"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-2xl font-bold mb-2">{getText('onboarding.body.title')}</h2>
                <p className="text-muted-foreground mb-6">{getText('onboarding.body.subtitle')}</p>
                
                <div className="space-y-5 flex-1 overflow-auto">
                  {/* Weight Unit Toggle */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const prevUnit = weightUnit
                          setWeightUnit('kg')
                          // Convert existing values if switching from lbs
                          if (prevUnit === 'lbs' && onboardingData.currentWeight) {
                            setOnboardingData({
                              ...onboardingData,
                              currentWeight: lbsToKg(onboardingData.currentWeight),
                              targetWeight: onboardingData.targetWeight ? lbsToKg(onboardingData.targetWeight) : undefined,
                              weightRangeMin: onboardingData.weightRangeMin ? lbsToKg(onboardingData.weightRangeMin) : undefined,
                              weightRangeMax: onboardingData.weightRangeMax ? lbsToKg(onboardingData.weightRangeMax) : undefined,
                            })
                          }
                        }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          weightUnit === 'kg' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const prevUnit = weightUnit
                          setWeightUnit('lbs')
                          // Convert existing values if switching from kg
                          if (prevUnit === 'kg' && onboardingData.currentWeight) {
                            setOnboardingData({
                              ...onboardingData,
                              currentWeight: kgToLbs(onboardingData.currentWeight),
                              targetWeight: onboardingData.targetWeight ? kgToLbs(onboardingData.targetWeight) : undefined,
                              weightRangeMin: onboardingData.weightRangeMin ? kgToLbs(onboardingData.weightRangeMin) : undefined,
                              weightRangeMax: onboardingData.weightRangeMax ? kgToLbs(onboardingData.weightRangeMax) : undefined,
                            })
                          }
                        }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          weightUnit === 'lbs' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  
                  {/* Height and Current Weight - Always shown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.body.height')}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={onboardingData.height || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              setOnboardingData({ ...onboardingData, height: undefined })
                              setHeightError(null)
                            } else {
                              const num = parseInt(value)
                              if (!isNaN(num)) {
                                setOnboardingData({ ...onboardingData, height: num })
                                // Validate
                                if (num < 50) {
                                  setHeightError(language === 'ru' ? 'Минимальный рост: 50 см' : 'Minimum height: 50 cm')
                                } else if (num > 250) {
                                  setHeightError(language === 'ru' ? 'Максимальный рост: 250 см' : 'Maximum height: 250 cm')
                                } else {
                                  setHeightError(null)
                                }
                              }
                            }
                          }}
                          onBlur={() => {
                            // Final validation on blur
                            if (onboardingData.height === undefined) {
                              setHeightError(language === 'ru' ? 'Укажите рост' : 'Please enter your height')
                            }
                          }}
                          className={`w-full px-4 py-3.5 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 ${
                            heightError ? 'border-red-500' : 'border-border'
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{getText('onboarding.body.heightUnit')}</span>
                      </div>
                      {heightError && (
                        <p className="text-red-500 text-xs mt-1">{heightError}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.body.currentWeight')}</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={onboardingData.currentWeight || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              setOnboardingData({ ...onboardingData, currentWeight: undefined })
                              setWeightError(null)
                            } else {
                              const num = parseFloat(value)
                              if (!isNaN(num)) {
                                setOnboardingData({ ...onboardingData, currentWeight: num })
                                // Validate - use different min/max for kg vs lbs
                                const minWeight = weightUnit === 'lbs' ? 22 : 10
                                const maxWeight = weightUnit === 'lbs' ? 1323 : 600
                                const unitLabel = weightUnit === 'lbs' ? 'lbs' : 'kg'
                                if (num < minWeight) {
                                  setWeightError(language === 'ru' ? `Минимальный вес: ${minWeight} ${unitLabel}` : `Minimum weight: ${minWeight} ${unitLabel}`)
                                } else if (num > maxWeight) {
                                  setWeightError(language === 'ru' ? `Максимальный вес: ${maxWeight} ${unitLabel}` : `Maximum weight: ${maxWeight} ${unitLabel}`)
                                } else {
                                  setWeightError(null)
                                }
                                // Update weight range defaults for maintenance
                                if (onboardingData.fitnessGoal === 'maintenance') {
                                  setOnboardingData(prev => ({
                                    ...prev,
                                    currentWeight: num,
                                    weightRangeMin: prev.weightRangeMin ?? num - (weightUnit === 'lbs' ? 4.4 : 2),
                                    weightRangeMax: prev.weightRangeMax ?? num + (weightUnit === 'lbs' ? 4.4 : 2)
                                  }))
                                }
                              }
                            }
                          }}
                          onBlur={() => {
                            if (onboardingData.currentWeight === undefined) {
                              setWeightError(language === 'ru' ? 'Укажите вес' : 'Please enter your weight')
                            }
                          }}
                          className={`w-full px-4 py-3.5 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 ${
                            weightError ? 'border-red-500' : 'border-border'
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{weightUnit}</span>
                      </div>
                      {weightError && (
                        <p className="text-red-500 text-xs mt-1">{weightError}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Target Weight - Only for fat_loss and muscle_gain */}
                  {(onboardingData.fitnessGoal === 'fat_loss' || onboardingData.fitnessGoal === 'muscle_gain') && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.body.targetWeight')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={onboardingData.targetWeight || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                setOnboardingData({ ...onboardingData, targetWeight: undefined })
                                setTargetWeightError(null)
                                setTargetWeightWarning(null)
                              } else {
                                const num = parseFloat(value)
                                if (!isNaN(num)) {
                                  setOnboardingData({ ...onboardingData, targetWeight: num })
                                  // Validate range - use different min/max for kg vs lbs
                                  const minWeight = weightUnit === 'lbs' ? 22 : 10
                                  const maxWeight = weightUnit === 'lbs' ? 1323 : 600
                                  const unitLabel = weightUnit === 'lbs' ? 'lbs' : 'kg'
                                  if (num < minWeight) {
                                    setTargetWeightError(language === 'ru' ? `Минимальный вес: ${minWeight} ${unitLabel}` : `Minimum weight: ${minWeight} ${unitLabel}`)
                                  } else if (num > maxWeight) {
                                    setTargetWeightError(language === 'ru' ? `Максимальный вес: ${maxWeight} ${unitLabel}` : `Maximum weight: ${maxWeight} ${unitLabel}`)
                                  } else {
                                    setTargetWeightError(null)
                                  }
                                  // Validate by goal
                                  if (onboardingData.currentWeight && onboardingData.fitnessGoal) {
                                    setTargetWeightWarning(validateTargetWeightByGoal(onboardingData.currentWeight, num, onboardingData.fitnessGoal))
                                  }
                                }
                              }
                            }}
                            onBlur={() => {
                              if (onboardingData.targetWeight === undefined && onboardingData.fitnessGoal !== 'maintenance') {
                                setTargetWeightError(language === 'ru' ? 'Укажите целевой вес' : 'Please enter your target weight')
                              }
                            }}
                            className={`w-full px-4 py-3.5 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 ${
                              targetWeightError ? 'border-red-500' : 'border-border'
                            }`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{weightUnit}</span>
                        </div>
                        {targetWeightError && (
                          <p className="text-red-500 text-xs mt-1">{targetWeightError}</p>
                        )}
                      </div>
                      
                      {targetWeightWarning && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-sm text-amber-700 dark:text-amber-300">{targetWeightWarning}</p>
                        </div>
                      )}
                      
                      {onboardingData.currentWeight && onboardingData.targetWeight && !targetWeightWarning && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">{getText('onboarding.body.goalLabel')}</p>
                          <p className="text-lg font-semibold text-primary">
                            {onboardingData.currentWeight > onboardingData.targetWeight 
                              ? `${getText('onboarding.body.loseWeight')} ${(onboardingData.currentWeight - onboardingData.targetWeight).toFixed(1)} ${weightUnit}`
                              : onboardingData.currentWeight < onboardingData.targetWeight
                              ? `${getText('onboarding.body.gainWeight')} ${(onboardingData.targetWeight - onboardingData.currentWeight).toFixed(1)} ${weightUnit}`
                              : getText('onboarding.body.maintainWeight')}
                          </p>
                          {getEstimatedTime(onboardingData.currentWeight, onboardingData.targetWeight, onboardingData.fitnessGoal || 'fat_loss') && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {language === 'ru' ? 'Примерное время:' : 'Estimated:'} {getEstimatedTime(onboardingData.currentWeight, onboardingData.targetWeight, onboardingData.fitnessGoal || 'fat_loss')}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Endurance Goal - Specific fields */}
                  {onboardingData.fitnessGoal === 'endurance' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.body.enduranceMetric')}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'run_5km', labelKey: 'onboarding.body.run5km' },
                            { id: 'run_10km', labelKey: 'onboarding.body.run10km' },
                            { id: 'pushups', labelKey: 'onboarding.body.pushups' },
                            { id: 'plank', labelKey: 'onboarding.body.plank' },
                          ].map((metric) => (
                            <button
                              key={metric.id}
                              onClick={() => setOnboardingData({ 
                                ...onboardingData, 
                                enduranceMetric: metric.id as 'run_5km' | 'run_10km' | 'pushups' | 'plank',
                                initialEndurance: metric.id === 'plank' ? 60 : metric.id.includes('run') ? 30 : 20,
                                targetEndurance: metric.id === 'plank' ? 120 : metric.id.includes('run') ? 25 : 40
                              })}
                              className={`p-3 rounded-xl border-2 transition-all text-left ${
                                onboardingData.enduranceMetric === metric.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border bg-card hover:border-primary/50'
                              }`}
                            >
                              <p className="font-medium text-sm">{getText(metric.labelKey)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.body.currentValue')}</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              value={onboardingData.initialEndurance || ''}
                              onChange={(e) => setOnboardingData({ ...onboardingData, initialEndurance: parseInt(e.target.value) || 1 })}
                              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              {onboardingData.enduranceMetric === 'plank' ? getText('onboarding.body.seconds') : 
                               onboardingData.enduranceMetric?.includes('run') ? getText('onboarding.body.minutes') : getText('onboarding.body.reps')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">{getText('onboarding.body.targetValue')}</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              value={onboardingData.targetEndurance || ''}
                              onChange={(e) => setOnboardingData({ ...onboardingData, targetEndurance: parseInt(e.target.value) || 1 })}
                              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              {onboardingData.enduranceMetric === 'plank' ? getText('onboarding.body.seconds') : 
                               onboardingData.enduranceMetric?.includes('run') ? getText('onboarding.body.minutes') : getText('onboarding.body.reps')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          {language === 'ru' 
                            ? `Цель: улучшить результат с ${onboardingData.initialEndurance || '?'} до ${onboardingData.targetEndurance || '?'}`
                            : `Goal: improve from ${onboardingData.initialEndurance || '?'} to ${onboardingData.targetEndurance || '?'}`}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Maintenance Goal - Weight range fields */}
                  {onboardingData.fitnessGoal === 'maintenance' && (
                    <>
                      <div className="p-3 rounded-xl bg-muted/50 border border-border mb-3">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {getText('onboarding.body.weightRangeInfo')}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          {getText('onboarding.body.weightRange')}
                          <span className="text-xs text-muted-foreground">{getText('onboarding.body.weightRangeOptional')}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">{getText('onboarding.body.weightRangeMin')}</label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                min={10}
                                max={600}
                                value={onboardingData.weightRangeMin ?? (onboardingData.currentWeight ? onboardingData.currentWeight - 2 : '')}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  setOnboardingData({ 
                                    ...onboardingData, 
                                    weightRangeMin: isNaN(val) ? undefined : val 
                                  })
                                }}
                                placeholder={(onboardingData.currentWeight ? (onboardingData.currentWeight - 2).toFixed(1) : '')}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{getText('onboarding.body.weightUnit')}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">{getText('onboarding.body.weightRangeMax')}</label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                min={10}
                                max={600}
                                value={onboardingData.weightRangeMax ?? (onboardingData.currentWeight ? onboardingData.currentWeight + 2 : '')}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  setOnboardingData({ 
                                    ...onboardingData, 
                                    weightRangeMax: isNaN(val) ? undefined : val 
                                  })
                                }}
                                placeholder={(onboardingData.currentWeight ? (onboardingData.currentWeight + 2).toFixed(1) : '')}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{getText('onboarding.body.weightUnit')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Weight Stability Scale Preview */}
                      {onboardingData.currentWeight && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="text-sm font-medium mb-3">
                            {language === 'ru' ? 'Ваш целевой диапазон:' : 'Your target range:'}
                          </p>
                          <WeightStabilityScale 
                            currentWeight={onboardingData.currentWeight} 
                            targetWeight={onboardingData.currentWeight}
                            language={language}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="py-4 px-6 rounded-xl bg-secondary font-medium"
                  >
                    {getText('common.back')}
                  </button>
                  <button
                    onClick={() => setOnboardingStep(5)}
                    disabled={
                      !onboardingData.height || 
                      !onboardingData.currentWeight ||
                      heightError || 
                      weightError ||
                      (onboardingData.fitnessGoal !== 'maintenance' && onboardingData.fitnessGoal !== 'endurance' && !onboardingData.targetWeight) ||
                      targetWeightError
                    }
                    className="flex-1 py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {getText('common.next')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Level Step - Step 5: Fitness level selection */}
            {currentOnboardingStep === 5 && (
              <motion.div
                key="level"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-2xl font-bold mb-2">{getText('onboarding.level.title')}</h2>
                <p className="text-muted-foreground mb-6">{getText('onboarding.level.subtitle')}</p>
                
                <div className="space-y-4 flex-1 overflow-auto">
                  {[
                    { 
                      id: 'beginner', 
                      labelKey: 'onboarding.goals.beginner', 
                      descKey: 'onboarding.goals.beginnerDesc', 
                      IconComponent: Zap,
                      gradient: 'from-green-400 to-emerald-500',
                      bgGradient: 'from-green-400/20 to-emerald-500/20',
                      shadowColor: 'shadow-green-500/25',
                      descriptionRu: 'Начинаю тренироваться или был длительный перерыв',
                      descriptionEn: 'Just starting or returning after a long break'
                    },
                    { 
                      id: 'intermediate', 
                      labelKey: 'onboarding.goals.intermediate', 
                      descKey: 'onboarding.goals.intermediateDesc', 
                      IconComponent: Activity,
                      gradient: 'from-amber-400 to-orange-500',
                      bgGradient: 'from-amber-400/20 to-orange-500/20',
                      shadowColor: 'shadow-amber-500/25',
                      descriptionRu: 'Тренируюсь регулярно 6+ месяцев',
                      descriptionEn: 'Training regularly for 6+ months'
                    },
                    { 
                      id: 'advanced', 
                      labelKey: 'onboarding.goals.advanced', 
                      descKey: 'onboarding.goals.advancedDesc', 
                      IconComponent: Crown,
                      gradient: 'from-rose-400 to-red-500',
                      bgGradient: 'from-rose-400/20 to-red-500/20',
                      shadowColor: 'shadow-rose-500/25',
                      descriptionRu: 'Опытный атлет, тренируюсь 2+ года',
                      descriptionEn: 'Experienced athlete, training 2+ years'
                    },
                  ].map((level) => {
                    const LevelIcon = level.IconComponent
                    const isSelected = onboardingData.fitnessLevel === level.id
                    return (
                      <motion.button
                        key={level.id}
                        onClick={() => setOnboardingData({ ...onboardingData, fitnessLevel: level.id as 'beginner' | 'intermediate' | 'advanced' })}
                        className={`relative w-full p-5 rounded-2xl border-2 transition-all text-left overflow-hidden ${
                          isSelected
                            ? `border-transparent bg-gradient-to-br ${level.bgGradient} shadow-lg ${level.shadowColor}`
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Gradient background overlay when selected */}
                        {isSelected && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${level.gradient} opacity-5`} />
                        )}
                        
                        <div className="relative flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? `bg-gradient-to-br ${level.gradient} shadow-lg`
                              : 'bg-secondary'
                          }`}>
                            <LevelIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-lg ${isSelected ? 'text-foreground' : ''}`}>
                              {t(level.labelKey, language)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === 'ru' ? level.descriptionRu : level.descriptionEn}
                            </p>
                          </div>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-7 h-7 rounded-full bg-gradient-to-br ${level.gradient} flex items-center justify-center shrink-0 shadow-md`}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="py-4 px-6 rounded-xl bg-secondary font-medium"
                  >
                    {getText('common.back')}
                  </button>
                  <button
                    onClick={() => setOnboardingStep(6)}
                    className="flex-1 py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98]"
                  >
                    {getText('common.next')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Equipment & Budget Step - Step 6 */}
            {currentOnboardingStep === 6 && (
              <motion.div
                key="equipment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-2xl font-bold mb-2">{getText('onboarding.equipment.title')}</h2>
                <p className="text-muted-foreground mb-6">{getText('onboarding.equipment.subtitle')}</p>
                
                <div className="space-y-5 flex-1 overflow-auto">
                  {/* Training Location */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      {language === 'ru' ? 'Где вы тренируетесь?' : 'Where do you train?'}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { 
                          id: 'home', 
                          label: language === 'ru' ? 'Дома' : 'Home', 
                          icon: Home,
                          gradient: 'from-amber-400 to-yellow-500',
                          bgGradient: 'from-amber-400/20 to-yellow-500/20',
                          shadowColor: 'shadow-amber-500/25',
                          description: language === 'ru' ? 'Тренировки дома' : 'Home workouts'
                        },
                        { 
                          id: 'gym', 
                          label: language === 'ru' ? 'В зале' : 'Gym', 
                          icon: Dumbbell,
                          gradient: 'from-blue-400 to-cyan-500',
                          bgGradient: 'from-blue-400/20 to-cyan-500/20',
                          shadowColor: 'shadow-blue-500/25',
                          description: language === 'ru' ? 'Тренажёрный зал' : 'Fitness gym'
                        },
                        { 
                          id: 'both', 
                          label: language === 'ru' ? 'Оба' : 'Both', 
                          icon: Activity,
                          gradient: 'from-violet-400 to-purple-500',
                          bgGradient: 'from-violet-400/20 to-purple-500/20',
                          shadowColor: 'shadow-violet-500/25',
                          description: language === 'ru' ? 'Дом + зал' : 'Home + gym'
                        },
                      ].map((loc) => {
                        const Icon = loc.icon
                        const isSelected = onboardingData.trainingLocation === loc.id
                        return (
                          <motion.button
                            key={loc.id}
                            onClick={() => {
                              // Reset equipment when location changes
                              const newLocation = loc.id as 'home' | 'gym' | 'both'
                              let newEquipment: string[] = []
                              
                              if (newLocation === 'gym') {
                                newEquipment = ['gym']
                              } else if (newLocation === 'home') {
                                newEquipment = ['bodyweight']
                              } else {
                                newEquipment = ['bodyweight']
                              }
                              
                              setOnboardingData({ 
                                ...onboardingData, 
                                trainingLocation: newLocation,
                                equipment: newEquipment
                              })
                            }}
                            className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 overflow-hidden ${
                              isSelected
                                ? `border-transparent bg-gradient-to-br ${loc.bgGradient} shadow-lg ${loc.shadowColor}`
                                : 'border-border bg-card hover:border-primary/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-br ${loc.gradient} opacity-5`} />
                            )}
                            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected 
                                ? `bg-gradient-to-br ${loc.gradient} shadow-lg`
                                : 'bg-secondary'
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                            </div>
                            <p className={`relative font-semibold text-sm text-center ${isSelected ? 'text-foreground' : ''}`}>
                              {loc.label}
                            </p>
                            <p className="relative text-[10px] text-muted-foreground text-center">
                              {loc.description}
                            </p>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br ${loc.gradient} flex items-center justify-center shadow-md`}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Equipment Categories - Based on Location */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">{getText('onboarding.equipment.availableEquipment')}</p>
                    
                    {/* Category 1: Bodyweight - Available for Home and Both */}
                    {(onboardingData.trainingLocation === 'home' || onboardingData.trainingLocation === 'both') && (
                      <button
                        onClick={() => {
                          const current = onboardingData.equipment || []
                          const hasBodyweight = current.includes('bodyweight')
                          if (hasBodyweight) {
                            setOnboardingData({ ...onboardingData, equipment: current.filter(e => e !== 'bodyweight') })
                          } else {
                            setOnboardingData({ ...onboardingData, equipment: [...current.filter(e => e !== 'gym'), 'bodyweight'] })
                          }
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-2 ${
                          onboardingData.equipment?.includes('bodyweight')
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {language === 'ru' ? 'Собственный вес' : 'Bodyweight'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {language === 'ru' ? 'Отжимания, приседания, планка, берпи' : 'Push-ups, squats, planks, burpees'}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            onboardingData.equipment?.includes('bodyweight') ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {onboardingData.equipment?.includes('bodyweight') && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    )}
                    
                    {/* Category 2: Free Weights - Available for Home and Both */}
                    {(onboardingData.trainingLocation === 'home' || onboardingData.trainingLocation === 'both') && (
                      <div className="mb-2">
                        <button
                          onClick={() => {
                            const current = onboardingData.equipment || []
                            const hasFreeWeights = current.includes('free_weights') || current.includes('dumbbells') || current.includes('barbell') || current.includes('kettlebells')
                            
                            if (hasFreeWeights) {
                              // Remove all free weights
                              setOnboardingData({ 
                                ...onboardingData, 
                                equipment: current.filter(e => !['free_weights', 'dumbbells', 'barbell', 'kettlebells'].includes(e)) 
                              })
                            } else {
                              // Add free_weights category
                              setOnboardingData({ 
                                ...onboardingData, 
                                equipment: [...current.filter(e => e !== 'gym'), 'free_weights'] 
                              })
                            }
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            (onboardingData.equipment?.includes('free_weights') || onboardingData.equipment?.includes('dumbbells') || onboardingData.equipment?.includes('barbell'))
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {language === 'ru' ? 'Свободные веса' : 'Free Weights'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {language === 'ru' ? 'Гантели, штанга, гири' : 'Dumbbells, barbell, kettlebells'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              (onboardingData.equipment?.includes('free_weights') || onboardingData.equipment?.includes('dumbbells') || onboardingData.equipment?.includes('barbell'))
                                ? 'border-primary bg-primary' : 'border-muted-foreground'
                            }`}>
                              {(onboardingData.equipment?.includes('free_weights') || onboardingData.equipment?.includes('dumbbells') || onboardingData.equipment?.includes('barbell')) && 
                                <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </button>
                        
                        {/* Sub-options for Free Weights */}
                        {(onboardingData.equipment?.includes('free_weights') || onboardingData.equipment?.includes('dumbbells') || onboardingData.equipment?.includes('barbell')) && (
                          <div className="ml-4 pl-4 border-l-2 border-primary/30 mt-2 space-y-2">
                            {[
                              { id: 'dumbbells', label: language === 'ru' ? 'Гантели' : 'Dumbbells' },
                              { id: 'barbell', label: language === 'ru' ? 'Штанга' : 'Barbell' },
                              { id: 'kettlebells', label: language === 'ru' ? 'Гири' : 'Kettlebells' },
                            ].map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  const current = onboardingData.equipment || []
                                  const hasItem = current.includes(item.id)
                                  const updated = hasItem
                                    ? current.filter(e => e !== item.id)
                                    : [...current, item.id]
                                  setOnboardingData({ ...onboardingData, equipment: updated })
                                }}
                                className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                                  onboardingData.equipment?.includes(item.id)
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-card hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  onboardingData.equipment?.includes(item.id) ? 'border-primary bg-primary' : 'border-muted-foreground'
                                }`}>
                                  {onboardingData.equipment?.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <p className="font-medium text-sm">{item.label}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Category 3: Pull-up Bar (Турник) - Available for Home and Both, always in Gym */}
                    {(onboardingData.trainingLocation === 'home' || onboardingData.trainingLocation === 'both') && (
                      <button
                        onClick={() => {
                          const current = onboardingData.equipment || []
                          const hasPullupBar = current.includes('pullup_bar')
                          
                          if (hasPullupBar) {
                            setOnboardingData({ ...onboardingData, equipment: current.filter(e => e !== 'pullup_bar') })
                          } else {
                            setOnboardingData({ ...onboardingData, equipment: [...current.filter(e => e !== 'gym'), 'pullup_bar'] })
                          }
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-2 ${
                          onboardingData.equipment?.includes('pullup_bar')
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {language === 'ru' ? 'Турник' : 'Pull-up Bar'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {language === 'ru' ? 'Подтягивания, австралийские подтягивания' : 'Pull-ups, Australian pull-ups'}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            onboardingData.equipment?.includes('pullup_bar') ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {onboardingData.equipment?.includes('pullup_bar') && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    )}
                    
                    {/* Note: Pull-up bar is always available in Gym */}
                    {onboardingData.trainingLocation === 'gym' && (
                      <div className="w-full p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 text-left mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-muted-foreground">
                            {language === 'ru' ? 'Турник доступен в зале' : 'Pull-up bar available in gym'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Category 4: Gym Machines - Only for Gym and Both */}
                    {(onboardingData.trainingLocation === 'gym' || onboardingData.trainingLocation === 'both') && (
                      <button
                        onClick={() => {
                          const current = onboardingData.equipment || []
                          const hasGym = current.includes('gym')
                          
                          if (hasGym) {
                            // Remove gym
                            setOnboardingData({ ...onboardingData, equipment: current.filter(e => e !== 'gym') })
                          } else {
                            // Add gym (replaces bodyweight and free_weights for gym-only)
                            if (onboardingData.trainingLocation === 'gym') {
                              setOnboardingData({ ...onboardingData, equipment: ['gym'] })
                            } else {
                              setOnboardingData({ ...onboardingData, equipment: [...current, 'gym'] })
                            }
                          }
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left mb-2 ${
                          onboardingData.equipment?.includes('gym')
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {language === 'ru' ? 'Тренажёры (зал)' : 'Gym Machines'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {language === 'ru' ? 'Жим ногами, кроссовер, тяга блока и др.' : 'Leg press, cable crossover, lat pulldown, etc.'}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            onboardingData.equipment?.includes('gym') ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {onboardingData.equipment?.includes('gym') && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    )}
                    
                    {/* Custom Equipment Input - "Ещё" field */}
                    <div className="mt-4">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        {language === 'ru' ? 'Ещё оборудование' : 'Other equipment'}
                      </label>
                      <input
                        type="text"
                        value={customEquipmentInput}
                        onChange={(e) => {
                          setCustomEquipmentInput(e.target.value)
                          setOnboardingData({ ...onboardingData, customEquipment: e.target.value })
                        }}
                        placeholder={language === 'ru' ? 'Например: эспандер, TRX, медбол...' : 'E.g.: resistance band, TRX, medball...'}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{getText('onboarding.equipment.budgetTitle')}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {language === 'ru' ? 'Все цены указаны в долларах США для простоты' : 'All prices are in USD for simplicity'}
                    </p>
                    
                    {/* Budget options in USD */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {getBudgetOptions(language).slice(0, 4).map((budget) => (
                        <button
                          key={budget.value}
                          onClick={() => {
                            setOnboardingData({ ...onboardingData, budget: budget.value })
                            setCustomBudget('')
                          }}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            onboardingData.budget === budget.value && !customBudget
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <p className="font-medium text-sm">{budget.label}</p>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customBudget}
                        onChange={(e) => {
                          setCustomBudget(e.target.value)
                          const value = parseInt(e.target.value) || 0
                          setOnboardingData({ ...onboardingData, budget: value })
                        }}
                        placeholder={language === 'ru' ? 'Свой вариант' : 'Custom'}
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <span className="text-muted-foreground text-sm">
                        $/{language === 'ru' ? 'нед' : 'wk'}
                      </span>
                    </div>
                  </div>

                  {/* Goal Prediction - Dynamic per equipment */}
                  {onboardingData.currentWeight && onboardingData.targetWeight && onboardingData.fitnessGoal && onboardingData.fitnessLevel && (
                    <>
                      {isPredictionHidden ? (
                        <button
                          onClick={() => { setIsPredictionHidden(false); try { localStorage.removeItem('predictionHidden') } catch {} }}
                          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-muted-foreground"
                        >
                          {language === 'ru' ? 'Показать прогноз' : 'Show prediction'}
                        </button>
                      ) : (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 relative">
                          <button
                            onClick={() => { setIsPredictionHidden(true); try { localStorage.setItem('predictionHidden', 'true') } catch {} }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary transition-colors"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-primary">
                              {language === 'ru' ? 'Твой прогноз' : 'Your Prediction'}
                            </span>
                          </div>
                          
                          {isLoadingPrediction ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm text-muted-foreground">
                                {language === 'ru' ? 'AI анализирует...' : 'AI analyzing...'}
                              </span>
                            </div>
                          ) : (
                            <>
                              {/* Main prediction */}
                              <p className="text-base font-medium text-foreground mb-3">
                                {aiPrediction || calculateGoalPrediction(
                                  onboardingData.currentWeight,
                                  onboardingData.targetWeight,
                                  onboardingData.fitnessGoal as 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance',
                                  onboardingData.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
                                  onboardingData.gender as 'male' | 'female' | 'other',
                                  onboardingData.trainingLocation as 'home' | 'gym' | 'both',
                                  onboardingData.equipment || [],
                                  language
                                ).prediction}
                              </p>
                              
                              {/* Equipment-specific predictions */}
                              {(() => {
                                const predictionResult = calculateGoalPrediction(
                                  onboardingData.currentWeight,
                                  onboardingData.targetWeight,
                                  onboardingData.fitnessGoal as 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance',
                                  onboardingData.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
                                  onboardingData.gender as 'male' | 'female' | 'other',
                                  onboardingData.trainingLocation as 'home' | 'gym' | 'both',
                                  onboardingData.equipment || [],
                                  language
                                )

                                // Filter predictions based on training location
                                const filteredPredictions = predictionResult.predictionsByEquipment?.filter((p) => {
                                  if (onboardingData.trainingLocation === 'home') {
                                    return p.equipment !== 'gym'
                                  } else if (onboardingData.trainingLocation === 'gym') {
                                    return p.equipment === 'gym'
                                  }
                                  return true
                                })

                                // Also filter based on selected equipment
                                const selectedEquipment = onboardingData.equipment || []
                                const finalPredictions = filteredPredictions?.filter((p) => {
                                  // If user has specific equipment selected, show only those
                                  if (selectedEquipment.includes('dumbbells') || selectedEquipment.includes('barbell')) {
                                    return selectedEquipment.includes(p.equipment) || p.equipment === 'bodyweight'
                                  }
                                  return true
                                })

                                return finalPredictions && finalPredictions.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground font-medium">
                                      {language === 'ru' ? 'По типу оборудования:' : 'By equipment type:'}
                                    </p>
                                    {finalPredictions.map((p, i) => (
                                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/50 dark:bg-black/20">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                          {p.equipment === 'bodyweight' && ''}
                                          {p.equipment === 'pullup_bar' && ''}
                                          {p.equipment === 'dumbbells' && ''}
                                          {p.equipment === 'barbell' && ''}
                                          {p.equipment === 'kettlebells' && ''}
                                          {p.equipment === 'gym' && ''}
                                          {p.equipment === 'bodyweight' ? (language === 'ru' ? 'Без оборудования' : 'Bodyweight') :
                                           p.equipment === 'pullup_bar' ? (language === 'ru' ? 'С турником' : 'Pull-up Bar') :
                                           p.equipment === 'dumbbells' ? (language === 'ru' ? 'С гантелями' : 'Dumbbells') :
                                           p.equipment === 'barbell' ? (language === 'ru' ? 'Со штангой' : 'Barbell') :
                                           p.equipment === 'kettlebells' ? (language === 'ru' ? 'С гирями' : 'Kettlebells') :
                                           (language === 'ru' ? 'В зале' : 'Gym')}
                                        </span>
                                        <span className="font-semibold text-primary">{p.changePerMonth}</span>
                                      </div>
                                    ))}
                                  </div>
                                )
                              })()}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setOnboardingStep(5)}
                    className="py-4 px-6 rounded-xl bg-secondary font-medium"
                  >
                    {getText('common.back')}
                  </button>
                  <button
                    onClick={completeOnboarding}
                    disabled={!!ageError}
                    className="flex-1 py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getText('onboarding.finish.title')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RECIPE MODAL
  // ============================================================================

  const RecipeModal = () => {
    if (!selectedMeal) return null
    
    const instructions = getLocalizedInstructions(selectedMeal)
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedMeal(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-card rounded-2xl overflow-hidden max-h-[85vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          {selectedMeal.imageUrl && (
            <div className="h-48 bg-muted relative">
              <img src={selectedMeal.imageUrl} alt={getLocalizedName(selectedMeal)} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-primary font-medium uppercase tracking-wide">{t(`nutrition.${selectedMeal.type}`, language)}</span>
                <h3 className="text-xl font-bold mt-1">{getLocalizedName(selectedMeal)}</h3>
              </div>
              <button onClick={() => setSelectedMeal(null)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Nutrition Info */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold">{selectedMeal.calories}</p>
                <p className="text-xs text-muted-foreground">{getText('nutrition.calories')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold">{selectedMeal.protein}g</p>
                <p className="text-xs text-muted-foreground">{getText('nutrition.protein')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold">{selectedMeal.carbs}g</p>
                <p className="text-xs text-muted-foreground">{getText('nutrition.carbs')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold">{selectedMeal.fat}g</p>
                <p className="text-xs text-muted-foreground">{getText('nutrition.fat')}</p>
              </div>
            </div>
            
            {/* Time & Cost */}
            <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
              {selectedMeal.totalTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {selectedMeal.totalTime} {language === 'ru' ? 'мин' : 'min'}
                </div>
              )}
              {selectedMeal.estimatedCost && (
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  ~{formatMealCost(selectedMeal.estimatedCost, language)}
                </div>
              )}
            </div>
            
            {/* Ingredients */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" /> {getText('nutrition.ingredients')}
              </h4>
              <ul className="space-y-1.5">
                {(language === 'ru' && selectedMeal.ingredientsRu?.length 
                  ? selectedMeal.ingredientsRu 
                  : selectedMeal.ingredients
                ).map((ing, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Instructions */}
            {instructions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">{getText('nutrition.instructions')}</h4>
                <ol className="space-y-3">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">{i + 1}</span>
                      <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ============================================================================
  // WORKOUT SESSION SCREEN
  // ============================================================================

  if (currentWorkoutDay) {
    // WARMUP PHASE
    if (isWarmupPhase && currentWorkoutDay.warmup && currentWorkoutDay.warmup.length > 0 && !warmupSkipped) {
      const currentWarmupExercise = currentWorkoutDay.warmup[warmupExerciseIndex]
      const warmupName = language === 'ru' 
        ? (currentWorkoutDay.warmupNameRu || 'Разминка') 
        : (currentWorkoutDay.warmupName || 'Warm-up')
      
      return (
        <div className="min-h-screen flex flex-col bg-background">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <button onClick={() => setCurrentWorkoutDay(null)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-amber-500">
                {warmupName}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ru' ? 'Упражнение' : 'Exercise'} {warmupExerciseIndex + 1}/{currentWorkoutDay.warmup.length}
              </p>
            </div>
            <button 
              onClick={skipWarmup}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
            >
              {language === 'ru' ? 'Пропустить' : 'Skip'}
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((warmupExerciseIndex + 1) / currentWorkoutDay.warmup.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Warmup Exercise Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={warmupExerciseIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-sm text-center"
              >
                {/* Exercise Icon */}
                <div className="w-full aspect-video rounded-2xl bg-amber-500/10 mb-6 flex items-center justify-center">
                  <Flame className="w-16 h-16 text-amber-500" />
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  {language === 'ru' ? currentWarmupExercise.nameRu : currentWarmupExercise.name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'ru' ? currentWarmupExercise.descriptionRu : currentWarmupExercise.description}
                </p>

                {/* Timer or Reps */}
                <div className="p-6 rounded-2xl bg-card border border-border mb-6">
                  {currentWarmupExercise.duration ? (
                    // Timed exercise
                    <div className="text-center">
                      {warmupTimer !== null ? (
                        <div>
                          <p className="text-5xl font-bold text-amber-500 mb-2">
                            {Math.floor(warmupTimer / 60)}:{(warmupTimer % 60).toString().padStart(2, '0')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ru' ? 'Осталось времени' : 'Time remaining'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl font-bold mb-2">{currentWarmupExercise.duration}с</p>
                          <p className="text-sm text-muted-foreground">{language === 'ru' ? 'секунд' : 'seconds'}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Reps-based exercise
                    <div className="text-center">
                      <p className="text-5xl font-bold mb-2">{currentWarmupExercise.reps || 10}</p>
                      <p className="text-sm text-muted-foreground">{language === 'ru' ? 'повторений' : 'reps'}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {currentWarmupExercise.duration && warmupTimer === null && (
                    <button
                      onClick={() => startWarmupTimer(currentWarmupExercise.duration!)}
                      className="w-full py-4 px-6 rounded-xl bg-amber-500 text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      {language === 'ru' ? 'Начать таймер' : 'Start Timer'}
                    </button>
                  )}
                  
                  {warmupTimer !== null && (
                    <button
                      onClick={() => {
                        setIsWarmupTimerRunning(!isWarmupTimerRunning)
                      }}
                      className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                        isWarmupTimerRunning 
                          ? 'bg-secondary text-foreground' 
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isWarmupTimerRunning ? (
                        <>
                          <Pause className="w-5 h-5" />
                          {language === 'ru' ? 'Пауза' : 'Pause'}
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          {language === 'ru' ? 'Продолжить' : 'Resume'}
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={completeWarmupExercise}
                    className="w-full py-4 px-6 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {warmupExerciseIndex + 1 >= currentWorkoutDay.warmup.length
                      ? (language === 'ru' ? 'Начать тренировку' : 'Start Workout')
                      : (language === 'ru' ? 'Далее' : 'Next')
                    }
                  </button>
                </div>

                {/* Exercise type indicator */}
                <div className="mt-6 flex justify-center gap-2">
                  {currentWorkoutDay.warmup.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === warmupExerciseIndex 
                          ? 'bg-amber-500' 
                          : idx < warmupExerciseIndex 
                            ? 'bg-amber-500/50' 
                            : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )
    }

    // MAIN WORKOUT PHASE
    const currentExercise = currentWorkoutDay.exercises[currentExerciseIndex]
    const alternatives = getAlternativeExercises()
    
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border">
          <button onClick={() => setCurrentWorkoutDay(null)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {getText('workout.exercise')} {currentExerciseIndex + 1}/{currentWorkoutDay.exercises.length}
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentExerciseIndex + completedSets / (currentExercise?.sets || 1)) / currentWorkoutDay.exercises.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Exercise Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-lg text-center"
            >
              {/* Exercise Video/Image - Optimized */}
              <div className={`w-full rounded-2xl bg-secondary mb-4 flex items-center justify-center overflow-hidden relative ${TALL_FRAME_EXERCISES.includes(currentExercise?.id || '') ? 'aspect-[3/4]' : 'aspect-square'}`}>
                {/* Loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-secondary z-0">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                {currentExercise?.id && hasExerciseVideo(currentExercise.id) ? (
                  <video 
                    key={currentExercise.id}
                    src={getExerciseVideoUrl(currentExercise.id)} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover relative z-10"
                    style={{ backgroundColor: 'transparent' }}
                  />
                ) : currentExercise?.gifUrl ? (
                  <img 
                    key={currentExercise.gifUrl}
                    src={currentExercise.gifUrl} 
                    alt={getLocalizedName(currentExercise)} 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover relative z-10"
                  />
                ) : currentExercise?.videoUrl ? (
                  <video 
                    key={currentExercise.videoUrl}
                    src={currentExercise.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover relative z-10"
                  />
                ) : (
                  <Dumbbell className="w-16 h-16 text-muted-foreground/50 relative z-10" />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">{getLocalizedName(currentExercise)}</h2>
              <p className="text-muted-foreground mb-6">
                {currentExercise?.primaryMuscles?.map(m => t(`muscles.${m}`, language)).join(', ')}
              </p>

              {/* Sets and Reps */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-2xl font-bold">{currentExercise?.sets || 3}</p>
                  <p className="text-sm text-muted-foreground">{getText('workout.sets')}</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-2xl font-bold">{currentExercise?.reps || '10-12'}</p>
                  <p className="text-sm text-muted-foreground">{getText('workout.reps')}</p>
                </div>
                {/* Rest Time with Adjust Controls */}
                <div className="p-3 rounded-xl bg-card border border-border">
                  <p className="text-2xl font-bold">{currentRestTime}s</p>
                  <p className="text-xs text-muted-foreground mb-1">{getText('workout.rest')}</p>
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => adjustRestTime(-15)}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-foreground dark:text-gray-200" />
                    </button>
                    <button
                      onClick={() => adjustRestTime(15)}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-foreground dark:text-gray-200" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Set Progress */}
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: currentExercise?.sets || 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      i < completedSets ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {i < completedSets ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                ))}
              </div>

              {/* Instructions */}
              {getLocalizedInstructions(currentExercise).length > 0 && (
                <div className="text-left mb-4 p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm font-medium mb-2">{getText('workout.technique')}</p>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    {getLocalizedInstructions(currentExercise).slice(0, 3).map((inst: string, i: number) => (
                      <li key={i}>{i + 1}. {inst}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Action Buttons - Replace & Skip */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowReplaceModal(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-secondary border border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {language === 'ru' ? 'Заменить' : 'Replace'}
                </button>
                <button
                  onClick={() => setShowSkipModal(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-secondary border border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  {language === 'ru' ? 'Пропустить' : 'Skip'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="p-6">
          <button
            onClick={completeSet}
            className="w-full py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-transform active:scale-[0.98]"
          >
            {completedSets < (currentExercise?.sets || 3) - 1 
              ? getText('workout.completeSet') 
              : currentExerciseIndex < currentWorkoutDay.exercises.length - 1
              ? getText('workout.nextExercise')
              : getText('workout.finishWorkout')}
          </button>
        </div>

        {/* Skip Exercise Modal */}
        <AnimatePresence>
          {showSkipModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowSkipModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <SkipForward className="w-5 h-5 text-primary" />
                  {language === 'ru' ? 'Пропустить упражнение?' : 'Skip exercise?'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ru' 
                    ? 'Укажите причину пропуска для адаптации будущих тренировок:' 
                    : 'Specify the reason for skipping to adapt future workouts:'}
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'too_hard', label: language === 'ru' ? 'Слишком тяжело' : 'Too hard' },
                    { id: 'injury', label: language === 'ru' ? 'Травма/боль' : 'Injury/pain' },
                    { id: 'no_equipment', label: language === 'ru' ? 'Нет оборудования' : 'No equipment' },
                    { id: 'dislike', label: language === 'ru' ? 'Не нравится упражнение' : "Don't like exercise" },
                    { id: 'other', label: language === 'ru' ? 'Другое' : 'Other' },
                  ].map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => handleSkipExercise(reason.id)}
                      className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left text-sm font-medium"
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="w-full mt-4 py-3 rounded-xl bg-card border border-border font-medium hover:bg-secondary/50 transition-colors"
                >
                  {getText('common.cancel')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replace Exercise Modal */}
        <AnimatePresence>
          {showReplaceModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowReplaceModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  {language === 'ru' ? 'Заменить упражнение' : 'Replace exercise'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ru' 
                    ? 'Выберите альтернативное упражнение:' 
                    : 'Select an alternative exercise:'}
                </p>
                {alternatives.length > 0 ? (
                  <div className="space-y-3">
                    {alternatives.map((alt, i) => (
                      <button
                        key={alt.id}
                        onClick={() => handleReplaceExercise(alt)}
                        className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
                      >
                        <div className="flex gap-3">
                          {/* Exercise Video Preview - Optimized */}
                          <div className="w-20 h-20 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {hasExerciseVideo(alt.id) ? (
                              <video 
                                key={alt.id}
                                src={getExerciseVideoUrl(alt.id)} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{getLocalizedName(alt)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {language === 'ru' ? 'Сложность' : 'Difficulty'}: {alt.difficulty}/5
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {alt.primaryMuscles?.map(m => t(`muscles.${m}`, language)).join(', ')}
                            </p>
                          </div>
                          <ArrowRightLeft className="w-5 h-5 text-muted-foreground flex-shrink-0 self-center" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {language === 'ru' 
                      ? 'Нет альтернативных упражнений для этой группы мышц' 
                      : 'No alternative exercises for this muscle group'}
                  </p>
                )}
                <button
                  onClick={() => setShowReplaceModal(false)}
                  className="w-full mt-4 py-3 rounded-xl bg-card border border-border font-medium hover:bg-secondary/50 transition-colors"
                >
                  {getText('common.cancel')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workout Feedback Modal - Enhanced with detailed exercise feedback */}
        <AnimatePresence>
          {showFeedbackModal && currentWorkoutDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card rounded-2xl p-6 border border-border"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {language === 'ru' ? 'Тренировка завершена!' : 'Workout completed!'}
                  </h3>
                </div>

                {/* Overall feeling section */}
                {!overallWorkoutFeeling ? (
                  <>
                    <p className="text-muted-foreground text-center mb-4">
                      {language === 'ru' ? 'Как прошла тренировка в целом?' : 'How was your workout overall?'}
                    </p>
                    <div className="space-y-2">
                      {[
                        { id: 'too_easy', icon: Check, label: language === 'ru' ? 'Слишком легко' : 'Too easy', iconBg: 'bg-green-500/20', iconColor: 'text-green-500' },
                        { id: 'normal', icon: Flame, label: language === 'ru' ? 'Нормально, вспотел' : 'Good, broke a sweat', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-500' },
                        { id: 'hard', icon: AlertCircle, label: language === 'ru' ? 'Тяжело, но справился' : 'Hard but completed', iconBg: 'bg-orange-500/20', iconColor: 'text-orange-500' },
                        { id: 'could_not_complete', icon: X, label: language === 'ru' ? 'Не смог закончить' : "Couldn't finish", iconBg: 'bg-red-500/20', iconColor: 'text-red-500' },
                      ].map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleWorkoutFeedback(option.id as WorkoutFeedbackEntry['feedback'])}
                            className="w-full p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-3"
                          >
                            <div className={`w-8 h-8 rounded-full ${option.iconBg} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${option.iconColor}`} />
                            </div>
                            <span className="font-medium">{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  /* Detailed exercise feedback section */
                  <>
                    <p className="text-muted-foreground text-center mb-4">
                      {language === 'ru' ? 'Оцени каждое упражнение:' : 'Rate each exercise:'}
                    </p>
                    <div className="space-y-4 mb-6">
                      {currentWorkoutDay.exercises.map((ex, index) => {
                        const currentFeedback = exerciseFeedbacks[ex.id]
                        return (
                          <div key={ex.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                              <span className="font-medium text-sm">{getLocalizedName(ex)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { rpe: 'too_easy', icon: Check, label: language === 'ru' ? 'Легко' : 'Easy', colorClass: 'text-green-500', bgClass: 'bg-green-500/20' },
                                { rpe: 'normal', icon: Minus, label: language === 'ru' ? 'Норм' : 'OK', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/20' },
                                { rpe: 'hard', icon: Plus, label: language === 'ru' ? 'Тяжело' : 'Hard', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/20' },
                                { rpe: 'could_not_complete', icon: X, label: language === 'ru' ? 'Не смог' : "No", colorClass: 'text-red-500', bgClass: 'bg-red-500/20' },
                              ].map((option) => {
                                const IconComponent = option.icon
                                return (
                                  <button
                                    key={option.rpe}
                                    onClick={() => setExerciseFeedbacks(prev => ({
                                      ...prev,
                                      [ex.id]: { rpe: option.rpe as any, notes: prev[ex.id]?.notes }
                                    }))}
                                    className={`p-2 rounded-lg text-center transition-all ${
                                      currentFeedback?.rpe === option.rpe
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary hover:bg-secondary/80'
                                    }`}
                                  >
                                    <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                                      currentFeedback?.rpe === option.rpe ? 'bg-white/20' : option.bgClass
                                    }`}>
                                      <IconComponent className={`w-3.5 h-3.5 ${
                                        currentFeedback?.rpe === option.rpe ? 'text-primary-foreground' : option.colorClass
                                      }`} />
                                    </div>
                                    <div className="text-[10px] font-medium mt-1">{option.label}</div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Submit button */}
                    <button
                      onClick={handleDetailedFeedbackSubmit}
                      disabled={Object.keys(exerciseFeedbacks).length < currentWorkoutDay.exercises.length}
                      className="w-full py-4 px-6 rounded-xl bg-primary text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'ru' ? 'Сохранить и завершить' : 'Save and finish'}
                    </button>

                    {/* Skip detailed feedback option */}
                    <button
                      onClick={() => {
                        setShowFeedbackModal(false)
                        setCurrentWorkoutDay(null)
                        setCompletedWorkoutId(null)
                        setExerciseFeedbacks({})
                        setOverallWorkoutFeeling(null)
                      }}
                      className="w-full py-2 mt-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      {language === 'ru' ? 'Пропустить оценку' : 'Skip rating'}
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Plan Notification */}
        <AnimatePresence>
          {showNewPlanNotification && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">
                {language === 'ru'
                  ? 'Новый план готов! Мы учли твои результаты и подобрали свежие упражнения'
                  : 'New plan ready! We considered your results and selected fresh exercises'}
              </span>
              <button onClick={() => setShowNewPlanNotification(false)}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ============================================================================
  // MAIN DASHBOARD
  // ============================================================================

  const calories = user ? calculateDailyCalories(user.currentWeight, user.height, user.age, user.gender, user.fitnessGoal) : 2000
  const macros = user ? calculateMacros(calories, user.fitnessGoal) : { protein: 150, carbs: 200, fat: 65 }
  const remainingMessages = getRemainingChatMessages()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (Desktop) */}
      <SidebarNav />
      
      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen ${isDesktop ? 'lg:ml-64' : ''}`}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-lg">BodyGenius</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="p-2 rounded-lg bg-secondary text-sm font-medium"
              >
                {language === 'ru' ? 'EN' : 'RU'}
              </button>
              <button onClick={handleThemeToggle} className="p-2 rounded-lg bg-secondary">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        {isDesktop && (
          <header className="hidden lg:flex sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30 p-4 items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{getText('dashboard.greeting')} {user?.name?.split(' ')[0] || 'User'}!</h2>
              <p className="text-muted-foreground">
                {(() => {
                  const goalKey = user?.fitnessGoal || 'maintenance'
                  const goalTexts: Record<string, { ru: string; en: string }> = {
                    fat_loss: { ru: 'Сбрось лишний вес', en: 'Lose extra weight' },
                    muscle_gain: { ru: 'Набери мышечную массу', en: 'Build muscle mass' },
                    endurance: { ru: 'Повысь выносливость', en: 'Improve endurance' },
                    maintenance: { ru: 'Сохрани здоровье', en: 'Maintain health' },
                  }
                  return language === 'ru' ? goalTexts[goalKey].ru : goalTexts[goalKey].en
                })()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                title={isDarkMode 
                  ? (language === 'ru' ? 'Включить светлую тему' : 'Switch to light theme')
                  : (language === 'ru' ? 'Включить тёмную тему' : 'Switch to dark theme')
                }
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="px-3 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                {language === 'ru' ? 'EN' : 'RU'}
              </button>
              <button
                onClick={() => setShowSubscription(true)}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                {user?.subscriptionTier === 'free' ? (language === 'ru' ? 'Обновить' : 'Upgrade') : user?.subscriptionTier}
              </button>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto ${isDesktop ? '' : 'pb-20'}`}>
          <div className={`${isDesktop ? 'p-6 max-w-5xl mx-auto' : 'p-4'} space-y-6`}>
            
            {/* Tab Content - reorganized for better mobile UX */}
            <AnimatePresence mode="wait">
            {/* Dashboard Tab - Shows overview for both mobile and desktop */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Welcome Section */}
                  {!isDesktop && (
                    <div className="mb-2">
                      <p className="text-muted-foreground text-sm">{getText('dashboard.greeting')}</p>
                      <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
                      <p className="text-sm text-primary font-medium mt-1">
                        {(() => {
                          const goalKey = user?.fitnessGoal || 'maintenance'
                          const goalTexts: Record<string, { ru: string; en: string }> = {
                            fat_loss: { ru: 'Сбрось лишний вес', en: 'Lose extra weight' },
                            muscle_gain: { ru: 'Набери мышечную массу', en: 'Build muscle mass' },
                            endurance: { ru: 'Повысь выносливость', en: 'Improve endurance' },
                            maintenance: { ru: 'Сохрани здоровье', en: 'Maintain health' },
                          }
                          return language === 'ru' ? goalTexts[goalKey].ru : goalTexts[goalKey].en
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Desktop Welcome Section */}
                  {isDesktop && (
                    <div className="mb-2">
                      <p className="text-muted-foreground text-sm">{getText('dashboard.greeting')}</p>
                      <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
                    </div>
                  )}

                  {/* Motivational Quote Card - Both Mobile and Desktop */}
                  <div className={`${isDesktop ? 'p-5' : 'p-4'} rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20`}>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={prevQuote}
                        className={`${isDesktop ? 'p-2' : 'p-1'} rounded-full hover:bg-primary/10 transition-colors`}
                        aria-label="Previous quote"
                      >
                        <ChevronRight className={`${isDesktop ? 'w-5 h-5' : 'w-4 h-4'} text-foreground dark:text-gray-200 rotate-180`} />
                      </button>
                      <motion.div 
                        className="flex-1 text-center"
                        animate={{ opacity: isQuoteAnimating ? 0 : 1, y: isQuoteAnimating ? 10 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className={`${isDesktop ? 'text-base px-4' : 'text-sm px-3'} font-medium text-foreground leading-relaxed line-clamp-3`}>
                          {language === 'ru' 
                            ? MOTIVATIONAL_QUOTES[currentQuoteIndex].ru 
                            : MOTIVATIONAL_QUOTES[currentQuoteIndex].en}
                        </p>
                      </motion.div>
                      <button 
                        onClick={nextQuote}
                        className={`${isDesktop ? 'p-2' : 'p-1'} rounded-full hover:bg-primary/10 transition-colors`}
                        aria-label="Next quote"
                      >
                        <ChevronRight className={`${isDesktop ? 'w-5 h-5' : 'w-4 h-4'} text-foreground dark:text-gray-200`} />
                      </button>
                    </div>
                    <div className={`flex justify-center gap-1.5 ${isDesktop ? 'mt-4' : 'mt-3'}`}>
                      {MOTIVATIONAL_QUOTES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setIsQuoteAnimating(true)
                            setTimeout(() => {
                              setCurrentQuoteIndex(i)
                              setIsQuoteAnimating(false)
                            }, 200)
                          }}
                          className={`${isDesktop ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full transition-colors ${
                            i === currentQuoteIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                          aria-label={`Go to quote ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

            {/* Progress Card - Goal-specific */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {(() => {
                    const goalKey = user?.fitnessGoal || 'maintenance'
                    const progressLabels: Record<string, { ru: string; en: string }> = {
                      fat_loss: { ru: 'Прогресс к цели', en: 'Progress to Goal' },
                      muscle_gain: { ru: 'Прогресс к цели', en: 'Progress to Goal' },
                      endurance: { ru: 'Прогресс к цели', en: 'Progress to Goal' },
                      maintenance: { ru: 'Стабильность веса', en: 'Weight Stability' },
                    }
                    return language === 'ru' ? progressLabels[goalKey].ru : progressLabels[goalKey].en
                  })()}
                </h3>
                <span className="text-sm text-primary font-medium">
                  {goalProgress.isGoalReached 
                    ? (language === 'ru' ? '✓ Цель!' : '✓ Goal!') 
                    : `${goalProgress.percentage}%`}
                </span>
              </div>
              
              {/* Special visualization for maintenance goal */}
              {user?.fitnessGoal === 'maintenance' && (
                <WeightStabilityScale 
                  currentWeight={user.currentWeight}
                  targetWeight={user.targetWeight}
                  language={language}
                />
              )}
              
              {/* Standard progress bar for other goals */}
              {user?.fitnessGoal !== 'maintenance' && (
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${getProgressBarColorClass(goalProgress.percentage, goalProgress.isGoalReached)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, goalProgress.percentage)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getProgressTextClass(goalProgress.percentage, goalProgress.isGoalReached)}`}>
                      {getProgressStatusLabel(goalProgress.percentage, goalProgress.isGoalReached, language)}
                    </span>
                    <span className="text-muted-foreground">
                      {goalProgress.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Goal-specific stats */}
              <div className="flex items-center justify-between text-sm">
                {user?.fitnessGoal === 'endurance' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {goalProgress.currentValue}
                      </span>
                      <span className="text-muted-foreground">{goalProgress.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">{goalProgress.targetValue}</span>
                      <span>{goalProgress.unit}</span>
                    </div>
                  </>
                ) : user?.fitnessGoal === 'maintenance' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{displayWeight(goalProgress.currentValue as unknown as number)}</span>
                      <span className="text-muted-foreground">{weightUnitLabel}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${goalProgress.isGoalReached ? 'text-green-500' : 'text-amber-500'}`}>
                      {goalProgress.isGoalReached ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{language === 'ru' ? goalProgress.statusTextRu : goalProgress.statusText}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{displayWeight(goalProgress.currentValue as unknown as number)}</span>
                      <span className="text-muted-foreground">{weightUnitLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">{displayWeight(goalProgress.targetValue as unknown as number)}</span>
                      <span>{weightUnitLabel}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Record Result Button for Endurance Goals */}
              {user?.fitnessGoal === 'endurance' && (
                <button
                  onClick={() => setShowEnduranceModal(true)}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ru' ? 'Записать результат' : 'Record Result'}
                </button>
              )}
              
              {/* Record Weight Button for Weight-related Goals */}
              {(user?.fitnessGoal === 'fat_loss' || user?.fitnessGoal === 'muscle_gain') && (
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  {language === 'ru' ? 'Записать вес' : 'Record Weight'}
                </button>
              )}
              
              {/* Status text */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {language === 'ru' ? goalProgress.statusTextRu : goalProgress.statusText}
                </p>
              </div>
            </motion.div>

            {/* AI Prediction Card */}
            {user && user.fitnessGoal && (
              <>
                {isPredictionHidden ? (
                  <button
                    onClick={() => { setIsPredictionHidden(false); try { localStorage.removeItem('predictionHidden') } catch {} }}
                    className="w-full p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-muted-foreground"
                  >
                    {language === 'ru' ? 'Показать прогноз' : 'Show prediction'}
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative"
                  >
                    <button
                      onClick={() => { setIsPredictionHidden(true); try { localStorage.setItem('predictionHidden', 'true') } catch {} }}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">
                        {language === 'ru' ? 'AI Прогноз' : 'AI Prediction'}
                      </span>
                    </div>
                    <p className="text-base font-medium">
                      {aiPrediction || calculateGoalPrediction(
                        user.currentWeight,
                        user.targetWeight,
                        user.fitnessGoal,
                        user.fitnessLevel,
                        user.gender,
                        user.trainingLocation,
                        user.equipment,
                        language
                      ).prediction}
                    </p>
                    {(() => {
                      const predictionResult = calculateGoalPrediction(
                        user.currentWeight,
                        user.targetWeight,
                        user.fitnessGoal,
                        user.fitnessLevel,
                        user.gender,
                        user.trainingLocation,
                        user.equipment,
                        language
                      )
                      return predictionResult.predictionsByEquipment && predictionResult.predictionsByEquipment.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-muted-foreground">{language === 'ru' ? 'По типу оборудования:' : 'By equipment type:'}</p>
                          {predictionResult.predictionsByEquipment.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {p.equipment === 'bodyweight' ? (language === 'ru' ? 'Без оборудования' : 'Bodyweight') :
                                 p.equipment === 'pullup_bar' ? (language === 'ru' ? 'С турником' : 'Pull-up Bar') :
                                 p.equipment === 'dumbbells' ? (language === 'ru' ? 'С гантелями' : 'Dumbbells') :
                                 p.equipment === 'barbell' ? (language === 'ru' ? 'Со штангой' : 'Barbell') :
                                 p.equipment === 'gym' ? (language === 'ru' ? 'В зале' : 'Gym') :
                                 p.equipment}
                              </span>
                              <span className="font-medium">{p.change} / {p.weeks} {language === 'ru' ? 'нед.' : 'wks'}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </motion.div>
                )}
              </>
            )}

            {/* Quick Stats - Desktop only */}
            {isDesktop && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{getText('tabs.workout')}</span>
                    </div>
                    <p className="text-2xl font-bold">{workoutPlan?.workouts?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{language === 'ru' ? 'тренировок' : 'workouts'}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">{getText('tabs.nutrition')}</span>
                    </div>
                    <p className="text-2xl font-bold">{nutritionPlan?.meals?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{language === 'ru' ? 'приёмов пищи' : 'meals'}</p>
                  </div>
                </div>
            )}

            {/* Week Progress Summary - Mobile only */}
            {!isDesktop && (
              <div className="space-y-3">
                {workoutPlan && (
                  <div className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{language === 'ru' ? 'Прогресс недели' : 'Week Progress'}</span>
                      </div>
                      {canUpdatePlan() && (
                        <button
                          onClick={generateWorkoutPlan}
                          disabled={isGeneratingPlan}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium flex items-center gap-1"
                        >
                          {isGeneratingPlan ? (
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {language === 'ru' ? 'Обновить план' : 'Update Plan'}
                        </button>
                      )}
                    </div>
                    {(() => {
                      const weekProgress = getWeekProgress()
                      const progressPercent = weekProgress.total > 0 ? (weekProgress.completed / weekProgress.total) * 100 : 0
                      return (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full progress-smooth"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {weekProgress.completed}/{weekProgress.total}
                            </span>
                          </div>
                          {canUpdatePlan() ? (
                            <p className="text-xs text-primary">
                              {language === 'ru' ? 'Все тренировки выполнены!' : 'All workouts completed!'}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {language === 'ru' 
                                ? `${weekProgress.total - weekProgress.completed} тренировок осталось`
                                : `${weekProgress.total - weekProgress.completed} workouts left`}
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
                
                {/* Quick Actions - Navigate to tabs */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('workout')}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{getText('tabs.workout')}</span>
                    </div>
                    <p className="text-2xl font-bold">{workoutPlan?.workouts?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{language === 'ru' ? 'тренировок' : 'workouts'}</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-green-500/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Utensils className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-sm">{getText('tabs.nutrition')}</span>
                    </div>
                    <p className="text-2xl font-bold">{nutritionPlan?.meals?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{language === 'ru' ? 'приёмов пищи' : 'meals'}</p>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Workout Tab */}
          {activeTab === 'workout' && (
                <motion.div
                  key="workout"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {/* Goal-specific workout header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      {user?.fitnessGoal === 'fat_loss' && <Flame className="w-5 h-5 text-primary" />}
                      {user?.fitnessGoal === 'muscle_gain' && <Dumbbell className="w-5 h-5 text-primary" />}
                      {user?.fitnessGoal === 'endurance' && <Activity className="w-5 h-5 text-primary" />}
                      {user?.fitnessGoal === 'maintenance' && <Heart className="w-5 h-5 text-primary" />}
                      <h3 className="font-semibold text-primary">
                        {(() => {
                          const titles: Record<string, { ru: string; en: string }> = {
                            fat_loss: { ru: 'Жиросжигающие тренировки', en: 'Fat-burning workouts' },
                            muscle_gain: { ru: 'Силовые тренировки', en: 'Strength training' },
                            endurance: { ru: 'Кардио и интервалы', en: 'Cardio & Intervals' },
                            maintenance: { ru: 'Функциональный фитнес', en: 'Functional fitness' },
                          }
                          const goal = user?.fitnessGoal || 'maintenance'
                          return language === 'ru' ? titles[goal].ru : titles[goal].en
                        })()}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const descs: Record<string, { ru: string; en: string }> = {
                          fat_loss: { ru: 'Кардио + круговые для максимального сжигания калорий', en: 'Cardio + circuits for maximum calorie burn' },
                          muscle_gain: { ru: 'Базовые упражнения с прогрессией весов', en: 'Compound exercises with progressive overload' },
                          endurance: { ru: 'Интервальные тренировки для развития выносливости', en: 'Interval training for endurance development' },
                          maintenance: { ru: 'Сбалансированные тренировки для тонуса и здоровья', en: 'Balanced workouts for tone and health' },
                        }
                        const goal = user?.fitnessGoal || 'maintenance'
                        return language === 'ru' ? descs[goal].ru : descs[goal].en
                      })()}
                    </p>
                  </div>

                  {!workoutPlan ? (
                    <div className="p-8 rounded-2xl bg-card border border-border text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{getText('workout.createPlan')}</h3>
                      <p className="text-muted-foreground text-sm mb-6">{getText('workout.createPlanDesc')}</p>
                      
                      {/* Error message */}
                      {planGenerationError && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{planGenerationError}</span>
                          </div>
                        </div>
                      )}
                      
                      <motion.button
                        onClick={() => generateWorkoutPlan(0)}
                        disabled={isGeneratingPlan}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-transform disabled:opacity-50 btn-attention glow-primary"
                      >
                        {isGeneratingPlan ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {planGenerationRetryCount > 0 
                              ? (language === 'ru' ? `Повторная попытка ${planGenerationRetryCount}...` : `Retrying ${planGenerationRetryCount}...`)
                              : (language === 'ru' ? 'AI подбирает тренировки...' : 'AI is selecting workouts...')
                            }
                          </span>
                        ) : planGenerationError ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            {language === 'ru' ? 'Попробовать снова' : 'Try Again'}
                          </span>
                        ) : (
                          getText('workout.generatePlan')
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      {/* Week Progress Card */}
                      {(() => {
                        const weekProgress = getWeekProgress()
                        const canUpdate = canUpdatePlan()
                        return (
                          <div className="p-4 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{getLocalizedName(workoutPlan)}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {workoutPlan.daysPerWeek} {getText('workout.daysPerWeek')} • {workoutPlan.durationWeeks} {getText('workout.weeks')}
                            </p>
                            {/* Week progress bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full progress-smooth"
                                  style={{ width: `${(weekProgress.completed / weekProgress.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {weekProgress.completed}/{weekProgress.total}
                              </span>
                            </div>
                            {/* Update Plan Button - Always visible when eligible */}
                            {canUpdate && (
                              <>
                                {/* Error message */}
                                {planGenerationError && (
                                  <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                      <span>{planGenerationError}</span>
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={() => generateWorkoutPlan(0)}
                                  disabled={isGeneratingPlan}
                                  className={`w-full mt-3 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                                    planGenerationError 
                                      ? 'bg-red-500 text-white hover:bg-red-600' 
                                      : 'bg-primary text-white'
                                  }`}
                                >
                                  {isGeneratingPlan ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      {planGenerationRetryCount > 0 
                                        ? (language === 'ru' ? `Повторная попытка ${planGenerationRetryCount}...` : `Retrying ${planGenerationRetryCount}...`)
                                        : (language === 'ru' ? 'AI обновляет план...' : 'AI is updating plan...')
                                      }
                                    </>
                                  ) : planGenerationError ? (
                                    <>
                                      <RefreshCw className="w-4 h-4" />
                                      {language === 'ru' ? 'Попробовать снова' : 'Try Again'}
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-4 h-4" />
                                      {language === 'ru' ? 'Обновить план' : 'Update Plan'}
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                            {!canUpdate && weekProgress.completed > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {language === 'ru' 
                                  ? `Осталось ${weekProgress.total - weekProgress.completed} тренировок до обновления`
                                  : `${weekProgress.total - weekProgress.completed} workouts left to update`}
                              </p>
                            )}
                          </div>
                        )
                      })()}

                      {workoutPlan.workouts.map((workout, index) => {
                        const isCompleted = workout.isCompleted || completedWorkouts.some(cw => cw.workoutId === workout.id)
                        return (
                          <motion.div
                            key={workout.dayOfWeek || workout.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
                            className={`p-5 rounded-2xl bg-card border transition-colors card-interactive ${
                              isCompleted
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {isCompleted && (
                                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold">{getLocalizedName(workout)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {workout.exercises.length} {getText('workout.exercises')} • ~{workout.estimatedDuration} {getText('workout.minutes')}
                                    {isCompleted && workout.completedAt && (
                                      <span className="ml-2 text-green-500">
                                        • {language === 'ru' ? 'Выполнено' : 'Completed'} {new Date(workout.completedAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {isCompleted ? (
                                <span className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                  {language === 'ru' ? 'Готово' : 'Done'}
                                </span>
                              ) : (
                                <motion.button
                                  onClick={() => startWorkout(workout)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium transition-transform btn-gradient glow-primary"
                                >
                                  {getText('workout.startWorkout')}
                                </motion.button>
                              )}
                            </div>
                            
                            {/* Warmup indicator */}
                            {workout.warmup && workout.warmup.length > 0 && (
                              <div className="mb-3 flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  <Flame className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">
                                    {language === 'ru' 
                                      ? (workout.warmupNameRu || 'Разминка') 
                                      : (workout.warmupName || 'Warm-up')
                                    } • {workout.warmup.length} {language === 'ru' ? 'упр.' : 'ex.'}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              {workout.exercises.slice(0, 4).map((ex: Exercise) => (
                                <span key={ex.id} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                                  {getLocalizedName(ex)}
                                </span>
                              ))}
                              {workout.exercises.length > 4 && (
                                <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                                  +{workout.exercises.length - 4}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </>
                  )}
                </motion.div>
              )}

              {/* Nutrition Tab */}
              {activeTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {/* Goal-specific nutrition header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-green-600 dark:text-green-400">
                        {(() => {
                          const titles: Record<string, { ru: string; en: string }> = {
                            fat_loss: { ru: 'Рацион для похудения', en: 'Fat loss nutrition' },
                            muscle_gain: { ru: 'Питание для роста мышц', en: 'Muscle building nutrition' },
                            endurance: { ru: 'Энергия на весь день', en: 'All-day energy' },
                            maintenance: { ru: 'Сбалансированное питание', en: 'Balanced nutrition' },
                          }
                          const goal = user?.fitnessGoal || 'maintenance'
                          return language === 'ru' ? titles[goal].ru : titles[goal].en
                        })()}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const descs: Record<string, { ru: string; en: string }> = {
                          fat_loss: { ru: 'Дефицит калорий, много белка, лёгкие блюда', en: 'Calorie deficit, high protein, light meals' },
                          muscle_gain: { ru: 'Профицит калорий, много белка и углеводов', en: 'Calorie surplus, high protein and carbs' },
                          endurance: { ru: 'Сбалансированное питание с акцентом на углеводы', en: 'Balanced nutrition with focus on carbs' },
                          maintenance: { ru: 'Разнообразное питание для поддержания формы', en: 'Varied nutrition for maintaining shape' },
                        }
                        const goal = user?.fitnessGoal || 'maintenance'
                        return language === 'ru' ? descs[goal].ru : descs[goal].en
                      })()}
                    </p>
                  </div>

                  {/* Daily Summary */}
                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <h3 className="font-semibold mb-4">{getText('nutrition.dailyNorm')}</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { labelKey: 'nutrition.calories', value: calories, unit: '', color: 'bg-primary' },
                        { labelKey: 'nutrition.protein', value: macros.protein, unit: 'g', color: 'bg-green-500' },
                        { labelKey: 'nutrition.carbs', value: macros.carbs, unit: 'g', color: 'bg-amber-500' },
                        { labelKey: 'nutrition.fat', value: macros.fat, unit: 'g', color: 'bg-purple-500' },
                      ].map((item, i) => (
                        <div key={i} className="text-center">
                          <div className={`w-12 h-12 rounded-xl ${item.color} bg-opacity-15 flex items-center justify-center mx-auto mb-2`}>
                            <span className="text-sm font-bold">{item.value}{item.unit}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{t(item.labelKey, language)}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Goal-specific tip */}
                    <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const tips: Record<string, { ru: string; en: string }> = {
                            fat_loss: { ru: 'Совет: ешь больше овощей и пей воду за 30 минут до еды', en: 'Tip: eat more vegetables and drink water 30 min before meals' },
                            muscle_gain: { ru: 'Совет: ешь белок в каждом приёме пищи, 1.6-2г на кг веса', en: 'Tip: eat protein at every meal, 1.6-2g per kg bodyweight' },
                            endurance: { ru: 'Совет: углеводы за 2-3 часа до тренировки для энергии', en: 'Tip: carbs 2-3 hours before training for energy' },
                            maintenance: { ru: 'Совет: разнообразие — ключ к здоровому питанию', en: 'Tip: variety is key to healthy eating' },
                          }
                          const goal = user?.fitnessGoal || 'maintenance'
                          return language === 'ru' ? tips[goal].ru : tips[goal].en
                        })()}
                      </p>
                    </div>
                    
                    {/* Budget indicator with correct currency */}
                    {user?.budget && (
                      <div className="mt-4 p-3 rounded-xl bg-secondary/50 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {getText('nutrition.budget')}: {getBudgetDisplay(user.budget)}/{language === 'ru' ? 'нед' : 'wk'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fridge Analysis Button */}
                  <button
                    onClick={analyzeFridge}
                    className="w-full p-4 rounded-2xl bg-card border border-border flex items-center justify-center gap-2 hover:border-primary/30 transition-colors"
                  >
                    <ChefHat className="w-5 h-5 text-primary" />
                    <span>{language === 'ru' ? 'Анализ холодильника' : 'Analyze Fridge'}</span>
                  </button>

                  {!nutritionPlan ? (
                    <div className="p-8 rounded-2xl bg-card border border-border text-center">
                      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="font-semibold mb-2">{getText('nutrition.createMealPlan')}</h3>
                      <p className="text-muted-foreground text-sm mb-6">{getText('nutrition.createMealPlanDesc')}</p>
                      <button
                        onClick={generateNutritionPlan}
                        className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold transition-transform active:scale-[0.98]"
                      >
                        {getText('workout.generatePlan')}
                      </button>
                    </div>
                  ) : (
                    nutritionPlan.meals.map((meal) => (
                      <div 
                        key={meal.id} 
                        className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedMeal(meal)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs text-primary font-medium uppercase tracking-wide">{t(`nutrition.${meal.type}`, language)}</span>
                            <h4 className="font-semibold mt-1">{getLocalizedName(meal)}</h4>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{meal.calories} <span className="text-muted-foreground font-normal text-sm">{getText('nutrition.calories')}</span></p>
                            <p className="text-xs text-muted-foreground">
                              {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                          {meal.totalTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {meal.totalTime} {language === 'ru' ? 'мин' : 'min'}
                            </span>
                          )}
                          {meal.estimatedCost && (
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" /> ~{formatMealCost(meal.estimatedCost, language)}
                            </span>
                          )}
                          <span className="text-primary ml-auto flex items-center gap-1">
                            {getText('nutrition.viewRecipe')} <ChevronRight className="w-3 h-3 text-primary dark:text-primary-light" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {/* Motivation Card - Moved to top */}
                  {(() => {
                    const weekProgress = getWeekProgress()
                    const daysSinceLastWorkout = completedWorkouts.length > 0 
                      ? Math.floor((Date.now() - new Date(completedWorkouts[0]?.completedAt).getTime()) / (1000 * 60 * 60 * 24))
                      : null
                    
                    if (weekProgress.completed === 0 && completedWorkouts.length === 0) {
                      return (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="font-medium text-primary">{language === 'ru' ? 'Начни сегодня!' : 'Start today!'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ru' 
                              ? 'Каждая тренировка — это шаг к лучшей версии себя. Начни первую тренировку!'
                              : 'Every workout is a step towards a better you. Start your first workout!'}
                          </p>
                        </div>
                      )
                    }
                    
                    if (daysSinceLastWorkout && daysSinceLastWorkout > 2) {
                      return (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5 text-amber-500" />
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                              {language === 'ru' ? 'Время вернуться!' : 'Time to return!'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ru'
                              ? `Прошло ${daysSinceLastWorkout} дней с последней тренировки. Не теряй прогресс!`
                              : `It's been ${daysSinceLastWorkout} days since your last workout. Don't lose progress!`}
                          </p>
                        </div>
                      )
                    }
                    
                    return null
                  })()}

                  {/* Maintenance Progress - Special Card */}
                  {user?.fitnessGoal === 'maintenance' && (
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Текущий вес' : 'Current weight'}</p>
                          <p className="text-3xl font-bold">{user.currentWeight} <span className="text-base font-normal text-muted-foreground">кг</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Целевой вес' : 'Target weight'}</p>
                          <p className="text-lg font-semibold text-green-500">{user.targetWeight} кг</p>
                        </div>
                      </div>

                      {/* Visual Stability Scale */}
                      <WeightStabilityScale 
                        currentWeight={user.currentWeight} 
                        targetWeight={user.targetWeight}
                        language={language}
                      />

                      {/* Additional Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 mt-3 border-t border-border">
                        <span>{language === 'ru' ? 'ИМТ' : 'BMI'}</span>
                        <span className="font-medium">{(user.currentWeight / Math.pow(user.height / 100, 2)).toFixed(1)}</span>
                      </div>
                      
                      {/* Weight History Hint */}
                      {weightLogs.length > 1 && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                          <span>{language === 'ru' ? 'Изменение за период' : 'Change over period'}</span>
                          <span className={`font-medium ${
                            weightLogs[0].weight > weightLogs[weightLogs.length - 1].weight 
                              ? 'text-green-500' 
                              : weightLogs[0].weight < weightLogs[weightLogs.length - 1].weight 
                                ? 'text-red-500' 
                                : ''
                          }`}>
                            {weightLogs[0].weight > weightLogs[weightLogs.length - 1].weight 
                              ? '-' 
                              : weightLogs[0].weight < weightLogs[weightLogs.length - 1].weight 
                                ? '+' 
                                : ''}
                            {Math.abs(weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight).toFixed(1)} кг
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress to Goal - For non-maintenance goals */}
                  {user?.fitnessGoal !== 'maintenance' && (
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">
                          {language === 'ru' ? 'Прогресс к цели' : 'Progress to Goal'}
                        </h3>
                        <button
                          onClick={toggleProgressType}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          title={language === 'ru' ? 'Переключить вид' : 'Toggle view'}
                        >
                          {useCircularProgress ? '▭' : '○'}
                        </button>
                      </div>
                      
                      {useCircularProgress ? (
                        /* Circular Progress View */
                        <div className="flex flex-col items-center py-4">
                          <CircularProgress
                            key={`progress-${goalProgress.percentage}`}
                            percentage={goalProgress.percentage}
                            size={160}
                            strokeWidth={12}
                            currentValue={user?.fitnessGoal === 'endurance' 
                              ? (goalProgress.currentValue || '--')
                              : displayWeight(user?.currentWeight)}
                            unit={user?.fitnessGoal === 'endurance' 
                              ? goalProgress.unit 
                              : weightUnitLabel}
                            language={language}
                            isGoalReached={goalProgress.isGoalReached}
                          />
                          
                          {/* Endurance input button */}
                          {user?.fitnessGoal === 'endurance' && (
                            <button
                              onClick={() => setShowEnduranceModal(true)}
                              className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              {language === 'ru' ? 'Записать результат' : 'Log Result'}
                            </button>
                          )}
                          
                          {/* Weight input button */}
                          {user?.fitnessGoal !== 'endurance' && (
                            <button
                              onClick={() => setShowWeightModal(true)}
                              className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              {language === 'ru' ? 'Записать вес' : 'Log Weight'}
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Linear Progress View */
                        <>
                          <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
                            <motion.div 
                              className={`h-full rounded-full transition-colors ${goalProgress.isGoalReached ? 'bg-green-500' : 'bg-primary'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, goalProgress.percentage)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Goal-specific stats */}
                      {user?.fitnessGoal === 'endurance' ? (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-3 rounded-xl bg-secondary">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Текущее' : 'Current'}</p>
                              <button 
                                onClick={() => setShowEnduranceModal(true)}
                                className="p-1 rounded hover:bg-primary/10 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-primary dark:text-primary-light" />
                              </button>
                            </div>
                            <p className="text-xl font-bold">{goalProgress.currentValue}</p>
                            <p className="text-xs text-muted-foreground">{goalProgress.unit}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-secondary">
                            <p className="text-xs text-muted-foreground mb-1">{language === 'ru' ? 'Цель' : 'Target'}</p>
                            <p className="text-xl font-bold text-green-500">{goalProgress.targetValue}</p>
                            <p className="text-xs text-muted-foreground">{goalProgress.unit}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="p-3 rounded-xl bg-secondary text-center">
                            <p className="text-xs text-muted-foreground mb-1">{language === 'ru' ? 'Начальный' : 'Start'}</p>
                            <p className="text-lg font-bold">{displayWeight(user?.initialWeight || user?.currentWeight)}</p>
                            <p className="text-xs text-muted-foreground">{weightUnitLabel}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-primary/10 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <p className="text-xs text-primary">{language === 'ru' ? 'Текущий' : 'Current'}</p>
                              <button 
                                onClick={() => setShowWeightModal(true)}
                                className="p-0.5 rounded hover:bg-primary/20 transition-colors"
                              >
                                <Plus className="w-2.5 h-2.5 text-primary dark:text-primary-light" />
                              </button>
                            </div>
                            <p className="text-lg font-bold text-primary">{displayWeight(user?.currentWeight)}</p>
                            <p className="text-xs text-muted-foreground">{weightUnitLabel}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-green-500/10 text-center">
                            <p className="text-xs text-green-500 mb-1">{language === 'ru' ? 'Цель' : 'Goal'}</p>
                            <p className="text-lg font-bold text-green-500">{displayWeight(user?.targetWeight)}</p>
                            <p className="text-xs text-muted-foreground">{weightUnitLabel}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Progress details - for weight goals */}
                      {user?.fitnessGoal !== 'endurance' && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {user?.fitnessGoal === 'fat_loss' 
                                ? (language === 'ru' ? 'Сброшено' : 'Lost')
                                : user?.fitnessGoal === 'muscle_gain'
                                  ? (language === 'ru' ? 'Набрано' : 'Gained')
                                  : (language === 'ru' ? 'Изменение' : 'Change')}
                            </p>
                            <p className={`text-lg font-bold ${
                              (user?.fitnessGoal === 'fat_loss' && (user?.initialWeight || user?.currentWeight) > user?.currentWeight) 
                                ? 'text-green-500' 
                                : (user?.fitnessGoal === 'muscle_gain' && user?.currentWeight > (user?.initialWeight || user?.currentWeight))
                                  ? 'text-green-500'
                                  : 'text-foreground'
                            }`}>
                              {user?.fitnessGoal === 'fat_loss' 
                                ? ((user?.initialWeight || user?.currentWeight) > user?.currentWeight ? '-' : '+')
                                : user?.fitnessGoal === 'muscle_gain'
                                  ? (user?.currentWeight > (user?.initialWeight || user?.currentWeight) ? '+' : '-')
                                  : ((user?.initialWeight || user?.currentWeight) > user?.currentWeight ? '-' : '+')}
                              {Math.abs((user?.initialWeight || user?.currentWeight) - user?.currentWeight).toFixed(1)} кг
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {language === 'ru' ? 'Осталось' : 'Remaining'}
                            </p>
                            <p className="text-lg font-bold">
                              {user?.fitnessGoal === 'fat_loss'
                                ? Math.max(0, (user?.currentWeight || 0) - (user?.targetWeight || 0)).toFixed(1)
                                : user?.fitnessGoal === 'muscle_gain'
                                  ? Math.max(0, (user?.targetWeight || 0) - (user?.currentWeight || 0)).toFixed(1)
                                  : Math.abs((user?.currentWeight || 0) - (user?.targetWeight || 0)).toFixed(1)} кг
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Motivational message */}
                      <div className={`mt-4 p-3 rounded-xl ${
                        goalProgress.isGoalReached 
                          ? 'bg-green-500/10' 
                          : goalProgress.percentage >= 50 
                            ? 'bg-amber-500/10' 
                            : 'bg-secondary'
                      }`}>
                        <p className={`text-sm font-medium ${
                          goalProgress.isGoalReached 
                            ? 'text-green-600 dark:text-green-400' 
                            : goalProgress.percentage >= 50 
                              ? 'text-amber-600 dark:text-amber-400' 
                              : 'text-foreground'
                        }`}>
                          {goalProgress.isGoalReached 
                            ? (language === 'ru' ? 'Поздравляем! Вы достигли цели!' : 'Congratulations! You reached your goal!')
                            : goalProgress.percentage >= 75 
                              ? (language === 'ru' ? 'Почти у цели! Осталось совсем немного!' : 'Almost there! Just a little more!')
                              : goalProgress.percentage >= 50 
                                ? (language === 'ru' ? 'Отличный прогресс! Продолжайте в том же духе!' : 'Great progress! Keep it up!')
                                : goalProgress.percentage >= 25 
                                  ? (language === 'ru' ? 'Хороший старт! Продолжайте!' : 'Good start! Keep going!')
                                  : (language === 'ru' ? 'Каждое действие приближает вас к цели!' : 'Every step brings you closer!')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Chart - Goal-specific */}
                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">
                        {(() => {
                          const chartTitles: Record<string, { ru: string; en: string }> = {
                            fat_loss: { ru: 'История веса', en: 'Weight History' },
                            muscle_gain: { ru: 'История веса', en: 'Weight History' },
                            endurance: { ru: 'Прогресс выносливости', en: 'Endurance Progress' },
                            maintenance: { ru: 'Стабильность веса', en: 'Weight Stability' },
                          }
                          const goalKey = user?.fitnessGoal || 'maintenance'
                          return language === 'ru' ? chartTitles[goalKey].ru : chartTitles[goalKey].en
                        })()}
                      </h3>
                      {user?.fitnessGoal !== 'endurance' && (
                        <button
                          onClick={() => setShowWeightModal(true)}
                          className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> {getText('progress.logWeight')}
                        </button>
                      )}
                    </div>

                    {/* Chart based on goal type */}
                    {(() => {
                      const chartType = goalProgress.chartType
                      const chartData = goalProgress.chartData
                      
                      // Endurance or Activity chart
                      if (chartType === 'endurance' || chartType === 'activity') {
                        return chartData && chartData.length > 0 ? (
                          <div className="h-48 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <defs>
                                  <linearGradient id="colorEndurance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={(date) => new Date(date).toLocaleDateString(language === 'ru' ? 'ru' : 'en', { day: 'numeric', month: 'short' })}
                                  tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  domain={['dataMin - 1', 'dataMax + 1']}
                                  tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                                  axisLine={false}
                                  tickLine={false}
                                  width={35}
                                  reversed={chartType === 'endurance'} // Lower time is better for endurance
                                />
                                <Tooltip
                                  contentStyle={{
                                    background: isDarkMode ? '#1A1D24' : 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    color: isDarkMode ? '#F9FAFB' : '#111827'
                                  }}
                                  labelFormatter={(date) => new Date(date).toLocaleDateString(language === 'ru' ? 'ru' : 'en')}
                                  formatter={(value: number) => [
                                    chartType === 'endurance' ? `${value.toFixed(1)} мин` : `${value} ${language === 'ru' ? 'тренировок' : 'workouts'}`,
                                    chartType === 'endurance' ? (language === 'ru' ? 'Время' : 'Time') : (language === 'ru' ? 'Тренировок' : 'Workouts')
                                  ]}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#22C55E"
                                  strokeWidth={2}
                                  fill="url(#colorEndurance)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center text-muted-foreground">
                            {language === 'ru' ? 'Нет данных для отображения' : 'No data to display'}
                          </div>
                        )
                      }
                      
                      // Weight or Stability chart (fat_loss, muscle_gain, maintenance)
                      return weightLogs.length > 0 ? (
                        <div className="h-48 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weightLogs.slice(0, 14).reverse()}>
                              <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4C6FFF" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#4C6FFF" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="date"
                                tickFormatter={(date) => new Date(date).toLocaleDateString(language === 'ru' ? 'ru' : 'en', { day: 'numeric', month: 'short' })}
                                tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={35}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: isDarkMode ? '#1A1D24' : 'white',
                                  border: 'none',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  color: isDarkMode ? '#F9FAFB' : '#111827'
                                }}
                                labelFormatter={(date) => new Date(date).toLocaleDateString(language === 'ru' ? 'ru' : 'en')}
                                formatter={(value: number) => [
                                  `${displayWeight(value)} ${weightUnitLabel}`,
                                  language === 'ru' ? 'Вес' : 'Weight'
                                ]}
                              />
                              <Area
                                type="monotone"
                                dataKey="weight"
                                stroke="#4C6FFF"
                                strokeWidth={2}
                                fill="url(#colorWeight)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                          
                          {/* Target zone indicator for maintenance */}
                          {user?.fitnessGoal === 'maintenance' && (
                            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                              <span>{language === 'ru' ? 'Целевой диапазон:' : 'Target range:'}</span>
                              <span className="font-medium text-green-500">
                                {goalProgress.targetValue} {goalProgress.unit}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          {getText('progress.noRecords')}
                        </div>
                      )
                    })()}
                  </div>

                  {/* Stats Cards - For weight-related goals (fat_loss, muscle_gain) */}
                  {user?.fitnessGoal !== 'maintenance' && user?.fitnessGoal !== 'endurance' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{getText('progress.currentWeight')}</p>
                      <p className="text-2xl font-bold">{displayWeight(user?.currentWeight)} <span className="text-sm font-normal text-muted-foreground">{weightUnitLabel}</span></p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{getText('progress.targetWeight')}</p>
                      <p className="text-2xl font-bold">{displayWeight(user?.targetWeight)} <span className="text-sm font-normal text-muted-foreground">{weightUnitLabel}</span></p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{getText('progress.difference')}</p>
                      <p className="text-2xl font-bold text-primary">
                        {user && ((user.currentWeight - user.targetWeight) > 0 ? '-' : '+')}
                        {user ? displayWeight(Math.abs(user.currentWeight - user.targetWeight)) : '--'} <span className="text-sm font-normal">{weightUnitLabel}</span>
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{getText('progress.bmi')}</p>
                      <p className="text-2xl font-bold">
                        {user ? (user.currentWeight / Math.pow(user.height / 100, 2)).toFixed(1) : '--'}
                      </p>
                    </div>
                  </div>
                  )}

                  {/* Stats Cards - For endurance goals (only current weight and BMI) */}
                  {user?.fitnessGoal === 'endurance' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{getText('progress.currentWeight')}</p>
                      <p className="text-2xl font-bold">{displayWeight(user?.currentWeight)} <span className="text-sm font-normal text-muted-foreground">{weightUnitLabel}</span></p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{getText('progress.bmi')}</p>
                      <p className="text-2xl font-bold">
                        {user ? (user.currentWeight / Math.pow(user.height / 100, 2)).toFixed(1) : '--'}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{language === 'ru' ? 'Текущий результат' : 'Current Result'}</p>
                      <p className="text-2xl font-bold text-primary">
                        {goalProgress.currentValue} <span className="text-sm font-normal text-muted-foreground">{goalProgress.unit}</span>
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{language === 'ru' ? 'Цель' : 'Target'}</p>
                      <p className="text-2xl font-bold text-green-500">
                        {goalProgress.targetValue} <span className="text-sm font-normal text-muted-foreground">{goalProgress.unit}</span>
                      </p>
                    </div>
                  </div>
                  )}

                  {/* Achievements Button - Yellow Card (Darker) */}
                  <button
                    onClick={() => setShowAchievementModal(true)}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <Award className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-white">
                            {language === 'ru' ? 'Достижения' : 'Achievements'}
                          </h3>
                          <p className="text-sm text-white/80">
                            {(() => {
                              const userAchievements = user?.achievements || []
                              const goalAchievements = getAchievementsForGoal(user?.fitnessGoal || 'maintenance')
                              // Only count achievements relevant to current goal
                              const goalAchievementIds = new Set(goalAchievements.map(a => a.id))
                              const completed = userAchievements.filter(a => a.completed && goalAchievementIds.has(a.achievementId)).length
                              const total = goalAchievements.length
                              return `${completed} / ${total} ${language === 'ru' ? 'получено' : 'earned'}`
                            })()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/70" />
                    </div>
                  </button>

                  {/* Gamification Stats */}
                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{language === 'ru' ? 'Твой уровень' : 'Your Level'}</h3>
                      {(() => {
                        const userAchievements = user?.achievements || []
                        const totalXp = calculateTotalXp(userAchievements)
                        const levelInfo = calculateUserLevel(totalXp)
                        return (
                          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {language === 'ru' ? levelInfo.titleRu : levelInfo.title}
                          </div>
                        )
                      })()}
                    </div>
                    
                    {/* Level Progress */}
                    {(() => {
                      const userAchievements = user?.achievements || []
                      const totalXp = calculateTotalXp(userAchievements)
                      const levelInfo = calculateUserLevel(totalXp)
                      const progressPercent = levelInfo.nextLevelXp > levelInfo.currentLevelXp 
                        ? Math.round(((totalXp - levelInfo.currentLevelXp) / (levelInfo.nextLevelXp - levelInfo.currentLevelXp)) * 100)
                        : 100
                      
                      return (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{language === 'ru' ? `Уровень ${levelInfo.level}` : `Level ${levelInfo.level}`}</span>
                            <span>{totalXp} / {levelInfo.nextLevelXp} XP</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <p className="text-2xl font-bold">{completedWorkouts.length}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Тренировок' : 'Workouts'}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <p className="text-2xl font-bold">{weightLogs.length}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Записей веса' : 'Weight logs'}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <p className="text-2xl font-bold">{(() => {
                          const userAchievements = user?.achievements || []
                          return userAchievements.filter(a => a.completed).length
                        })()}</p>
                        <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Достижений' : 'Achievements'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]"
                >
                  {/* Disclaimer */}
                  {showDisclaimer && (
                    <div className="p-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-2 flex items-start gap-2">
                      <p className="text-xs text-amber-700 dark:text-amber-300 flex-1">{getText('chat.disclaimer')}</p>
                      <button 
                        onClick={dismissDisclaimer}
                        className="text-amber-700 dark:text-amber-300 hover:opacity-70 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Remaining messages - compact header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs text-muted-foreground">
                      {remainingMessages === Infinity 
                        ? '∞' 
                        : remainingMessages} {getText('chat.limitInfo')}
                    </span>
                    <div className="flex items-center gap-2">
                      {user?.subscriptionTier !== 'elite' && (
                        <button 
                          onClick={() => setShowSubscription(true)}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          {language === 'ru' ? 'Увеличить' : 'Upgrade'}
                        </button>
                      )}
                      {chatMessages.length > 0 && (
                        <button
                          onClick={() => clearChat()}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {language === 'ru' ? 'Очистить' : 'Clear'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Messages - takes most space */}
                  <div 
                    id="chat-messages-container"
                    className="flex-1 overflow-auto scroll-smooth px-1 pb-2"
                    style={{ minHeight: '200px' }}
                  >
                    {chatMessages.length === 0 && (
                      <div className="p-8 rounded-2xl bg-card border border-border text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2 text-lg">{getText('chat.title')}</h3>
                        <p className="text-muted-foreground text-base">{getText('chat.subtitle')}</p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {chatMessages.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[88%] rounded-2xl ${
                                msg.role === 'user'
                                  ? 'bg-primary text-white rounded-br-md px-4 py-3'
                                  : 'bg-card border border-border rounded-bl-md px-4 py-3'
                              }`}
                            >
                              <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ fontSize: '16px' }}>{msg.content}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {isAiTyping && (
                        <motion.div 
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-start"
                        >
                          <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-bl-md">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Input & Suggestions - compact bottom section */}
                  <div className="shrink-0 pt-2 border-t border-border/50">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                          }, 100)
                        }}
                        placeholder={getText('chat.placeholder')}
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[46px]"
                        style={{ fontSize: '16px' }}
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || !canSendChatMessage()}
                        className="px-4 py-3 rounded-xl bg-primary text-white transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[46px] min-w-[46px] flex items-center justify-center"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Smart Suggestions - compact horizontal scroll */}
                    {!chatInput && (
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                        {[
                          { key: 'todayWorkout', icon: Dumbbell },
                          { key: 'dinner', icon: Utensils },
                          { key: 'weightLoss', icon: TrendingUp },
                          { key: 'motivation', icon: Heart },
                        ].map((suggestion) => {
                          const Icon = suggestion.icon
                          return (
                            <button
                              key={suggestion.key}
                              onClick={() => setChatInput(t(`chat.suggestions.${suggestion.key}`, language))}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground text-sm hover:bg-secondary hover:text-foreground transition-all whitespace-nowrap shrink-0"
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {t(`chat.suggestions.${suggestion.key}`, language)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Modals */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowWeightModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{getText('progress.logWeight')}</h3>
                {/* Unit toggle */}
                <div className="flex items-center gap-1 p-0.5 bg-secondary rounded-lg">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      weightUnit === 'kg' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      weightUnit === 'lbs' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <div className="relative mb-4">
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder={`${getText('onboarding.body.currentWeight')}`}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{weightUnit}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-3 rounded-xl bg-secondary font-medium hover:bg-secondary/80 transition-colors"
                >
                  {getText('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    // Convert to kg before saving if input is in lbs
                    const weightInKg = weightUnit === 'lbs' && newWeight ? lbsToKg(parseFloat(newWeight)) : parseFloat(newWeight)
                    if (weightInKg && !isNaN(weightInKg)) {
                      addWeightLog({
                        id: Date.now().toString(),
                        weight: weightInKg,
                        date: new Date().toISOString()
                      })
                      setNewWeight('')
                      setShowWeightModal(false)
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98]"
                >
                  {getText('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSubscription(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-card rounded-2xl p-6 max-h-[85vh] overflow-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">{getText('subscription.title')}</h3>
                <button onClick={() => setShowSubscription(false)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrentPlan = user?.subscriptionTier === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        if (!isCurrentPlan && user) {
                          // Store old tier for comparison
                          const oldTier = user.subscriptionTier
                          // Update subscription tier (this will reset achievements if tier changes)
                          updateSubscriptionTier(plan.id as 'free' | 'pro' | 'elite')
                          // Show notification if achievements were reset
                          if (oldTier !== plan.id) {
                            setShowAchievementsResetNotification(true)
                            setTimeout(() => setShowAchievementsResetNotification(false), 4000)
                          }
                          setShowSubscription(false)
                        }
                      }}
                      className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                        isCurrentPlan 
                          ? 'border-primary bg-primary/10' 
                          : plan.popular 
                            ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                            : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {plan.popular && !isCurrentPlan && (
                        <span className="text-xs font-semibold text-primary mb-2 block">{getText('subscription.popular')}</span>
                      )}
                      {isCurrentPlan && (
                        <span className="text-xs font-semibold text-green-500 mb-2 block">
                          {language === 'ru' ? 'Текущий план' : 'Current plan'}
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{plan.nameKey}</h4>
                        <div>
                          <span className="text-xl font-bold">{plan.price}</span>
                          <span className="text-sm text-muted-foreground">{t(plan.periodKey, language)}</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((featureKey, i) => (
                          <li key={`${plan.id}-${i}`} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            {t(featureKey, language)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedMeal && <RecipeModal />}

        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-card rounded-2xl p-6 max-h-[85vh] overflow-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                  {language === 'ru' ? 'Настройки' : 'Settings'}
                </h3>
                <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Profile */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {language === 'ru' ? 'Профиль' : 'Profile'}
                </h4>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="font-medium">{user?.name || 'User'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || 'email@example.com'}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.subscriptionTier || 'Free'} plan</p>
                </div>
              </div>
              
              {/* Language Selection */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {language === 'ru' ? 'Язык' : 'Language'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLanguage('ru')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      language === 'ru' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl mb-1 block">RU</span>
                    <span className="font-medium text-sm">Русский</span>
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      language === 'en' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl mb-1 block">EN</span>
                    <span className="font-medium text-sm">English</span>
                  </button>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {language === 'ru' ? 'Тема' : 'Theme'}
                </h4>
                <button
                  onClick={handleThemeToggle}
                  className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all flex items-center justify-between"
                >
                  <span>{isDarkMode 
                    ? (language === 'ru' ? 'Тёмная тема' : 'Dark mode')
                    : (language === 'ru' ? 'Светлая тема' : 'Light mode')
                  }</span>
                  <div className={`w-12 h-6 rounded-full transition-all ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>

              {/* Progress Display Type */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {language === 'ru' ? 'Вид прогресса' : 'Progress View'}
                </h4>
                <button
                  onClick={toggleProgressType}
                  className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all flex items-center justify-between"
                >
                  <span>{useCircularProgress 
                    ? (language === 'ru' ? 'Круговой индикатор' : 'Circular progress')
                    : (language === 'ru' ? 'Линейный прогресс' : 'Linear progress')
                  }</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${useCircularProgress ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 ${useCircularProgress ? 'border-primary' : 'border-muted-foreground'}`} style={{ 
                        borderColor: useCircularProgress ? 'var(--primary)' : undefined,
                        background: useCircularProgress ? `conic-gradient(var(--primary) 75%, transparent 0)` : undefined 
                      }} />
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!useCircularProgress ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <div className={`w-5 h-1.5 rounded-full ${!useCircularProgress ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                    </div>
                  </div>
                </button>
              </div>

              {/* Profile Settings - Enhanced UI */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('profileSettings.title', language)}
                  </h4>
                  {user?.subscriptionTier !== 'elite' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Elite
                    </span>
                  )}
                </div>
                
                {/* Goal Selection - Card Style with Gradients */}
                <div className={`mb-4 ${user?.subscriptionTier !== 'elite' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('profileSettings.goal.title', language)}</span>
                    {user?.subscriptionTier !== 'elite' && (
                      <div className="relative group">
                        <Lock className="w-3 h-3 text-amber-500 ml-1" />
                        <div className="absolute left-0 bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg border border-border">
                          {t('profileSettings.lockedTooltip', language)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'fat_loss', icon: Flame, gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-500/20 to-red-500/20' },
                      { id: 'muscle_gain', icon: Dumbbell, gradient: 'from-blue-500 to-indigo-500', bgGradient: 'from-blue-500/20 to-indigo-500/20' },
                      { id: 'endurance', icon: Activity, gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-500/20 to-emerald-500/20' },
                      { id: 'maintenance', icon: Heart, gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-500/20 to-rose-500/20' },
                    ].map(goal => {
                      const Icon = goal.icon
                      const isSelected = user?.fitnessGoal === goal.id
                      const isLocked = user?.subscriptionTier !== 'elite'
                      return (
                        <button
                          key={goal.id}
                          disabled={isLocked}
                          onClick={() => {
                            if (user?.subscriptionTier === 'elite') {
                              // Show confirmation for goal change
                              setPendingGoalChange(goal.id as any)
                              setShowGoalConfirmModal(true)
                            }
                          }}
                          className={`relative p-3 rounded-xl border-2 transition-all text-left overflow-hidden ${
                            isSelected 
                              ? `border-transparent bg-gradient-to-br ${goal.bgGradient}` 
                              : 'border-border bg-card hover:border-primary/50'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? `bg-gradient-to-br ${goal.gradient}` 
                                : 'bg-secondary'
                            }`}>
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className="font-medium text-xs sm:text-sm leading-tight truncate">{t(`profileSettings.goal.${goal.id}`, language)}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t(`profileSettings.goal.${goal.id}_desc`, language)}</p>
                            </div>
                            {isSelected && (
                              <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br ${goal.gradient} flex items-center justify-center flex-shrink-0`}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Training Location - Segmented Control */}
                <div className={`mb-4 ${user?.subscriptionTier !== 'elite' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('profileSettings.location.title', language)}</span>
                    {user?.subscriptionTier !== 'elite' && (
                      <div className="relative group">
                        <Lock className="w-3 h-3 text-amber-500 ml-1" />
                        <div className="absolute left-0 bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg border border-border">
                          {t('profileSettings.lockedTooltip', language)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 p-1 rounded-xl bg-secondary/50">
                    {[
                      { id: 'home', icon: Home },
                      { id: 'gym', icon: Dumbbell },
                      { id: 'both', icon: ArrowRightLeft },
                    ].map(loc => {
                      const Icon = loc.icon
                      const isSelected = user?.trainingLocation === loc.id
                      const isLocked = user?.subscriptionTier !== 'elite'
                      return (
                        <button
                          key={loc.id}
                          disabled={isLocked}
                          onClick={() => {
                            if (user?.subscriptionTier === 'elite') {
                              updateUser({ trainingLocation: loc.id as any })
                              generateWorkoutPlan()
                              showSettingsNotification('location')
                            }
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all text-sm font-medium ${
                            isSelected 
                              ? 'bg-primary text-white shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <Icon className="w-4 h-4" />
                          {t(`profileSettings.location.${loc.id}`, language)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Fitness Level - Radio Cards */}
                <div className={`${user?.subscriptionTier !== 'elite' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('profileSettings.level.title', language)}</span>
                    {user?.subscriptionTier !== 'elite' && (
                      <div className="relative group">
                        <Lock className="w-3 h-3 text-amber-500 ml-1" />
                        <div className="absolute left-0 bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg border border-border">
                          {t('profileSettings.lockedTooltip', language)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'beginner', icon: '🌱' },
                      { id: 'intermediate', icon: '⚡' },
                      { id: 'advanced', icon: '🏆' },
                    ].map(level => {
                      const isSelected = user?.fitnessLevel === level.id
                      const isLocked = user?.subscriptionTier !== 'elite'
                      return (
                        <button
                          key={level.id}
                          disabled={isLocked}
                          onClick={() => {
                            if (user?.subscriptionTier === 'elite') {
                              updateUser({ fitnessLevel: level.id as any })
                              generateWorkoutPlan()
                              showSettingsNotification('level')
                            }
                          }}
                          className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border bg-card hover:border-primary/50'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-lg">
                            {level.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{t(`profileSettings.level.${level.id}`, language)}</p>
                            <p className="text-[10px] text-muted-foreground">{t(`profileSettings.level.${level.id}_desc`, language)}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                {/* Goal History Section */}
                {user?.goalHistory && user.goalHistory.length > 0 && (
                  <div className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {language === 'ru' ? 'История целей' : 'Goal History'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {user.goalHistory.map((entry) => {
                        const goalLabels: Record<string, { ru: string; en: string; icon: React.ElementType; color: string }> = {
                          fat_loss: { ru: 'Похудение', en: 'Fat Loss', icon: Flame, color: 'text-orange-500' },
                          muscle_gain: { ru: 'Набор массы', en: 'Muscle Gain', icon: Dumbbell, color: 'text-blue-500' },
                          endurance: { ru: 'Выносливость', en: 'Endurance', icon: Activity, color: 'text-green-500' },
                          maintenance: { ru: 'Поддержание', en: 'Maintenance', icon: Heart, color: 'text-pink-500' },
                        }
                        const goalInfo = goalLabels[entry.goalType] || goalLabels.fat_loss
                        const GoalIcon = goalInfo.icon
                        const startDate = new Date(entry.startedAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })
                        const endDate = new Date(entry.endedAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })
                        
                        return (
                          <div key={entry.id} className="p-3 rounded-lg bg-card border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <GoalIcon className={`w-4 h-4 ${goalInfo.color}`} />
                                <span className="font-medium text-sm">
                                  {language === 'ru' ? goalInfo.ru : goalInfo.en}
                                </span>
                              </div>
                              {entry.goalReached && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                                  {language === 'ru' ? 'Достигнута' : 'Achieved'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{startDate} - {endDate}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Dumbbell className="w-3 h-3" />
                                  {entry.totalWorkouts} {language === 'ru' ? 'тренировок' : 'workouts'}
                                </span>
                                {entry.weightChange !== undefined && entry.weightChange !== 0 && (
                                  <span className={entry.weightChange < 0 ? 'text-green-500' : 'text-blue-500'}>
                                    {entry.weightChange > 0 ? '+' : ''}{entry.weightChange.toFixed(1)} кг
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>{entry.achievements.length} {language === 'ru' ? 'достижений' : 'achievements'}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {user?.subscriptionTier !== 'elite' && (
                  <button
                    onClick={() => {
                      setShowSettings(false)
                      setShowSubscription(true)
                    }}
                    className="w-full mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium hover:from-amber-500/20 hover:to-orange-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    {t('profileSettings.upgradeToElite', language)}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showFridgeAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowFridgeAnalysis(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-card rounded-2xl p-6 max-h-[85vh] overflow-auto border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  {language === 'ru' ? 'Анализ холодильника' : 'Fridge Analysis'}
                </h3>
                <button 
                  onClick={() => setShowFridgeAnalysis(false)} 
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isAnalyzingFridge ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'ru' ? 'Анализируем содержимое холодильника...' : 'Analyzing fridge contents...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detected Products */}
                  {fridgeProducts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">
                        {language === 'ru' ? 'Найденные продукты' : 'Detected Products'}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {fridgeProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 rounded-xl bg-secondary/50 text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{language === 'ru' ? product.nameRu : product.name}</span>
                              {product.available && <Check className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {product.calories} kcal • {product.protein}g P
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Recipes */}
                  {fridgeRecipes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">
                        {language === 'ru' ? 'Рекомендуемые рецепты' : 'Recommended Recipes'}
                      </h4>
                      <div className="space-y-3">
                        {fridgeRecipes.map((recipe, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-xl bg-secondary/50 border border-border"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold">{language === 'ru' ? recipe.nameRu : recipe.name}</h5>
                              <span className="text-xs text-primary font-medium">{recipe.calories} kcal</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {language === 'ru' ? recipe.descriptionRu : recipe.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              <span>{recipe.protein}g {language === 'ru' ? 'Белки' : 'Protein'}</span>
                              <span>{recipe.carbs}g {language === 'ru' ? 'Углеводы' : 'Carbs'}</span>
                              <span>{recipe.fat}g {language === 'ru' ? 'Жиры' : 'Fat'}</span>
                            </div>
                            {recipe.ingredients && (
                              <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.map((ing: string, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fridgeProducts.length === 0 && fridgeRecipes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === 'ru' 
                        ? 'Не удалось найти продукты. Попробуйте ещё раз.' 
                        : 'No products found. Please try again.'}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Endurance Result Modal */}
      <AnimatePresence>
        {showEnduranceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEnduranceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">
                {language === 'ru' ? 'Записать результат' : 'Log Result'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {user?.enduranceMetric === 'run_5km' 
                  ? (language === 'ru' ? 'Время бега на 5 км (в минутах)' : '5km run time (minutes)')
                  : user?.enduranceMetric === 'run_10km'
                    ? (language === 'ru' ? 'Время бега на 10 км (в минутах)' : '10km run time (minutes)')
                    : user?.enduranceMetric === 'pushups'
                      ? (language === 'ru' ? 'Количество отжиманий' : 'Push-up count')
                      : user?.enduranceMetric === 'plank'
                        ? (language === 'ru' ? 'Время планки (в секундах)' : 'Plank time (seconds)')
                        : (language === 'ru' ? 'Результат' : 'Result')}
              </p>
              
              <div className="relative mb-4">
                <input
                  type="number"
                  step="0.1"
                  value={newEnduranceValue}
                  onChange={(e) => setNewEnduranceValue(e.target.value)}
                  placeholder={language === 'ru' ? 'Введите значение' : 'Enter value'}
                  className="w-full px-4 py-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
              </div>
              
              {/* Quick input buttons */}
              <div className="flex gap-2 mb-4">
                {user?.enduranceMetric === 'run_5km' || user?.enduranceMetric === 'run_10km' ? (
                  <>
                    {[15, 20, 25, 30, 35, 40].map((val) => (
                      <button
                        key={val}
                        onClick={() => setNewEnduranceValue(String(val))}
                        className="flex-1 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {val}
                      </button>
                    ))}
                  </>
                ) : user?.enduranceMetric === 'pushups' ? (
                  <>
                    {[10, 20, 30, 40, 50].map((val) => (
                      <button
                        key={val}
                        onClick={() => setNewEnduranceValue(String(val))}
                        className="flex-1 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {val}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[30, 60, 90, 120, 180].map((val) => (
                      <button
                        key={val}
                        onClick={() => setNewEnduranceValue(String(val))}
                        className="flex-1 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {val}
                      </button>
                    ))}
                  </>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEnduranceModal(false)}
                  className="flex-1 py-3 rounded-xl bg-secondary font-medium hover:bg-secondary/80 transition-colors"
                >
                  {getText('common.cancel')}
                </button>
                <button
                  onClick={logEnduranceResult}
                  disabled={!newEnduranceValue}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {getText('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievements Modal - Full Screen */}
      <AnimatePresence>
        {showAchievementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAchievementModal(false)}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold">{language === 'ru' ? 'Достижения' : 'Achievements'}</h2>
                  {(() => {
                    const userAchievements = user?.achievements || []
                    const goalAchievements = getAchievementsForGoal(user?.fitnessGoal || 'maintenance')
                    // Only count achievements relevant to current goal
                    const goalAchievementIds = new Set(goalAchievements.map(a => a.id))
                    const completed = userAchievements.filter(a => a.completed && goalAchievementIds.has(a.achievementId)).length
                    const total = goalAchievements.length
                    return (
                      <p className="text-sm text-muted-foreground">
                        {completed} / {total} {language === 'ru' ? 'получено' : 'earned'}
                      </p>
                    )
                  })()}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Categories */}
              {(() => {
                const getIcon = (iconName: string) => {
                  const icons: Record<string, React.ElementType> = {
                    Flame, Award, Crown, Play, Activity, Zap,
                    TrendingDown, Target, Sparkles, Scale, BarChart3,
                  }
                  return icons[iconName] || Award
                }

                const categories = [
                  {
                    id: 'regularity',
                    title: language === 'ru' ? 'Регулярность' : 'Regularity',
                    description: language === 'ru' ? 'Дни подряд' : 'Days in a row',
                    icon: Flame,
                    color: 'text-orange-500',
                    bgColor: 'bg-orange-500/10',
                  },
                  {
                    id: 'workouts',
                    title: language === 'ru' ? 'Тренировки' : 'Workouts',
                    description: language === 'ru' ? 'Завершённые тренировки' : 'Completed workouts',
                    icon: Dumbbell,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-500/10',
                  },
                  {
                    id: 'goal',
                    title: language === 'ru' ? 'Прогресс' : 'Progress',
                    description: language === 'ru' ? 'К цели' : 'Towards goal',
                    icon: Target,
                    color: 'text-green-500',
                    bgColor: 'bg-green-500/10',
                  },
                  {
                    id: 'weight_logs',
                    title: language === 'ru' ? 'Записи веса' : 'Weight Logs',
                    description: language === 'ru' ? 'Отслеживание веса' : 'Weight tracking',
                    icon: Scale,
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-500/10',
                  },
                ]

                // Get goal-specific achievements
                const goalAchievements = getAchievementsForGoal(user?.fitnessGoal || 'maintenance')

                return categories.map(category => {
                  // Filter goal-specific achievements by category
                  const categoryAchievements = goalAchievements.filter(a => a.type === category.id)
                  if (categoryAchievements.length === 0) return null

                  const completedCount = categoryAchievements.filter(a =>
                    user?.achievements?.find(ua => ua.achievementId === a.id && ua.completed)
                  ).length
                  const CategoryIcon = category.icon

                  return (
                    <div key={category.id} className="p-4 rounded-2xl bg-card border border-border">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                            <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.title}</h3>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          <span className={completedCount > 0 ? category.color : 'text-muted-foreground'}>
                            {completedCount}
                          </span>
                          <span className="text-muted-foreground">/{categoryAchievements.length}</span>
                        </span>
                      </div>

                      {/* Achievements List */}
                      <div className="space-y-2">
                        {categoryAchievements.map(achievement => {
                          const userAchievement = user?.achievements?.find(a => a.achievementId === achievement.id)
                          const isCompleted = !!userAchievement?.completed
                          const progress = userAchievement?.progress || 0
                          const Icon = getIcon(achievement.icon)
                          const progressPercent = Math.min(100, (progress / achievement.requirement) * 100)

                          return (
                            <motion.div
                              key={achievement.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isCompleted
                                  ? `${category.bgColor} border border-transparent`
                                  : 'bg-secondary/30'
                              }`}
                            >
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isCompleted ? category.bgColor : 'bg-muted'
                              }`}>
                                <Icon className={`w-5 h-5 ${isCompleted ? category.color : 'text-muted-foreground'}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className={`font-medium text-sm ${isCompleted ? '' : 'text-muted-foreground'}`}>
                                    {language === 'ru' ? achievement.nameRu : achievement.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {progress}/{achievement.requirement}
                                    </span>
                                    <span className={`text-xs font-bold ${isCompleted ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                      +{achievement.xpReward} XP
                                    </span>
                                  </div>
                                </div>
                                {/* Progress bar */}
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${isCompleted ? category.color.replace('text-', 'bg-') : 'bg-primary/50'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                  />
                                </div>
                              </div>

                              {/* Completed indicator */}
                              {isCompleted && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`w-6 h-6 rounded-full ${category.color.replace('text-', 'bg-')} flex items-center justify-center`}
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievement Notification Toast */}
      <AnimatePresence>
        {showAchievementNotification && achievementNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white shadow-2xl">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="text-3xl"
              >
                {achievementNotification.icon}
              </motion.div>
              <div>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-bold text-lg"
                >
                  {language === 'ru' ? 'Достижение!' : 'Achievement!'}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-white/90"
                >
                  {language === 'ru' ? achievementNotification.nameRu : achievementNotification.name}
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="ml-2 px-2 py-1 rounded-lg bg-white/20 text-sm font-bold"
              >
                +{achievementNotification.xpReward} XP
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Skill Tree Modal - NEW */}
      <AnimatePresence>
        {showSkillTree && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowSkillTree(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card rounded-3xl p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">
                    {language === 'ru' ? 'Дерево навыков' : 'Skill Tree'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'ru' ? 'Открывай новые уровни упражнений' : 'Unlock new exercise levels'}
                  </p>
                </div>
                <button
                  onClick={() => setShowSkillTree(false)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Skill Tree Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSkillTreeData().map((group: SkillTreeGroup) => (
                  <motion.div
                    key={group.muscleGroup}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedMuscleGroup === group.muscleGroup 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-secondary/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMuscleGroup(
                      selectedMuscleGroup === group.muscleGroup ? null : group.muscleGroup
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <h4 className="font-bold">{group.muscleGroupRu}</h4>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ru' ? `Уровень ${group.currentLevel}/${group.maxLevel}` : `Level ${group.currentLevel}/${group.maxLevel}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{Math.round(group.progressPercentage)}%</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${group.progressPercentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    
                    {/* Level Dots */}
                    <div className="flex justify-between">
                      {group.nodes.map((node: SkillTreeNode) => (
                        <motion.div
                          key={node.level}
                          className={`relative flex flex-col items-center ${
                            node.isUnlocked ? 'opacity-100' : 'opacity-40'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 * node.level }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            node.isCurrent 
                              ? 'bg-primary text-white ring-4 ring-primary/30' 
                              : node.isUnlocked 
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {node.isUnlocked ? '✓' : node.level}
                          </div>
                          {node.isCurrent && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -bottom-1 w-2 h-2 rounded-full bg-primary"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedMuscleGroup === group.muscleGroup && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-border overflow-hidden"
                        >
                          {group.nodes.map((node: SkillTreeNode) => (
                            <div 
                              key={node.exerciseId}
                              className={`flex items-center justify-between py-2 ${
                                !node.isUnlocked ? 'opacity-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  node.isCurrent ? 'bg-primary text-white' : 
                                  node.isUnlocked ? 'bg-green-500/20 text-green-500' : 'bg-muted'
                                }`}>
                                  {node.level}
                                </span>
                                <span className="text-sm">
                                  {language === 'ru' ? node.exerciseNameRu : node.exerciseName}
                                </span>
                              </div>
                              {node.xpEarned && (
                                <span className="text-xs text-amber-500">+{node.xpEarned} XP</span>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level Up Notification - NEW */}
      <AnimatePresence>
        {showLevelUpNotification && levelUpData && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Award className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-bold text-lg"
                >
                  {language === 'ru' ? 'Новый уровень!' : 'Level Up!'}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-white/90"
                >
                  {language === 'ru' 
                    ? `Разблокировано: ${levelUpData.exerciseName}`
                    : `Unlocked: ${levelUpData.exerciseName}`}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Goal Change Confirmation Modal */}
      <AnimatePresence>
        {showGoalConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
            onClick={() => setShowGoalConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t('profileSettings.confirm.title', language)}</h3>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                {t('profileSettings.confirm.message', language)}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGoalConfirmModal(false)
                    setPendingGoalChange(null)
                  }}
                  className="flex-1 py-3 rounded-xl bg-secondary font-medium hover:bg-secondary/80 transition-colors"
                >
                  {t('profileSettings.confirm.no', language)}
                </button>
                <button
                  onClick={confirmGoalChange}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold transition-transform active:scale-[0.98]"
                >
                  {t('profileSettings.confirm.yes', language)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings Update Notification */}
      <AnimatePresence>
        {settingsNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-500 text-white shadow-xl">
              <Check className="w-5 h-5" />
              <p className="font-medium text-sm">
                {t('profileSettings.success.message', language)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievements Reset Notification - shown when subscription changes */}
      <AnimatePresence>
        {showAchievementsResetNotification && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500 text-white shadow-xl">
              <RefreshCw className="w-5 h-5" />
              <p className="font-medium text-sm">
                {language === 'ru' 
                  ? 'Достижения сброшены! Начните собирать их заново!' 
                  : 'Achievements reset! Start collecting them again!'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
