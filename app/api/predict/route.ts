import { NextRequest, NextResponse } from 'next/server'
import {
  calculateGoalPrediction,
  calculateRealisticPrediction,
  REALISTIC_PREDICTIONS,
  getAvailableEquipmentByLocation,
  EQUIPMENT_CATEGORIES,
} from '@/lib/store'

interface PredictionRequest {
  age: number
  gender: 'male' | 'female' | 'other'
  currentWeight: number
  targetWeight: number
  height: number
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  trainingLocation: 'home' | 'gym' | 'both'
  equipment: string[]
  customEquipment?: string
  language: 'ru' | 'en'
}

interface EquipmentPrediction {
  equipmentId: string
  equipmentName: string
  equipmentNameEn: string
  available: boolean
  prediction: string
  weeks: number
  change: string
}

interface PredictionResponse {
  success: boolean
  goal: string
  goalLabel: string
  goalLabelEn: string
  mainPrediction: string
  weeksToGoal: number
  predictionsByEquipment: EquipmentPrediction[]
  bodyweightPrediction?: string
  dumbbellsPrediction?: string
  barbellPrediction?: string
  gymPrediction?: string
  recommendations: {
    workoutTypes: string[]
    daysPerWeek: { min: number; max: number }
    repsRange: string
    restSeconds: number
    nutritionTip: string
    nutritionTipEn: string
  }
}

// Goal-specific configuration for recommendations
const GOAL_RECOMMENDATIONS = {
  fat_loss: {
    workoutTypes: ['cardio', 'circuit', 'hiit'],
    daysPerWeek: { min: 3, max: 5 },
    repsRange: '15-20',
    restSeconds: 30,
    nutritionTip: 'Дефицит калорий 15-20%, белок 1.6-2 г/кг, меньше углеводов',
    nutritionTipEn: 'Calorie deficit 15-20%, protein 1.6-2 g/kg, fewer carbs',
  },
  muscle_gain: {
    workoutTypes: ['strength', 'hypertrophy'],
    daysPerWeek: { min: 3, max: 4 },
    repsRange: '6-12',
    restSeconds: 90,
    nutritionTip: 'Профицит калорий +10-20%, белок 1.6-2.2 г/кг, много углеводов',
    nutritionTipEn: 'Calorie surplus +10-20%, protein 1.6-2.2 g/kg, more carbs',
  },
  endurance: {
    workoutTypes: ['cardio', 'intervals'],
    daysPerWeek: { min: 3, max: 5 },
    repsRange: '15-25',
    restSeconds: 20,
    nutritionTip: 'Акцент на сложные углеводы, белок 1.2-1.6 г/кг',
    nutritionTipEn: 'Focus on complex carbs, protein 1.2-1.6 g/kg',
  },
  maintenance: {
    workoutTypes: ['functional', 'flexibility'],
    daysPerWeek: { min: 2, max: 4 },
    repsRange: '10-15',
    restSeconds: 60,
    nutritionTip: 'Сбалансированное питание, поддержание нормы калорий',
    nutritionTipEn: 'Balanced nutrition, maintain calorie intake',
  },
}

const GOAL_LABELS = {
  fat_loss: { ru: 'Похудение', en: 'Fat Loss' },
  muscle_gain: { ru: 'Набор мышц', en: 'Muscle Gain' },
  endurance: { ru: 'Выносливость', en: 'Endurance' },
  maintenance: { ru: 'Поддержание', en: 'Maintenance' },
}

// POST /api/predict - Generate realistic prediction for fitness goals
export async function POST(request: NextRequest) {
  console.log('📊 Prediction request received')

  try {
    const body: PredictionRequest = await request.json()
    const {
      age,
      gender,
      currentWeight,
      targetWeight,
      height,
      fitnessGoal,
      fitnessLevel,
      trainingLocation,
      equipment,
      customEquipment,
      language = 'ru',
    } = body

    if (!fitnessGoal || !currentWeight) {
      return NextResponse.json({
        success: false,
        error: language === 'ru' ? 'Недостаточно данных для прогноза' : 'Not enough data for prediction',
      }, { status: 400 })
    }

    // Get main prediction using updated function
    const mainPredictionResult = calculateGoalPrediction(
      currentWeight,
      targetWeight,
      fitnessGoal,
      fitnessLevel,
      gender,
      trainingLocation,
      equipment,
      language
    )

    // Build detailed predictions by equipment
    const predictionsByEquipment: EquipmentPrediction[] = []
    const availableCategories = getAvailableEquipmentByLocation(trainingLocation)

    // Equipment types to check
    const equipmentTypes: Array<{
      id: 'bodyweight' | 'pullup_bar' | 'dumbbells' | 'barbell' | 'machines'
      category: string
      name: string
      nameEn: string
    }> = [
      { id: 'bodyweight', category: 'bodyweight', name: 'Собственный вес', nameEn: 'Bodyweight' },
      { id: 'pullup_bar', category: 'pullup_bar', name: 'Турник', nameEn: 'Pull-up Bar' },
      { id: 'dumbbells', category: 'free_weights', name: 'Гантели', nameEn: 'Dumbbells' },
      { id: 'barbell', category: 'free_weights', name: 'Штанга', nameEn: 'Barbell' },
      { id: 'machines', category: 'machines', name: 'Тренажёры', nameEn: 'Machines' },
    ]

    const hasEquipment = (eq: string) => 
      equipment.some(e => e.toLowerCase().includes(eq.toLowerCase())) ||
      (customEquipment?.toLowerCase().includes(eq.toLowerCase()) ?? false)

    for (const eq of equipmentTypes) {
      // Determine availability
      let isAvailable = false
      
      if (eq.id === 'bodyweight') {
        isAvailable = true // Always available
      } else if (eq.id === 'machines') {
        isAvailable = trainingLocation === 'gym' || trainingLocation === 'both'
      } else if (eq.id === 'pullup_bar') {
        // Pull-up bar is available at home if selected, or always in gym
        isAvailable = hasEquipment('pullup_bar') || trainingLocation === 'gym' || trainingLocation === 'both'
      } else {
        // Dumbbells or barbell
        if (trainingLocation === 'home' || trainingLocation === 'both') {
          isAvailable = hasEquipment(eq.id) || hasEquipment('free_weights') || hasEquipment('гантел') || hasEquipment('штанга')
        }
      }

      // Get prediction for this equipment type
      const pred = calculateRealisticPrediction(fitnessGoal, eq.id, fitnessLevel, gender, language)

      predictionsByEquipment.push({
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentNameEn: eq.nameEn,
        available: isAvailable,
        prediction: pred.description,
        weeks: pred.weeks,
        change: pred.value,
      })
    }

    // Get recommendations for goal
    const recommendations = GOAL_RECOMMENDATIONS[fitnessGoal]

    // Adjust days per week based on fitness level
    let daysPerWeek = { ...recommendations.daysPerWeek }
    if (fitnessLevel === 'beginner') {
      daysPerWeek.max = Math.min(daysPerWeek.max, 4)
    } else if (fitnessLevel === 'advanced') {
      daysPerWeek.min = Math.max(daysPerWeek.min, 4)
    }

    const response: PredictionResponse = {
      success: true,
      goal: fitnessGoal,
      goalLabel: GOAL_LABELS[fitnessGoal].ru,
      goalLabelEn: GOAL_LABELS[fitnessGoal].en,
      mainPrediction: mainPredictionResult.prediction,
      weeksToGoal: mainPredictionResult.weeksToGoal,
      predictionsByEquipment,
      bodyweightPrediction: mainPredictionResult.bodyweightPrediction,
      dumbbellsPrediction: mainPredictionResult.dumbbellsPrediction,
      barbellPrediction: mainPredictionResult.barbellPrediction,
      gymPrediction: mainPredictionResult.gymPrediction,
      recommendations: {
        workoutTypes: recommendations.workoutTypes,
        daysPerWeek,
        repsRange: recommendations.repsRange,
        restSeconds: recommendations.restSeconds,
        nutritionTip: recommendations.nutritionTip,
        nutritionTipEn: recommendations.nutritionTipEn,
      },
    }

    console.log('✅ Prediction generated:', response.mainPrediction)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Prediction error:', error)
    return NextResponse.json({
      success: false,
      error: 'Prediction temporarily unavailable',
    }, { status: 500 })
  }
}
