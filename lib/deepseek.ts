// AI Client with Google Gemini API
// Primary: Google Gemini 2.0 Flash, Fallback: z-ai-web-dev-sdk

import ZAI from 'z-ai-web-dev-sdk'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Google Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDTk5qlinzDaTgR8SDfojCQACqDBBWZUR8'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Timeout configuration
const AI_TIMEOUT_MS = 15000 // 15 seconds
const MAX_RETRIES = 2

interface GeminiContent {
  parts: { text: string }[]
  role?: string
}

interface GeminiResponse {
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

// Convert messages to Gemini format
function convertToGeminiFormat(messages: ChatMessage[]): GeminiContent[] {
  const contents: GeminiContent[] = []
  
  // Find system message and combine with first user message
  let systemPrompt = ''
  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = msg.content
    }
  }
  
  // Convert user/assistant messages
  for (const msg of messages) {
    if (msg.role === 'system') continue
    
    const role = msg.role === 'assistant' ? 'model' : 'user'
    let content = msg.content
    
    // Prepend system prompt to first user message
    if (systemPrompt && role === 'user' && contents.length === 0) {
      content = `${systemPrompt}\n\nUser: ${content}`
    }
    
    contents.push({
      role,
      parts: [{ text: content }]
    })
  }
  
  return contents
}

// Sleep helper for retries
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Call Gemini API with timeout
async function callGeminiApi(contents: GeminiContent[], retryCount = 0): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
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
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }
    
    const data: GeminiResponse = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return text
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    // Retry on timeout or network errors
    if ((error.name === 'AbortError' || error.message?.includes('fetch')) && retryCount < MAX_RETRIES) {
      console.log(`[Gemini] Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
      await sleep(500)
      return callGeminiApi(contents, retryCount + 1)
    }
    
    throw error
  }
}

// Fallback to z-ai-web-dev-sdk
async function fallbackChatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const zai = await ZAI.create()
    
    const completion = await zai.chat.completions.create({
      messages: messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      })),
      temperature: 0.7,
      max_tokens: 1500,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Fallback API error:', error)
    throw error
  }
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: {
    temperature?: number
    max_tokens?: number
    model?: string
  } = {}
): Promise<string> {
  // Try Gemini first
  try {
    console.log('[AI] Calling Gemini API...')
    const contents = convertToGeminiFormat(messages)
    const response = await callGeminiApi(contents)
    console.log('[AI] Gemini response received, length:', response.length)
    return response
  } catch (error: any) {
    console.error('[AI] Gemini failed:', error.message)
    
    // Use fallback
    console.log('[AI] Using fallback...')
    return fallbackChatCompletion(messages)
  }
}

// Helper for structured JSON responses
export async function createStructuredCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number
    max_tokens?: number
  } = {}
): Promise<string> {
  return createChatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4000,
    }
  )
}
