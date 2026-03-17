import { NextRequest, NextResponse } from 'next/server'
import { 
  FOOD_DISHES, 
  FOOD_PRODUCTS,
  FoodDish,
  MealType,
  GoalTag
} from '@/lib/food-database'
import {
  calculateDailyTargets,
  generateDailyMealPlan,
  DailyMealPlan,
  DailyTargets,
  FitnessGoal,
  GoalMacros,
  GOAL_MACROS
} from '@/lib/nutrition-calculations'
import { Language } from '@/lib/translations'

// POST /api/nutrition - Generate goal-based meal plan
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { 
      // User profile for goal-based calculation
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      fitnessGoal,
      activityLevel = 'moderate',
      // Direct targets (if provided, overrides calculation)
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      // Other options
      mealsPerDay = 4,
      weeklyBudget,
      dietaryRestrictions = [],
      dislikes = [],
      language = 'ru',
      forceRefresh = false,
      // Recent dishes to avoid
      recentDishIds = []
    } = body

    // Calculate or use provided targets
    let dailyTargets: DailyTargets
    
    if (targetCalories && targetProtein && targetCarbs && targetFat) {
      // Use provided targets
      dailyTargets = {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        mealsPerDay
      }
    } else if (age && gender && height && currentWeight && fitnessGoal) {
      // Calculate from profile
      dailyTargets = calculateDailyTargets({
        age,
        gender,
        height,
        currentWeight,
        targetWeight,
        fitnessGoal: fitnessGoal as FitnessGoal,
        fitnessLevel: 'intermediate',
        activityLevel
      }, mealsPerDay)
    } else {
      return NextResponse.json(
        { error: 'Either user profile (age, gender, height, currentWeight, fitnessGoal) or direct targets (targetCalories, targetProtein, targetCarbs, targetFat) are required' },
        { status: 400 }
      )
    }

    // Generate meal plan
    const mealPlan = generateDailyMealPlan(
      {
        age: age || 25,
        gender: gender || 'male',
        height: height || 175,
        currentWeight: currentWeight || 75,
        targetWeight: targetWeight || 70,
        fitnessGoal: fitnessGoal as FitnessGoal || 'maintenance',
        fitnessLevel: 'intermediate',
        activityLevel
      },
      dailyTargets,
      new Date(),
      recentDishIds
    )

    console.log(`[Nutrition] Generated goal-based meal plan in ${Date.now() - startTime}ms`)
    
    return NextResponse.json({ 
      mealPlan,
      targets: dailyTargets,
      goalConfig: GOAL_MACROS[fitnessGoal as FitnessGoal] || GOAL_MACROS.maintenance
    })
  } catch (error) {
    console.error('Error generating meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}

// GET /api/nutrition - Search foods and dishes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all' // 'products', 'dishes', 'all'
  const mealType = searchParams.get('mealType') as MealType | null
  const goal = searchParams.get('goal') as GoalTag | null
  const language = (searchParams.get('language') || 'ru') as Language
  
  try {
    let results: { products: typeof FOOD_PRODUCTS; dishes: typeof FOOD_DISHES } = {
      products: [],
      dishes: []
    }
    
    const lowerQuery = query.toLowerCase()
    
    // Search products
    if (type === 'all' || type === 'products') {
      results.products = FOOD_PRODUCTS.filter(p => {
        const matchesQuery = !query || 
          p.name.toLowerCase().includes(lowerQuery) ||
          p.nameRu.toLowerCase().includes(lowerQuery)
        const matchesGoal = !goal || p.tags?.includes(goal)
        return matchesQuery && matchesGoal
      }).slice(0, 20) // Limit results
    }
    
    // Search dishes
    if (type === 'all' || type === 'dishes') {
      results.dishes = FOOD_DISHES.filter(d => {
        const matchesQuery = !query ||
          d.name.toLowerCase().includes(lowerQuery) ||
          d.nameRu.toLowerCase().includes(lowerQuery)
        const matchesMealType = !mealType || d.mealType.includes(mealType)
        const matchesGoal = !goal || d.tags.includes(goal)
        return matchesQuery && matchesMealType && matchesGoal
      }).slice(0, 20) // Limit results
    }
    
    return NextResponse.json({
      query,
      results,
      total: results.products.length + results.dishes.length
    })
  } catch (error) {
    console.error('Error searching foods:', error)
    return NextResponse.json(
      { error: 'Failed to search foods' },
      { status: 500 }
    )
  }
}
