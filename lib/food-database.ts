// ============================================================================
// FOOD DATABASE - Comprehensive database of products and dishes
// ============================================================================

// Product category types
export type ProductCategory = 
  | 'cereals'      // Крупы
  | 'meat'         // Мясо
  | 'poultry'      // Птица
  | 'fish'         // Рыба
  | 'seafood'      // Морепродукты
  | 'dairy'        // Молочные продукты
  | 'eggs'         // Яйца
  | 'vegetables'   // Овощи
  | 'fruits'       // Фрукты
  | 'berries'      // Ягоды
  | 'nuts'         // Орехи
  | 'legumes'      // Бобовые
  | 'oils'         // Масла
  | 'sauces'       // Соусы
  | 'spices'       // Специи
  | 'beverages'    // Напитки
  | 'bakery'       // Выпечка
  | 'sweets'       // Сладости
  | 'fast_food'    // Фастфуд
  | 'snacks'       // Снеки

// Season availability
export type Season = 'all' | 'spring' | 'summer' | 'autumn' | 'winter'

// Goal tags for dishes
export type GoalTag = 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance'

// Meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

// ============================================================================
// PRODUCT DATABASE
// ============================================================================

export interface FoodProduct {
  id: string
  name: string
  nameRu: string
  caloriesPer100g: number
  proteinPer100g: number
  fatPer100g: number
  carbsPer100g: number
  fiberPer100g?: number
  category: ProductCategory
  typicalPortion: number        // in grams
  typicalPortionUnit: string    // e.g., "г", "шт", "стакан"
  typicalPortionNameRu: string  // e.g., "порция", "штука", "стакан"
  season?: Season[]
  tags?: GoalTag[]
  priceCategory?: 'budget' | 'medium' | 'premium' // Price level
}

// Comprehensive food products database (300+ items)
export const FOOD_PRODUCTS: FoodProduct[] = [
  // ============================================================================
  // CEREALS - КРУПЫ
  // ============================================================================
  { id: 'prod_cereal_001', name: 'Buckwheat', nameRu: 'Гречка', caloriesPer100g: 343, proteinPer100g: 13.3, fatPer100g: 3.4, carbsPer100g: 72, fiberPer100g: 10, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_cereal_002', name: 'Oatmeal', nameRu: 'Овсянка', caloriesPer100g: 366, proteinPer100g: 12.3, fatPer100g: 6.1, carbsPer100g: 67, fiberPer100g: 10.6, category: 'cereals', typicalPortion: 60, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_cereal_003', name: 'Rice (white)', nameRu: 'Рис белый', caloriesPer100g: 344, proteinPer100g: 6.7, fatPer100g: 0.7, carbsPer100g: 78.9, fiberPer100g: 0.4, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_cereal_004', name: 'Rice (brown)', nameRu: 'Рис бурый', caloriesPer100g: 370, proteinPer100g: 7.4, fatPer100g: 2.1, carbsPer100g: 76, fiberPer100g: 3.5, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_cereal_005', name: 'Quinoa', nameRu: 'Киноа', caloriesPer100g: 368, proteinPer100g: 14.1, fatPer100g: 6.1, carbsPer100g: 57, fiberPer100g: 7, category: 'cereals', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_cereal_006', name: 'Bulgur', nameRu: 'Булгур', caloriesPer100g: 342, proteinPer100g: 12.3, fatPer100g: 1.3, carbsPer100g: 76, fiberPer100g: 18.3, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_cereal_007', name: 'Millet', nameRu: 'Пшено', caloriesPer100g: 348, proteinPer100g: 11.5, fatPer100g: 3.3, carbsPer100g: 69, fiberPer100g: 8.7, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_cereal_008', name: 'Barley', nameRu: 'Перловка', caloriesPer100g: 324, proteinPer100g: 9.3, fatPer100g: 1.1, carbsPer100g: 73.7, fiberPer100g: 15.6, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_cereal_009', name: 'Semolina', nameRu: 'Манка', caloriesPer100g: 333, proteinPer100g: 10.3, fatPer100g: 1, carbsPer100g: 73.3, fiberPer100g: 0.3, category: 'cereals', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: [], priceCategory: 'budget' },
  { id: 'prod_cereal_010', name: 'Corn grits', nameRu: 'Кукурузная крупа', caloriesPer100g: 337, proteinPer100g: 8.3, fatPer100g: 1.2, carbsPer100g: 75, fiberPer100g: 4.8, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_cereal_011', name: 'Peas (split)', nameRu: 'Горох', caloriesPer100g: 298, proteinPer100g: 20.5, fatPer100g: 2, carbsPer100g: 49.5, fiberPer100g: 11.2, category: 'cereals', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_cereal_012', name: 'Lentils', nameRu: 'Чечевица', caloriesPer100g: 295, proteinPer100g: 24, fatPer100g: 1.5, carbsPer100g: 46.3, fiberPer100g: 11.5, category: 'cereals', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'medium' },

  // ============================================================================
  // MEAT - МЯСО
  // ============================================================================
  { id: 'prod_meat_001', name: 'Chicken breast', nameRu: 'Куриная грудка', caloriesPer100g: 113, proteinPer100g: 23.6, fatPer100g: 1.9, carbsPer100g: 0.4, category: 'poultry', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_meat_002', name: 'Chicken thigh', nameRu: 'Куриное бедро', caloriesPer100g: 186, proteinPer100g: 19.4, fatPer100g: 11.3, carbsPer100g: 0, category: 'poultry', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_meat_003', name: 'Turkey breast', nameRu: 'Грудка индейки', caloriesPer100g: 104, proteinPer100g: 23.6, fatPer100g: 1, carbsPer100g: 0.1, category: 'poultry', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_meat_004', name: 'Beef (lean)', nameRu: 'Говядина постная', caloriesPer100g: 158, proteinPer100g: 22, fatPer100g: 7, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_meat_005', name: 'Beef (fatty)', nameRu: 'Говядина жирная', caloriesPer100g: 254, proteinPer100g: 18, fatPer100g: 19, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_meat_006', name: 'Pork tenderloin', nameRu: 'Свиная вырезка', caloriesPer100g: 143, proteinPer100g: 21.8, fatPer100g: 5.2, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_meat_007', name: 'Veal', nameRu: 'Телятина', caloriesPer100g: 131, proteinPer100g: 22, fatPer100g: 4, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'premium' },
  { id: 'prod_meat_008', name: 'Lamb', nameRu: 'Баранина', caloriesPer100g: 203, proteinPer100g: 17, fatPer100g: 15, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain'], priceCategory: 'premium' },
  { id: 'prod_meat_009', name: 'Rabbit', nameRu: 'Кролик', caloriesPer100g: 136, proteinPer100g: 21.4, fatPer100g: 5, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'premium' },
  { id: 'prod_meat_010', name: 'Ground beef (lean)', nameRu: 'Фарш говяжий постный', caloriesPer100g: 176, proteinPer100g: 20, fatPer100g: 10, carbsPer100g: 0, category: 'meat', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_meat_011', name: 'Chicken liver', nameRu: 'Печень куриная', caloriesPer100g: 136, proteinPer100g: 19.1, fatPer100g: 6.3, carbsPer100g: 0.6, category: 'meat', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_meat_012', name: 'Beef liver', nameRu: 'Печень говяжья', caloriesPer100g: 127, proteinPer100g: 17.9, fatPer100g: 3.7, carbsPer100g: 5.3, category: 'meat', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },

  // ============================================================================
  // FISH & SEAFOOD - РЫБА И МОРЕПРОДУКТЫ
  // ============================================================================
  { id: 'prod_fish_001', name: 'Salmon', nameRu: 'Лосось/Сёмга', caloriesPer100g: 208, proteinPer100g: 20, fatPer100g: 13, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_fish_002', name: 'Tuna (fresh)', nameRu: 'Тунец свежий', caloriesPer100g: 139, proteinPer100g: 24.4, fatPer100g: 4.6, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'premium' },
  { id: 'prod_fish_003', name: 'Tuna (canned)', nameRu: 'Тунец консервированный', caloriesPer100g: 116, proteinPer100g: 23.5, fatPer100g: 0.9, carbsPer100g: 0, category: 'fish', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'банка', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_fish_004', name: 'Cod', nameRu: 'Треска', caloriesPer100g: 78, proteinPer100g: 17.8, fatPer100g: 0.7, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_fish_005', name: 'Tilapia', nameRu: 'Тилапия', caloriesPer100g: 96, proteinPer100g: 20, fatPer100g: 1.7, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_fish_006', name: 'Mackerel', nameRu: 'Скумбрия', caloriesPer100g: 191, proteinPer100g: 18.6, fatPer100g: 12.7, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_fish_007', name: 'Herring', nameRu: 'Сельдь', caloriesPer100g: 161, proteinPer100g: 16.5, fatPer100g: 10.3, carbsPer100g: 0, category: 'fish', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_fish_008', name: 'Pollock', nameRu: 'Минтай', caloriesPer100g: 72, proteinPer100g: 15.9, fatPer100g: 0.9, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_fish_009', name: 'Trout', nameRu: 'Форель', caloriesPer100g: 148, proteinPer100g: 20.7, fatPer100g: 6.5, carbsPer100g: 0, category: 'fish', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_fish_010', name: 'Shrimp', nameRu: 'Креветки', caloriesPer100g: 95, proteinPer100g: 20.1, fatPer100g: 1.7, carbsPer100g: 0.2, category: 'seafood', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'premium' },
  { id: 'prod_fish_011', name: 'Squid', nameRu: 'Кальмар', caloriesPer100g: 92, proteinPer100g: 18, fatPer100g: 1.2, carbsPer100g: 2, category: 'seafood', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_fish_012', name: 'Crab', nameRu: 'Краб', caloriesPer100g: 96, proteinPer100g: 18.1, fatPer100g: 1, carbsPer100g: 0.5, category: 'seafood', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'premium' },
  { id: 'prod_fish_013', name: 'Mussels', nameRu: 'Мидии', caloriesPer100g: 86, proteinPer100g: 11.9, fatPer100g: 2.2, carbsPer100g: 3.7, category: 'seafood', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_fish_014', name: 'Sardines (canned)', nameRu: 'Сардины консервированные', caloriesPer100g: 208, proteinPer100g: 24.6, fatPer100g: 11.5, carbsPer100g: 0, category: 'fish', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'банка', tags: ['muscle_gain', 'maintenance'], priceCategory: 'medium' },

  // ============================================================================
  // DAIRY - МОЛОЧНЫЕ ПРОДУКТЫ
  // ============================================================================
  { id: 'prod_dairy_001', name: 'Milk (whole)', nameRu: 'Молоко цельное', caloriesPer100g: 61, proteinPer100g: 3.2, fatPer100g: 3.6, carbsPer100g: 4.8, category: 'dairy', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_dairy_002', name: 'Milk (skim)', nameRu: 'Молоко обезжиренное', caloriesPer100g: 31, proteinPer100g: 3, fatPer100g: 0.1, carbsPer100g: 4.7, category: 'dairy', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_dairy_003', name: 'Greek yogurt', nameRu: 'Греческий йогурт', caloriesPer100g: 59, proteinPer100g: 10, fatPer100g: 0.7, carbsPer100g: 3.6, category: 'dairy', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_dairy_004', name: 'Yogurt (regular)', nameRu: 'Йогурт обычный', caloriesPer100g: 60, proteinPer100g: 4.3, fatPer100g: 3.3, carbsPer100g: 4.2, category: 'dairy', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_dairy_005', name: 'Cottage cheese (low-fat)', nameRu: 'Творог обезжиренный', caloriesPer100g: 85, proteinPer100g: 16.5, fatPer100g: 0.5, carbsPer100g: 1.3, category: 'dairy', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_dairy_006', name: 'Cottage cheese (regular)', nameRu: 'Творог обычный', caloriesPer100g: 155, proteinPer100g: 14, fatPer100g: 9, carbsPer100g: 2.7, category: 'dairy', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_dairy_007', name: 'Cheese (hard)', nameRu: 'Сыр твёрдый', caloriesPer100g: 352, proteinPer100g: 25, fatPer100g: 28, carbsPer100g: 0.1, category: 'dairy', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'кусочек', tags: ['muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_dairy_008', name: 'Cheese (feta)', nameRu: 'Сыр фета', caloriesPer100g: 264, proteinPer100g: 14.2, fatPer100g: 21.3, carbsPer100g: 4.1, category: 'dairy', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'medium' },
  { id: 'prod_dairy_009', name: 'Mozzarella', nameRu: 'Моцарелла', caloriesPer100g: 280, proteinPer100g: 19.9, fatPer100g: 21.6, carbsPer100g: 0.7, category: 'dairy', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'шарик', tags: ['maintenance'], priceCategory: 'medium' },
  { id: 'prod_dairy_010', name: 'Kefir', nameRu: 'Кефир', caloriesPer100g: 40, proteinPer100g: 3, fatPer100g: 1, carbsPer100g: 4, category: 'dairy', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_dairy_011', name: 'Ryazhenka', nameRu: 'Ряженка', caloriesPer100g: 54, proteinPer100g: 2.8, fatPer100g: 2.5, carbsPer100g: 4.2, category: 'dairy', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_dairy_012', name: 'Sour cream', nameRu: 'Сметана', caloriesPer100g: 115, proteinPer100g: 2.8, fatPer100g: 10, carbsPer100g: 3.2, category: 'dairy', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'ложка', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_dairy_013', name: 'Cream (heavy)', nameRu: 'Сливки 33%', caloriesPer100g: 322, proteinPer100g: 2.3, fatPer100g: 33, carbsPer100g: 3.7, category: 'dairy', typicalPortion: 30, typicalPortionUnit: 'мл', typicalPortionNameRu: 'ложка', tags: [], priceCategory: 'medium' },
  { id: 'prod_dairy_014', name: 'Whey protein', nameRu: 'Сывороточный протеин', caloriesPer100g: 370, proteinPer100g: 75, fatPer100g: 5, carbsPer100g: 10, category: 'dairy', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'premium' },
  { id: 'prod_dairy_015', name: 'Casein protein', nameRu: 'Казеин', caloriesPer100g: 360, proteinPer100g: 78, fatPer100g: 3, carbsPer100g: 8, category: 'dairy', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain'], priceCategory: 'premium' },

  // ============================================================================
  // EGGS - ЯЙЦА
  // ============================================================================
  { id: 'prod_egg_001', name: 'Chicken egg', nameRu: 'Яйцо куриное', caloriesPer100g: 155, proteinPer100g: 12.6, fatPer100g: 10.6, carbsPer100g: 1.1, category: 'eggs', typicalPortion: 55, typicalPortionUnit: 'шт', typicalPortionNameRu: 'штука', tags: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_egg_002', name: 'Egg white', nameRu: 'Яичный белок', caloriesPer100g: 52, proteinPer100g: 11, fatPer100g: 0.2, carbsPer100g: 0.7, category: 'eggs', typicalPortion: 30, typicalPortionUnit: 'шт', typicalPortionNameRu: 'штука', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_egg_003', name: 'Quail egg', nameRu: 'Яйцо перепелиное', caloriesPer100g: 158, proteinPer100g: 13, fatPer100g: 11, carbsPer100g: 0.6, category: 'eggs', typicalPortion: 12, typicalPortionUnit: 'шт', typicalPortionNameRu: 'штука', tags: ['maintenance'], priceCategory: 'medium' },

  // ============================================================================
  // VEGETABLES - ОВОЩИ
  // ============================================================================
  { id: 'prod_veg_001', name: 'Tomato', nameRu: 'Помидор', caloriesPer100g: 18, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 3.9, fiberPer100g: 1.2, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer', 'autumn'], tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_veg_002', name: 'Cucumber', nameRu: 'Огурец', caloriesPer100g: 15, proteinPer100g: 0.8, fatPer100g: 0.1, carbsPer100g: 3.6, fiberPer100g: 0.5, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_veg_003', name: 'Bell pepper', nameRu: 'Болгарский перец', caloriesPer100g: 27, proteinPer100g: 1.3, fatPer100g: 0.3, carbsPer100g: 5.7, fiberPer100g: 1.9, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer', 'autumn'], tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_veg_004', name: 'Broccoli', nameRu: 'Брокколи', caloriesPer100g: 34, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 6.6, fiberPer100g: 2.6, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_veg_005', name: 'Cauliflower', nameRu: 'Цветная капуста', caloriesPer100g: 30, proteinPer100g: 2.5, fatPer100g: 0.3, carbsPer100g: 5.4, fiberPer100g: 2, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_veg_006', name: 'Cabbage', nameRu: 'Капуста белокочанная', caloriesPer100g: 28, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 6.2, fiberPer100g: 2.3, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn', 'winter'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_veg_007', name: 'Carrot', nameRu: 'Морковь', caloriesPer100g: 35, proteinPer100g: 1.3, fatPer100g: 0.1, carbsPer100g: 7.9, fiberPer100g: 2.4, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_veg_008', name: 'Onion', nameRu: 'Лук репчатый', caloriesPer100g: 41, proteinPer100g: 1.4, fatPer100g: 0.2, carbsPer100g: 9.1, fiberPer100g: 1.7, category: 'vegetables', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_veg_009', name: 'Garlic', nameRu: 'Чеснок', caloriesPer100g: 149, proteinPer100g: 6.5, fatPer100g: 0.5, carbsPer100g: 29.9, fiberPer100g: 1.5, category: 'vegetables', typicalPortion: 10, typicalPortionUnit: 'г', typicalPortionNameRu: 'зубчик', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_veg_010', name: 'Spinach', nameRu: 'Шпинат', caloriesPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.4, carbsPer100g: 3.6, fiberPer100g: 2.2, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_veg_011', name: 'Zucchini', nameRu: 'Кабачок', caloriesPer100g: 24, proteinPer100g: 1.2, fatPer100g: 0.2, carbsPer100g: 5.2, fiberPer100g: 1.6, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_veg_012', name: 'Eggplant', nameRu: 'Баклажан', caloriesPer100g: 25, proteinPer100g: 1.2, fatPer100g: 0.2, carbsPer100g: 5.7, fiberPer100g: 2.5, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer', 'autumn'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_veg_013', name: 'Green beans', nameRu: 'Зелёная фасоль', caloriesPer100g: 31, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 7.1, fiberPer100g: 2.7, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_veg_014', name: 'Peas (green)', nameRu: 'Горошек зелёный', caloriesPer100g: 73, proteinPer100g: 5.4, fatPer100g: 0.4, carbsPer100g: 13.6, fiberPer100g: 4.3, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_veg_015', name: 'Sweet potato', nameRu: 'Сладкий картофель', caloriesPer100g: 86, proteinPer100g: 1.6, fatPer100g: 0.1, carbsPer100g: 20.1, fiberPer100g: 3, category: 'vegetables', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['endurance', 'muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_veg_016', name: 'Potato', nameRu: 'Картофель', caloriesPer100g: 77, proteinPer100g: 2, fatPer100g: 0.1, carbsPer100g: 17.3, fiberPer100g: 1.3, category: 'vegetables', typicalPortion: 200, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn', 'winter'], tags: ['endurance', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_veg_017', name: 'Beet', nameRu: 'Свёкла', caloriesPer100g: 43, proteinPer100g: 1.6, fatPer100g: 0.2, carbsPer100g: 9.6, fiberPer100g: 2.8, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn', 'winter'], tags: ['endurance', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_veg_018', name: 'Pumpkin', nameRu: 'Тыква', caloriesPer100g: 26, proteinPer100g: 1, fatPer100g: 0.1, carbsPer100g: 6.5, fiberPer100g: 1.7, category: 'vegetables', typicalPortion: 200, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_veg_019', name: 'Mushrooms (white)', nameRu: 'Грибы белые', caloriesPer100g: 22, proteinPer100g: 3.3, fatPer100g: 0.4, carbsPer100g: 3.2, fiberPer100g: 1.5, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer', 'autumn'], tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_veg_020', name: 'Champignons', nameRu: 'Шампиньоны', caloriesPer100g: 27, proteinPer100g: 4.3, fatPer100g: 1, carbsPer100g: 2.2, fiberPer100g: 1.4, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_veg_021', name: 'Lettuce', nameRu: 'Салат листовой', caloriesPer100g: 15, proteinPer100g: 1.4, fatPer100g: 0.2, carbsPer100g: 2.2, fiberPer100g: 1.2, category: 'vegetables', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_veg_022', name: 'Avocado', nameRu: 'Авокадо', caloriesPer100g: 160, proteinPer100g: 2, fatPer100g: 15, carbsPer100g: 9, fiberPer100g: 6.7, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'половина', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_veg_023', name: 'Celery', nameRu: 'Сельдерей', caloriesPer100g: 14, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 2.9, fiberPer100g: 1.6, category: 'vegetables', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_veg_024', name: 'Radish', nameRu: 'Редис', caloriesPer100g: 19, proteinPer100g: 1.2, fatPer100g: 0.1, carbsPer100g: 4.1, fiberPer100g: 1.4, category: 'vegetables', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['spring', 'summer'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_veg_025', name: 'Asparagus', nameRu: 'Спаржа', caloriesPer100g: 20, proteinPer100g: 2.2, fatPer100g: 0.1, carbsPer100g: 3.9, fiberPer100g: 2.1, category: 'vegetables', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['spring'], tags: ['fat_loss'], priceCategory: 'premium' },

  // ============================================================================
  // FRUITS - ФРУКТЫ
  // ============================================================================
  { id: 'prod_fruit_001', name: 'Apple', nameRu: 'Яблоко', caloriesPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 13.8, fiberPer100g: 2.4, category: 'fruits', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_fruit_002', name: 'Banana', nameRu: 'Банан', caloriesPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 22.8, fiberPer100g: 2.6, category: 'fruits', typicalPortion: 120, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', tags: ['endurance', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_fruit_003', name: 'Orange', nameRu: 'Апельсин', caloriesPer100g: 47, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 11.8, fiberPer100g: 2.4, category: 'fruits', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', season: ['winter'], tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_fruit_004', name: 'Grapefruit', nameRu: 'Грейпфрут', caloriesPer100g: 35, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 8.5, fiberPer100g: 1.6, category: 'fruits', typicalPortion: 200, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', season: ['winter'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_fruit_005', name: 'Pear', nameRu: 'Груша', caloriesPer100g: 57, proteinPer100g: 0.4, fatPer100g: 0.1, carbsPer100g: 15.2, fiberPer100g: 3.1, category: 'fruits', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', season: ['autumn'], tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_fruit_006', name: 'Peach', nameRu: 'Персик', caloriesPer100g: 39, proteinPer100g: 0.9, fatPer100g: 0.3, carbsPer100g: 9.5, fiberPer100g: 1.5, category: 'fruits', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', season: ['summer'], tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_fruit_007', name: 'Plum', nameRu: 'Слива', caloriesPer100g: 46, proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 11.4, fiberPer100g: 1.4, category: 'fruits', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer', 'autumn'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_fruit_008', name: 'Apricot', nameRu: 'Абрикос', caloriesPer100g: 48, proteinPer100g: 1.4, fatPer100g: 0.4, carbsPer100g: 11.1, fiberPer100g: 2, category: 'fruits', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_fruit_009', name: 'Kiwi', nameRu: 'Киви', caloriesPer100g: 61, proteinPer100g: 1.1, fatPer100g: 0.5, carbsPer100g: 14.7, fiberPer100g: 3, category: 'fruits', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', tags: ['fat_loss', 'endurance'], priceCategory: 'medium' },
  { id: 'prod_fruit_010', name: 'Mango', nameRu: 'Манго', caloriesPer100g: 60, proteinPer100g: 0.8, fatPer100g: 0.4, carbsPer100g: 15, fiberPer100g: 1.6, category: 'fruits', typicalPortion: 200, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', tags: ['endurance', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_fruit_011', name: 'Pineapple', nameRu: 'Ананас', caloriesPer100g: 50, proteinPer100g: 0.5, fatPer100g: 0.1, carbsPer100g: 13.1, fiberPer100g: 1.4, category: 'fruits', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_fruit_012', name: 'Watermelon', nameRu: 'Арбуз', caloriesPer100g: 30, proteinPer100g: 0.6, fatPer100g: 0.2, carbsPer100g: 7.6, fiberPer100g: 0.4, category: 'fruits', typicalPortion: 300, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_fruit_013', name: 'Melon', nameRu: 'Дыня', caloriesPer100g: 35, proteinPer100g: 0.6, fatPer100g: 0.3, carbsPer100g: 8.3, fiberPer100g: 0.9, category: 'fruits', typicalPortion: 200, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_fruit_014', name: 'Grapes', nameRu: 'Виноград', caloriesPer100g: 69, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 17.2, fiberPer100g: 0.9, category: 'fruits', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn'], tags: ['endurance', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_fruit_015', name: 'Lemon', nameRu: 'Лимон', caloriesPer100g: 29, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 6.9, fiberPer100g: 2.8, category: 'fruits', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'половина', tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_fruit_016', name: 'Pomegranate', nameRu: 'Гранат', caloriesPer100g: 72, proteinPer100g: 0.9, fatPer100g: 0.3, carbsPer100g: 17.2, fiberPer100g: 2.2, category: 'fruits', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', season: ['autumn', 'winter'], tags: ['endurance', 'maintenance'], priceCategory: 'medium' },

  // ============================================================================
  // BERRIES - ЯГОДЫ
  // ============================================================================
  { id: 'prod_berry_001', name: 'Strawberry', nameRu: 'Клубника', caloriesPer100g: 32, proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 7.7, fiberPer100g: 2, category: 'berries', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_berry_002', name: 'Blueberry', nameRu: 'Черника', caloriesPer100g: 57, proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 14.5, fiberPer100g: 2.4, category: 'berries', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss', 'endurance'], priceCategory: 'premium' },
  { id: 'prod_berry_003', name: 'Raspberry', nameRu: 'Малина', caloriesPer100g: 46, proteinPer100g: 1.2, fatPer100g: 0.7, carbsPer100g: 9.5, fiberPer100g: 4.8, category: 'berries', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_berry_004', name: 'Blackberry', nameRu: 'Ежевика', caloriesPer100g: 43, proteinPer100g: 1.4, fatPer100g: 0.5, carbsPer100g: 9.6, fiberPer100g: 5.3, category: 'berries', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss'], priceCategory: 'medium' },
  { id: 'prod_berry_005', name: 'Currant', nameRu: 'Смородина', caloriesPer100g: 44, proteinPer100g: 1, fatPer100g: 0.4, carbsPer100g: 9.6, fiberPer100g: 3.7, category: 'berries', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_berry_006', name: 'Cherry', nameRu: 'Вишня', caloriesPer100g: 52, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 12.2, fiberPer100g: 1.6, category: 'berries', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['summer'], tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_berry_007', name: 'Cranberry', nameRu: 'Клюква', caloriesPer100g: 28, proteinPer100g: 0.5, fatPer100g: 0.2, carbsPer100g: 6.6, fiberPer100g: 3.6, category: 'berries', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn'], tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_berry_008', name: 'Lingonberry', nameRu: 'Брусника', caloriesPer100g: 43, proteinPer100g: 0.7, fatPer100g: 0.5, carbsPer100g: 9.6, fiberPer100g: 2.5, category: 'berries', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', season: ['autumn'], tags: ['fat_loss'], priceCategory: 'budget' },

  // ============================================================================
  // NUTS - ОРЕХИ
  // ============================================================================
  { id: 'prod_nut_001', name: 'Almonds', nameRu: 'Миндаль', caloriesPer100g: 579, proteinPer100g: 21, fatPer100g: 50, carbsPer100g: 22, fiberPer100g: 12.5, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_nut_002', name: 'Walnuts', nameRu: 'Грецкие орехи', caloriesPer100g: 654, proteinPer100g: 15, fatPer100g: 65, carbsPer100g: 14, fiberPer100g: 6.7, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'endurance', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_nut_003', name: 'Peanuts', nameRu: 'Арахис', caloriesPer100g: 567, proteinPer100g: 26, fatPer100g: 49, carbsPer100g: 16, fiberPer100g: 8.5, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_nut_004', name: 'Cashews', nameRu: 'Кешью', caloriesPer100g: 553, proteinPer100g: 18, fatPer100g: 44, carbsPer100g: 30, fiberPer100g: 3.3, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_nut_005', name: 'Hazelnuts', nameRu: 'Фундук', caloriesPer100g: 628, proteinPer100g: 15, fatPer100g: 61, carbsPer100g: 17, fiberPer100g: 9.7, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_nut_006', name: 'Pistachios', nameRu: 'Фисташки', caloriesPer100g: 560, proteinPer100g: 20, fatPer100g: 45, carbsPer100g: 28, fiberPer100g: 10.3, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_nut_007', name: 'Pine nuts', nameRu: 'Кедровые орехи', caloriesPer100g: 673, proteinPer100g: 14, fatPer100g: 68, carbsPer100g: 13, fiberPer100g: 3.7, category: 'nuts', typicalPortion: 20, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['maintenance'], priceCategory: 'premium' },
  { id: 'prod_nut_008', name: 'Sunflower seeds', nameRu: 'Семечки подсолнечника', caloriesPer100g: 584, proteinPer100g: 21, fatPer100g: 51, carbsPer100g: 20, fiberPer100g: 8.6, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_nut_009', name: 'Pumpkin seeds', nameRu: 'Семечки тыквы', caloriesPer100g: 559, proteinPer100g: 30, fatPer100g: 49, carbsPer100g: 10, fiberPer100g: 6, category: 'nuts', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'горсть', tags: ['muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_nut_010', name: 'Chia seeds', nameRu: 'Семена чиа', caloriesPer100g: 486, proteinPer100g: 17, fatPer100g: 31, carbsPer100g: 42, fiberPer100g: 34, category: 'nuts', typicalPortion: 15, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'premium' },
  { id: 'prod_nut_011', name: 'Flax seeds', nameRu: 'Семена льна', caloriesPer100g: 534, proteinPer100g: 18, fatPer100g: 42, carbsPer100g: 29, fiberPer100g: 27, category: 'nuts', typicalPortion: 15, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },

  // ============================================================================
  // LEGUMES - БОБОВЫЕ
  // ============================================================================
  { id: 'prod_legume_001', name: 'Chickpeas', nameRu: 'Нут', caloriesPer100g: 164, proteinPer100g: 8.9, fatPer100g: 2.6, carbsPer100g: 27.4, fiberPer100g: 7.6, category: 'legumes', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_legume_002', name: 'Red beans', nameRu: 'Красная фасоль', caloriesPer100g: 127, proteinPer100g: 8.7, fatPer100g: 0.5, carbsPer100g: 22.8, fiberPer100g: 6.4, category: 'legumes', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_legume_003', name: 'White beans', nameRu: 'Белая фасоль', caloriesPer100g: 128, proteinPer100g: 7, fatPer100g: 0.5, carbsPer100g: 23.4, fiberPer100g: 6.3, category: 'legumes', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'budget' },
  { id: 'prod_legume_004', name: 'Soybeans (edamame)', nameRu: 'Соя (эдамаме)', caloriesPer100g: 147, proteinPer100g: 13, fatPer100g: 7, carbsPer100g: 9.9, fiberPer100g: 5.2, category: 'legumes', typicalPortion: 100, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_legume_005', name: 'Tofu', nameRu: 'Тофу', caloriesPer100g: 76, proteinPer100g: 8, fatPer100g: 4.8, carbsPer100g: 1.9, fiberPer100g: 0.3, category: 'legumes', typicalPortion: 150, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },

  // ============================================================================
  // OILS - МАСЛА
  // ============================================================================
  { id: 'prod_oil_001', name: 'Olive oil', nameRu: 'Оливковое масло', caloriesPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0, category: 'oils', typicalPortion: 15, typicalPortionUnit: 'мл', typicalPortionNameRu: 'ст. ложка', tags: ['muscle_gain', 'maintenance'], priceCategory: 'premium' },
  { id: 'prod_oil_002', name: 'Sunflower oil', nameRu: 'Подсолнечное масло', caloriesPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0, category: 'oils', typicalPortion: 15, typicalPortionUnit: 'мл', typicalPortionNameRu: 'ст. ложка', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_oil_003', name: 'Coconut oil', nameRu: 'Кокосовое масло', caloriesPer100g: 862, proteinPer100g: 0, fatPer100g: 99, carbsPer100g: 0, category: 'oils', typicalPortion: 15, typicalPortionUnit: 'мл', typicalPortionNameRu: 'ст. ложка', tags: [], priceCategory: 'premium' },
  { id: 'prod_oil_004', name: 'Butter', nameRu: 'Сливочное масло', caloriesPer100g: 717, proteinPer100g: 0.9, fatPer100g: 81, carbsPer100g: 0.1, category: 'oils', typicalPortion: 10, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain'], priceCategory: 'medium' },
  { id: 'prod_oil_005', name: 'Ghee', nameRu: 'Масло гхи', caloriesPer100g: 900, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0, category: 'oils', typicalPortion: 10, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: [], priceCategory: 'premium' },

  // ============================================================================
  // BEVERAGES - НАПИТКИ
  // ============================================================================
  { id: 'prod_bev_001', name: 'Coffee (black)', nameRu: 'Кофе чёрный', caloriesPer100g: 2, proteinPer100g: 0.2, fatPer100g: 0, carbsPer100g: 0.3, category: 'beverages', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'чашка', tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_bev_002', name: 'Tea (black)', nameRu: 'Чай чёрный', caloriesPer100g: 1, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0.3, category: 'beverages', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'чашка', tags: ['fat_loss'], priceCategory: 'budget' },
  { id: 'prod_bev_003', name: 'Green tea', nameRu: 'Зелёный чай', caloriesPer100g: 1, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0, category: 'beverages', typicalPortion: 250, typicalPortionUnit: 'мл', typicalPortionNameRu: 'чашка', tags: ['fat_loss', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_bev_004', name: 'Orange juice', nameRu: 'Апельсиновый сок', caloriesPer100g: 45, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 10.4, fiberPer100g: 0.2, category: 'beverages', typicalPortion: 200, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['endurance'], priceCategory: 'medium' },
  { id: 'prod_bev_005', name: 'Apple juice', nameRu: 'Яблочный сок', caloriesPer100g: 46, proteinPer100g: 0.1, fatPer100g: 0.1, carbsPer100g: 11.3, fiberPer100g: 0.2, category: 'beverages', typicalPortion: 200, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['endurance'], priceCategory: 'budget' },
  { id: 'prod_bev_006', name: 'Smoothie (fruit)', nameRu: 'Смузи фруктовый', caloriesPer100g: 54, proteinPer100g: 0.8, fatPer100g: 0.3, carbsPer100g: 12.3, fiberPer100g: 1.4, category: 'beverages', typicalPortion: 300, typicalPortionUnit: 'мл', typicalPortionNameRu: 'стакан', tags: ['endurance', 'maintenance'], priceCategory: 'medium' },

  // ============================================================================
  // BAKERY - ВЫПЕЧКА
  // ============================================================================
  { id: 'prod_bakery_001', name: 'Bread (white)', nameRu: 'Хлеб белый', caloriesPer100g: 266, proteinPer100g: 8, fatPer100g: 3, carbsPer100g: 50, fiberPer100g: 2.7, category: 'bakery', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'кусочек', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_bakery_002', name: 'Bread (whole grain)', nameRu: 'Хлеб цельнозерновой', caloriesPer100g: 247, proteinPer100g: 10, fatPer100g: 3.5, carbsPer100g: 42, fiberPer100g: 6, category: 'bakery', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'кусочек', tags: ['fat_loss', 'muscle_gain', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_bakery_003', name: 'Bread (rye)', nameRu: 'Хлеб ржаной', caloriesPer100g: 214, proteinPer100g: 6.5, fatPer100g: 1.3, carbsPer100g: 44, fiberPer100g: 4.6, category: 'bakery', typicalPortion: 30, typicalPortionUnit: 'г', typicalPortionNameRu: 'кусочек', tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_bakery_004', name: 'Tortilla (wheat)', nameRu: 'Лепёшка пшеничная', caloriesPer100g: 304, proteinPer100g: 8.7, fatPer100g: 7.8, carbsPer100g: 49, fiberPer100g: 2.6, category: 'bakery', typicalPortion: 60, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_bakery_005', name: 'Pasta (dry)', nameRu: 'Макароны сухие', caloriesPer100g: 350, proteinPer100g: 12, fatPer100g: 1.5, carbsPer100g: 73, fiberPer100g: 2.7, category: 'bakery', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['muscle_gain', 'endurance'], priceCategory: 'budget' },
  { id: 'prod_bakery_006', name: 'Pasta (whole wheat)', nameRu: 'Макароны цельнозерновые', caloriesPer100g: 348, proteinPer100g: 14, fatPer100g: 1.6, carbsPer100g: 68, fiberPer100g: 6, category: 'bakery', typicalPortion: 80, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['fat_loss', 'muscle_gain'], priceCategory: 'medium' },

  // ============================================================================
  // SWEETS - СЛАДОСТИ
  // ============================================================================
  { id: 'prod_sweet_001', name: 'Honey', nameRu: 'Мёд', caloriesPer100g: 304, proteinPer100g: 0.3, fatPer100g: 0, carbsPer100g: 82, category: 'sweets', typicalPortion: 20, typicalPortionUnit: 'г', typicalPortionNameRu: 'ст. ложка', tags: ['endurance'], priceCategory: 'medium' },
  { id: 'prod_sweet_002', name: 'Dark chocolate', nameRu: 'Тёмный шоколад', caloriesPer100g: 546, proteinPer100g: 5, fatPer100g: 31, carbsPer100g: 60, fiberPer100g: 7, category: 'sweets', typicalPortion: 20, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'premium' },
  { id: 'prod_sweet_003', name: 'Granola', nameRu: 'Гранола', caloriesPer100g: 471, proteinPer100g: 10, fatPer100g: 18, carbsPer100g: 68, fiberPer100g: 5.3, category: 'sweets', typicalPortion: 40, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['endurance', 'maintenance'], priceCategory: 'medium' },
  { id: 'prod_sweet_004', name: 'Protein bar', nameRu: 'Протеиновый батончик', caloriesPer100g: 380, proteinPer100g: 30, fatPer100g: 12, carbsPer100g: 40, fiberPer100g: 3, category: 'sweets', typicalPortion: 50, typicalPortionUnit: 'г', typicalPortionNameRu: 'штука', tags: ['fat_loss', 'muscle_gain', 'endurance'], priceCategory: 'premium' },

  // ============================================================================
  // SPICES & SAUCES - СПЕЦИИ И СОУСЫ
  // ============================================================================
  { id: 'prod_spice_001', name: 'Soy sauce', nameRu: 'Соевый соус', caloriesPer100g: 53, proteinPer100g: 7, fatPer100g: 0, carbsPer100g: 6.7, category: 'sauces', typicalPortion: 15, typicalPortionUnit: 'мл', typicalPortionNameRu: 'ст. ложка', tags: ['maintenance'], priceCategory: 'budget' },
  { id: 'prod_spice_002', name: 'Mayonnaise', nameRu: 'Майонез', caloriesPer100g: 680, proteinPer100g: 1, fatPer100g: 72, carbsPer100g: 2, category: 'sauces', typicalPortion: 15, typicalPortionUnit: 'г', typicalPortionNameRu: 'ст. ложка', tags: [], priceCategory: 'budget' },
  { id: 'prod_spice_003', name: 'Ketchup', nameRu: 'Кетчуп', caloriesPer100g: 101, proteinPer100g: 1.3, fatPer100g: 0.1, carbsPer100g: 25, category: 'sauces', typicalPortion: 15, typicalPortionUnit: 'г', typicalPortionNameRu: 'ст. ложка', tags: [], priceCategory: 'budget' },
  { id: 'prod_spice_004', name: 'Mustard', nameRu: 'Горчица', caloriesPer100g: 67, proteinPer100g: 4, fatPer100g: 4, carbsPer100g: 4, category: 'sauces', typicalPortion: 10, typicalPortionUnit: 'г', typicalPortionNameRu: 'ч. ложка', tags: ['fat_loss', 'maintenance'], priceCategory: 'budget' },
  { id: 'prod_spice_005', name: 'Olive tapenade', nameRu: 'Оливковая паста', caloriesPer100g: 230, proteinPer100g: 2, fatPer100g: 24, carbsPer100g: 3, category: 'sauces', typicalPortion: 20, typicalPortionUnit: 'г', typicalPortionNameRu: 'порция', tags: ['maintenance'], priceCategory: 'premium' },
]

// ============================================================================
// DISHES DATABASE
// ============================================================================

export interface DishIngredient {
  productId: string
  weight: number // in grams
}

export interface FoodDish {
  id: string
  name: string
  nameRu: string
  ingredients: DishIngredient[]
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  cookingTime: number // minutes
  mealType: MealType[]
  tags: GoalTag[]
  recipe: string
  recipeRu: string
  season?: Season[]
  difficulty?: 'easy' | 'medium' | 'hard'
  servings?: number
}

// Helper function to get product by ID
export function getProductById(id: string): FoodProduct | undefined {
  return FOOD_PRODUCTS.find(p => p.id === id)
}

// Calculate dish nutrition from ingredients
export function calculateDishNutrition(ingredients: DishIngredient[]): { calories: number; protein: number; fat: number; carbs: number; fiber: number } {
  let calories = 0, protein = 0, fat = 0, carbs = 0, fiber = 0

  for (const ing of ingredients) {
    const product = getProductById(ing.productId)
    if (product) {
      const factor = ing.weight / 100
      calories += product.caloriesPer100g * factor
      protein += product.proteinPer100g * factor
      fat += product.fatPer100g * factor
      carbs += product.carbsPer100g * factor
      fiber += (product.fiberPer100g || 0) * factor
    }
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fiber: Math.round(fiber * 10) / 10
  }
}

// Comprehensive dishes database
export const FOOD_DISHES: FoodDish[] = [
  // ============================================================================
  // BREAKFAST DISHES
  // ============================================================================
  {
    id: 'dish_bf_001',
    name: 'Oatmeal with Berries and Nuts',
    nameRu: 'Овсянка с ягодами и орехами',
    ingredients: [
      { productId: 'prod_cereal_002', weight: 60 },
      { productId: 'prod_dairy_001', weight: 200 },
      { productId: 'prod_berry_002', weight: 50 },
      { productId: 'prod_nut_001', weight: 15 },
      { productId: 'prod_sweet_001', weight: 10 }
    ],
    calories: 350,
    protein: 14,
    fat: 12,
    carbs: 48,
    fiber: 8,
    cookingTime: 7,
    mealType: ['breakfast'],
    tags: ['fat_loss', 'muscle_gain', 'endurance', 'maintenance'],
    recipe: 'Cook oats with milk for 5 minutes. Add honey and mix well. Top with berries and nuts.',
    recipeRu: 'Сварить овсянку на молоке 5 минут. Добавить мёд и перемешать. Украсить ягодами и орехами.',
    difficulty: 'easy'
  },
  {
    id: 'dish_bf_002',
    name: 'Scrambled Eggs with Vegetables',
    nameRu: 'Яичница с овощами',
    ingredients: [
      { productId: 'prod_egg_001', weight: 165 }, // 3 eggs
      { productId: 'prod_veg_001', weight: 50 },
      { productId: 'prod_veg_003', weight: 30 },
      { productId: 'prod_oil_001', weight: 10 },
      { productId: 'prod_bakery_002', weight: 60 } // 2 slices
    ],
    calories: 450,
    protein: 28,
    fat: 22,
    carbs: 30,
    fiber: 4,
    cookingTime: 10,
    mealType: ['breakfast'],
    tags: ['fat_loss', 'muscle_gain', 'maintenance'],
    recipe: 'Whisk eggs. Heat pan with olive oil. Cook vegetables for 2 min, add eggs and scramble. Serve with toast.',
    recipeRu: 'Взбить яйца. Разогреть сковороду с оливковым маслом. Обжарить овощи 2 мин, добавить яйца и размешать. Подать с тостами.',
    difficulty: 'easy'
  },
  {
    id: 'dish_bf_003',
    name: 'Greek Yogurt Parfait',
    nameRu: 'Греческий йогурт с фруктами',
    ingredients: [
      { productId: 'prod_dairy_003', weight: 200 },
      { productId: 'prod_fruit_002', weight: 100 },
      { productId: 'prod_sweet_003', weight: 30 },
      { productId: 'prod_sweet_001', weight: 10 }
    ],
    calories: 380,
    protein: 22,
    fat: 8,
    carbs: 52,
    fiber: 5,
    cookingTime: 3,
    mealType: ['breakfast', 'snack'],
    tags: ['fat_loss', 'muscle_gain', 'endurance'],
    recipe: 'Layer yogurt in bowl. Add sliced banana. Top with granola and honey.',
    recipeRu: 'Выложить йогурт в миску. Добавить нарезанный банан. Сверху гранолу и мёд.',
    difficulty: 'easy'
  },
  {
    id: 'dish_bf_004',
    name: 'Protein Pancakes',
    nameRu: 'Протеиновые блины',
    ingredients: [
      { productId: 'prod_dairy_014', weight: 30 },
      { productId: 'prod_egg_001', weight: 110 }, // 2 eggs
      { productId: 'prod_bakery_002', weight: 30 },
      { productId: 'prod_dairy_002', weight: 100 },
      { productId: 'prod_fruit_001', weight: 100 }
    ],
    calories: 420,
    protein: 35,
    fat: 12,
    carbs: 45,
    fiber: 4,
    cookingTime: 15,
    mealType: ['breakfast'],
    tags: ['muscle_gain', 'fat_loss'],
    recipe: 'Mix protein powder, eggs, flour and milk. Cook pancakes on non-stick pan. Serve with sliced apple.',
    recipeRu: 'Смешать протеин, яйца, муку и молоко. Выпекать блины на сковороде. Подать с нарезанным яблоком.',
    difficulty: 'medium'
  },
  {
    id: 'dish_bf_005',
    name: 'Cottage Cheese Bowl',
    nameRu: 'Творог с фруктами',
    ingredients: [
      { productId: 'prod_dairy_005', weight: 200 },
      { productId: 'prod_fruit_001', weight: 100 },
      { productId: 'prod_berry_003', weight: 30 },
      { productId: 'prod_nut_002', weight: 15 }
    ],
    calories: 320,
    protein: 32,
    fat: 8,
    carbs: 30,
    fiber: 5,
    cookingTime: 3,
    mealType: ['breakfast', 'snack'],
    tags: ['fat_loss', 'muscle_gain'],
    recipe: 'Mix cottage cheese with yogurt if desired. Add sliced apple, raspberries and chopped walnuts.',
    recipeRu: 'Смешать творог с йогуртом по желанию. Добавить нарезанное яблоко, малину и грецкие орехи.',
    difficulty: 'easy'
  },
  {
    id: 'dish_bf_006',
    name: 'Avocado Toast with Egg',
    nameRu: 'Тост с авокадо и яйцом',
    ingredients: [
      { productId: 'prod_bakery_002', weight: 60 },
      { productId: 'prod_veg_022', weight: 80 },
      { productId: 'prod_egg_001', weight: 55 },
      { productId: 'prod_spice_001', weight: 5 }
    ],
    calories: 380,
    protein: 16,
    fat: 20,
    carbs: 32,
    fiber: 8,
    cookingTime: 8,
    mealType: ['breakfast'],
    tags: ['fat_loss', 'maintenance'],
    recipe: 'Toast bread. Mash avocado and spread on toast. Top with fried or poached egg. Season with salt and pepper.',
    recipeRu: 'Поджарить хлеб. Размять авокадо и намазать на тост. Сверху выложить жареное яйцо. Посолить и поперчить.',
    difficulty: 'easy'
  },

  // ============================================================================
  // LUNCH DISHES
  // ============================================================================
  {
    id: 'dish_ln_001',
    name: 'Grilled Chicken Salad',
    nameRu: 'Салат с курицей гриль',
    ingredients: [
      { productId: 'prod_meat_001', weight: 150 },
      { productId: 'prod_veg_021', weight: 50 },
      { productId: 'prod_veg_001', weight: 80 },
      { productId: 'prod_veg_002', weight: 50 },
      { productId: 'prod_veg_003', weight: 40 },
      { productId: 'prod_oil_001', weight: 15 }
    ],
    calories: 420,
    protein: 38,
    fat: 18,
    carbs: 12,
    fiber: 4,
    cookingTime: 20,
    mealType: ['lunch'],
    tags: ['fat_loss', 'muscle_gain', 'endurance'],
    recipe: 'Season and grill chicken breast. Prepare salad with greens and vegetables. Slice chicken and place on salad. Dress with olive oil and lemon.',
    recipeRu: 'Приправить и обжарить куриную грудку. Приготовить салат из зелени и овощей. Нарезать курицу и выложить на салат. Заправить оливковым маслом и лимоном.',
    difficulty: 'easy'
  },
  {
    id: 'dish_ln_002',
    name: 'Buckwheat with Chicken',
    nameRu: 'Гречка с курицей',
    ingredients: [
      { productId: 'prod_cereal_001', weight: 150 },
      { productId: 'prod_meat_001', weight: 120 },
      { productId: 'prod_veg_007', weight: 50 },
      { productId: 'prod_veg_008', weight: 30 },
      { productId: 'prod_oil_001', weight: 10 }
    ],
    calories: 520,
    protein: 42,
    fat: 15,
    carbs: 58,
    fiber: 8,
    cookingTime: 30,
    mealType: ['lunch', 'dinner'],
    tags: ['muscle_gain', 'maintenance', 'fat_loss'],
    recipe: 'Cook buckwheat. Sauté onions and carrots, add diced chicken and cook until done. Mix with buckwheat.',
    recipeRu: 'Сварить гречку. Обжарить лук и морковь, добавить нарезанную курицу и готовить до готовности. Смешать с гречкой.',
    difficulty: 'easy'
  },
  {
    id: 'dish_ln_003',
    name: 'Quinoa Bowl with Vegetables',
    nameRu: 'Тарелка с киноа и овощами',
    ingredients: [
      { productId: 'prod_cereal_005', weight: 80 },
      { productId: 'prod_legume_001', weight: 100 },
      { productId: 'prod_veg_002', weight: 50 },
      { productId: 'prod_veg_001', weight: 50 },
      { productId: 'prod_oil_001', weight: 15 },
      { productId: 'prod_fruit_015', weight: 15 }
    ],
    calories: 480,
    protein: 18,
    fat: 16,
    carbs: 62,
    fiber: 12,
    cookingTime: 25,
    mealType: ['lunch', 'dinner'],
    tags: ['fat_loss', 'muscle_gain', 'maintenance'],
    recipe: 'Cook quinoa. Mix with chickpeas and diced vegetables. Dress with olive oil and lemon juice.',
    recipeRu: 'Сварить киноа. Смешать с нутом и нарезанными овощами. Заправить оливковым маслом и лимонным соком.',
    difficulty: 'easy'
  },
  {
    id: 'dish_ln_004',
    name: 'Turkey Wrap',
    nameRu: 'Ролл с индейкой',
    ingredients: [
      { productId: 'prod_meat_003', weight: 120 },
      { productId: 'prod_bakery_004', weight: 60 },
      { productId: 'prod_veg_021', weight: 30 },
      { productId: 'prod_veg_001', weight: 40 },
      { productId: 'prod_spice_004', weight: 10 }
    ],
    calories: 380,
    protein: 32,
    fat: 10,
    carbs: 38,
    fiber: 4,
    cookingTime: 10,
    mealType: ['lunch'],
    tags: ['fat_loss', 'muscle_gain'],
    recipe: 'Warm tortilla. Layer turkey and vegetables. Add mustard and roll tightly.',
    recipeRu: 'Слегка подогреть лепёшку. Выложить индейку и овощи. Добавить горчицу и свернуть.',
    difficulty: 'easy'
  },
  {
    id: 'dish_ln_005',
    name: 'Salmon with Brown Rice',
    nameRu: 'Лосось с бурым рисом',
    ingredients: [
      { productId: 'prod_fish_001', weight: 150 },
      { productId: 'prod_cereal_004', weight: 100 },
      { productId: 'prod_veg_004', weight: 100 },
      { productId: 'prod_oil_001', weight: 10 },
      { productId: 'prod_fruit_015', weight: 15 }
    ],
    calories: 580,
    protein: 38,
    fat: 24,
    carbs: 52,
    fiber: 6,
    cookingTime: 30,
    mealType: ['lunch', 'dinner'],
    tags: ['muscle_gain', 'maintenance', 'endurance'],
    recipe: 'Cook brown rice. Season salmon with herbs and lemon, bake at 180°C for 15 min. Steam broccoli. Serve together.',
    recipeRu: 'Сварить бурый рис. Приправить лосось травами и лимоном, запечь при 180°C 15 мин. Приготовить брокколи на пару. Подать вместе.',
    difficulty: 'medium'
  },
  {
    id: 'dish_ln_006',
    name: 'Vegetable Soup with Chicken',
    nameRu: 'Овощной суп с курицей',
    ingredients: [
      { productId: 'prod_meat_001', weight: 100 },
      { productId: 'prod_veg_006', weight: 100 },
      { productId: 'prod_veg_007', weight: 50 },
      { productId: 'prod_veg_008', weight: 30 },
      { productId: 'prod_veg_016', weight: 80 },
      { productId: 'prod_cereal_001', weight: 50 }
    ],
    calories: 320,
    protein: 26,
    fat: 6,
    carbs: 38,
    fiber: 6,
    cookingTime: 40,
    mealType: ['lunch'],
    tags: ['fat_loss', 'maintenance'],
    recipe: 'Cook chicken in water until done, remove and shred. Sauté vegetables, add broth and buckwheat. Cook until tender. Add chicken back.',
    recipeRu: 'Сварить курицу в воде, вынуть и разделать. Обжарить овощи, добавить бульон и гречку. Варить до готовности. Вернуть курицу.',
    difficulty: 'medium'
  },
  {
    id: 'dish_ln_007',
    name: 'Beef Stir Fry',
    nameRu: 'Говядина с овощами вок',
    ingredients: [
      { productId: 'prod_meat_004', weight: 150 },
      { productId: 'prod_veg_003', weight: 80 },
      { productId: 'prod_veg_004', weight: 80 },
      { productId: 'prod_spice_001', weight: 15 },
      { productId: 'prod_cereal_003', weight: 100 }
    ],
    calories: 550,
    protein: 38,
    fat: 18,
    carbs: 55,
    fiber: 5,
    cookingTime: 25,
    mealType: ['lunch', 'dinner'],
    tags: ['muscle_gain', 'maintenance'],
    recipe: 'Cook rice. Stir fry beef until golden. Add vegetables and soy sauce. Serve over rice.',
    recipeRu: 'Сварить рис. Обжарить говядину до золотистого цвета. Добавить овощи и соевый соус. Подать с рисом.',
    difficulty: 'medium'
  },

  // ============================================================================
  // DINNER DISHES
  // ============================================================================
  {
    id: 'dish_dn_001',
    name: 'Baked Cod with Vegetables',
    nameRu: 'Запечённая треска с овощами',
    ingredients: [
      { productId: 'prod_fish_004', weight: 180 },
      { productId: 'prod_veg_004', weight: 100 },
      { productId: 'prod_veg_015', weight: 100 },
      { productId: 'prod_oil_001', weight: 10 },
      { productId: 'prod_fruit_015', weight: 20 }
    ],
    calories: 350,
    protein: 35,
    fat: 10,
    carbs: 32,
    fiber: 6,
    cookingTime: 35,
    mealType: ['dinner'],
    tags: ['fat_loss', 'maintenance'],
    recipe: 'Season cod with herbs and lemon. Roast sweet potato and broccoli at 200°C for 20 min. Bake cod at 180°C for 15 min.',
    recipeRu: 'Приправить треску травами и лимоном. Запечь сладкий картофель и брокколи при 200°C 20 мин. Запечь треску при 180°C 15 мин.',
    difficulty: 'medium'
  },
  {
    id: 'dish_dn_002',
    name: 'Chicken Breast with Steamed Vegetables',
    nameRu: 'Куриная грудка с овощами на пару',
    ingredients: [
      { productId: 'prod_meat_001', weight: 150 },
      { productId: 'prod_veg_005', weight: 100 },
      { productId: 'prod_veg_013', weight: 80 },
      { productId: 'prod_veg_007', weight: 50 },
      { productId: 'prod_oil_001', weight: 10 }
    ],
    calories: 340,
    protein: 38,
    fat: 10,
    carbs: 18,
    fiber: 6,
    cookingTime: 25,
    mealType: ['dinner'],
    tags: ['fat_loss', 'muscle_gain'],
    recipe: 'Season chicken and bake at 180°C for 20 min. Steam cauliflower and green beans. Serve with carrots and olive oil.',
    recipeRu: 'Приправить курицу и запечь при 180°C 20 мин. Приготовить цветную капусту и фасоль на пару. Подать с морковью и оливковым маслом.',
    difficulty: 'easy'
  },
  {
    id: 'dish_dn_003',
    name: 'Shrimp Stir Fry',
    nameRu: 'Креветки с овощами',
    ingredients: [
      { productId: 'prod_fish_010', weight: 150 },
      { productId: 'prod_veg_011', weight: 100 },
      { productId: 'prod_veg_003', weight: 60 },
      { productId: 'prod_spice_001', weight: 15 },
      { productId: 'prod_oil_001', weight: 10 }
    ],
    calories: 320,
    protein: 32,
    fat: 12,
    carbs: 20,
    fiber: 4,
    cookingTime: 15,
    mealType: ['dinner'],
    tags: ['fat_loss', 'muscle_gain'],
    recipe: 'Heat oil in wok. Stir fry shrimp for 2-3 min. Add vegetables and soy sauce. Cook until vegetables are tender-crisp.',
    recipeRu: 'Разогреть масло в воке. Обжарить креветки 2-3 мин. Добавить овощи и соевый соус. Готовить до мягкости овощей.',
    difficulty: 'easy'
  },
  {
    id: 'dish_dn_004',
    name: 'Tofu with Vegetables',
    nameRu: 'Тофу с овощами',
    ingredients: [
      { productId: 'prod_legume_005', weight: 150 },
      { productId: 'prod_veg_004', weight: 80 },
      { productId: 'prod_veg_003', weight: 60 },
      { productId: 'prod_veg_010', weight: 50 },
      { productId: 'prod_spice_001', weight: 15 },
      { productId: 'prod_cereal_003', weight: 80 }
    ],
    calories: 380,
    protein: 22,
    fat: 12,
    carbs: 48,
    fiber: 6,
    cookingTime: 20,
    mealType: ['dinner'],
    tags: ['fat_loss', 'maintenance'],
    recipe: 'Press and cube tofu. Stir fry until golden. Add vegetables and soy sauce. Serve over rice.',
    recipeRu: 'Отжать и нарезать тофу кубиками. Обжарить до золотистого цвета. Добавить овощи и соевый соус. Подать с рисом.',
    difficulty: 'easy'
  },
  {
    id: 'dish_dn_005',
    name: 'Turkey Meatballs with Zucchini Noodles',
    nameRu: 'Фрикадельки из индейки с кабачковой лапшой',
    ingredients: [
      { productId: 'prod_meat_003', weight: 150 },
      { productId: 'prod_veg_011', weight: 200 },
      { productId: 'prod_veg_001', weight: 80 },
      { productId: 'prod_spice_003', weight: 30 },
      { productId: 'prod_veg_009', weight: 5 }
    ],
    calories: 350,
    protein: 35,
    fat: 12,
    carbs: 22,
    fiber: 5,
    cookingTime: 30,
    mealType: ['dinner'],
    tags: ['fat_loss', 'muscle_gain'],
    recipe: 'Mix ground turkey with garlic, form meatballs. Bake at 180°C for 20 min. Spiralize zucchini, sauté briefly. Serve with tomato sauce.',
    recipeRu: 'Смешать фарш индейки с чесноком, сформировать фрикадельки. Запечь при 180°C 20 мин. Спирализовать кабачок, слегка обжарить. Подать с томатным соусом.',
    difficulty: 'medium'
  },

  // ============================================================================
  // SNACKS
  // ============================================================================
  {
    id: 'dish_sn_001',
    name: 'Protein Shake',
    nameRu: 'Протеиновый коктейль',
    ingredients: [
      { productId: 'prod_dairy_014', weight: 30 },
      { productId: 'prod_fruit_002', weight: 100 },
      { productId: 'prod_dairy_002', weight: 200 }
    ],
    calories: 280,
    protein: 28,
    fat: 4,
    carbs: 32,
    fiber: 3,
    cookingTime: 3,
    mealType: ['snack'],
    tags: ['fat_loss', 'muscle_gain', 'endurance'],
    recipe: 'Blend all ingredients until smooth.',
    recipeRu: 'Смешать все ингредиенты в блендере до однородности.',
    difficulty: 'easy'
  },
  {
    id: 'dish_sn_002',
    name: 'Apple with Peanut Butter',
    nameRu: 'Яблоко с арахисовой пастой',
    ingredients: [
      { productId: 'prod_fruit_001', weight: 150 },
      { productId: 'prod_nut_003', weight: 20 }
    ],
    calories: 230,
    protein: 6,
    fat: 10,
    carbs: 30,
    fiber: 5,
    cookingTime: 2,
    mealType: ['snack'],
    tags: ['fat_loss', 'maintenance'],
    recipe: 'Slice apple and serve with peanut butter for dipping.',
    recipeRu: 'Нарезать яблоко и подать с арахисовой пастой для макания.',
    difficulty: 'easy'
  },
  {
    id: 'dish_sn_003',
    name: 'Cottage Cheese with Berries',
    nameRu: 'Творог с ягодами',
    ingredients: [
      { productId: 'prod_dairy_005', weight: 150 },
      { productId: 'prod_berry_001', weight: 50 },
      { productId: 'prod_sweet_001', weight: 10 }
    ],
    calories: 210,
    protein: 26,
    fat: 3,
    carbs: 18,
    fiber: 2,
    cookingTime: 2,
    mealType: ['snack'],
    tags: ['fat_loss', 'muscle_gain'],
    recipe: 'Mix cottage cheese with berries and honey.',
    recipeRu: 'Смешать творог с ягодами и мёдом.',
    difficulty: 'easy'
  },
  {
    id: 'dish_sn_004',
    name: 'Mixed Nuts',
    nameRu: 'Смесь орехов',
    ingredients: [
      { productId: 'prod_nut_001', weight: 10 },
      { productId: 'prod_nut_002', weight: 10 },
      { productId: 'prod_nut_004', weight: 10 }
    ],
    calories: 180,
    protein: 5,
    fat: 15,
    carbs: 7,
    fiber: 2,
    cookingTime: 0,
    mealType: ['snack'],
    tags: ['muscle_gain', 'maintenance'],
    recipe: 'Mix nuts together and enjoy.',
    recipeRu: 'Смешать орехи и наслаждаться.',
    difficulty: 'easy'
  },
  {
    id: 'dish_sn_005',
    name: 'Greek Yogurt with Honey',
    nameRu: 'Греческий йогурт с мёдом',
    ingredients: [
      { productId: 'prod_dairy_003', weight: 150 },
      { productId: 'prod_sweet_001', weight: 15 },
      { productId: 'prod_nut_010', weight: 10 }
    ],
    calories: 220,
    protein: 16,
    fat: 5,
    carbs: 26,
    fiber: 4,
    cookingTime: 2,
    mealType: ['snack'],
    tags: ['fat_loss', 'muscle_gain', 'endurance'],
    recipe: 'Top yogurt with honey and chia seeds.',
    recipeRu: 'Полить йогурт мёдом и посыпать семенами чиа.',
    difficulty: 'easy'
  },
  {
    id: 'dish_sn_006',
    name: 'Rice Cakes with Avocado',
    nameRu: 'Рисовые хлебцы с авокадо',
    ingredients: [
      { productId: 'prod_veg_022', weight: 60 },
      { productId: 'prod_egg_001', weight: 55 },
      { productId: 'prod_bakery_003', weight: 30 }
    ],
    calories: 260,
    protein: 12,
    fat: 16,
    carbs: 20,
    fiber: 5,
    cookingTime: 5,
    mealType: ['snack'],
    tags: ['fat_loss', 'maintenance'],
    recipe: 'Mash avocado and spread on bread. Top with boiled egg slices.',
    recipeRu: 'Размять авокадо и намазать на хлеб. Сверху выложить ломтики варёного яйца.',
    difficulty: 'easy'
  },
  {
    id: 'dish_sn_007',
    name: 'Energy Balls',
    nameRu: 'Энергетические шарики',
    ingredients: [
      { productId: 'prod_cereal_002', weight: 30 },
      { productId: 'prod_sweet_001', weight: 20 },
      { productId: 'prod_nut_003', weight: 20 },
      { productId: 'prod_sweet_002', weight: 10 }
    ],
    calories: 290,
    protein: 8,
    fat: 14,
    carbs: 35,
    fiber: 4,
    cookingTime: 10,
    mealType: ['snack'],
    tags: ['endurance', 'muscle_gain'],
    recipe: 'Mix oats, peanut butter, honey and cocoa. Form into balls. Refrigerate.',
    recipeRu: 'Смешать овсянку, арахисовую пасту, мёд и какао. Сформировать шарики. Охладить.',
    difficulty: 'easy'
  }
]

// Get products by category
export function getProductsByCategory(category: ProductCategory): FoodProduct[] {
  return FOOD_PRODUCTS.filter(p => p.category === category)
}

// Get products by goal tag
export function getProductsByGoal(goal: GoalTag): FoodProduct[] {
  return FOOD_PRODUCTS.filter(p => p.tags?.includes(goal))
}

// Get dishes by meal type
export function getDishesByMealType(mealType: MealType): FoodDish[] {
  return FOOD_DISHES.filter(d => d.mealType.includes(mealType))
}

// Get dishes by goal tag
export function getDishesByGoal(goal: GoalTag): FoodDish[] {
  return FOOD_DISHES.filter(d => d.tags.includes(goal))
}

// Search products by name
export function searchProducts(query: string, language: 'ru' | 'en' = 'ru'): FoodProduct[] {
  const lowerQuery = query.toLowerCase()
  return FOOD_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.nameRu.toLowerCase().includes(lowerQuery)
  )
}

// Search dishes by name
export function searchDishes(query: string, language: 'ru' | 'en' = 'ru'): FoodDish[] {
  const lowerQuery = query.toLowerCase()
  return FOOD_DISHES.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.nameRu.toLowerCase().includes(lowerQuery)
  )
}

// Get all unique categories
export function getAllCategories(): ProductCategory[] {
  return [...new Set(FOOD_PRODUCTS.map(p => p.category))]
}

// Get seasonal products
export function getSeasonalProducts(season: Season): FoodProduct[] {
  return FOOD_PRODUCTS.filter(p => 
    !p.season || p.season.includes('all') || p.season.includes(season)
  )
}
