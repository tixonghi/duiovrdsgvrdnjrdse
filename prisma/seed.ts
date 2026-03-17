import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real exercise GIF URLs from various sources
// These are placeholder URLs - in production, use a CDN or exercise database API
const exercises = [
  // ============================================================================
  // BODYWEIGHT - PUSH
  // ============================================================================
  {
    id: 'ex-001',
    slug: 'pushup-standard',
    name: 'Standard Push-up',
    nameRu: 'Классические отжимания',
    instructions: JSON.stringify([
      'Start in a plank position with hands slightly wider than shoulder-width apart',
      'Keep your body in a straight line from head to heels',
      'Lower your chest toward the ground by bending your elbows',
      'Push back up to the starting position',
      'Keep your core engaged throughout the movement'
    ]),
    instructionsRu: JSON.stringify([
      'Начните в позиции планки, руки чуть шире плеч',
      'Держите тело в прямой линии от головы до пят',
      'Опустите грудь к полу, сгибая локти',
      'Вернитесь в исходное положение',
      'Держите пресс напряжённым всё время'
    ]),
    tips: JSON.stringify(['Keep your neck neutral', 'Don\'t let hips sag']),
    tipsRu: JSON.stringify(['Держите шею прямо', 'Не прогибайтесь в пояснице']),
    warnings: JSON.stringify(['Stop if you feel shoulder pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в плечах']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['chest', 'triceps']),
    secondaryMuscles: JSON.stringify(['shoulders', 'core']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif',
    videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
  },
  {
    id: 'ex-002',
    slug: 'pushup-wide',
    name: 'Wide Grip Push-up',
    nameRu: 'Широкие отжимания',
    instructions: JSON.stringify([
      'Place hands wider than shoulder-width apart',
      'Lower chest toward the ground',
      'Push back up, focusing on chest contraction'
    ]),
    instructionsRu: JSON.stringify([
      'Поставьте руки шире плеч',
      'Опустите грудь к полу',
      'Вернитесь вверх, напрягая грудные мышцы'
    ]),
    tips: JSON.stringify(['Keep elbows at 45 degrees']),
    tipsRu: JSON.stringify(['Держите локти под 45 градусов']),
    warnings: JSON.stringify(['Don\'t go too wide - can strain shoulders']),
    warningsRu: JSON.stringify(['Не ставьте руки слишком широко']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['chest']),
    secondaryMuscles: JSON.stringify(['shoulders', 'triceps']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/3oriNZoNvn73MZaFYk/giphy.gif',
  },
  {
    id: 'ex-003',
    slug: 'pushup-diamond',
    name: 'Diamond Push-up',
    nameRu: 'Алмазные отжимания',
    instructions: JSON.stringify([
      'Place hands close together under chest, forming a diamond shape',
      'Lower chest toward hands',
      'Push back up, keeping elbows close to body'
    ]),
    instructionsRu: JSON.stringify([
      'Поставьте руки близко друг к другу под грудью, образуя алмаз',
      'Опустите грудь к рукам',
      'Вернитесь вверх, держа локти близко к телу'
    ]),
    tips: JSON.stringify(['Great for triceps isolation']),
    tipsRu: JSON.stringify(['Отлично изолирует трицепс']),
    warnings: JSON.stringify(['Can be hard on wrists']),
    warningsRu: JSON.stringify(['Может нагружать запястья']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['triceps']),
    secondaryMuscles: JSON.stringify(['chest', 'shoulders']),
    difficulty: 4,
    gifUrl: 'https://media.giphy.com/media/26xBI0mwTQj8IL3BM/giphy.gif',
  },
  {
    id: 'ex-004',
    slug: 'pushup-incline',
    name: 'Incline Push-up',
    nameRu: 'Отжимания от возвышенности',
    instructions: JSON.stringify([
      'Place hands on elevated surface (bench, step)',
      'Lower chest toward surface',
      'Push back up'
    ]),
    instructionsRu: JSON.stringify([
      'Поставьте руки на возвышенность',
      'Опустите грудь к поверхности',
      'Вернитесь вверх'
    ]),
    tips: JSON.stringify(['Easier than standard push-ups']),
    tipsRu: JSON.stringify(['Легче обычных отжиманий']),
    warnings: JSON.stringify(['Ensure surface is stable']),
    warningsRu: JSON.stringify(['Убедитесь, что поверхность устойчива']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['chest', 'shoulders']),
    secondaryMuscles: JSON.stringify(['triceps']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/3oEjHGr1Fhz0kyv8Ig/giphy.gif',
  },
  {
    id: 'ex-005',
    slug: 'pushup-decline',
    name: 'Decline Push-up',
    nameRu: 'Отжимания с ногами на возвышенности',
    instructions: JSON.stringify([
      'Place feet on elevated surface',
      'Perform push-up with increased upper chest focus'
    ]),
    instructionsRu: JSON.stringify([
      'Поставьте ноги на возвышенность',
      'Выполняйте отжимания с акцентом на верх груди'
    ]),
    tips: JSON.stringify(['Higher feet = more difficulty']),
    tipsRu: JSON.stringify(['Чем выше ноги, тем сложнее']),
    warnings: JSON.stringify(['Requires good core strength']),
    warningsRu: JSON.stringify(['Требует сильного пресса']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['upper_chest', 'shoulders']),
    secondaryMuscles: JSON.stringify(['triceps', 'core']),
    difficulty: 4,
    gifUrl: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  },

  // ============================================================================
  // BODYWEIGHT - LEGS
  // ============================================================================
  {
    id: 'ex-006',
    slug: 'squat-bodyweight',
    name: 'Bodyweight Squat',
    nameRu: 'Приседания без веса',
    instructions: JSON.stringify([
      'Stand with feet shoulder-width apart',
      'Lower your body by bending at hips and knees',
      'Go down until thighs are parallel to ground',
      'Push through heels to stand back up'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, ноги на ширине плеч',
      'Опуститесь, сгибая колени и бёдра',
      'Опускайтесь до параллели бёдер с полом',
      'Вернитесь вверх через пятки'
    ]),
    tips: JSON.stringify(['Keep knees over toes', 'Weight on heels']),
    tipsRu: JSON.stringify(['Колени над стопами', 'Вес на пятках']),
    warnings: JSON.stringify(['Stop if knee pain occurs']),
    warningsRu: JSON.stringify(['Прекратите при боли в коленях']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['hamstrings', 'calves']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
    videoUrl: 'https://www.youtube.com/embed/UItWltVZZmE',
  },
  {
    id: 'ex-007',
    slug: 'squat-sumo',
    name: 'Sumo Squat',
    nameRu: 'Сумо-приседания',
    instructions: JSON.stringify([
      'Stand with feet wider than shoulder-width, toes pointed out',
      'Lower body by bending knees outward',
      'Go until thighs are parallel',
      'Push back up through heels'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте широко, носки развёрнуты наружу',
      'Опуститесь, разводя колени',
      'До параллели бёдер с полом',
      'Вернитесь через пятки'
    ]),
    tips: JSON.stringify(['Great for inner thighs']),
    tipsRu: JSON.stringify(['Отлично для внутренней поверхности бедра']),
    warnings: JSON.stringify(['Keep knees tracking over toes']),
    warningsRu: JSON.stringify(['Колени по направлению стоп']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['inner_thighs', 'glutes']),
    secondaryMuscles: JSON.stringify(['quadriceps']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/3oKIPnmiqNhZIueLPW/giphy.gif',
  },
  {
    id: 'ex-008',
    slug: 'squat-jump',
    name: 'Jump Squat',
    nameRu: 'Прыжковые приседания',
    instructions: JSON.stringify([
      'Start in squat position',
      'Explosively jump upward',
      'Land softly back into squat',
      'Immediately go into next rep'
    ]),
    instructionsRu: JSON.stringify([
      'Начните в приседе',
      'Взрывным движением выпрыгните вверх',
      'Приземлитесь мягко обратно в присед',
      'Сразу переходите к следующему повторению'
    ]),
    tips: JSON.stringify(['Land softly', 'Use arms for momentum']),
    tipsRu: JSON.stringify(['Приземляйтесь мягко', 'Используйте руки для инерции']),
    warnings: JSON.stringify(['High impact - not for knee issues']),
    warningsRu: JSON.stringify(['Высокая нагрузка - не при проблемах с коленями']),
    level: 'intermediate',
    goal: 'fat_loss',
    category: 'cardio',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes', 'calves']),
    secondaryMuscles: JSON.stringify(['hamstrings', 'core']),
    difficulty: 4,
    gifUrl: 'https://media.giphy.com/media/l41lUjUgLLwWrz20w/giphy.gif',
    caloriesPerRep: 0.5,
  },
  {
    id: 'ex-009',
    slug: 'lunge-forward',
    name: 'Forward Lunge',
    nameRu: 'Выпады вперёд',
    instructions: JSON.stringify([
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower until both knees are at 90 degrees',
      'Push through front heel to return',
      'Alternate legs'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, ноги на ширине бёдер',
      'Шагните вперёд одной ногой',
      'Опуститесь, оба колена под 90 градусов',
      'Вернитесь через пятку передней ноги',
      'Чередуйте ноги'
    ]),
    tips: JSON.stringify(['Keep torso upright', 'Front knee over ankle']),
    tipsRu: JSON.stringify(['Держите корпус прямо', 'Переднее колено над лодыжкой']),
    warnings: JSON.stringify(['Stop if knee pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в коленях']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['hamstrings', 'calves']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/26xBIyiQ7ZWhFk5ZG/giphy.gif',
    videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
  },
  {
    id: 'ex-010',
    slug: 'lunge-reverse',
    name: 'Reverse Lunge',
    nameRu: 'Выпады назад',
    instructions: JSON.stringify([
      'Stand with feet hip-width apart',
      'Step backward with one leg',
      'Lower until both knees are at 90 degrees',
      'Push through front heel to return',
      'Alternate legs'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, ноги на ширине бёдер',
      'Шагните назад одной ногой',
      'Опуститесь, оба колена под 90 градусов',
      'Вернитесь через пятку передней ноги',
      'Чередуйте ноги'
    ]),
    tips: JSON.stringify(['Easier on knees than forward lunges']),
    tipsRu: JSON.stringify(['Легче для коленей, чем выпады вперёд']),
    warnings: JSON.stringify(['Maintain balance']),
    warningsRu: JSON.stringify(['Сохраняйте равновесие']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['hamstrings']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/3oriNZoNvn73MZaFYk/giphy.gif',
  },

  // ============================================================================
  // BODYWEIGHT - CORE
  // ============================================================================
  {
    id: 'ex-011',
    slug: 'plank-standard',
    name: 'Standard Plank',
    nameRu: 'Классическая планка',
    instructions: JSON.stringify([
      'Start in push-up position or on forearms',
      'Keep body in straight line from head to heels',
      'Engage core and squeeze glutes',
      'Hold for designated time'
    ]),
    instructionsRu: JSON.stringify([
      'Начните в позиции отжиманий или на предплечьях',
      'Держите тело в прямой линии',
      'Напрягите пресс и ягодицы',
      'Удерживайте заданное время'
    ]),
    tips: JSON.stringify(['Don\'t let hips sag or pike']),
    tipsRu: JSON.stringify(['Не прогибайтесь и не поднимайте бёдра']),
    warnings: JSON.stringify(['Stop if lower back pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в пояснице']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['core', 'abs']),
    secondaryMuscles: JSON.stringify(['shoulders', 'back']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qAZcty5hNfZoGN2/giphy.gif',
    videoUrl: 'https://www.youtube.com/embed/BQu26ABuVS0',
  },
  {
    id: 'ex-012',
    slug: 'plank-side',
    name: 'Side Plank',
    nameRu: 'Боковая планка',
    instructions: JSON.stringify([
      'Lie on side with legs stacked',
      'Prop up on forearm, elbow under shoulder',
      'Lift hips to create straight line',
      'Hold and repeat on other side'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на бок, ноги вместе',
      'Обопритесь на предплечье, локоть под плечом',
      'Поднимите бёдра в прямую линию',
      'Удерживайте, повторите на другой стороне'
    ]),
    tips: JSON.stringify(['Keep hips lifted throughout']),
    tipsRu: JSON.stringify(['Держите бёдра поднятыми']),
    warnings: JSON.stringify(['Stop if shoulder pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в плече']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['obliques', 'core']),
    secondaryMuscles: JSON.stringify(['shoulders']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/26xBI0mwTQj8IL3BM/giphy.gif',
  },
  {
    id: 'ex-013',
    slug: 'crunch-standard',
    name: 'Standard Crunch',
    nameRu: 'Классические скручивания',
    instructions: JSON.stringify([
      'Lie on back with knees bent, feet flat',
      'Hands behind head or across chest',
      'Lift shoulders off ground by contracting abs',
      'Lower with control'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на спину, колени согнуты',
      'Руки за головой или на груди',
      'Поднимите плечи, напрягая пресс',
      'Опуститесь с контролем'
    ]),
    tips: JSON.stringify(['Don\'t pull on neck']),
    tipsRu: JSON.stringify(['Не тяните шею руками']),
    warnings: JSON.stringify(['Keep lower back pressed to floor']),
    warningsRu: JSON.stringify(['Прижимайте поясницу к полу']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['abs']),
    secondaryMuscles: JSON.stringify(['obliques']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/3oKIPnmiqNhZIueLPW/giphy.gif',
  },
  {
    id: 'ex-014',
    slug: 'crunch-bicycle',
    name: 'Bicycle Crunch',
    nameRu: 'Велосипедные скручивания',
    instructions: JSON.stringify([
      'Lie on back with hands behind head',
      'Bring knees to 90 degrees',
      'Alternate bringing elbow to opposite knee',
      'Extend other leg out'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на спину, руки за головой',
      'Поднимите колени до 90 градусов',
      'Поочерёдно тяните локоть к противоположному колену',
      'Выпрямляйте другую ногу'
    ]),
    tips: JSON.stringify(['Focus on rotation, not just elbow to knee']),
    tipsRu: JSON.stringify(['Фокус на скручивании, не просто локоть к колену']),
    warnings: JSON.stringify(['Stop if lower back strain']),
    warningsRu: JSON.stringify(['Прекратите при напряжении в пояснице']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['obliques', 'abs']),
    secondaryMuscles: JSON.stringify(['hip_flexors']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  },
  {
    id: 'ex-015',
    slug: 'leg-raise',
    name: 'Leg Raise',
    nameRu: 'Подъём ног',
    instructions: JSON.stringify([
      'Lie flat with legs extended',
      'Keep legs straight, raise to 90 degrees',
      'Slowly lower without touching ground',
      'Keep lower back pressed to ground'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте прямо, ноги вытянуты',
      'Держа ноги прямыми, поднимите до 90 градусов',
      'Медленно опустите, не касаясь пола',
      'Прижимайте поясницу к полу'
    ]),
    tips: JSON.stringify(['Move slowly for better engagement']),
    tipsRu: JSON.stringify(['Двигайтесь медленно']),
    warnings: JSON.stringify(['Stop if lower back arches']),
    warningsRu: JSON.stringify(['Прекратите, если поясница прогибается']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['lower_abs', 'hip_flexors']),
    secondaryMuscles: JSON.stringify(['core']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
  },
  {
    id: 'ex-016',
    slug: 'mountain-climber',
    name: 'Mountain Climber',
    nameRu: 'Альпинист',
    instructions: JSON.stringify([
      'Start in high plank position',
      'Drive one knee toward chest',
      'Quickly switch legs in running motion',
      'Keep core engaged and hips low'
    ]),
    instructionsRu: JSON.stringify([
      'Начните в позиции планки на руках',
      'Тяните одно колено к груди',
      'Быстро меняйте ноги в беговом движении',
      'Держите пресс напряжённым, бёдра низко'
    ]),
    tips: JSON.stringify(['The faster, the more cardio benefit']),
    tipsRu: JSON.stringify(['Чем быстрее, тем больше кардио-эффект']),
    warnings: JSON.stringify(['High intensity - take breaks']),
    warningsRu: JSON.stringify(['Высокая интенсивность - делайте перерывы']),
    level: 'intermediate',
    goal: 'fat_loss',
    category: 'cardio',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['core', 'hip_flexors']),
    secondaryMuscles: JSON.stringify(['shoulders', 'chest']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/26xBIyiQ7ZWhFk5ZG/giphy.gif',
    caloriesPerRep: 0.3,
  },

  // ============================================================================
  // BODYWEIGHT - BACK
  // ============================================================================
  {
    id: 'ex-017',
    slug: 'superman',
    name: 'Superman',
    nameRu: 'Супермен',
    instructions: JSON.stringify([
      'Lie face down with arms extended in front',
      'Simultaneously lift arms, chest, and legs',
      'Hold briefly at top',
      'Lower with control'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на живот, руки вытянуты вперёд',
      'Одновременно поднимите руки, грудь и ноги',
      'Удерживайте в верхней точке',
      'Опуститесь с контролем'
    ]),
    tips: JSON.stringify(['Squeeze glutes at top']),
    tipsRu: JSON.stringify(['Напрягите ягодицы наверху']),
    warnings: JSON.stringify(['Stop if lower back pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в пояснице']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['lower_back', 'glutes']),
    secondaryMuscles: JSON.stringify(['upper_back', 'hamstrings']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/3oEjHGr1Fhz0kyv8Ig/giphy.gif',
  },

  // ============================================================================
  // CARDIO
  // ============================================================================
  {
    id: 'ex-018',
    slug: 'burpee',
    name: 'Burpee',
    nameRu: 'Бёрпи',
    instructions: JSON.stringify([
      'Stand with feet shoulder-width apart',
      'Drop into squat, hands on ground',
      'Kick feet back to plank',
      'Perform push-up (optional)',
      'Jump feet to hands, then jump up'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, ноги на ширине плеч',
      'Опуститесь в присед, руки на пол',
      'Отбросьте ноги в планку',
      'Отожмитесь (опционально)',
      'Прыжком верните ноги к рукам, затем выпрыгните вверх'
    ]),
    tips: JSON.stringify(['Modify by stepping instead of jumping']),
    tipsRu: JSON.stringify(['Упростите: шагайте вместо прыжков']),
    warnings: JSON.stringify(['High impact - not for joint issues']),
    warningsRu: JSON.stringify(['Высокая нагрузка - не при проблемах с суставами']),
    level: 'intermediate',
    goal: 'fat_loss',
    category: 'cardio',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['full_body']),
    secondaryMuscles: JSON.stringify(['core', 'chest', 'legs']),
    difficulty: 5,
    gifUrl: 'https://media.giphy.com/media/l41lUjUgLLwWrz20w/giphy.gif',
    caloriesPerRep: 1.0,
  },
  {
    id: 'ex-019',
    slug: 'jumping-jack',
    name: 'Jumping Jack',
    nameRu: 'Прыжки звездой',
    instructions: JSON.stringify([
      'Stand with feet together, arms at sides',
      'Jump while spreading legs and raising arms',
      'Jump back to starting position'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, ноги вместе, руки вдоль тела',
      'Прыгните, разведя ноги и подняв руки',
      'Прыгните обратно в исходное положение'
    ]),
    tips: JSON.stringify(['Great for warming up']),
    tipsRu: JSON.stringify(['Отлично для разминки']),
    warnings: JSON.stringify(['Low impact version: step out instead']),
    warningsRu: JSON.stringify(['Низкая нагрузка: шагайте вместо прыжков']),
    level: 'beginner',
    goal: 'fat_loss',
    category: 'cardio',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['full_body']),
    secondaryMuscles: JSON.stringify(['calves', 'shoulders']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/3oKIPnmiqNhZIueLPW/giphy.gif',
    caloriesPerRep: 0.2,
  },
  {
    id: 'ex-020',
    slug: 'high-knees',
    name: 'High Knees',
    nameRu: 'Бег с высоким подниманием бедра',
    instructions: JSON.stringify([
      'Run in place, bringing knees to hip level',
      'Pump arms for momentum',
      'Stay on balls of feet'
    ]),
    instructionsRu: JSON.stringify([
      'Бегите на месте, поднимая колени до уровня бёдер',
      'Работайте руками',
      'Стоите на носках'
    ]),
    tips: JSON.stringify(['Drive knees up, not just forward']),
    tipsRu: JSON.stringify(['Тяните колени вверх, не только вперёд']),
    warnings: JSON.stringify(['High impact - modify if needed']),
    warningsRu: JSON.stringify(['Высокая нагрузка - модифицируйте при необходимости']),
    level: 'intermediate',
    goal: 'fat_loss',
    category: 'cardio',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['hip_flexors', 'quadriceps', 'core']),
    secondaryMuscles: JSON.stringify(['calves', 'glutes']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/26xBIyiQ7ZWhFk5ZG/giphy.gif',
    caloriesPerRep: 0.15,
  },
  {
    id: 'ex-021',
    slug: 'butt-kick',
    name: 'Butt Kicks',
    nameRu: 'Бег с захлёстом голени',
    instructions: JSON.stringify([
      'Run in place, kicking heels toward glutes',
      'Keep torso upright',
      'Stay on balls of feet'
    ]),
    instructionsRu: JSON.stringify([
      'Бегите на месте, захлёстывая пятки к ягодицам',
      'Держите корпус прямо',
      'Стоите на носках'
    ]),
    tips: JSON.stringify(['Keep a steady rhythm']),
    tipsRu: JSON.stringify(['Держите ровный ритм']),
    warnings: JSON.stringify(['Start slow if knee issues']),
    warningsRu: JSON.stringify(['Начните медленно при проблемах с коленями']),
    level: 'beginner',
    goal: 'fat_loss',
    category: 'cardio',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['hamstrings', 'quadriceps']),
    secondaryMuscles: JSON.stringify(['glutes', 'calves']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
    caloriesPerRep: 0.12,
  },

  // ============================================================================
  // DUMBBELLS
  // ============================================================================
  {
    id: 'ex-022',
    slug: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    nameRu: 'Жим гантелей лёжа',
    instructions: JSON.stringify([
      'Lie on bench with dumbbells at chest level',
      'Press weights up until arms extended',
      'Lower back to starting position'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на скамью, гантели на уровне груди',
      'Выжмите гантели вверх до выпрямления рук',
      'Опустите в исходное положение'
    ]),
    tips: JSON.stringify(['Use full range of motion']),
    tipsRu: JSON.stringify(['Используйте полный диапазон']),
    warnings: JSON.stringify(['Use spotter for heavy weights']),
    warningsRu: JSON.stringify(['Используйте страховщика для больших весов']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['chest', 'triceps']),
    secondaryMuscles: JSON.stringify(['shoulders']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  },
  {
    id: 'ex-023',
    slug: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    nameRu: 'Разведение гантелей лёжа',
    instructions: JSON.stringify([
      'Lie on bench with dumbbells extended above chest',
      'With slight elbow bend, lower weights out to sides',
      'Bring weights back together over chest'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на скамью, гантели над грудью',
      'Слегка согнув локти, разведите руки в стороны',
      'Сведите гантели над грудью'
    ]),
    tips: JSON.stringify(['Focus on the squeeze at top']),
    tipsRu: JSON.stringify(['Фокус на сведении вверху']),
    warnings: JSON.stringify(['Don\'t go too deep']),
    warningsRu: JSON.stringify(['Не опускайте слишком низко']),
    level: 'intermediate',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['chest']),
    secondaryMuscles: JSON.stringify(['shoulders']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  },
  {
    id: 'ex-024',
    slug: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    nameRu: 'Жим гантелей над головой',
    instructions: JSON.stringify([
      'Sit or stand with dumbbells at shoulder height',
      'Press weights overhead until arms extended',
      'Lower back to starting position'
    ]),
    instructionsRu: JSON.stringify([
      'Сядьте или стойте, гантели на уровне плеч',
      'Выжмите гантели вверх до выпрямления рук',
      'Опустите в исходное положение'
    ]),
    tips: JSON.stringify(['Don\'t arch your back']),
    tipsRu: JSON.stringify(['Не прогибайте спину']),
    warnings: JSON.stringify(['Keep wrists straight']),
    warningsRu: JSON.stringify(['Держите запястья прямо']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['shoulders']),
    secondaryMuscles: JSON.stringify(['triceps', 'upper_chest']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/3o7btPCcdNniyf0Nr6/giphy.gif',
  },
  {
    id: 'ex-025',
    slug: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    nameRu: 'Разведение гантелей в стороны',
    instructions: JSON.stringify([
      'Stand with dumbbells at sides',
      'Raise weights out to sides until shoulder height',
      'Slowly lower back down'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, гантели вдоль тела',
      'Поднимите гантели в стороны до уровня плеч',
      'Медленно опустите'
    ]),
    tips: JSON.stringify(['Use light weights']),
    tipsRu: JSON.stringify(['Используйте лёгкий вес']),
    warnings: JSON.stringify(['Don\'t raise above shoulder height']),
    warningsRu: JSON.stringify(['Не поднимайте выше плеч']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['shoulders']),
    secondaryMuscles: JSON.stringify(['traps']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  },
  {
    id: 'ex-026',
    slug: 'dumbbell-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    nameRu: 'Сгибание рук с гантелями',
    instructions: JSON.stringify([
      'Stand with dumbbells at sides, palms forward',
      'Curl weights up to shoulder level',
      'Keep elbows close to body'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, гантели вдоль тела, ладони вперёд',
      'Согните руки до уровня плеч',
      'Держите локти близко к телу'
    ]),
    tips: JSON.stringify(['Don\'t swing the weights']),
    tipsRu: JSON.stringify(['Не раскачивайте вес']),
    warnings: JSON.stringify(['Control the negative']),
    warningsRu: JSON.stringify(['Контролируйте опускание']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['biceps']),
    secondaryMuscles: JSON.stringify(['forearms']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  },
  {
    id: 'ex-027',
    slug: 'dumbbell-hammer-curl',
    name: 'Hammer Curl',
    nameRu: 'Молотки',
    instructions: JSON.stringify([
      'Stand with dumbbells at sides, palms facing each other',
      'Curl weights up keeping palms facing in',
      'Lower with control'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, гантели вдоль тела, ладони друг к другу',
      'Согните руки, держа ладони развёрнутыми',
      'Опустите с контролем'
    ]),
    tips: JSON.stringify(['Great for arm thickness']),
    tipsRu: JSON.stringify(['Отлично для объёма рук']),
    warnings: JSON.stringify(['Keep wrists neutral']),
    warningsRu: JSON.stringify(['Держите запястья нейтрально']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['biceps', 'brachialis']),
    secondaryMuscles: JSON.stringify(['forearms']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/3o7btPCcdNniyf0Nr6/giphy.gif',
  },
  {
    id: 'ex-028',
    slug: 'dumbbell-tricep-extension',
    name: 'Dumbbell Tricep Extension',
    nameRu: 'Разгибание рук с гантелями',
    instructions: JSON.stringify([
      'Hold dumbbell with both hands behind head',
      'Extend arms to raise weight overhead',
      'Keep elbows close to head'
    ]),
    instructionsRu: JSON.stringify([
      'Держите гантель обеими руками за головой',
      'Выпрямите руки, поднимая гантель вверх',
      'Держите локти близко к голове'
    ]),
    tips: JSON.stringify(['Focus on tricep contraction']),
    tipsRu: JSON.stringify(['Фокус на сокращении трицепса']),
    warnings: JSON.stringify(['Start light']),
    warningsRu: JSON.stringify(['Начните с малого веса']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['triceps']),
    secondaryMuscles: JSON.stringify(['forearms']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  },
  {
    id: 'ex-029',
    slug: 'dumbbell-row',
    name: 'Dumbbell Row',
    nameRu: 'Тяга гантели в наклоне',
    instructions: JSON.stringify([
      'Place one knee and hand on bench',
      'Pull dumbbell up to hip, squeezing back',
      'Lower with control'
    ]),
    instructionsRu: JSON.stringify([
      'Упритесь коленом и рукой в скамью',
      'Тяните гантель к бедру, сжимая спину',
      'Опустите с контролем'
    ]),
    tips: JSON.stringify(['Pull with back, not arm']),
    tipsRu: JSON.stringify(['Тяните спиной, не рукой']),
    warnings: JSON.stringify(['Keep back flat']),
    warningsRu: JSON.stringify(['Держите спину прямой']),
    level: 'beginner',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['back', 'lats']),
    secondaryMuscles: JSON.stringify(['biceps', 'rear_delts']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  },
  {
    id: 'ex-030',
    slug: 'dumbbell-goblet-squat',
    name: 'Goblet Squat',
    nameRu: 'Гоблет-приседания',
    instructions: JSON.stringify([
      'Hold dumbbell vertically against chest',
      'Squat down, keeping chest up',
      'Drive through heels to stand'
    ]),
    instructionsRu: JSON.stringify([
      'Держите гантель вертикально у груди',
      'Приседайте, держа грудь поднятой',
      'Вернитесь через пятки'
    ]),
    tips: JSON.stringify(['Keep elbows inside knees']),
    tipsRu: JSON.stringify(['Держите локти внутри коленей']),
    warnings: JSON.stringify(['Don\'t let knees cave inward']),
    warningsRu: JSON.stringify(['Не сводите колени внутрь']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'dumbbells',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['core', 'upper_back']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  },

  // ============================================================================
  // BARBELL
  // ============================================================================
  {
    id: 'ex-031',
    slug: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    nameRu: 'Жим штанги лёжа',
    instructions: JSON.stringify([
      'Lie on bench with eyes under bar',
      'Grip bar slightly wider than shoulder-width',
      'Lower to mid-chest, press back up'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на скамью, глаза под грифом',
      'Возьмитесь шире плеч',
      'Опустите к середине груди, выжмите вверх'
    ]),
    tips: JSON.stringify(['Retract scapula', 'Use spotter']),
    tipsRu: JSON.stringify(['Сведите лопатки', 'Используйте страховщика']),
    warnings: JSON.stringify(['Always use spotter for heavy sets']),
    warningsRu: JSON.stringify(['Всегда используйте страховщика для больших весов']),
    level: 'intermediate',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'barbell',
    primaryMuscles: JSON.stringify(['chest', 'triceps']),
    secondaryMuscles: JSON.stringify(['shoulders']),
    difficulty: 4,
    gifUrl: 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
  },
  {
    id: 'ex-032',
    slug: 'barbell-squat',
    name: 'Barbell Back Squat',
    nameRu: 'Приседания со штангой',
    instructions: JSON.stringify([
      'Set bar on upper back',
      'Squat down, sitting back and down',
      'Drive through heels to stand'
    ]),
    instructionsRu: JSON.stringify([
      'Положите штангу на верх спины',
      'Приседайте, отводя таз назад',
      'Вернитесь через пятки'
    ]),
    tips: JSON.stringify(['Keep chest up', 'Knees track over toes']),
    tipsRu: JSON.stringify(['Держите грудь поднятой', 'Колени по направлению стоп']),
    warnings: JSON.stringify(['Use safety bars']),
    warningsRu: JSON.stringify(['Используйте страховочные упоры']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'barbell',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['hamstrings', 'lower_back', 'core']),
    difficulty: 4,
    gifUrl: 'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
    videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
  },
  {
    id: 'ex-033',
    slug: 'barbell-deadlift',
    name: 'Barbell Deadlift',
    nameRu: 'Становая тяга',
    instructions: JSON.stringify([
      'Stand with bar over mid-foot',
      'Bend down, grip bar just outside legs',
      'Drive through feet to stand up with bar'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте, гриф над серединой стопы',
      'Наклонитесь, возьмитесь за гриф',
      'Вернитесь в стоячее положение'
    ]),
    tips: JSON.stringify(['Keep bar close to body']),
    tipsRu: JSON.stringify(['Держите гриф близко к телу']),
    warnings: JSON.stringify(['Don\'t round back']),
    warningsRu: JSON.stringify(['Не округляйте спину']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'barbell',
    primaryMuscles: JSON.stringify(['back', 'glutes', 'hamstrings']),
    secondaryMuscles: JSON.stringify(['quadriceps', 'core', 'forearms']),
    difficulty: 5,
    gifUrl: 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
    videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
  },
  {
    id: 'ex-034',
    slug: 'barbell-overhead-press',
    name: 'Barbell Overhead Press',
    nameRu: 'Жим штанги над головой',
    instructions: JSON.stringify([
      'Start with bar at shoulder height',
      'Press bar overhead until arms locked',
      'Lower back to shoulders'
    ]),
    instructionsRu: JSON.stringify([
      'Начните с грифа на уровне плеч',
      'Выжмите гриф вверх до выпрямления рук',
      'Опустите к плечам'
    ]),
    tips: JSON.stringify(['Squeeze glutes to protect back']),
    tipsRu: JSON.stringify(['Напрягите ягодицы для защиты спины']),
    warnings: JSON.stringify(['Don\'t lean back excessively']),
    warningsRu: JSON.stringify(['Не отклоняйтесь назад']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'barbell',
    primaryMuscles: JSON.stringify(['shoulders', 'triceps']),
    secondaryMuscles: JSON.stringify(['upper_chest', 'core']),
    difficulty: 4,
    gifUrl: 'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
  },
  {
    id: 'ex-035',
    slug: 'barbell-row',
    name: 'Barbell Row',
    nameRu: 'Тяга штанги в наклоне',
    instructions: JSON.stringify([
      'Bend over with flat back, holding bar',
      'Pull bar to lower chest/stomach',
      'Lower with control'
    ]),
    instructionsRu: JSON.stringify([
      'Наклонитесь с прямой спиной, держа штангу',
      'Тяните гриф к низу груди/животу',
      'Опустите с контролем'
    ]),
    tips: JSON.stringify(['Keep back flat']),
    tipsRu: JSON.stringify(['Держите спину прямой']),
    warnings: JSON.stringify(['If back rounds, reduce weight']),
    warningsRu: JSON.stringify(['Если спина округляется, снизьте вес']),
    level: 'intermediate',
    goal: 'muscle_gain',
    category: 'strength',
    equipment: 'barbell',
    primaryMuscles: JSON.stringify(['back', 'lats']),
    secondaryMuscles: JSON.stringify(['biceps', 'rear_delts']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
  },

  // ============================================================================
  // HOME / RESISTANCE BAND
  // ============================================================================
  {
    id: 'ex-036',
    slug: 'resistance-band-squat',
    name: 'Resistance Band Squat',
    nameRu: 'Приседания с эспандером',
    instructions: JSON.stringify([
      'Stand on band with feet shoulder-width',
      'Hold handles at shoulder height',
      'Perform squat, band adds resistance'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте на эспандер, ноги на ширине плеч',
      'Держите ручки на уровне плеч',
      'Выполняйте приседания, лента добавляет сопротивление'
    ]),
    tips: JSON.stringify(['Great for home workouts']),
    tipsRu: JSON.stringify(['Отлично для домашних тренировок']),
    warnings: JSON.stringify(['Check band for tears']),
    warningsRu: JSON.stringify(['Проверьте ленту на разрывы']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'home',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['hamstrings']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xUPGcC0R9QjyxkPnS8/giphy.gif',
  },
  {
    id: 'ex-037',
    slug: 'resistance-band-row',
    name: 'Resistance Band Row',
    nameRu: 'Тяга эспандера',
    instructions: JSON.stringify([
      'Secure band around sturdy object',
      'Hold handles, step back for tension',
      'Pull handles toward torso'
    ]),
    instructionsRu: JSON.stringify([
      'Закрепите эспандер за устойчивый объект',
      'Держите ручки, отступите для натяжения',
      'Тяните ручки к корпусу'
    ]),
    tips: JSON.stringify(['Keep core engaged']),
    tipsRu: JSON.stringify(['Держите пресс напряжённым']),
    warnings: JSON.stringify(['Ensure anchor is secure']),
    warningsRu: JSON.stringify(['Убедитесь, что крепление надёжно']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'home',
    primaryMuscles: JSON.stringify(['back', 'lats']),
    secondaryMuscles: JSON.stringify(['biceps']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
  },
  {
    id: 'ex-038',
    slug: 'step-up',
    name: 'Step-up',
    nameRu: 'Зашагивания на платформу',
    instructions: JSON.stringify([
      'Stand in front of step or platform',
      'Step up with one foot, press through heel',
      'Step back down, alternate legs'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте перед степом или платформой',
      'Шагните одной ногой, оттолкнитесь пяткой',
      'Спуститесь, смените ногу'
    ]),
    tips: JSON.stringify(['Higher step = more glute activation']),
    tipsRu: JSON.stringify(['Выше степ = больше нагрузка на ягодицы']),
    warnings: JSON.stringify(['Ensure step is stable']),
    warningsRu: JSON.stringify(['Убедитесь, что платформа устойчива']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'home',
    primaryMuscles: JSON.stringify(['quadriceps', 'glutes']),
    secondaryMuscles: JSON.stringify(['hamstrings', 'calves']),
    difficulty: 2,
    gifUrl: 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  },
  {
    id: 'ex-039',
    slug: 'glute-bridge',
    name: 'Glute Bridge',
    nameRu: 'Ягодичный мостик',
    instructions: JSON.stringify([
      'Lie on back with knees bent',
      'Squeeze glutes, lift hips toward ceiling',
      'Lower with control'
    ]),
    instructionsRu: JSON.stringify([
      'Лягте на спину, колени согнуты',
      'Напрягите ягодицы, поднимите бёдра вверх',
      'Опуститесь с контролем'
    ]),
    tips: JSON.stringify(['Great for activating glutes']),
    tipsRu: JSON.stringify(['Отлично для активации ягодиц']),
    warnings: JSON.stringify(['Don\'t hyperextend back at top']),
    warningsRu: JSON.stringify(['Не переразгибайте спину наверху']),
    level: 'beginner',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['glutes', 'hamstrings']),
    secondaryMuscles: JSON.stringify(['core']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif',
  },
  {
    id: 'ex-040',
    slug: 'tricep-dip',
    name: 'Tricep Dip',
    nameRu: 'Отжимания на трицепс',
    instructions: JSON.stringify([
      'Place hands on bench behind you',
      'Extend legs out in front',
      'Lower body by bending elbows to 90 degrees',
      'Push back up'
    ]),
    instructionsRu: JSON.stringify([
      'Обопритесь руками о скамью позади',
      'Вытяните ноги вперёд',
      'Опуститесь, сгибая локти до 90 градусов',
      'Вернитесь вверх'
    ]),
    tips: JSON.stringify(['Don\'t go too deep']),
    tipsRu: JSON.stringify(['Не опускайтесь слишком низко']),
    warnings: JSON.stringify(['Can be hard on shoulders']),
    warningsRu: JSON.stringify(['Может нагружать плечи']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'home',
    primaryMuscles: JSON.stringify(['triceps']),
    secondaryMuscles: JSON.stringify(['chest', 'shoulders']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/xUPGcC0R9QjyxkPnS8/giphy.gif',
  },
  {
    id: 'ex-041',
    slug: 'wall-sit',
    name: 'Wall Sit',
    nameRu: 'Стульчик у стены',
    instructions: JSON.stringify([
      'Lean back against wall',
      'Slide down until thighs parallel to ground',
      'Hold for designated time'
    ]),
    instructionsRu: JSON.stringify([
      'Обопритесь спиной о стену',
      'Опуститесь до параллели бёдер с полом',
      'Удерживайте заданное время'
    ]),
    tips: JSON.stringify(['Great for leg endurance']),
    tipsRu: JSON.stringify(['Отлично для выносливости ног']),
    warnings: JSON.stringify(['Stop if sharp knee pain']),
    warningsRu: JSON.stringify(['Прекратите при острой боли в коленях']),
    level: 'beginner',
    goal: 'endurance',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['quadriceps']),
    secondaryMuscles: JSON.stringify(['glutes', 'calves']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
  },
  {
    id: 'ex-042',
    slug: 'russian-twist',
    name: 'Russian Twist',
    nameRu: 'Русский твист',
    instructions: JSON.stringify([
      'Sit with knees bent and feet off floor',
      'Rotate torso to touch ground on each side',
      'Keep core tight'
    ]),
    instructionsRu: JSON.stringify([
      'Сядьте, колени согнуты, стопы на весу',
      'Поворачивайте корпус, касаясь пола с каждой стороны',
      'Держите пресс напряжённым'
    ]),
    tips: JSON.stringify(['Move from core, not arms']),
    tipsRu: JSON.stringify(['Двигайтесь корпусом, не руками']),
    warnings: JSON.stringify(['Stop if lower back pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в пояснице']),
    level: 'intermediate',
    goal: 'strength',
    category: 'strength',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['obliques', 'core']),
    secondaryMuscles: JSON.stringify(['abs']),
    difficulty: 3,
    gifUrl: 'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif',
  },

  // ============================================================================
  // STRETCHING / FLEXIBILITY
  // ============================================================================
  {
    id: 'ex-043',
    slug: 'quad-stretch',
    name: 'Standing Quad Stretch',
    nameRu: 'Растяжка квадрицепса стоя',
    instructions: JSON.stringify([
      'Stand on one leg',
      'Grab other foot, pull toward glutes',
      'Hold 20-30 seconds'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте на одну ногу',
      'Возьмите другую ногу, тяните к ягодицам',
      'Удерживайте 20-30 секунд'
    ]),
    tips: JSON.stringify(['Use wall for balance']),
    tipsRu: JSON.stringify(['Используйте стену для равновесия']),
    warnings: JSON.stringify(['Stop if knee pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в колене']),
    level: 'beginner',
    goal: 'endurance',
    category: 'flexibility',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['quadriceps']),
    secondaryMuscles: JSON.stringify(['hip_flexors']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  },
  {
    id: 'ex-044',
    slug: 'hamstring-stretch',
    name: 'Standing Hamstring Stretch',
    nameRu: 'Растяжка бицепса бедра стоя',
    instructions: JSON.stringify([
      'Place heel on low surface',
      'Keep leg straight, lean forward from hips',
      'Hold 20-30 seconds'
    ]),
    instructionsRu: JSON.stringify([
      'Поставьте пятку на низкую поверхность',
      'Держа ногу прямой, наклонитесь от бёдер',
      'Удерживайте 20-30 секунд'
    ]),
    tips: JSON.stringify(['Feel stretch in back of thigh']),
    tipsRu: JSON.stringify(['Чувствуйте растяжение задней поверхности бедра']),
    warnings: JSON.stringify(['Don\'t overstretch']),
    warningsRu: JSON.stringify(['Не перерастягивайте']),
    level: 'beginner',
    goal: 'endurance',
    category: 'flexibility',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['hamstrings']),
    secondaryMuscles: JSON.stringify(['calves']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/xT8qAZcty5hNfZoGN2/giphy.gif',
  },
  {
    id: 'ex-045',
    slug: 'chest-stretch',
    name: 'Chest Stretch',
    nameRu: 'Растяжка грудных мышц',
    instructions: JSON.stringify([
      'Stand in doorway',
      'Place forearms on frame at shoulder height',
      'Step forward until stretch felt in chest'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте в дверном проёме',
      'Обопритесь предплечьями о косяк на уровне плеч',
      'Шагните вперёд до ощущения растяжения'
    ]),
    tips: JSON.stringify(['Adjust arm height for different areas']),
    tipsRu: JSON.stringify(['Меняйте высоту рук для разных участков']),
    warnings: JSON.stringify(['Stop if shoulder pain']),
    warningsRu: JSON.stringify(['Прекратите при боли в плече']),
    level: 'beginner',
    goal: 'endurance',
    category: 'flexibility',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['chest']),
    secondaryMuscles: JSON.stringify(['shoulders']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/26xBI0mwTQj8IL3BM/giphy.gif',
  },
  {
    id: 'ex-046',
    slug: 'child-pose',
    name: 'Child\'s Pose',
    nameRu: 'Поза ребёнка',
    instructions: JSON.stringify([
      'Kneel, sit back on heels',
      'Fold forward, extend arms in front',
      'Rest forehead on ground, hold 30-60 seconds'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте на колени, сядьте на пятки',
      'Наклонитесь вперёд, вытяните руки',
      'Положите лоб на пол, удерживайте 30-60 секунд'
    ]),
    tips: JSON.stringify(['Great for lower back relief']),
    tipsRu: JSON.stringify(['Отлично для расслабления поясницы']),
    warnings: JSON.stringify(['Skip if knee issues']),
    warningsRu: JSON.stringify(['Пропустите при проблемах с коленями']),
    level: 'beginner',
    goal: 'endurance',
    category: 'flexibility',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['lower_back', 'hips']),
    secondaryMuscles: JSON.stringify(['shoulders']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/3oEjHGr1Fhz0kyv8Ig/giphy.gif',
  },
  {
    id: 'ex-047',
    slug: 'cat-cow',
    name: 'Cat-Cow Stretch',
    nameRu: 'Кошка-корова',
    instructions: JSON.stringify([
      'Start on hands and knees',
      'Cow: Drop belly, lift chest, look up',
      'Cat: Round back up toward ceiling',
      'Flow between positions with breath'
    ]),
    instructionsRu: JSON.stringify([
      'Встаньте на четвереньки',
      'Корова: опустите живот, поднимите грудь, смотрите вверх',
      'Кошка: округлите спину к потолку',
      'Двигайтесь между позициями с дыханием'
    ]),
    tips: JSON.stringify(['Inhale for Cow, exhale for Cat']),
    tipsRu: JSON.stringify(['Вдох на корову, выдох на кошку']),
    warnings: JSON.stringify(['Keep movements gentle']),
    warningsRu: JSON.stringify(['Движения должны быть мягкими']),
    level: 'beginner',
    goal: 'endurance',
    category: 'flexibility',
    equipment: 'none',
    primaryMuscles: JSON.stringify(['back', 'core']),
    secondaryMuscles: JSON.stringify(['shoulders', 'hips']),
    difficulty: 1,
    gifUrl: 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
  },
]

// Achievements with localization
const achievements = [
  {
    id: 'ach-001',
    code: 'FIRST_WORKOUT',
    name: 'First Steps',
    nameRu: 'Первые шаги',
    description: 'Complete your first workout',
    descriptionRu: 'Завершите первую тренировку',
    icon: '🎯',
    category: 'milestone',
    requirementType: 'workouts_count',
    requirementValue: 1,
    xpPoints: 50,
  },
  {
    id: 'ach-002',
    code: 'WEEK_STREAK',
    name: 'Week Warrior',
    nameRu: 'Воин недели',
    description: 'Exercise 7 days in a row',
    descriptionRu: 'Тренируйтесь 7 дней подряд',
    icon: '🔥',
    category: 'streak',
    requirementType: 'streak_days',
    requirementValue: 7,
    xpPoints: 100,
  },
  {
    id: 'ach-003',
    code: 'WEIGHT_GOAL',
    name: 'Goal Crusher',
    nameRu: 'Достигатор',
    description: 'Reach your target weight',
    descriptionRu: 'Достигните целевого веса',
    icon: '🏆',
    category: 'milestone',
    requirementType: 'weight_goal',
    requirementValue: 1,
    xpPoints: 200,
  },
  {
    id: 'ach-004',
    code: 'TEN_WORKOUTS',
    name: 'Getting Stronger',
    nameRu: 'Становлюсь сильнее',
    description: 'Complete 10 workouts',
    descriptionRu: 'Завершите 10 тренировок',
    icon: '💪',
    category: 'workout',
    requirementType: 'workouts_count',
    requirementValue: 10,
    xpPoints: 150,
  },
  {
    id: 'ach-005',
    code: 'WEIGHT_LOST_5',
    name: '5kg Down',
    nameRu: 'Минус 5 кг',
    description: 'Lose 5kg from starting weight',
    descriptionRu: 'Сбросьте 5 кг от начального веса',
    icon: '⬇️',
    category: 'milestone',
    requirementType: 'weight_lost',
    requirementValue: 5,
    xpPoints: 100,
  },
]

// Currency rates (base: RUB)
const currencyRates = [
  { fromCurrency: 'RUB', toCurrency: 'RUB', rate: 1 },
  { fromCurrency: 'RUB', toCurrency: 'USD', rate: 0.011 },
  { fromCurrency: 'RUB', toCurrency: 'EUR', rate: 0.01 },
  { fromCurrency: 'RUB', toCurrency: 'BYN', rate: 0.036 },
  { fromCurrency: 'RUB', toCurrency: 'UAH', rate: 0.43 },
  { fromCurrency: 'USD', toCurrency: 'RUB', rate: 90 },
  { fromCurrency: 'EUR', toCurrency: 'RUB', rate: 100 },
  { fromCurrency: 'BYN', toCurrency: 'RUB', rate: 28 },
  { fromCurrency: 'UAH', toCurrency: 'RUB', rate: 2.3 },
]

async function main() {
  console.log('🌱 Seeding database v2.0...')

  // Seed exercises
  console.log('📦 Seeding exercises with localization...')
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise
    })
  }
  console.log(`✅ Seeded ${exercises.length} exercises`)

  // Seed achievements
  console.log('🏆 Seeding achievements...')
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement
    })
  }
  console.log(`✅ Seeded ${achievements.length} achievements`)

  // Seed currency rates
  console.log('💱 Seeding currency rates...')
  for (const rate of currencyRates) {
    await prisma.currencyRate.create({
      data: rate
    })
  }
  console.log(`✅ Seeded ${currencyRates.length} currency rates`)

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
