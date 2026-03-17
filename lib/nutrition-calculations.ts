// ============================================================================
// NUTRITION CALCULATIONS - Goal-based macro calculations and meal planning
// ============================================================================

import { 
  FoodProduct, 
  FoodDish, 
  FOOD_PRODUCTS, 
  FOOD_DISHES,
  GoalTag,
  MealType,
  Season,
  DishIngredient
} from './food-database'

// ============================================================================
// TYPES
// ============================================================================

export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'
export type Gender = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface UserProfile {
  age: number
  gender: Gender
  height: number // cm
  currentWeight: number // kg
  targetWeight: number // kg
  fitnessGoal: FitnessGoal
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  activityLevel?: ActivityLevel
}

export interface DailyTargets {
  calories: number
  protein: number // grams
  fat: number // grams
  carbs: number // grams
  fiber?: number // grams
  mealsPerDay: number
}

export interface GoalMacros {
  proteinPerKg: [number, number] // min, max per kg bodyweight
  fatPerKg: [number, number]
  carbsPerKg?: [number, number] // specific for endurance
  calorieAdjustment: number // percentage: negative for deficit, positive for surplus
  description: string
  descriptionRu: string
}

// ============================================================================
// GOAL-SPECIFIC MACRO CONFIGURATIONS
// ============================================================================

export const GOAL_MACROS: Record<FitnessGoal, GoalMacros> = {
  fat_loss: {
    proteinPerKg: [1.8, 2.2],
    fatPerKg: [0.8, 1.0],
    calorieAdjustment: -15, // 15% deficit
    description: 'Calorie deficit for fat burning while preserving muscle mass',
    descriptionRu: 'Дефицит калорий для жиросжигания с сохранением мышц'
  },
  muscle_gain: {
    proteinPerKg: [1.8, 2.2],
    fatPerKg: [1.0, 1.2],
    calorieAdjustment: 15, // 15% surplus
    description: 'Calorie surplus for muscle growth and strength gains',
    descriptionRu: 'Профицит калорий для роста мышц и силы'
  },
  endurance: {
    proteinPerKg: [1.5, 1.8],
    fatPerKg: [0.8, 1.0],
    carbsPerKg: [4, 6],
    calorieAdjustment: 5, // slight surplus for energy
    description: 'High carbs for energy, moderate protein for recovery',
    descriptionRu: 'Много углеводов для энергии, умеренно белка для восстановления'
  },
  maintenance: {
    proteinPerKg: [1.5, 1.8],
    fatPerKg: [0.8, 1.0],
    calorieAdjustment: 0, // maintenance
    description: 'Balanced nutrition for weight maintenance',
    descriptionRu: 'Сбалансированное питание для поддержания веса'
  }
}

// ============================================================================
// BASAL METABOLIC RATE (BMR) CALCULATION
// ============================================================================

/**
 * Calculate BMR using Mifflin-St Jeor equation (most accurate)
 */
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'female' ? base - 161 : base + 5
}

/**
 * Activity multiplier for TDEE calculation
 */
export function getActivityMultiplier(level: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9     // Very hard exercise & physical job
  }
  return multipliers[level]
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel = 'moderate'
): number {
  const bmr = calculateBMR(weight, height, age, gender)
  return Math.round(bmr * getActivityMultiplier(activityLevel))
}

// ============================================================================
// GOAL-BASED MACRO CALCULATIONS
// ============================================================================

/**
 * Calculate daily calorie and macro targets based on goal
 */
export function calculateDailyTargets(
  profile: UserProfile,
  mealsPerDay: number = 4
): DailyTargets {
  const { currentWeight, fitnessGoal, activityLevel = 'moderate' } = profile
  
  // Calculate base TDEE
  const tdee = calculateTDEE(
    currentWeight,
    profile.height,
    profile.age,
    profile.gender,
    activityLevel
  )
  
  const goalConfig = GOAL_MACROS[fitnessGoal]
  
  // Calculate calorie target with goal adjustment
  const calorieAdjustment = 1 + (goalConfig.calorieAdjustment / 100)
  const targetCalories = Math.round(tdee * calorieAdjustment)
  
  // Calculate protein (use midpoint of range)
  const proteinPerKg = (goalConfig.proteinPerKg[0] + goalConfig.proteinPerKg[1]) / 2
  const targetProtein = Math.round(currentWeight * proteinPerKg)
  
  // Calculate fat (use midpoint of range)
  const fatPerKg = (goalConfig.fatPerKg[0] + goalConfig.fatPerKg[1]) / 2
  const targetFat = Math.round(currentWeight * fatPerKg)
  
  // Calculate carbs (remaining calories)
  // Protein = 4 cal/g, Fat = 9 cal/g, Carbs = 4 cal/g
  const proteinCalories = targetProtein * 4
  const fatCalories = targetFat * 9
  const remainingCalories = targetCalories - proteinCalories - fatCalories
  const targetCarbs = Math.round(remainingCalories / 4)
  
  // Calculate fiber (roughly 14g per 1000 calories)
  const targetFiber = Math.round(targetCalories / 1000 * 14)
  
  return {
    calories: targetCalories,
    protein: targetProtein,
    fat: targetFat,
    carbs: targetCarbs,
    fiber: targetFiber,
    mealsPerDay
  }
}

/**
 * Get macro distribution percentages
 */
export function getMacroDistribution(targets: DailyTargets): {
  proteinPercent: number
  fatPercent: number
  carbsPercent: number
} {
  const totalCalories = targets.calories
  const proteinCalories = targets.protein * 4
  const fatCalories = targets.fat * 9
  const carbsCalories = targets.carbs * 4
  
  return {
    proteinPercent: Math.round((proteinCalories / totalCalories) * 100),
    fatPercent: Math.round((fatCalories / totalCalories) * 100),
    carbsPercent: Math.round((carbsCalories / totalCalories) * 100)
  }
}

// ============================================================================
// MEAL DISTRIBUTION
// ============================================================================

export interface MealDistribution {
  mealType: MealType
  caloriePercent: number
  proteinPercent: number
  carbsPercent: number
  fatPercent: number
}

/**
 * Get calorie/macro distribution across meals
 */
export function getMealDistributions(mealsPerDay: number): MealDistribution[] {
  // Standard meal distributions
  const distributions4: MealDistribution[] = [
    { mealType: 'breakfast', caloriePercent: 25, proteinPercent: 25, carbsPercent: 30, fatPercent: 20 },
    { mealType: 'lunch', caloriePercent: 35, proteinPercent: 35, carbsPercent: 35, fatPercent: 35 },
    { mealType: 'dinner', caloriePercent: 25, proteinPercent: 25, carbsPercent: 25, fatPercent: 30 },
    { mealType: 'snack', caloriePercent: 15, proteinPercent: 15, carbsPercent: 10, fatPercent: 15 }
  ]
  
  const distributions3: MealDistribution[] = [
    { mealType: 'breakfast', caloriePercent: 30, proteinPercent: 30, carbsPercent: 30, fatPercent: 25 },
    { mealType: 'lunch', caloriePercent: 40, proteinPercent: 40, carbsPercent: 40, fatPercent: 40 },
    { mealType: 'dinner', caloriePercent: 30, proteinPercent: 30, carbsPercent: 30, fatPercent: 35 }
  ]
  
  const distributions5: MealDistribution[] = [
    { mealType: 'breakfast', caloriePercent: 25, proteinPercent: 25, carbsPercent: 25, fatPercent: 20 },
    { mealType: 'snack', caloriePercent: 10, proteinPercent: 10, carbsPercent: 10, fatPercent: 10 },
    { mealType: 'lunch', caloriePercent: 30, proteinPercent: 30, carbsPercent: 30, fatPercent: 30 },
    { mealType: 'snack', caloriePercent: 10, proteinPercent: 10, carbsPercent: 10, fatPercent: 10 },
    { mealType: 'dinner', caloriePercent: 25, proteinPercent: 25, carbsPercent: 25, fatPercent: 30 }
  ]
  
  switch (mealsPerDay) {
    case 3: return distributions3
    case 5: return distributions5
    default: return distributions4
  }
}

// ============================================================================
// MEAL SUITABILITY SCORE
// ============================================================================

export interface MealSuitability {
  score: number // 0-100
  color: 'green' | 'yellow' | 'red'
  label: string
  labelRu: string
  issues: string[]
  issuesRu: string[]
  recommendations: string[]
  recommendationsRu: string[]
}

/**
 * Calculate how well a dish fits the user's goal and remaining macros
 */
export function calculateMealSuitability(
  dish: FoodDish,
  goal: FitnessGoal,
  remainingMacros: { calories: number; protein: number; fat: number; carbs: number },
  mealType: MealType
): MealSuitability {
  const issues: string[] = []
  const issuesRu: string[] = []
  const recommendations: string[] = []
  const recommendationsRu: string[] = []
  
  let score = 100
  
  // Check if dish has goal tag
  if (!dish.tags.includes(goal)) {
    score -= 15
    issues.push('Dish is not optimized for your goal')
    issuesRu.push('Блюдо не оптимизировано для вашей цели')
  }
  
  // Check calorie fit
  const calorieRatio = dish.calories / remainingMacros.calories
  if (calorieRatio > 0.6) {
    score -= 20
    issues.push('High calorie content for remaining daily budget')
    issuesRu.push('Высокая калорийность для остатка дневной нормы')
    recommendations.push('Consider reducing portion size')
    recommendationsRu.push('Рекомендуется уменьшить порцию')
  } else if (calorieRatio > 0.4 && calorieRatio <= 0.6) {
    // Good fit
    score += 5
  }
  
  // Check protein fit (important for muscle_gain and fat_loss)
  if (goal === 'muscle_gain' || goal === 'fat_loss') {
    const proteinRatio = dish.protein / remainingMacros.protein
    if (proteinRatio < 0.2) {
      score -= 15
      issues.push('Low protein content for your goal')
      issuesRu.push('Низкое содержание белка для вашей цели')
      recommendations.push('Add a protein source')
      recommendationsRu.push('Добавьте источник белка')
    } else if (proteinRatio >= 0.25 && proteinRatio <= 0.4) {
      score += 10
    }
  }
  
  // Check carbs fit (important for endurance)
  if (goal === 'endurance') {
    const carbsRatio = dish.carbs / remainingMacros.carbs
    if (carbsRatio < 0.2) {
      score -= 10
      issues.push('Low carbs for endurance activity')
      issuesRu.push('Мало углеводов для выносливости')
      recommendations.push('Add complex carbs')
      recommendationsRu.push('Добавьте сложные углеводы')
    }
  }
  
  // Check fat fit (should be lower for fat_loss)
  if (goal === 'fat_loss') {
    const fatRatio = dish.fat / remainingMacros.fat
    if (fatRatio > 0.5) {
      score -= 15
      issues.push('High fat content for fat loss goal')
      issuesRu.push('Высокое содержание жиров для цели похудения')
      recommendations.push('Choose a leaner option')
      recommendationsRu.push('Выберите вариант с меньшим содержанием жира')
    }
  }
  
  // Check if dish is appropriate for meal type
  if (!dish.mealType.includes(mealType)) {
    score -= 10
    issues.push(`Not typically eaten as ${mealType}`)
    issuesRu.push(`Не типично для ${mealType === 'breakfast' ? 'завтрака' : mealType === 'lunch' ? 'обеда' : mealType === 'dinner' ? 'ужина' : 'перекуса'}`)
  }
  
  // Normalize score
  score = Math.max(0, Math.min(100, score))
  
  // Determine color and label
  let color: 'green' | 'yellow' | 'red'
  let label: string
  let labelRu: string
  
  if (score >= 70) {
    color = 'green'
    label = 'Excellent choice!'
    labelRu = 'Отличный выбор!'
  } else if (score >= 40) {
    color = 'yellow'
    label = 'Acceptable with adjustments'
    labelRu = 'Допустимо с корректировками'
  } else {
    color = 'red'
    label = 'Not recommended for your goal'
    labelRu = 'Не рекомендуется для вашей цели'
  }
  
  return {
    score,
    color,
    label,
    labelRu,
    issues,
    issuesRu,
    recommendations,
    recommendationsRu
  }
}

// ============================================================================
// DAILY MEAL PLAN GENERATION
// ============================================================================

export interface GeneratedMeal {
  dish: FoodDish
  mealType: MealType
  time: string
  suitability: MealSuitability
}

export interface DailyMealPlan {
  date: string
  meals: GeneratedMeal[]
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  totalFiber: number
  targets: DailyTargets
  goal: FitnessGoal
}

/**
 * Get current season
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

/**
 * Shuffle array with seed for reproducibility
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let m = result.length
  
  // Simple seeded random
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  
  while (m) {
    const i = Math.floor(random() * m--)
    ;[result[m], result[i]] = [result[i], result[m]]
  }
  
  return result
}

/**
 * Generate a daily meal plan
 */
export function generateDailyMealPlan(
  profile: UserProfile,
  targets: DailyTargets,
  date: Date = new Date(),
  recentDishIds: string[] = [] // Dishes to avoid (recently used)
): DailyMealPlan {
  const dateString = date.toISOString().split('T')[0]
  const seed = hashCode(dateString + profile.fitnessGoal)
  
  // Get distributions
  const distributions = getMealDistributions(targets.mealsPerDay)
  const season = getCurrentSeason()
  
  // Filter dishes by goal and season
  const eligibleDishes = FOOD_DISHES.filter(dish => {
    // Must match goal
    if (!dish.tags.includes(profile.fitnessGoal)) return false
    
    // Avoid recently used dishes (within last 2 weeks)
    if (recentDishIds.includes(dish.id)) return false
    
    // Check season if specified
    if (dish.season && !dish.season.includes('all') && !dish.season.includes(season)) {
      return false
    }
    
    return true
  })
  
  const meals: GeneratedMeal[] = []
  let remainingMacros = {
    calories: targets.calories,
    protein: targets.protein,
    fat: targets.fat,
    carbs: targets.carbs
  }
  
  // Time slots
  const timeSlots: Record<MealType, string> = {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00',
    snack: '16:00'
  }
  
  // Generate each meal
  for (const distribution of distributions) {
    const mealType = distribution.mealType
    
    // Calculate target macros for this meal
    const mealTargetCalories = Math.round(targets.calories * distribution.caloriePercent / 100)
    const mealTargetProtein = Math.round(targets.protein * distribution.proteinPercent / 100)
    const mealTargetCarbs = Math.round(targets.carbs * distribution.carbsPercent / 100)
    const mealTargetFat = Math.round(targets.fat * distribution.fatPercent / 100)
    
    // Filter dishes for this meal type
    const mealDishes = eligibleDishes.filter(d => d.mealType.includes(mealType))
    
    // Score and sort dishes
    const scoredDishes = mealDishes.map(dish => {
      const calorieDiff = Math.abs(dish.calories - mealTargetCalories)
      const proteinDiff = Math.abs(dish.protein - mealTargetProtein)
      
      // Lower score is better
      const score = calorieDiff + proteinDiff * 2
      
      return { dish, score }
    })
    
    // Sort by score (best match first) and shuffle top candidates
    scoredDishes.sort((a, b) => a.score - b.score)
    const topCandidates = scoredDishes.slice(0, 5)
    const shuffled = seededShuffle(topCandidates, seed + mealType.length)
    
    // Pick the best candidate
    const selected = shuffled[0]
    
    if (selected) {
      const suitability = calculateMealSuitability(
        selected.dish,
        profile.fitnessGoal,
        remainingMacros,
        mealType
      )
      
      meals.push({
        dish: selected.dish,
        mealType,
        time: timeSlots[mealType],
        suitability
      })
      
      // Update remaining macros
      remainingMacros.calories -= selected.dish.calories
      remainingMacros.protein -= selected.dish.protein
      remainingMacros.fat -= selected.dish.fat
      remainingMacros.carbs -= selected.dish.carbs
    }
  }
  
  // Calculate totals
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.dish.calories,
    protein: acc.protein + meal.dish.protein,
    fat: acc.fat + meal.dish.fat,
    carbs: acc.carbs + meal.dish.carbs,
    fiber: acc.fiber + (meal.dish.fiber || 0)
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })
  
  return {
    date: dateString,
    meals,
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalFat: totals.fat,
    totalCarbs: totals.carbs,
    totalFiber: totals.fiber,
    targets,
    goal: profile.fitnessGoal
  }
}

/**
 * Simple hash function for seed generation
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// ============================================================================
// NUTRITION TRACKING
// ============================================================================

export interface FoodLogEntry {
  id: string
  date: string
  mealType: MealType
  foodId: string // product or dish ID
  foodType: 'product' | 'dish'
  name: string
  nameRu: string
  portion: number // grams or servings
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  timestamp: string
}

export interface DailyNutritionSummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  totalFiber: number
  targetCalories: number
  targetProtein: number
  targetFat: number
  targetCarbs: number
  caloriePercent: number
  proteinPercent: number
  fatPercent: number
  carbsPercent: number
}

/**
 * Calculate nutrition for a food log entry
 */
export function calculateEntryNutrition(
  foodId: string,
  foodType: 'product' | 'dish',
  portion: number
): { calories: number; protein: number; fat: number; carbs: number; fiber: number } | null {
  if (foodType === 'product') {
    const product = FOOD_PRODUCTS.find(p => p.id === foodId)
    if (!product) return null
    
    const factor = portion / product.typicalPortion
    return {
      calories: Math.round(product.caloriesPer100g * (product.typicalPortion / 100) * factor),
      protein: Math.round(product.proteinPer100g * (product.typicalPortion / 100) * factor * 10) / 10,
      fat: Math.round(product.fatPer100g * (product.typicalPortion / 100) * factor * 10) / 10,
      carbs: Math.round(product.carbsPer100g * (product.typicalPortion / 100) * factor * 10) / 10,
      fiber: Math.round((product.fiberPer100g || 0) * (product.typicalPortion / 100) * factor * 10) / 10
    }
  } else {
    const dish = FOOD_DISHES.find(d => d.id === foodId)
    if (!dish) return null
    
    const factor = portion
    return {
      calories: Math.round(dish.calories * factor),
      protein: Math.round(dish.protein * factor * 10) / 10,
      fat: Math.round(dish.fat * factor * 10) / 10,
      carbs: Math.round(dish.carbs * factor * 10) / 10,
      fiber: Math.round((dish.fiber || 0) * factor * 10) / 10
    }
  }
}

/**
 * Generate daily nutrition summary from entries
 */
export function generateDailySummary(
  entries: FoodLogEntry[],
  targets: DailyTargets
): DailyNutritionSummary {
  const totals = entries.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein: acc.protein + entry.protein,
    fat: acc.fat + entry.fat,
    carbs: acc.carbs + entry.carbs,
    fiber: acc.fiber + (entry.fiber || 0)
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })
  
  return {
    date: entries[0]?.date || new Date().toISOString().split('T')[0],
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalFat: totals.fat,
    totalCarbs: totals.carbs,
    totalFiber: totals.fiber,
    targetCalories: targets.calories,
    targetProtein: targets.protein,
    targetFat: targets.fat,
    targetCarbs: targets.carbs,
    caloriePercent: Math.min(100, Math.round((totals.calories / targets.calories) * 100)),
    proteinPercent: Math.min(100, Math.round((totals.protein / targets.protein) * 100)),
    fatPercent: Math.min(100, Math.round((totals.fat / targets.fat) * 100)),
    carbsPercent: Math.min(100, Math.round((totals.carbs / targets.carbs) * 100))
  }
}

// ============================================================================
// PROGRESS BAR COLOR HELPER
// ============================================================================

/**
 * Get color class based on progress percentage
 */
export function getProgressColor(percent: number): 'green' | 'yellow' | 'red' {
  if (percent >= 80 && percent <= 110) return 'green'
  if (percent >= 60 && percent <= 120) return 'yellow'
  return 'red'
}

/**
 * Get color hex based on progress percentage
 */
export function getProgressColorHex(percent: number): string {
  const color = getProgressColor(percent)
  switch (color) {
    case 'green': return '#22c55e'
    case 'yellow': return '#eab308'
    case 'red': return '#ef4444'
  }
}
