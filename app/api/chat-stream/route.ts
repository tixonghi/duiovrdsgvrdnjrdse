import { NextRequest } from 'next/server'
import { CHAT_LIMITS } from '@/lib/translations'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  AI_TIMEOUT: 30000, // 30 seconds - AI needs time
  MAX_RETRIES: 2,
  RETRY_DELAYS: [1000, 2000],
  MAX_CONTEXT_MESSAGES: 10,
}

// Google AI API Configuration - Using Gemma 3
const GOOGLE_API_KEY = 'AIzaSyDTk5qlinzDaTgR8SDfojCQACqDBBWZUR8'
// Try different model endpoints
const MODELS = [
  'gemma-3-27b-it',
  'gemma-3-12b-it', 
  'gemma-3-4b-it',
  'gemini-2.0-flash',
]
const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

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

// ============================================================================
// SYSTEM PROMPT
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
    return `Ты — дружелюбный AI-фитнес-ассистент BodyGenius. Ты помогаешь с тренировками, питанием, здоровьем, мотивацией и выбором инвентаря.

${userContext ? `
ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
• Возраст: ${userContext.age || 'не указан'} лет
• Пол: ${genderDesc || 'не указан'}
• Цель: ${goalDesc || 'не указана'}
• Уровень: ${levelDesc || 'не указан'}
${weightInfo}
${equipmentDesc}
${calorieInfo}
` : ''}

ПРАВИЛА ОТВЕТОВ:
• Отвечай ПОДРОБНО и ПОЛЕЗНО - это главное!
• Давай конкретные советы: упражнения, подходы, повторения, продукты.
• При вопросе о тренажёрах - рекомендуй конкретные модели с учётом цели и бюджета.
• При вопросе о тренировках - давай конкретную программу.
• При вопросе о питании - называй продукты, рецепты, калории.
• Используй эмодзи умеренно (1-3 на ответ).
• Задавай уточняющие вопросы в конце.
• Персонализируй ответ под профиль пользователя!

Отвечай на русском языке.`
  }

  return `You are a friendly AI fitness assistant for BodyGenius. You help with workouts, nutrition, health, motivation, and equipment selection.

${userContext ? `
USER PROFILE:
• Age: ${userContext.age || 'not specified'} years
• Gender: ${genderDesc || 'not specified'}
• Goal: ${goalDesc || 'not specified'}
• Level: ${levelDesc || 'not specified'}
${weightInfo}
${equipmentDesc}
${calorieInfo}
` : ''}

RESPONSE RULES:
• Give DETAILED and HELPFUL answers - this is key!
• Give specific advice: exercises, sets, reps, foods.
• For equipment questions - recommend specific models based on goal and budget.
• For workout questions - give a concrete program.
• For nutrition questions - name foods, recipes, calories.
• Use emojis moderately (1-3 per response).
• Ask follow-up questions at the end.
• Personalize the response for the user's profile!

Respond in English.`
}

// ============================================================================
// GOOGLE AI API CALL (GEMMA 3)
// ============================================================================

interface GoogleAIContent {
  parts: { text: string }[]
  role?: string
}

interface GoogleAIResponse {
  candidates?: {
    content: {
      parts: { text: string }[]
    }
  }[]
  error?: {
    message: string
    code: number
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callGoogleAI(
  model: string, 
  contents: GoogleAIContent[], 
  retryCount = 0
): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.AI_TIMEOUT)
  
  const url = `${GOOGLE_API_BASE}/${model}:generateContent?key=${GOOGLE_API_KEY}`
  
  try {
    console.log(`[Chat] Calling ${model} (attempt ${retryCount + 1})`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    const responseText = await response.text()
    console.log(`[Chat] ${model} response status:`, response.status)
    
    if (!response.ok) {
      console.error(`[Chat] ${model} error response:`, responseText.substring(0, 500))
      throw new Error(`API error ${response.status}: ${responseText.substring(0, 200)}`)
    }
    
    const data: GoogleAIResponse = JSON.parse(responseText)
    
    if (data.error) {
      console.error(`[Chat] ${model} API error:`, data.error)
      throw new Error(data.error.message)
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    if (!text || text.trim() === '') {
      console.error(`[Chat] ${model} empty response:`, JSON.stringify(data).substring(0, 500))
      throw new Error('Empty response from AI')
    }
    
    console.log(`[Chat] ${model} success! Response length:`, text.length)
    return text
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error(`[Chat] ${model} failed:`, error.message)
    
    // Retry on timeout or network errors
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`[Chat] Retrying with ${model}...`)
      await sleep(CONFIG.RETRY_DELAYS[retryCount])
      return callGoogleAI(model, contents, retryCount + 1)
    }
    
    throw error
  }
}

// Try models in order until one works
async function callAIWithFallback(contents: GoogleAIContent[]): Promise<string> {
  let lastError: Error | null = null
  
  for (const model of MODELS) {
    try {
      const response = await callGoogleAI(model, contents)
      console.log(`[Chat] Successfully used model: ${model}`)
      return response
    } catch (error: any) {
      console.error(`[Chat] Model ${model} failed:`, error.message)
      lastError = error
      // Continue to next model
    }
  }
  
  throw lastError || new Error('All AI models failed')
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
// OFF-TOPIC RESPONSE
// ============================================================================

function getOffTopicResponse(language: 'ru' | 'en'): string {
  return language === 'ru'
    ? 'Я специализируюсь на фитнесе, тренировках, питании и здоровье. Задай вопрос по этой теме — с радостью помогу! 💪'
    : 'I specialize in fitness, workouts, nutrition, and health. Ask a question on these topics — I\'ll be happy to help! 💪'
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
      subscriptionTier = 'free',
      dailyMessageCount = 0,
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
        budget?: number
      }
      subscriptionTier?: 'free' | 'pro' | 'elite'
      dailyMessageCount?: number
      language?: 'ru' | 'en'
    } = body

    console.log('[Chat] Request received:', {
      messageCount: messages?.length,
      userContext: userContext ? 'provided' : 'none',
      language
    })

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const limit = CHAT_LIMITS[subscriptionTier]
    if (limit !== Infinity && dailyMessageCount >= limit) {
      const limitMessage = language === 'ru'
        ? `Дневной лимит: ${limit} сообщений. Обнови подписку.`
        : `Daily limit: ${limit} messages. Upgrade for more.`

      return new Response(limitMessage, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    const lastMessage = messages[messages.length - 1]?.content || ''
    const encoder = new TextEncoder()

    // Check topic
    if (!isAllowed(lastMessage)) {
      console.log(`[Chat] Blocked off-topic: "${lastMessage.substring(0, 30)}..."`)
      const stream = await streamResponse(getOffTopicResponse(language), encoder)
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    // Build prompt
    const systemPrompt = buildSystemPrompt(userContext, language)
    const limitedMessages = messages.slice(-CONFIG.MAX_CONTEXT_MESSAGES)
    
    // Convert to Google AI format
    const contents: GoogleAIContent[] = []
    
    // Combine system prompt with first user message
    if (limitedMessages.length > 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nПользователь: ${limitedMessages[0].content}` }]
      })
      
      // Add remaining messages
      for (let i = 1; i < limitedMessages.length; i++) {
        const msg = limitedMessages[i]
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })
      }
    }

    console.log('[Chat] Calling AI with', contents.length, 'messages')

    try {
      const aiResponse = await callAIWithFallback(contents)

      console.log(`[Chat] Total response time: ${Date.now() - startTime}ms`)

      const stream = await streamResponse(aiResponse, encoder)
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

    } catch (aiError: any) {
      console.error('[Chat] All AI models failed:', aiError.message)
      
      // Return actual error message so we can debug
      const errorMessage = language === 'ru'
        ? `⚠️ Ошибка AI: ${aiError.message}. Попробуй ещё раз.`
        : `⚠️ AI Error: ${aiError.message}. Please try again.`

      const stream = await streamResponse(errorMessage, encoder)
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

  } catch (error: any) {
    console.error('[Chat] Handler error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
