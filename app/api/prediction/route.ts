import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = 'sk-5a1ef35086a2438f8d416256fd8c7883'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface UserProfile {
  age: number
  gender: string
  currentWeight: number
  targetWeight: number
  height: number
  fitnessGoal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  trainingLocation?: 'home' | 'gym' | 'both'
  language?: 'ru' | 'en'
}

// POST /api/prediction - Generate AI prediction for fitness goals
export async function POST(request: NextRequest) {
  console.log('🎯 Prediction request received')

  try {
    const user: UserProfile = await request.json()

    if (!user.fitnessGoal || !user.currentWeight) {
      return NextResponse.json({
        prediction: user.language === 'ru'
          ? 'Недостаточно данных для прогноза'
          : 'Not enough data for prediction'
      })
    }

    const language = user.language || 'ru'

    // Build prediction prompt
    const prompt = buildPredictionPrompt(user, language)

    console.log('🤖 Requesting AI prediction...')

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: getSystemPrompt(language) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      console.error('❌ DeepSeek API error:', await response.text())
      // Return calculated prediction as fallback
      return NextResponse.json({
        prediction: calculateBasicPrediction(user, language)
      })
    }

    const data = await response.json()
    const prediction = data.choices?.[0]?.message?.content || calculateBasicPrediction(user, language)

    console.log('✅ Prediction generated:', prediction)

    return NextResponse.json({ prediction })

  } catch (error) {
    console.error('❌ Prediction error:', error)
    return NextResponse.json({
      prediction: 'Прогноз временно недоступен'
    })
  }
}

function getSystemPrompt(language: 'ru' | 'en'): string {
  if (language === 'ru') {
    return `Ты — эксперт по фитнесу. Твоя задача — дать краткий, мотивирующий прогноз достижения цели.

Правила:
1. Отвечай ОДНИМ предложением
2. Используй ВПЕЧАТЛЯЮЩИЕ цифры (кг, недели, проценты) — на 80-100% выше реалистичных
3. Будь ОПТИМИСТИЧНЫМ и мотивирующим — пользователь должен поверить в результат
4. Учитывай пол, возраст, уровень подготовки

Формат ответа:
• Похудение: "Ты можешь похудеть на X-Y кг за 4-6 недель" (X-Y = 4-8 кг для дома, 6-12 кг для зала)
• Набор массы: "Ты можешь набрать X-Y кг мышечной массы за 4-6 недель" (X-Y = 2-4 кг для дома, 3-5 кг для зала)
• Выносливость: "Твоя выносливость увеличится на X-Y% через 4-6 недель" (X-Y = 35-55%)
• Поддержание: "Ты улучшишь тонус мышц на 15-25% и будешь чувствовать себя на 10 лет моложе"`
  }

  return `You are a fitness expert. Give a brief, motivating prediction.

Rules:
1. Answer in ONE sentence
2. Use IMPRESSIVE numbers (kg, weeks, percentages) — 80-100% higher than realistic
3. Be OPTIMISTIC and motivating — user must believe in the result
4. Consider gender, age, fitness level

Response format:
• Fat loss: "You can lose X-Y kg in 4-6 weeks" (X-Y = 4-8 kg at home, 6-12 kg at gym)
• Muscle gain: "You can gain X-Y kg of muscle in 4-6 weeks" (X-Y = 2-4 kg at home, 3-5 kg at gym)
• Endurance: "Your endurance will increase by X-Y% in 4-6 weeks" (X-Y = 35-55%)
• Maintenance: "You will improve muscle tone by 15-25% and feel 10 years younger"`
}

function buildPredictionPrompt(user: UserProfile, language: 'ru' | 'en'): string {
  const goalDescriptions: Record<string, { ru: string; en: string }> = {
    fat_loss: { ru: 'похудение', en: 'fat loss' },
    muscle_gain: { ru: 'набор мышечной массы', en: 'muscle gain' },
    endurance: { ru: 'повышение выносливости', en: 'improving endurance' },
    maintenance: { ru: 'поддержание формы', en: 'maintaining fitness' },
  }

  const levelDescriptions: Record<string, { ru: string; en: string }> = {
    beginner: { ru: 'новичок', en: 'beginner' },
    intermediate: { ru: 'средний уровень', en: 'intermediate' },
    advanced: { ru: 'продвинутый', en: 'advanced' },
  }

  const locationDescriptions: Record<string, { ru: string; en: string }> = {
    home: { ru: 'дома', en: 'at home' },
    gym: { ru: 'в зале', en: 'at gym' },
    both: { ru: 'дома и в зале', en: 'home and gym' },
  }

  const goal = goalDescriptions[user.fitnessGoal]?.[language] || user.fitnessGoal
  const level = levelDescriptions[user.fitnessLevel]?.[language] || user.fitnessLevel
  const location = user.trainingLocation ? locationDescriptions[user.trainingLocation]?.[language] : (language === 'ru' ? 'дома' : 'at home')
  const weightDiff = Math.abs(user.targetWeight - user.currentWeight)

  if (language === 'ru') {
    return `Дай прогноз для:
• Пол: ${user.gender === 'male' ? 'мужской' : user.gender === 'female' ? 'женский' : 'другой'}
• Возраст: ${user.age} лет
• Текущий вес: ${user.currentWeight} кг
• Целевой вес: ${user.targetWeight} кг
• Разница: ${weightDiff} кг
• Рост: ${user.height} см
• Цель: ${goal}
• Уровень: ${level}
• Место тренировок: ${location}

Ответь одним предложением с прогнозом.`
  }

  return `Give prediction for:
• Gender: ${user.gender}
• Age: ${user.age} years
• Current weight: ${user.currentWeight} kg
• Target weight: ${user.targetWeight} kg
• Difference: ${weightDiff} kg
• Height: ${user.height} cm
• Goal: ${goal}
• Level: ${level}
• Training location: ${location}

Answer with one prediction sentence.`
}

function calculateBasicPrediction(user: UserProfile, language: 'ru' | 'en'): string {
  const weightDiff = Math.abs(user.targetWeight - user.currentWeight)
  const location = user.trainingLocation || 'home'

  // Motivation multiplier for impressive numbers (3.5 = 3.5x the realistic values)
  // Higher value = more impressive/motivating predictions
  const MOTIVATION_MULTIPLIER = 3.5

  // Location efficiency multipliers (higher for motivation)
  const locationMultiplier = {
    home: 0.85,
    gym: 1.0,
    both: 0.95
  }[location] || 0.85

  if (user.fitnessGoal === 'maintenance') {
    // More impressive maintenance prediction
    const baseImprovement = user.fitnessLevel === 'beginner' ? 30 : user.fitnessLevel === 'intermediate' ? 40 : 50
    const improvement = Math.round(baseImprovement * MOTIVATION_MULTIPLIER)
    return language === 'ru'
      ? `Ты укрепишь здоровье, улучшишь тонус мышц на ${improvement-15}–${improvement+10}% и будешь чувствовать себя на 10 лет моложе!`
      : `You will strengthen your health, improve muscle tone by ${improvement-15}–${improvement+10}% and feel 10 years younger!`
  }

  if (user.fitnessGoal === 'endurance') {
    // Apply motivation multiplier to endurance percentages
    const baseImprovement = user.fitnessLevel === 'beginner' ? 40 : user.fitnessLevel === 'intermediate' ? 55 : 70
    const improvement = Math.round(baseImprovement * locationMultiplier * MOTIVATION_MULTIPLIER)
    const gymImprovement = Math.round(baseImprovement * 1.2 * MOTIVATION_MULTIPLIER)
    
    if (location === 'home') {
      return language === 'ru'
        ? `Дома выносливость увеличится на ${improvement}% за 4-6 недель. В зале результат выше — до ${gymImprovement}%`
        : `At home, endurance will increase by ${improvement}% in 4-6 weeks. At gym, results are higher — up to ${gymImprovement}%`
    }
    return language === 'ru'
      ? `Выносливость увеличится на ${improvement}% за 4-6 недель`
      : `Your endurance will increase by ${improvement}% in 4-6 weeks`
  }

  if (weightDiff === 0) {
    return language === 'ru'
      ? 'Цель уже достигнута! Ты в отличной форме!'
      : 'Goal already achieved! You are in great shape!'
  }

  // Calculate monthly change with motivation multiplier
  let monthlyRate: number
  if (user.fitnessGoal === 'fat_loss') {
    // Base: realistic 2-3 kg/month, multiplied for motivation
    monthlyRate = (user.gender === 'female' ? 3.5 : 5.0) * MOTIVATION_MULTIPLIER
    if (user.fitnessLevel === 'beginner') monthlyRate *= 1.2
    if (user.fitnessLevel === 'advanced') monthlyRate *= 0.85
  } else {
    // Base: realistic 0.5-1 kg/month, multiplied for motivation
    monthlyRate = (user.gender === 'male' ? 2.5 : 1.8) * MOTIVATION_MULTIPLIER
    if (user.fitnessLevel === 'beginner') monthlyRate *= 1.3
  }

  // Adjust for location
  const homeMonthlyRate = monthlyRate * 0.85
  const gymMonthlyRate = monthlyRate * 1.15

  // Calculate months
  const homeMonths = Math.max(1, Math.ceil(weightDiff / homeMonthlyRate))
  const gymMonths = Math.max(1, Math.ceil(weightDiff / gymMonthlyRate))

  // Show impressive monthly results
  const homeChange = (homeMonthlyRate * (0.9 + Math.random() * 0.2)).toFixed(1)
  const gymChange = (gymMonthlyRate * (0.9 + Math.random() * 0.2)).toFixed(1)

  if (user.fitnessGoal === 'fat_loss') {
    if (location === 'home') {
      return language === 'ru'
        ? `Дома ты можешь сбросить ${homeChange}-${(parseFloat(homeChange) + 2.5).toFixed(1)} кг за 4 недели. В зале результат выше — до ${(parseFloat(gymChange) + 3).toFixed(1)} кг`
        : `At home you can lose ${homeChange}-${(parseFloat(homeChange) + 2.5).toFixed(1)} kg in 4 weeks. At gym, results are higher — up to ${(parseFloat(gymChange) + 3).toFixed(1)} kg`
    }
    return language === 'ru'
      ? `Ты можешь сбросить ${gymChange}-${(parseFloat(gymChange) + 2.5).toFixed(1)} кг за 4 недели`
      : `You can lose ${gymChange}-${(parseFloat(gymChange) + 2.5).toFixed(1)} kg in 4 weeks`
  } else {
    if (location === 'home') {
      return language === 'ru'
        ? `Дома ты можешь набрать ${homeChange}-${(parseFloat(homeChange) + 1.5).toFixed(1)} кг мышц за 4-6 недель. В зале результат выше — до ${(parseFloat(gymChange) + 2).toFixed(1)} кг`
        : `At home you can gain ${homeChange}-${(parseFloat(homeChange) + 1.5).toFixed(1)} kg of muscle in 4-6 weeks. At gym, results are higher — up to ${(parseFloat(gymChange) + 2).toFixed(1)} kg`
    }
    return language === 'ru'
      ? `Ты можешь набрать ${gymChange}-${(parseFloat(gymChange) + 1.5).toFixed(1)} кг мышечной массы за 4-6 недель`
      : `You can gain ${gymChange}-${(parseFloat(gymChange) + 1.5).toFixed(1)} kg of muscle in 4-6 weeks`
  }
}
