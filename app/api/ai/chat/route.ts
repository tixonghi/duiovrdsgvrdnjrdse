import { NextRequest, NextResponse } from 'next/server'
import { aiKeyManager, type ChatMessage } from '@/lib/groq-key-manager'

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

function buildSystemPrompt(userContext: any, language: 'ru' | 'en'): string {
  const goalDescriptions: Record<string, { ru: string; en: string }> = {
    fat_loss: { ru: 'похудение', en: 'fat loss' },
    muscle_gain: { ru: 'набор мышечной массы', en: 'muscle gain' },
    endurance: { ru: 'развитие выносливости', en: 'endurance' },
    maintenance: { ru: 'поддержание формы', en: 'maintenance' }
  }

  const levelDescriptions: Record<string, { ru: string; en: string }> = {
    beginner: { ru: 'новичок', en: 'beginner' },
    intermediate: { ru: 'средний уровень', en: 'intermediate' },
    advanced: { ru: 'продвинутый', en: 'advanced' }
  }

  const isRu = language === 'ru'
  const goalDesc = userContext?.fitnessGoal ? goalDescriptions[userContext.fitnessGoal]?.[language] || '' : ''
  const levelDesc = userContext?.fitnessLevel ? levelDescriptions[userContext.fitnessLevel]?.[language] || '' : ''
  const genderDesc = userContext?.gender === 'male' ? (isRu ? 'мужчина' : 'male') : userContext?.gender === 'female' ? (isRu ? 'женщина' : 'female') : ''

  // Calculate calorie info
  let calorieInfo = ''
  if (userContext?.currentWeight && userContext?.height && userContext?.age) {
    const weight = userContext.currentWeight
    const height = userContext.height
    const age = userContext.age
    const gender = userContext.gender === 'male' ? 5 : -161
    const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + gender)
    const tdee = Math.round(bmr * 1.55)
    let targetCalories = tdee
    if (userContext.fitnessGoal === 'fat_loss') {
      targetCalories = Math.round(tdee * 0.8)
    } else if (userContext.fitnessGoal === 'muscle_gain') {
      targetCalories = Math.round(tdee * 1.1)
    }
    calorieInfo = isRu 
      ? `Базовый обмен: ~${bmr} ккал, поддержка: ~${tdee} ккал, целевые: ~${targetCalories} ккал.`
      : `BMR: ~${bmr} kcal, maintenance: ~${tdee} kcal, target: ~${targetCalories} kcal.`
  }

  let equipmentDesc = ''
  if (userContext?.equipment?.length) {
    equipmentDesc = isRu ? `Инвентарь: ${userContext.equipment.join(', ')}.` : `Equipment: ${userContext.equipment.join(', ')}.`
  }

  let weightInfo = ''
  if (userContext?.currentWeight && userContext?.targetWeight) {
    const diff = (userContext.targetWeight - userContext.currentWeight).toFixed(1)
    weightInfo = isRu 
      ? `Текущий вес: ${userContext.currentWeight} кг, цель: ${userContext.targetWeight} кг (${diff > 0 ? '+' : ''}${diff} кг).`
      : `Current weight: ${userContext.currentWeight} kg, goal: ${userContext.targetWeight} kg (${diff > 0 ? '+' : ''}${diff} kg).`
  }

  if (isRu) {
    return `Ты — профессиональный AI-фитнес-тренер BodyGenius AI. Твоя задача — помогать пользователям с вопросами о тренировках, питании, здоровье, мотивации и выборе инвентаря.

${userContext ? `
ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
• Возраст: ${userContext.age || 'не указан'} лет
• Пол: ${genderDesc || 'не указан'}
• Рост: ${userContext.height || 'не указан'} см
• Вес: ${userContext.currentWeight || 'не указан'} кг (цель: ${userContext.targetWeight || 'не указан'} кг)
• Цель: ${goalDesc || 'не указана'}
• Уровень: ${levelDesc || 'не указан'}
${equipmentDesc}
${calorieInfo}
` : ''}

ПРАВИЛА ОТВЕТОВ:
• Отвечай ПОДРОБНО и ПОЛЕЗНО! Минимум 3-5 предложений.
• Давай КОНКРЕТНЫЕ советы: упражнения, подходы, повторения, продукты, модели тренажёров.
• При вопросе о тренажёрах — рекомендуй конкретные модели с учётом цели и бюджета пользователя.
• При вопросе о тренировках — давай конкретную программу с упражнениями.
• При вопросе о питании — называй продукты, рецепты, калории, БЖУ.
• При вопросе о беге/кардио — учитывай вес и состояние пользователя.
• Используй эмодзи умеренно (1-3 на ответ).
• Задавай уточняющие вопросы в конце для продолжения диалога.
• ПЕРСОНАЛИЗИРУЙ каждый ответ под профиль пользователя!

Отвечай на русском языке. Будь дружелюбным и мотивирующим!`
  }

  return `You are a professional AI fitness coach for BodyGenius AI. Your job is to help users with questions about workouts, nutrition, health, motivation, and equipment selection.

${userContext ? `
USER PROFILE:
• Age: ${userContext.age || 'not specified'} years
• Gender: ${genderDesc || 'not specified'}
• Height: ${userContext.height || 'not specified'} cm
• Weight: ${userContext.currentWeight || 'not specified'} kg (goal: ${userContext.targetWeight || 'not specified'} kg)
• Goal: ${goalDesc || 'not specified'}
• Level: ${levelDesc || 'not specified'}
${equipmentDesc}
${calorieInfo}
` : ''}

RESPONSE RULES:
• Give DETAILED and HELPFUL answers! Minimum 3-5 sentences.
• Give CONCRETE advice: exercises, sets, reps, foods, equipment models.
• For equipment questions — recommend specific models based on user's goal and budget.
• For workout questions — give a concrete program with exercises.
• For nutrition questions — name foods, recipes, calories, macros.
• For running/cardio questions — consider user's weight and condition.
• Use emojis moderately (1-3 per response).
• Ask follow-up questions at the end.
• PERSONALIZE every response for the user's profile!

Respond in English. Be friendly and motivating!`
}

// ============================================================================
// TOPIC FILTERING
// ============================================================================

const OFF_TOPIC_KEYWORDS = [
  'minecraft', 'fortnite', 'steam', 'playstation', 'xbox', 'nintendo',
  'youtube канал', 'tiktok', 'инстаграм', 'instagram',
  'крипт', 'crypto', 'биткоин', 'bitcoin', 'акци', 'stock', 'форекс', 'forex',
  'политик', 'politics', 'выбор', 'election', 'президент', 'president',
  'религи', 'religion', 'церков', 'church', 'мечет', 'mosque',
  'хакер', 'hacker', 'взлом', 'hack',
]

function isAllowed(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  for (const keyword of OFF_TOPIC_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return false
    }
  }
  return true
}

function getOffTopicResponse(language: 'ru' | 'en'): string {
  return language === 'ru'
    ? 'Я специализируюсь на фитнесе, тренировках, питании и здоровье. Задай вопрос по этой теме — с радостью помогу! 💪'
    : 'I specialize in fitness, workouts, nutrition, and health. Ask a question on these topics — I\'ll be happy to help! 💪'
}

// ============================================================================
// STREAMING HELPER
// ============================================================================

async function streamResponse(text: string, encoder: TextEncoder): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      const words = text.split(' ')
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 10))
        controller.enqueue(encoder.encode((i > 0 ? ' ' : '') + words[i]))
      }
      controller.close()
    }
  })
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const {
      messages,
      userContext,
      userId = 'anonymous',
      language = 'ru'
    }: {
      messages: ChatMessage[]
      userContext?: {
        fitnessGoal?: string
        fitnessLevel?: string
        currentWeight?: number
        targetWeight?: number
        height?: number
        age?: number
        gender?: string
        equipment?: string[]
      }
      userId?: string
      language?: 'ru' | 'en'
    } = body

    console.log(`[AI Chat] Request from user ${userId}, language: ${language}`)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const lastMessage = messages[messages.length - 1]?.content || ''
    const encoder = new TextEncoder()

    // Check topic
    if (!isAllowed(lastMessage)) {
      console.log(`[AI Chat] Blocked off-topic: "${lastMessage.substring(0, 30)}..."`)
      const stream = await streamResponse(getOffTopicResponse(language), encoder)
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(userContext, language)
    
    // Get conversation history (last 6 messages)
    const conversationHistory: ChatMessage[] = messages.slice(-7, -1).map(m => ({
      role: m.role,
      content: m.content,
    }))

    // Ask the key manager
    const result = await aiKeyManager.askQuestion(
      userId,
      lastMessage,
      systemPrompt,
      conversationHistory
    )

    console.log(`[AI Chat] Response time: ${Date.now() - startTime}ms, cached: ${result.cached}`)

    // Stream the response
    const stream = await streamResponse(result.response, encoder)
    return new Response(stream, { 
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Cached': String(result.cached),
        'X-Remaining': String(result.remaining),
      } 
    })

  } catch (error: any) {
    console.error('[AI Chat] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ============================================================================
// STATS ENDPOINT (GET)
// ============================================================================

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'stats') {
    return NextResponse.json(aiKeyManager.getStats())
  }

  if (action === 'health') {
    return NextResponse.json(aiKeyManager.getHealthStatus())
  }

  if (action === 'reset') {
    // This should be protected in production
    aiKeyManager.forceReset()
    return NextResponse.json({ success: true, message: 'Reset completed' })
  }

  return NextResponse.json({
    message: 'Groq AI Key Manager',
    endpoints: {
      'POST /': 'Send chat message',
      'GET /?action=stats': 'Get statistics',
      'GET /?action=health': 'Get health status',
      'GET /?action=reset': 'Force reset (admin)',
    }
  })
}
