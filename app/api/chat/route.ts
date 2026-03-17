import { NextRequest, NextResponse } from 'next/server'
import { Language, CHAT_LIMITS } from '@/lib/translations'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Google AI API Configuration
const GOOGLE_API_KEY = 'AIzaSyDTk5qlinzDaTgR8SDfojCQACqDBBWZUR8'
const MODELS = ['gemma-3-27b-it', 'gemma-3-12b-it', 'gemini-2.0-flash']
const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// POST /api/chat - AI Chat with Google Gemma 3
export async function POST(request: NextRequest) {
  console.log('💬 Chat request received')
  
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
      }
      subscriptionTier?: 'free' | 'pro' | 'elite'
      dailyMessageCount?: number
      language?: Language
    } = body

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Invalid messages array')
      return NextResponse.json({ 
        message: {
          role: 'assistant',
          content: language === 'ru' 
            ? 'Пожалуйста, введите сообщение.' 
            : 'Please enter a message.',
          timestamp: new Date().toISOString()
        },
        remaining: CHAT_LIMITS[subscriptionTier] === Infinity ? '∞' : CHAT_LIMITS[subscriptionTier]
      })
    }

    // Check daily message limit
    const limit = CHAT_LIMITS[subscriptionTier]
    if (limit !== Infinity && dailyMessageCount >= limit) {
      console.log('⚠️ Daily limit reached:', { count: dailyMessageCount, limit })
      const limitMessage = language === 'ru'
        ? `Дневной лимит сообщений достигнут (${limit} сообщений). Обновите подписку для увеличения лимита.`
        : `Daily message limit reached (${limit} messages). Upgrade your subscription for more messages.`
      
      return NextResponse.json({ 
        message: {
          role: 'assistant',
          content: limitMessage,
          timestamp: new Date().toISOString()
        },
        limitReached: true,
        limit: limit,
        remaining: 0
      }, { status: 200 })
    }

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(userContext, language)
    console.log('📝 System prompt built for language:', language)

    // Convert messages to Google AI format
    const contents = []
    const limitedMessages = messages.slice(-10)
    
    if (limitedMessages.length > 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nПользователь: ${limitedMessages[0].content}` }]
      })
      
      for (let i = 1; i < limitedMessages.length; i++) {
        const msg = limitedMessages[i]
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })
      }
    }

    // Try each model until one works
    let responseContent = ''
    let lastError: Error | null = null
    
    for (const model of MODELS) {
      try {
        console.log(`🤖 Trying model: ${model}`)
        
        const url = `${GOOGLE_API_BASE}/${model}:generateContent?key=${GOOGLE_API_KEY}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ ${model} error:`, response.status, errorText.substring(0, 200))
          throw new Error(`API error ${response.status}`)
        }
        
        const data = await response.json()
        responseContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        
        if (responseContent && responseContent.trim()) {
          console.log(`✅ ${model} success! Response length:`, responseContent.length)
          break
        }
        
      } catch (error: any) {
        console.error(`❌ ${model} failed:`, error.message)
        lastError = error
      }
    }

    if (!responseContent || responseContent.trim() === '') {
      console.error('❌ All models failed')
      const errorMessage = lastError?.message || 'Unknown error'
      return NextResponse.json({ 
        message: {
          role: 'assistant',
          content: language === 'ru' 
            ? `Ошибка AI: ${errorMessage}. Попробуйте ещё раз.` 
            : `AI Error: ${errorMessage}. Please try again.`,
          timestamp: new Date().toISOString()
        },
        error: true,
        remaining: limit === Infinity ? '∞' : Math.max(0, limit - dailyMessageCount)
      })
    }

    const remaining = limit === Infinity ? '∞' : Math.max(0, limit - dailyMessageCount - 1)

    return NextResponse.json({ 
      message: {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      },
      remaining
    })
  } catch (error) {
    console.error('❌ Chat error:', error)
    
    return NextResponse.json({ 
      message: {
        role: 'assistant',
        content: 'Произошла ошибка. Попробуйте ещё раз через минуту. 🔄',
        timestamp: new Date().toISOString()
      },
      error: false,
      remaining: 10
    })
  }
}

function buildSystemPrompt(userContext?: {
  fitnessGoal?: string
  fitnessLevel?: string
  currentWeight?: number
  targetWeight?: number
  height?: number
  age?: number
  gender?: string
  equipment?: string[]
}, language: Language = 'ru'): string {
  
  const goalNames: Record<string, { ru: string; en: string }> = {
    fat_loss: { ru: 'похудение', en: 'fat loss' },
    muscle_gain: { ru: 'набор мышечной массы', en: 'muscle gain' },
    endurance: { ru: 'выносливость', en: 'endurance' },
    maintenance: { ru: 'поддержание формы', en: 'maintenance' },
  }
  
  const levelNames: Record<string, { ru: string; en: string }> = {
    beginner: { ru: 'новичок', en: 'beginner' },
    intermediate: { ru: 'средний уровень', en: 'intermediate' },
    advanced: { ru: 'продвинутый', en: 'advanced' },
  }

  if (language === 'ru') {
    const basePrompt = `Ты — профессиональный AI-фитнес-тренер BodyGenius AI.

🎯 ТВОЯ РОЛЬ:
Ты — персональный тренер и консультант по питанию. Отвечай подробно, дружелюбно и с эмодзи.

💪 ТЫ МОЖЕШЬ ОТВЕЧАТЬ НА:
• Вопросы о тренировках и упражнениях
• Вопросы о питании и диетах
• Расчёт калорий и БЖУ
• Советы по мотивации
• Рекомендации по восстановлению
• Общие вопросы о фитнесе и здоровье
• Рекомендации по выбору тренажёров и инвентаря

⚠️ ОГРАНИЧЕНИЯ:
• НЕ давай медицинских диагнозов
• НЕ рекомендуй лекарства
• При болях/травмах советуй обратиться к врачу

💬 СТИЛЬ:
• Дружелюбный и поддерживающий
• Используй эмодзи и списки
• Давай конкретные советы с примерами
• Задавай уточняющие вопросы при необходимости
• Персонализируй ответ под пользователя!`

    if (userContext) {
      const goalName = userContext.fitnessGoal ? goalNames[userContext.fitnessGoal]?.ru : 'не указана'
      const levelName = userContext.fitnessLevel ? levelNames[userContext.fitnessLevel]?.ru : 'не указан'
      const equipment = userContext.equipment?.length 
        ? userContext.equipment.join(', ') 
        : 'без оборудования'
      
      // Check for specific equipment
      const hasPullupBar = userContext.equipment?.some(e => 
        e.toLowerCase().includes('pullup') || e.toLowerCase().includes('турник')
      ) || false
      
      let weightGoal = ''
      if (userContext.currentWeight && userContext.targetWeight) {
        const diff = userContext.targetWeight - userContext.currentWeight
        if (diff < 0) {
          weightGoal = `нужно похудеть на ${Math.abs(diff).toFixed(1)} кг`
        } else if (diff > 0) {
          weightGoal = `нужно набрать ${diff.toFixed(1)} кг`
        } else {
          weightGoal = 'поддержание текущего веса'
        }
      }

      let equipmentRecommendations = ''
      if (hasPullupBar) {
        equipmentRecommendations = `\n\n💪 ТУРНИК ДОСТУПЕН:
Пользователь имеет турник! Это открывает отличные возможности для тренировки спины и рук:
• Подтягивания (прямым хватом) - для широчайших мышц спины
• Подтягивания обратным хватом - акцент на бицепс
• Австралийские подтягивания - облегчённый вариант для новичков
• Вис на перекладине - для вытяжения позвоночника и хвата
• Подъём ног в висе - для пресса

РЕКОМЕНДУЙ упражнения с турником при вопросах о тренировке спины, бицепса или пресса!`
      }

      return `${basePrompt}

👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
• Возраст: ${userContext.age || 'не указан'} лет
• Пол: ${userContext.gender === 'male' ? 'мужской' : userContext.gender === 'female' ? 'женский' : 'не указан'}
• Рост: ${userContext.height || 'не указан'} см
• Текущий вес: ${userContext.currentWeight || 'не указан'} кг
• Целевой вес: ${userContext.targetWeight || 'не указан'} кг
• Цель: ${goalName}
• Уровень подготовки: ${levelName}
• Доступный инвентарь: ${equipment}
${weightGoal ? `• Задача: ${weightGoal}` : ''}${equipmentRecommendations}

📌 ВАЖНО:
Персонализируй все советы под этого пользователя! Учитывай его цель, уровень и параметры.`
    }

    return basePrompt
  }

  // English version
  const basePromptEn = `You are a professional AI fitness coach for BodyGenius AI.

🎯 YOUR ROLE:
You are a personal trainer and nutrition consultant. Respond thoroughly but in a friendly way with emojis.

💪 YOU CAN ANSWER:
• Questions about workouts and exercises
• Questions about nutrition and diets
• Calorie and macro calculations
• Motivation tips
• Recovery recommendations
• General fitness and wellness questions
• Equipment and machine recommendations

⚠️ LIMITATIONS:
• DO NOT give medical diagnoses
• DO NOT recommend medications
• For pain/injuries, recommend seeing a doctor

💬 STYLE:
• Friendly and supportive
• Use emojis and lists
• Give specific advice with examples
• Ask clarifying questions when needed
• Personalize responses for the user!`

  if (userContext) {
    const goalName = userContext.fitnessGoal ? goalNames[userContext.fitnessGoal]?.en : 'not specified'
    const levelName = userContext.fitnessLevel ? levelNames[userContext.fitnessLevel]?.en : 'not specified'
    const equipment = userContext.equipment?.length 
      ? userContext.equipment.join(', ') 
      : 'no equipment'
    
    // Check for specific equipment
    const hasPullupBar = userContext.equipment?.some(e => 
      e.toLowerCase().includes('pullup') || e.toLowerCase().includes('bar')
    ) || false
    
    let weightGoal = ''
    if (userContext.currentWeight && userContext.targetWeight) {
      const diff = userContext.targetWeight - userContext.currentWeight
      if (diff < 0) {
        weightGoal = `needs to lose ${Math.abs(diff).toFixed(1)} kg`
      } else if (diff > 0) {
        weightGoal = `needs to gain ${diff.toFixed(1)} kg`
      } else {
        weightGoal = 'maintaining current weight'
      }
    }

    let equipmentRecommendations = ''
    if (hasPullupBar) {
      equipmentRecommendations = `\n\n💪 PULL-UP BAR AVAILABLE:
The user has a pull-up bar! This opens excellent opportunities for back and arm training:
• Pull-ups (overhand grip) - for latissimus dorsi
• Chin-ups (underhand grip) - emphasis on biceps
• Inverted/Australian rows - easier variation for beginners
• Dead hang - for spine decompression and grip strength
• Hanging leg raises - for abs

RECOMMEND pull-up bar exercises when asked about back, biceps or abs training!`
    }

    return `${basePromptEn}

👤 USER PROFILE:
• Age: ${userContext.age || 'not specified'} years
• Gender: ${userContext.gender === 'male' ? 'male' : userContext.gender === 'female' ? 'female' : 'not specified'}
• Height: ${userContext.height || 'not specified'} cm
• Current weight: ${userContext.currentWeight || 'not specified'} kg
• Target weight: ${userContext.targetWeight || 'not specified'} kg
• Goal: ${goalName}
• Fitness level: ${levelName}
• Available equipment: ${equipment}
${weightGoal ? `• Task: ${weightGoal}` : ''}${equipmentRecommendations}

📌 IMPORTANT:
Personalize all advice for this user! Consider their goal, level, and parameters.`
  }

  return basePromptEn
}
