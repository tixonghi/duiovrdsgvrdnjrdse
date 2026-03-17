// BodyGenius AI - Localization System
// Full i18n support for Russian and English

export type Language = 'ru' | 'en'

export const translations = {
  // ============================================================================
  // COMMON
  // ============================================================================
  common: {
    continue: { ru: 'Продолжить', en: 'Continue' },
    back: { ru: 'Назад', en: 'Back' },
    next: { ru: 'Далее', en: 'Next' },
    skip: { ru: 'Пропустить', en: 'Skip' },
    save: { ru: 'Сохранить', en: 'Save' },
    cancel: { ru: 'Отмена', en: 'Cancel' },
    close: { ru: 'Закрыть', en: 'Close' },
    start: { ru: 'Начать', en: 'Start' },
    complete: { ru: 'Завершить', en: 'Complete' },
    update: { ru: 'Обновить', en: 'Update' },
    delete: { ru: 'Удалить', en: 'Delete' },
    loading: { ru: 'Загрузка...', en: 'Loading...' },
    error: { ru: 'Ошибка', en: 'Error' },
    success: { ru: 'Успешно', en: 'Success' },
    or: { ru: 'или', en: 'or' },
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  onboarding: {
    welcome: {
      title: { ru: 'Добро пожаловать', en: 'Welcome' },
      subtitle: { ru: 'Ваш персональный AI-тренер', en: 'Your personal AI coach' },
      startSetup: { ru: 'Начать настройку', en: 'Start Setup' },
      skip: { ru: 'Пропустить', en: 'Skip' },
    },
    basics: {
      title: { ru: 'Основное', en: 'Basics' },
      subtitle: { ru: 'Расскажите о себе', en: 'Tell us about yourself' },
      name: { ru: 'Ваше имя', en: 'Your name' },
      namePlaceholder: { ru: 'Как вас зовут?', en: 'What is your name?' },
      age: { ru: 'Возраст', en: 'Age' },
      gender: { ru: 'Пол', en: 'Gender' },
      male: { ru: 'Мужской', en: 'Male' },
      female: { ru: 'Женский', en: 'Female' },
      other: { ru: 'Другой', en: 'Other' },
    },
    body: {
      title: { ru: 'Параметры тела', en: 'Body Parameters' },
      subtitle: { ru: 'Ваши физические данные', en: 'Your physical data' },
      height: { ru: 'Рост', en: 'Height' },
      heightUnit: { ru: 'см', en: 'cm' },
      currentWeight: { ru: 'Текущий вес', en: 'Current weight' },
      targetWeight: { ru: 'Целевой вес', en: 'Target weight' },
      weightUnit: { ru: 'кг', en: 'kg' },
      goalLabel: { ru: 'Цель:', en: 'Goal:' },
      loseWeight: { ru: 'Похудеть на', en: 'Lose' },
      gainWeight: { ru: 'Набрать', en: 'Gain' },
      maintainWeight: { ru: 'Поддержание текущего веса', en: 'Maintain current weight' },
      // Endurance specific
      enduranceMetric: { ru: 'Метрика выносливости', en: 'Endurance metric' },
      currentValue: { ru: 'Текущий результат', en: 'Current result' },
      targetValue: { ru: 'Целевой результат', en: 'Target result' },
      run5km: { ru: 'Бег 5 км (мин)', en: '5km run (min)' },
      run10km: { ru: 'Бег 10 км (мин)', en: '10km run (min)' },
      pushups: { ru: 'Отжимания (раз)', en: 'Push-ups (reps)' },
      plank: { ru: 'Планка (сек)', en: 'Plank (sec)' },
      minutes: { ru: 'мин', en: 'min' },
      reps: { ru: 'раз', en: 'reps' },
      seconds: { ru: 'сек', en: 'sec' },
      // Maintenance specific
      weightRange: { ru: 'Диапазон веса', en: 'Weight range' },
      weightRangeMin: { ru: 'Мин. вес', en: 'Min weight' },
      weightRangeMax: { ru: 'Макс. вес', en: 'Max weight' },
      weightRangeInfo: { ru: 'По умолчанию ±2 кг от текущего веса', en: 'Default is ±2 kg from current weight' },
      weightRangeOptional: { ru: '(опционально)', en: '(optional)' },
    },
    goals: {
      title: { ru: 'Цели', en: 'Goals' },
      subtitle: { ru: 'К чему стремитесь?', en: 'What are you aiming for?' },
      mainGoal: { ru: 'Ваша главная цель', en: 'Your main goal' },
      fitnessLevel: { ru: 'Ваш уровень подготовки', en: 'Your fitness level' },
      fatLoss: { ru: 'Похудение', en: 'Fat Loss' },
      fatLossDesc: { ru: 'Сжигание жира и улучшение формы', en: 'Burn fat and improve shape' },
      muscleGain: { ru: 'Набор мышц', en: 'Muscle Gain' },
      muscleGainDesc: { ru: 'Увеличение мышечной массы', en: 'Increase muscle mass' },
      endurance: { ru: 'Выносливость', en: 'Endurance' },
      enduranceDesc: { ru: 'Повышение общей выносливости', en: 'Improve overall endurance' },
      maintenance: { ru: 'Поддержание', en: 'Maintenance' },
      maintenanceDesc: { ru: 'Сохранение текущей формы', en: 'Maintain current shape' },
      beginner: { ru: 'Новичок', en: 'Beginner' },
      beginnerDesc: { ru: 'Мало или нет опыта тренировок', en: 'Little or no training experience' },
      intermediate: { ru: 'Средний', en: 'Intermediate' },
      intermediateDesc: { ru: '1-2 года регулярных тренировок', en: '1-2 years of regular training' },
      advanced: { ru: 'Продвинутый', en: 'Advanced' },
      advancedDesc: { ru: '3+ лет опыта, уверенная техника', en: '3+ years experience, confident technique' },
    },
    equipment: {
      title: { ru: 'Инвентарь', en: 'Equipment' },
      subtitle: { ru: 'Что доступно для тренировок?', en: 'What is available for training?' },
      availableEquipment: { ru: 'Доступный инвентарь', en: 'Available equipment' },
      none: { ru: 'Без инвентаря', en: 'No equipment' },
      home: { ru: 'Домашний', en: 'Home' },
      dumbbells: { ru: 'Гантели', en: 'Dumbbells' },
      barbell: { ru: 'Штанга', en: 'Barbell' },
      budgetTitle: { ru: 'Бюджет на питание', en: 'Food budget' },
      budgetDesc: { ru: 'Ваш бюджет на питание в неделю', en: 'Your weekly food budget' },
      budgetCustom: { ru: 'Свой вариант', en: 'Custom' },
      budgetLow: { ru: 'Эконом', en: 'Budget' },
      budgetMedium: { ru: 'Средний', en: 'Standard' },
      budgetHigh: { ru: 'Премиум', en: 'Premium' },
      budgetCurrency: { ru: '₽/неделю', en: 'RUB/week' },
    },
    language: {
      title: { ru: 'Язык', en: 'Language' },
      subtitle: { ru: 'Выберите язык интерфейса', en: 'Choose interface language' },
    },
    level: {
      title: { ru: 'Уровень подготовки', en: 'Fitness Level' },
      subtitle: { ru: 'Выберите ваш текущий уровень', en: 'Select your current level' },
    },
    finish: {
      title: { ru: 'Начать тренировки', en: 'Start Training' },
    },
    validation: {
      ageMin: { ru: 'Минимальный возраст: 10 лет', en: 'Minimum age: 10 years' },
      ageMax: { ru: 'Максимальный возраст: 100 лет', en: 'Maximum age: 100 years' },
      ageWarning: { ru: 'Рекомендуем проконсультироваться с врачом перед началом тренировок', en: 'We recommend consulting a doctor before starting training' },
      requiredField: { ru: 'Обязательное поле', en: 'Required field' },
    },
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: {
    greeting: { ru: 'Привет,', en: 'Hi,' },
    progressToGoal: { ru: 'Прогресс к цели', en: 'Progress to goal' },
    today: { ru: 'Сегодня', en: 'Today' },
    thisWeek: { ru: 'Эта неделя', en: 'This week' },
    caloriesToday: { ru: 'Ккал сегодня', en: 'Calories today' },
    workoutToday: { ru: 'Тренировка сегодня', en: "Today's workout" },
    noWorkoutToday: { ru: 'Нет запланированных тренировок', en: 'No workouts scheduled' },
  },

  // ============================================================================
  // TABS
  // ============================================================================
  tabs: {
    workout: { ru: 'Тренировки', en: 'Workouts' },
    nutrition: { ru: 'Питание', en: 'Nutrition' },
    progress: { ru: 'Прогресс', en: 'Progress' },
    chat: { ru: 'AI-чат', en: 'AI Chat' },
  },

  // ============================================================================
  // WORKOUT
  // ============================================================================
  workout: {
    createPlan: { ru: 'Создать план тренировок', en: 'Create workout plan' },
    createPlanDesc: { ru: 'AI подберёт оптимальную программу под ваши цели', en: 'AI will create an optimal program for your goals' },
    generatePlan: { ru: 'Создать план', en: 'Generate Plan' },
    generating: { ru: 'Генерация...', en: 'Generating...' },
    daysPerWeek: { ru: 'тренировок в неделю', en: 'workouts per week' },
    weeks: { ru: 'недели', en: 'weeks' },
    exercises: { ru: 'упражнений', en: 'exercises' },
    minutes: { ru: 'мин', en: 'min' },
    startWorkout: { ru: 'Начать', en: 'Start' },
    exercise: { ru: 'Упражнение', en: 'Exercise' },
    sets: { ru: 'Подходов', en: 'Sets' },
    reps: { ru: 'Повторов', en: 'Reps' },
    rest: { ru: 'Отдых', en: 'Rest' },
    completeSet: { ru: 'Завершить подход', en: 'Complete set' },
    nextExercise: { ru: 'Следующее упражнение', en: 'Next exercise' },
    finishWorkout: { ru: 'Завершить тренировку', en: 'Finish workout' },
    technique: { ru: 'Техника выполнения:', en: 'Technique:' },
  },

  // ============================================================================
  // NUTRITION
  // ============================================================================
  nutrition: {
    dailyNorm: { ru: 'Дневная норма', en: 'Daily Target' },
    calories: { ru: 'Ккал', en: 'Cal' },
    protein: { ru: 'Белки', en: 'Protein' },
    carbs: { ru: 'Углев.', en: 'Carbs' },
    fat: { ru: 'Жиры', en: 'Fat' },
    createMealPlan: { ru: 'Создать план питания', en: 'Create meal plan' },
    createMealPlanDesc: { ru: 'AI составит меню под ваши цели и бюджет', en: 'AI will create a menu for your goals and budget' },
    breakfast: { ru: 'Завтрак', en: 'Breakfast' },
    lunch: { ru: 'Обед', en: 'Lunch' },
    dinner: { ru: 'Ужин', en: 'Dinner' },
    snack: { ru: 'Перекус', en: 'Snack' },
    viewRecipe: { ru: 'Открыть рецепт', en: 'View recipe' },
    ingredients: { ru: 'Ингредиенты', en: 'Ingredients' },
    instructions: { ru: 'Приготовление', en: 'Instructions' },
    prepTime: { ru: 'Время подготовки', en: 'Prep time' },
    cookTime: { ru: 'Время приготовления', en: 'Cook time' },
    totalTime: { ru: 'Общее время', en: 'Total time' },
    estimatedCost: { ru: 'Стоимость', en: 'Estimated cost' },
    budget: { ru: 'Бюджет', en: 'Budget' },
    withinBudget: { ru: 'В рамках бюджета', en: 'Within budget' },
    overBudget: { ru: 'Превышение бюджета', en: 'Over budget' },
  },

  // ============================================================================
  // PROGRESS
  // ============================================================================
  progress: {
    weightHistory: { ru: 'Динамика веса', en: 'Weight History' },
    logWeight: { ru: 'Записать вес', en: 'Log weight' },
    currentWeight: { ru: 'Текущий вес', en: 'Current weight' },
    targetWeight: { ru: 'Цель', en: 'Target' },
    difference: { ru: 'Разница', en: 'Difference' },
    bmi: { ru: 'ИМТ', en: 'BMI' },
    achievements: { ru: 'Достижения', en: 'Achievements' },
    noRecords: { ru: 'Записей пока нет', en: 'No records yet' },
    daysStreak: { ru: 'дней подряд', en: 'days streak' },
    firstWorkout: { ru: 'Первая тренировка', en: 'First workout' },
    goalReached: { ru: 'Цель достигнута', en: 'Goal reached' },
    weightLost: { ru: 'сброшено', en: 'lost' },
  },

  // ============================================================================
  // CHAT
  // ============================================================================
  chat: {
    title: { ru: 'AI-фитнес помощник', en: 'AI Fitness Assistant' },
    subtitle: { ru: 'Спроси о тренировках, питании, здоровье или мотивации', en: 'Ask about workouts, nutrition, health, or motivation' },
    placeholder: { ru: 'Введите сообщение...', en: 'Type a message...' },
    typing: { ru: 'AI печатает...', en: 'AI is typing...' },
    limitReached: { ru: 'Дневной лимит сообщений достигнут', en: 'Daily message limit reached' },
    limitInfo: { ru: 'сообщений сегодня', en: 'messages today' },
    offTopic: { 
      ru: 'Я — фитнес-помощник и могу ответить только на вопросы о тренировках, питании, здоровье и мотивации. Если есть вопрос по этой теме — с удовольствием помогу!', 
      en: 'I\'m a fitness assistant and can only answer questions about workouts, nutrition, health, and motivation. If you have a question on these topics, I\'d be happy to help!'
    },
    disclaimer: {
      ru: 'AI-помощник не даёт медицинских советов. При проблемах со здоровьем обратитесь к врачу.',
      en: 'AI assistant does not provide medical advice. Consult a doctor for health issues.'
    },
    // Smart suggestions
    suggestions: {
      title: { ru: 'Попробуй спросить:', en: 'Try asking:' },
      todayWorkout: { ru: 'Какая тренировка мне подойдёт сегодня?', en: 'What workout suits me today?' },
      weeklyPlan: { ru: 'Составь план на неделю', en: 'Create a weekly plan' },
      dinner: { ru: 'Что съесть на ужин?', en: 'What to eat for dinner?' },
      muscleGain: { ru: 'Как набрать мышцы?', en: 'How to build muscle?' },
      weightLoss: { ru: 'Как похудеть?', en: 'How to lose weight?' },
      calories: { ru: 'Сколько калорий мне нужно?', en: 'How many calories do I need?' },
      noEquipment: { ru: 'Тренировка без инвентаря', en: 'Workout without equipment' },
      budgetMeal: { ru: 'Бюджетное меню', en: 'Budget meal plan' },
      motivation: { ru: 'Нет мотивации тренироваться', en: 'No motivation to workout' },
      recovery: { ru: 'Как восстановиться после тренировки?', en: 'How to recover after workout?' },
      protein: { ru: 'Сколько белка нужно?', en: 'How much protein do I need?' },
      weightStuck: { ru: 'Вес стоит, что делать?', en: 'Weight is stuck, what to do?' },
      equipment: { ru: 'Какой инвентарь купить?', en: 'What equipment to buy?' },
    },
    welcome: {
      ru: 'Привет! Я твой AI-фитнес помощник. Могу помочь с тренировками, питанием, здоровьем, мотивацией и выбором инвентаря. Что тебя интересует?',
      en: "Hi! I'm your AI fitness assistant. I can help with workouts, nutrition, health, motivation, and equipment. What interests you?"
    },
  },

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================
  subscription: {
    title: { ru: 'Выберите план', en: 'Choose a plan' },
    popular: { ru: 'Популярный', en: 'Popular' },
    perMonth: { ru: '/месяц', en: '/month' },
    free: { ru: 'Бесплатно', en: 'Free' },
    trial: { ru: '3 дня пробного периода', en: '3-day trial' },
    basicWorkouts: { ru: 'Базовые тренировки', en: 'Basic workouts' },
    noAdaptation: { ru: 'Без адаптации', en: 'No adaptation' },
    allWorkouts: { ru: 'Все тренировки', en: 'All workouts' },
    mealPlans: { ru: 'Планы питания', en: 'Meal plans' },
    monthlyAdaptation: { ru: 'Адаптация раз в месяц', en: 'Monthly adaptation' },
    support: { ru: 'Поддержка', en: 'Support' },
    weeklyAdaptation: { ru: 'Еженедельная адаптация', en: 'Weekly adaptation' },
    aiChat247: { ru: 'AI-чат 24/7', en: 'AI chat 24/7' },
    fridgeAnalysis: { ru: 'Фото холодильника', en: 'Fridge photo analysis' },
    prioritySupport: { ru: 'Приоритетная поддержка', en: 'Priority support' },
    chatLimits: {
      free: { ru: '20 сообщений в день', en: '20 messages/day' },
      pro: { ru: '100 сообщений в день', en: '100 messages/day' },
      elite: { ru: 'Безлимитный чат', en: 'Unlimited chat' },
    },
  },

  // ============================================================================
  // MUSCLES (for exercise details)
  // ============================================================================
  muscles: {
    chest: { ru: 'Грудь', en: 'Chest' },
    back: { ru: 'Спина', en: 'Back' },
    shoulders: { ru: 'Плечи', en: 'Shoulders' },
    biceps: { ru: 'Бицепс', en: 'Biceps' },
    triceps: { ru: 'Трицепс', en: 'Triceps' },
    forearms: { ru: 'Предплечья', en: 'Forearms' },
    core: { ru: 'Пресс', en: 'Core' },
    abs: { ru: 'Пресс', en: 'Abs' },
    obliques: { ru: 'Косые мышцы', en: 'Obliques' },
    quadriceps: { ru: 'Квадрицепс', en: 'Quadriceps' },
    hamstrings: { ru: 'Бицепс бедра', en: 'Hamstrings' },
    glutes: { ru: 'Ягодицы', en: 'Glutes' },
    calves: { ru: 'Икры', en: 'Calves' },
    inner_thighs: { ru: 'Внутренняя поверхность бедра', en: 'Inner thighs' },
    hip_flexors: { ru: 'Сгибатели бедра', en: 'Hip flexors' },
    lower_back: { ru: 'Поясница', en: 'Lower back' },
    upper_back: { ru: 'Верх спины', en: 'Upper back' },
    lats: { ru: 'Широчайшие', en: 'Lats' },
    traps: { ru: 'Трапеция', en: 'Traps' },
    rear_delts: { ru: 'Задняя дельта', en: 'Rear delts' },
    upper_chest: { ru: 'Верх груди', en: 'Upper chest' },
    full_body: { ru: 'Всё тело', en: 'Full body' },
    adductors: { ru: 'Приводящие мышцы', en: 'Adductors' },
    lower_abs: { ru: 'Нижний пресс', en: 'Lower abs' },
    neck: { ru: 'Шея', en: 'Neck' },
  },

  // ============================================================================
  // EXERCISE CATEGORIES
  // ============================================================================
  categories: {
    strength: { ru: 'Сила', en: 'Strength' },
    cardio: { ru: 'Кардио', en: 'Cardio' },
    flexibility: { ru: 'Гибкость', en: 'Flexibility' },
    balance: { ru: 'Баланс', en: 'Balance' },
  },

  // ============================================================================
  // EQUIPMENT
  // ============================================================================
  equipmentTypes: {
    none: { ru: 'Без оборудования', en: 'No equipment' },
    bodyweight: { ru: 'Собственный вес', en: 'Bodyweight' },
    freeWeights: { ru: 'Свободные веса', en: 'Free weights' },
    freeWeightsDesc: { ru: 'Гантели, штанга, гири', en: 'Dumbbells, barbell, kettlebells' },
    dumbbells: { ru: 'Гантели', en: 'Dumbbells' },
    barbell: { ru: 'Штанга', en: 'Barbell' },
    kettlebells: { ru: 'Гири', en: 'Kettlebells' },
    home: { ru: 'Домашнее оборудование', en: 'Home equipment' },
    gym: { ru: 'Тренажёрный зал', en: 'Gym' },
    gymDesc: { ru: 'Тренажёры и свободные веса', en: 'Machines and free weights' },
    resistanceBands: { ru: 'Резинки', en: 'Resistance bands' },
  },

  // ============================================================================
  // PREDICTION
  // ============================================================================
  prediction: {
    title: { ru: 'Ваш прогноз', en: 'Your Prediction' },
    hide: { ru: 'Скрыть', en: 'Hide' },
    show: { ru: 'Показать прогноз', en: 'Show prediction' },
    byEquipment: { ru: 'По типу оборудования:', en: 'By equipment type:' },
    bodyweight: { ru: 'Без оборудования', en: 'Bodyweight' },
    dumbbells: { ru: 'С гантелями', en: 'With dumbbells' },
    barbell: { ru: 'Со штангой', en: 'With barbell' },
    gym: { ru: 'В зале', en: 'At gym' },
    weeks: { ru: 'недель', en: 'weeks' },
    fatLoss: { ru: 'Похудение', en: 'Fat loss' },
    muscleGain: { ru: 'Набор массы', en: 'Muscle gain' },
    endurance: { ru: 'Выносливость', en: 'Endurance' },
  },

  // ============================================================================
  // CURRENCY
  // ============================================================================
  currency: {
    title: { ru: 'Выберите валюту', en: 'Select Currency' },
    subtitle: { ru: 'Цены будут отображаться в выбранной валюте', en: 'Prices will be shown in selected currency' },
    changeTitle: { ru: 'Изменить валюту', en: 'Change Currency' },
    rub: { ru: 'Российский рубль', en: 'Russian Ruble' },
    usd: { ru: 'Доллар США', en: 'US Dollar' },
    eur: { ru: 'Евро', en: 'Euro' },
    byn: { ru: 'Белорусский рубль', en: 'Belarusian Ruble' },
    uah: { ru: 'Украинская гривна', en: 'Ukrainian Hryvnia' },
  },

  // ============================================================================
  // ERRORS
  // ============================================================================
  errors: {
    generic: { ru: 'Произошла ошибка. Попробуйте позже.', en: 'An error occurred. Please try again later.' },
    network: { ru: 'Ошибка сети. Проверьте подключение.', en: 'Network error. Check your connection.' },
    notFound: { ru: 'Не найдено', en: 'Not found' },
    unauthorized: { ru: 'Требуется авторизация', en: 'Authorization required' },
    validation: { ru: 'Проверьте введённые данные', en: 'Please check your input' },
    ageInvalid: { ru: 'Возраст должен быть от 10 до 100 лет', en: 'Age must be between 10 and 100 years' },
    weightInvalid: { ru: 'Вес должен быть положительным числом', en: 'Weight must be a positive number' },
  },

  // ============================================================================
  // DISCLAIMER
  // ============================================================================
  disclaimer: {
    title: { ru: 'Важное предупреждение', en: 'Important Disclaimer' },
    text: {
      ru: 'BodyGenius AI не является медицинским приложением. Перед началом любой программы тренировок или изменения рациона питания рекомендуется проконсультироваться с врачом. Не выполняйте упражнения при наличии травм или противопоказаний.',
      en: 'BodyGenius AI is not a medical application. Before starting any exercise program or changing your diet, we recommend consulting a doctor. Do not perform exercises if you have injuries or contraindications.'
    },
    accept: { ru: 'Я понимаю и принимаю', en: 'I understand and accept' },
  },

  // ============================================================================
  // GOAL-SPECIFIC CONTENT
  // ============================================================================
  goalContent: {
    fat_loss: {
      title: { ru: 'Похудение', en: 'Fat Loss' },
      subtitle: { ru: 'Сбрось лишний вес', en: 'Lose extra weight' },
      prediction: {
        ru: 'Ты можешь сбросить {min}-{max} кг за 4 недели',
        en: 'You can lose {min}-{max} kg in 4 weeks'
      },
      workoutTitle: { ru: 'Жиросжигающие тренировки', en: 'Fat-burning workouts' },
      workoutDesc: { ru: 'Кардио + круговые для максимального сжигания калорий', en: 'Cardio + circuits for maximum calorie burn' },
      nutritionTitle: { ru: 'Рацион для похудения', en: 'Fat loss nutrition' },
      nutritionDesc: { ru: 'Дефицит калорий, много белка, лёгкие блюда', en: 'Calorie deficit, high protein, light meals' },
      progressLabel: { ru: 'Снижение веса', en: 'Weight loss' },
      targetLabel: { ru: 'Цель: похудеть до', en: 'Goal: reach' },
      chartLabel: { ru: 'Вес (кг)', en: 'Weight (kg)' },
      tip: { ru: 'Оптимальная скорость похудения: 0.5-1 кг в неделю', en: 'Optimal weight loss rate: 0.5-1 kg per week' },
    },
    muscle_gain: {
      title: { ru: 'Набор мышц', en: 'Muscle Gain' },
      subtitle: { ru: 'Набери мышечную массу', en: 'Build muscle mass' },
      prediction: {
        ru: 'Ты можешь набрать {min}-{max} кг мышц за 8 недель',
        en: 'You can gain {min}-{max} kg of muscle in 8 weeks'
      },
      workoutTitle: { ru: 'Силовые тренировки', en: 'Strength training' },
      workoutDesc: { ru: 'Базовые упражнения с прогрессией весов', en: 'Compound exercises with progressive overload' },
      nutritionTitle: { ru: 'Питание для роста мышц', en: 'Muscle building nutrition' },
      nutritionDesc: { ru: 'Профицит калорий, много белка и углеводов', en: 'Calorie surplus, high protein and carbs' },
      progressLabel: { ru: 'Рост мышечной массы', en: 'Muscle growth' },
      targetLabel: { ru: 'Цель: набрать до', en: 'Goal: reach' },
      chartLabel: { ru: 'Вес (кг)', en: 'Weight (kg)' },
      tip: { ru: 'Реалистичный набор: 0.5-1 кг мышц в месяц', en: 'Realistic gain: 0.5-1 kg muscle per month' },
    },
    endurance: {
      title: { ru: 'Выносливость', en: 'Endurance' },
      subtitle: { ru: 'Повысь выносливость', en: 'Improve endurance' },
      prediction: {
        ru: 'Твоя выносливость увеличится на {min}-{max}% за 6 недель',
        en: 'Your endurance will increase by {min}-{max}% in 6 weeks'
      },
      workoutTitle: { ru: 'Кардио и интервалы', en: 'Cardio & Intervals' },
      workoutDesc: { ru: 'Интервальные тренировки для развития выносливости', en: 'Interval training for endurance development' },
      nutritionTitle: { ru: 'Энергия на весь день', en: 'All-day energy' },
      nutritionDesc: { ru: 'Сбалансированное питание с акцентом на углеводы', en: 'Balanced nutrition with focus on carbs' },
      progressLabel: { ru: 'Уровень выносливости', en: 'Endurance level' },
      targetLabel: { ru: 'Цель: улучшить выносливость', en: 'Goal: improve endurance' },
      chartLabel: { ru: 'Выносливость (%)', en: 'Endurance (%)' },
      tip: { ru: 'Постепенно увеличивай нагрузку на 10% в неделю', en: 'Gradually increase load by 10% per week' },
    },
    maintenance: {
      title: { ru: 'Поддержание', en: 'Maintenance' },
      subtitle: { ru: 'Сохрани здоровье', en: 'Maintain health' },
      prediction: {
        ru: 'Ты укрепишь здоровье и улучшишь самочувствие',
        en: 'You will strengthen your health and improve wellbeing'
      },
      workoutTitle: { ru: 'Функциональный фитнес', en: 'Functional fitness' },
      workoutDesc: { ru: 'Сбалансированные тренировки для тонуса и здоровья', en: 'Balanced workouts for tone and health' },
      nutritionTitle: { ru: 'Сбалансированное питание', en: 'Balanced nutrition' },
      nutritionDesc: { ru: 'Разнообразное питание для поддержания формы', en: 'Varied nutrition for maintaining shape' },
      progressLabel: { ru: 'Общее состояние', en: 'General condition' },
      targetLabel: { ru: 'Цель: поддерживать вес', en: 'Goal: maintain weight' },
      chartLabel: { ru: 'Вес (кг)', en: 'Weight (kg)' },
      tip: { ru: 'Поддержание — это тоже прогресс!', en: 'Maintenance is progress too!' },
    },
  },

  // ============================================================================
  // PROFILE SETTINGS
  // ============================================================================
  profileSettings: {
    title: { ru: 'Параметры тренировок', en: 'Workout Settings' },
    subtitle: { ru: 'Настройте программу под себя', en: 'Customize your program' },
    eliteOnly: { ru: 'Доступно с подпиской Elite', en: 'Available with Elite subscription' },
    upgradeToElite: { ru: 'Обновить до Elite', en: 'Upgrade to Elite' },
    lockedTooltip: { ru: 'Оформи подписку Elite, чтобы изменить этот параметр', en: 'Subscribe to Elite to change this setting' },
    
    // Goal section
    goal: {
      title: { ru: 'Цель', en: 'Goal' },
      subtitle: { ru: 'Ваша главная цель тренировок', en: 'Your main training goal' },
      fat_loss: { ru: 'Похудение', en: 'Fat Loss' },
      fat_loss_desc: { ru: 'Сжигание жира и улучшение формы', en: 'Burn fat and improve shape' },
      muscle_gain: { ru: 'Набор мышц', en: 'Muscle Gain' },
      muscle_gain_desc: { ru: 'Увеличение мышечной массы', en: 'Increase muscle mass' },
      endurance: { ru: 'Выносливость', en: 'Endurance' },
      endurance_desc: { ru: 'Повышение общей выносливости', en: 'Improve overall endurance' },
      maintenance: { ru: 'Поддержание', en: 'Maintenance' },
      maintenance_desc: { ru: 'Сохранение текущей формы', en: 'Maintain current shape' },
    },
    
    // Location section
    location: {
      title: { ru: 'Место тренировок', en: 'Training Location' },
      subtitle: { ru: 'Где вы тренируетесь', en: 'Where you train' },
      home: { ru: 'Дом', en: 'Home' },
      home_desc: { ru: 'Тренировки дома', en: 'Workouts at home' },
      gym: { ru: 'Зал', en: 'Gym' },
      gym_desc: { ru: 'Тренировки в зале', en: 'Workouts at gym' },
      both: { ru: 'Оба', en: 'Both' },
      both_desc: { ru: 'Дом и зал', en: 'Home and gym' },
    },
    
    // Level section
    level: {
      title: { ru: 'Уровень подготовки', en: 'Fitness Level' },
      subtitle: { ru: 'Ваш текущий уровень', en: 'Your current level' },
      beginner: { ru: 'Новичок', en: 'Beginner' },
      beginner_desc: { ru: 'Мало или нет опыта тренировок', en: 'Little or no training experience' },
      intermediate: { ru: 'Средний', en: 'Intermediate' },
      intermediate_desc: { ru: '1-2 года регулярных тренировок', en: '1-2 years of regular training' },
      advanced: { ru: 'Продвинутый', en: 'Advanced' },
      advanced_desc: { ru: '3+ лет опыта, уверенная техника', en: '3+ years experience, confident technique' },
    },
    
    // Confirmation dialog
    confirm: {
      title: { ru: 'Изменение цели', en: 'Change Goal' },
      message: { 
        ru: 'Смена цели приведёт к пересчёту прогресса и обновлению тренировок. Продолжить?', 
        en: 'Changing the goal will recalculate progress and update workouts. Continue?' 
      },
      yes: { ru: 'Да, изменить', en: 'Yes, change' },
      no: { ru: 'Отмена', en: 'Cancel' },
    },
    
    // Success notification
    success: {
      title: { ru: 'Параметры обновлены', en: 'Settings Updated' },
      message: { 
        ru: 'Тренировки и питание обновлены под новые параметры', 
        en: 'Workouts and nutrition have been updated for your new settings' 
      },
    },
    
    // Error notification
    error: {
      title: { ru: 'Ошибка', en: 'Error' },
      message: { ru: 'Не удалось обновить параметры', en: 'Failed to update settings' },
    },
  },
}

// Helper function to get translation
export function t(path: string, lang: Language = 'ru'): string {
  const keys = path.split('.')
  let result: Record<string, unknown> = translations as Record<string, unknown>
  
  for (const key of keys) {
    if (result[key] === undefined) {
      console.warn(`Translation not found: ${path}`)
      return path
    }
    result = result[key] as Record<string, unknown>
  }
  
  if (typeof result === 'object' && result !== null && lang in result) {
    return String(result[lang])
  }
  
  return typeof result === 'string' ? result : path
}

// Chat limits by subscription tier
export const CHAT_LIMITS = {
  free: 20,
  pro: 100,
  elite: Infinity,
}

// Allowed topics for AI chat
export const ALLOWED_CHAT_TOPICS = [
  // Fitness & Exercise
  'workout', 'exercise', 'training', 'fitness', 'gym', 'muscle', 'strength',
  'cardio', 'stretching', 'warmup', 'cooldown', 'sets', 'reps', 'rest',
  
  // Nutrition
  'nutrition', 'diet', 'calories', 'protein', 'carbs', 'fat', 'meal',
  'food', 'recipe', 'breakfast', 'lunch', 'dinner', 'snack', 'water',
  'vitamin', 'supplement', 'healthy', 'eating',
  
  // Progress & Goals
  'weight', 'progress', 'goal', 'target', 'bmi', 'result', 'achievement',
  'lose', 'gain', 'maintain', 'bulk', 'cut',
  
  // Health & Wellness (non-medical)
  'energy', 'sleep', 'stress', 'motivation', 'recovery', 'rest day',
  
  // Program
  'plan', 'program', 'schedule', 'routine', 'week',
]

// Check if message is on-topic
export function isMessageOnTopic(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  // Very permissive - just check for explicit off-topic keywords
  const offTopicKeywords = [
    'code', 'programming', 'javascript', 'python', 'game', 'movie',
    'music', 'politics', 'religion', 'relationship', 'investment',
    'crypto', 'stock', 'gambling', 'legal', 'lawyer'
  ]
  
  const hasOffTopic = offTopicKeywords.some(keyword =>
    lowerMessage.includes(keyword)
  )
  
  // If no off-topic keywords, assume it's on topic
  return !hasOffTopic
}

// Budget options
export const BUDGET_OPTIONS = [
  { value: 2000, label: { ru: '2 000 ₽/неделю', en: '2,000 RUB/week' } },
  { value: 3000, label: { ru: '3 000 ₽/неделю', en: '3,000 RUB/week' } },
  { value: 5000, label: { ru: '5 000 ₽/неделю', en: '5,000 RUB/week' } },
  { value: 7000, label: { ru: '7 000 ₽/неделю', en: '7,000 RUB/week' } },
  { value: 10000, label: { ru: '10 000 ₽/неделю', en: '10,000 RUB/week' } },
]

// Currency options
export const CURRENCIES = [
  { code: 'RUB', symbol: '₽', name: { ru: 'Рубль', en: 'Russian Ruble' } },
  { code: 'USD', symbol: '$', name: { ru: 'Доллар', en: 'US Dollar' } },
  { code: 'EUR', symbol: '€', name: { ru: 'Евро', en: 'Euro' } },
  { code: 'BYN', symbol: 'Br', name: { ru: 'Бел. рубль', en: 'Belarusian Ruble' } },
  { code: 'UAH', symbol: '₴', name: { ru: 'Гривна', en: 'Ukrainian Hryvnia' } },
]

// Format currency
export function formatCurrency(amount: number, currency: string = 'RUB'): string {
  const currencyData = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  return `${amount.toLocaleString()} ${currencyData.symbol}`
}
