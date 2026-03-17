import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = 'sk-5a1ef35086a2438f8d416256fd8c7883'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// Common food products database for recognition
const FOOD_PRODUCTS: Record<string, { name: string; nameRu: string; category: string; calories: number; protein: number; carbs: number; fat: number }> = {
  // Dairy
  milk: { name: 'Milk', nameRu: 'Молоко', category: 'dairy', calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  cheese: { name: 'Cheese', nameRu: 'Сыр', category: 'dairy', calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  yogurt: { name: 'Yogurt', nameRu: 'Йогурт', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.7 },
  cottage_cheese: { name: 'Cottage Cheese', nameRu: 'Творог', category: 'dairy', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  sour_cream: { name: 'Sour Cream', nameRu: 'Сметана', category: 'dairy', calories: 115, protein: 2.4, carbs: 2.9, fat: 10 },
  butter: { name: 'Butter', nameRu: 'Масло сливочное', category: 'dairy', calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },

  // Eggs
  eggs: { name: 'Eggs', nameRu: 'Яйца', category: 'protein', calories: 155, protein: 13, carbs: 1.1, fat: 11 },

  // Meat & Fish
  chicken: { name: 'Chicken', nameRu: 'Курица', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  beef: { name: 'Beef', nameRu: 'Говядина', category: 'protein', calories: 250, protein: 26, carbs: 0, fat: 15 },
  pork: { name: 'Pork', nameRu: 'Свинина', category: 'protein', calories: 242, protein: 27, carbs: 0, fat: 14 },
  fish: { name: 'Fish', nameRu: 'Рыба', category: 'protein', calories: 206, protein: 22, carbs: 0, fat: 12 },
  salmon: { name: 'Salmon', nameRu: 'Лосось', category: 'protein', calories: 208, protein: 20, carbs: 0, fat: 13 },
  turkey: { name: 'Turkey', nameRu: 'Индейка', category: 'protein', calories: 135, protein: 30, carbs: 0, fat: 1 },
  sausage: { name: 'Sausage', nameRu: 'Колбаса', category: 'protein', calories: 301, protein: 12, carbs: 2, fat: 26 },

  // Vegetables
  tomato: { name: 'Tomato', nameRu: 'Помидор', category: 'vegetable', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  cucumber: { name: 'Cucumber', nameRu: 'Огурец', category: 'vegetable', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  carrot: { name: 'Carrot', nameRu: 'Морковь', category: 'vegetable', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  onion: { name: 'Onion', nameRu: 'Лук', category: 'vegetable', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  potato: { name: 'Potato', nameRu: 'Картофель', category: 'vegetable', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  cabbage: { name: 'Cabbage', nameRu: 'Капуста', category: 'vegetable', calories: 25, protein: 1.3, carbs: 6, fat: 0.1 },
  pepper: { name: 'Bell Pepper', nameRu: 'Перец', category: 'vegetable', calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  broccoli: { name: 'Broccoli', nameRu: 'Брокколи', category: 'vegetable', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  spinach: { name: 'Spinach', nameRu: 'Шпинат', category: 'vegetable', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  mushroom: { name: 'Mushrooms', nameRu: 'Грибы', category: 'vegetable', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  garlic: { name: 'Garlic', nameRu: 'Чеснок', category: 'vegetable', calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  zucchini: { name: 'Zucchini', nameRu: 'Кабачок', category: 'vegetable', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  eggplant: { name: 'Eggplant', nameRu: 'Баклажан', category: 'vegetable', calories: 25, protein: 1, carbs: 6, fat: 0.2 },

  // Fruits
  apple: { name: 'Apple', nameRu: 'Яблоко', category: 'fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  banana: { name: 'Banana', nameRu: 'Банан', category: 'fruit', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  orange: { name: 'Orange', nameRu: 'Апельсин', category: 'fruit', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  lemon: { name: 'Lemon', nameRu: 'Лимон', category: 'fruit', calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3 },
  berries: { name: 'Berries', nameRu: 'Ягоды', category: 'fruit', calories: 43, protein: 0.7, carbs: 10, fat: 0.3 },

  // Grains & Bread
  bread: { name: 'Bread', nameRu: 'Хлеб', category: 'grains', calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  rice: { name: 'Rice', nameRu: 'Рис', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  pasta: { name: 'Pasta', nameRu: 'Макароны', category: 'grains', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  oatmeal: { name: 'Oatmeal', nameRu: 'Овсянка', category: 'grains', calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  flour: { name: 'Flour', nameRu: 'Мука', category: 'grains', calories: 364, protein: 10, carbs: 76, fat: 1 },

  // Oils & Fats
  olive_oil: { name: 'Olive Oil', nameRu: 'Оливковое масло', category: 'oils', calories: 884, protein: 0, carbs: 0, fat: 100 },
  sunflower_oil: { name: 'Sunflower Oil', nameRu: 'Подсолнечное масло', category: 'oils', calories: 884, protein: 0, carbs: 0, fat: 100 },

  // Other
  honey: { name: 'Honey', nameRu: 'Мёд', category: 'other', calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  sugar: { name: 'Sugar', nameRu: 'Сахар', category: 'other', calories: 387, protein: 0, carbs: 100, fat: 0 },
  mayonnaise: { name: 'Mayonnaise', nameRu: 'Майонез', category: 'other', calories: 680, protein: 1, carbs: 0.6, fat: 75 },
  ketchup: { name: 'Ketchup', nameRu: 'Кетчуп', category: 'other', calories: 101, protein: 1.3, carbs: 27, fat: 0.1 },
  nuts: { name: 'Nuts', nameRu: 'Орехи', category: 'other', calories: 607, protein: 20, carbs: 20, fat: 54 },
  juice: { name: 'Juice', nameRu: 'Сок', category: 'drinks', calories: 45, protein: 0.5, carbs: 11, fat: 0 },
}

interface DetectedProduct {
  id: string
  name: string
  nameRu: string
  category: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
  available: boolean
}

interface UserProfile {
  age: number
  gender: string
  currentWeight: number
  targetWeight: number
  height: number
  fitnessGoal: string
  fitnessLevel: string
  language: string
  targetCalories?: number
  targetProtein?: number
  targetCarbs?: number
  targetFat?: number
}

interface Recipe {
  id: string
  name: string
  nameRu: string
  calories: number
  protein: number
  carbs: number
  fat: number
  prepTime: number
  cookTime: number
  ingredients: { name: string; nameRu: string; amount: string; available: boolean }[]
  instructions: string[]
  instructionsRu: string[]
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  matchScore: number // How well it matches available products
}

// POST /api/analyze-fridge - Analyze fridge photo and generate recipes
export async function POST(request: NextRequest) {
  console.log('📸 Fridge analysis request received')

  try {
    const body = await request.json()
    const { image, user } = body as { image?: string; user: UserProfile }

    if (!user) {
      return NextResponse.json({ error: 'User profile required' }, { status: 400 })
    }

    let detectedProducts: DetectedProduct[] = []

    // If image provided, simulate AI detection
    if (image) {
      console.log('🔍 Analyzing image...')
      // Simulate AI detection with common fridge items
      // In production, this would call Google Vision API
      detectedProducts = simulateImageDetection()
    } else {
      // No image provided - simulate typical fridge contents for demo
      console.log('🔍 No image provided, simulating typical fridge contents...')
      detectedProducts = simulateImageDetection()
    }

    console.log(`✅ Detected ${detectedProducts.length} products`)

    // Generate recipes based on detected products and user profile
    const recipes = await generateRecipes(detectedProducts, user)

    console.log(`✅ Generated ${recipes.length} recipes`)

    return NextResponse.json({
      products: detectedProducts,
      recipes,
      message: `Found ${detectedProducts.length} products`
    })

  } catch (error) {
    console.error('❌ Fridge analysis error:', error)
    return NextResponse.json({
      error: 'Failed to analyze fridge',
      products: [],
      recipes: []
    }, { status: 500 })
  }
}

function simulateImageDetection(): DetectedProduct[] {
  // Simulate AI detection of common fridge items
  const commonItems = ['eggs', 'milk', 'cheese', 'chicken', 'tomato', 'cucumber', 'onion', 'carrot', 'butter', 'yogurt']

  return commonItems.map((id, index) => {
    const product = FOOD_PRODUCTS[id]
    return {
      id,
      name: product.name,
      nameRu: product.nameRu,
      category: product.category,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      confidence: 0.85 + Math.random() * 0.15,
      available: true
    }
  })
}

async function generateRecipes(products: DetectedProduct[], user: UserProfile): Promise<Recipe[]> {
  const language = user.language || 'ru'

  const prompt = language === 'ru'
    ? `Создай 4 рецепта на основе имеющихся продуктов для пользователя с целью ${user.fitnessGoal === 'fat_loss' ? 'похудение' : user.fitnessGoal === 'muscle_gain' ? 'набор массы' : 'здоровье'}.

Доступные продукты: ${products.map(p => p.nameRu).join(', ')}.

Целевые КБЖУ на день: ${user.targetCalories || 2000} ккал, ${user.targetProtein || 150}г белка.

Верни JSON массив с рецептами:
[{
  "name": "Название",
  "nameRu": "Название на русском",
  "calories": 350,
  "protein": 25,
  "carbs": 30,
  "fat": 12,
  "prepTime": 10,
  "cookTime": 20,
  "ingredients": [{"name": "Ingredient", "nameRu": "Ингредиент", "amount": "100g", "available": true}],
  "instructions": ["Step 1", "Step 2"],
  "instructionsRu": ["Шаг 1", "Шаг 2"],
  "mealType": "breakfast",
  "matchScore": 0.9
}]

Важно: используй в первую очередь имеющиеся продукты. available: true если продукт есть в списке.`
    : `Create 4 recipes based on available products for a user with goal: ${user.fitnessGoal}.

Available products: ${products.map(p => p.name).join(', ')}.

Target daily macros: ${user.targetCalories || 2000} kcal, ${user.targetProtein || 150}g protein.

Return JSON array:
[{
  "name": "Recipe Name",
  "nameRu": "Russian name",
  "calories": 350,
  "protein": 25,
  "carbs": 30,
  "fat": 12,
  "prepTime": 10,
  "cookTime": 20,
  "ingredients": [{"name": "Ingredient", "nameRu": "Russian", "amount": "100g", "available": true}],
  "instructions": ["Step 1", "Step 2"],
  "instructionsRu": ["Шаг 1", "Шаг 2"],
  "mealType": "breakfast",
  "matchScore": 0.9
}]

Use available products first. Set available: true if product is in the list.`

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Ты профессиональный диетолог. Возвращай только валидный JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      console.error('DeepSeek API error')
      return generateFallbackRecipes(products, user)
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || ''

    // Extract JSON array
    const jsonStart = content.indexOf('[')
    const jsonEnd = content.lastIndexOf(']')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.slice(jsonStart, jsonEnd + 1)
    }

    const recipes = JSON.parse(content)
    return recipes.map((r: Recipe, i: number) => ({
      ...r,
      id: `recipe-${Date.now()}-${i}`
    }))

  } catch (error) {
    console.error('Recipe generation error:', error)
    return generateFallbackRecipes(products, user)
  }
}

function generateFallbackRecipes(products: DetectedProduct[], user: UserProfile): Recipe[] {
  const availableProductNames = products.map(p => p.nameRu.toLowerCase())

  const baseRecipes: Recipe[] = [
    {
      id: `recipe-${Date.now()}-1`,
      name: 'Protein Omelette',
      nameRu: 'Белковый омлет',
      calories: 320,
      protein: 28,
      carbs: 8,
      fat: 20,
      prepTime: 5,
      cookTime: 10,
      ingredients: [
        { name: 'Eggs', nameRu: 'Яйца', amount: '3 шт', available: availableProductNames.includes('яйца') },
        { name: 'Milk', nameRu: 'Молоко', amount: '50 мл', available: availableProductNames.includes('молоко') },
        { name: 'Cheese', nameRu: 'Сыр', amount: '30 г', available: availableProductNames.includes('сыр') },
        { name: 'Tomato', nameRu: 'Помидор', amount: '1 шт', available: availableProductNames.includes('помидор') },
      ],
      instructions: ['Beat eggs with milk', 'Pour into heated pan', 'Add cheese and tomato', 'Cook until set'],
      instructionsRu: ['Взбить яйца с молоком', 'Вылить на разогретую сковороду', 'Добавить сыр и помидор', 'Готовить до готовности'],
      mealType: 'breakfast',
      matchScore: 0.85
    },
    {
      id: `recipe-${Date.now()}-2`,
      name: 'Chicken Salad',
      nameRu: 'Салат с курицей',
      calories: 380,
      protein: 35,
      carbs: 15,
      fat: 18,
      prepTime: 15,
      cookTime: 20,
      ingredients: [
        { name: 'Chicken', nameRu: 'Курица', amount: '150 г', available: availableProductNames.includes('курица') },
        { name: 'Cucumber', nameRu: 'Огурец', amount: '1 шт', available: availableProductNames.includes('огурец') },
        { name: 'Tomato', nameRu: 'Помидор', amount: '1 шт', available: availableProductNames.includes('помидор') },
        { name: 'Onion', nameRu: 'Лук', amount: '0.5 шт', available: availableProductNames.includes('лук') },
      ],
      instructions: ['Cook chicken until done', 'Slice vegetables', 'Combine all ingredients', 'Season to taste'],
      instructionsRu: ['Отварить или обжарить курицу', 'Нарезать овощи', 'Смешать все ингредиенты', 'Посолить по вкусу'],
      mealType: 'lunch',
      matchScore: 0.90
    },
    {
      id: `recipe-${Date.now()}-3`,
      name: 'Vegetable Stir Fry',
      nameRu: 'Овощное рагу',
      calories: 250,
      protein: 8,
      carbs: 25,
      fat: 12,
      prepTime: 10,
      cookTime: 15,
      ingredients: [
        { name: 'Carrot', nameRu: 'Морковь', amount: '1 шт', available: availableProductNames.includes('морковь') },
        { name: 'Onion', nameRu: 'Лук', amount: '1 шт', available: availableProductNames.includes('лук') },
        { name: 'Tomato', nameRu: 'Помидор', amount: '2 шт', available: availableProductNames.includes('помидор') },
        { name: 'Cabbage', nameRu: 'Капуста', amount: '200 г', available: availableProductNames.includes('капуста') },
      ],
      instructions: ['Chop all vegetables', 'Sauté onion and carrot', 'Add remaining vegetables', 'Cook until tender'],
      instructionsRu: ['Нарезать все овощи', 'Обжарить лук и морковь', 'Добавить остальные овощи', 'Тушить до готовности'],
      mealType: 'dinner',
      matchScore: 0.80
    },
    {
      id: `recipe-${Date.now()}-4`,
      name: 'Yogurt Bowl',
      nameRu: 'Йогуртовая чашка',
      calories: 200,
      protein: 15,
      carbs: 25,
      fat: 5,
      prepTime: 5,
      cookTime: 0,
      ingredients: [
        { name: 'Yogurt', nameRu: 'Йогурт', amount: '200 г', available: availableProductNames.includes('йогурт') },
        { name: 'Berries', nameRu: 'Ягоды', amount: '50 г', available: availableProductNames.includes('ягоды') },
        { name: 'Nuts', nameRu: 'Орехи', amount: '15 г', available: availableProductNames.includes('орехи') },
      ],
      instructions: ['Add yogurt to bowl', 'Top with berries', 'Sprinkle nuts'],
      instructionsRu: ['Выложить йогурт в чашку', 'Добавить ягоды', 'Посыпать орехами'],
      mealType: 'snack',
      matchScore: 0.75
    }
  ]

  // Calculate match score based on available products
  return baseRecipes.map(recipe => {
    const availableCount = recipe.ingredients.filter(i => i.available).length
    const matchScore = availableCount / recipe.ingredients.length
    return { ...recipe, matchScore }
  })
}
