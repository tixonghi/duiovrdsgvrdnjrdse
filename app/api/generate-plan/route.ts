import { NextRequest, NextResponse } from 'next/server'
import { Language } from '@/lib/translations'
import { generateWarmup, getWarmupName, WARMUP_EXERCISES, type WarmupExercise } from '@/lib/store'

// ============================================================================
// OPTIMIZED EXERCISE DATABASE - Pre-computed for maximum speed
// ============================================================================

interface ExerciseData {
  id: string
  slug?: string
  name: string
  nameRu?: string | null
  level: string
  goal: string
  category: string
  equipment: string
  difficulty?: number
  primaryMuscles: string[]
  secondaryMuscles: string[]
  gifUrl?: string | null
  videoUrl?: string | null
  instructions: string[]
  instructionsRu?: string[]
}

// Pre-defined exercise database (no DB dependency for speed)
const EXERCISES: ExerciseData[] = [
  // Bodyweight - Push
  { id: 'fb-001', name: 'Push-ups', nameRu: 'Отжимания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'], instructionsRu: ['Начните в позиции планки', 'Опустите грудь к полу', 'Вернитесь вверх'] },
  { id: 'fb-002', name: 'Wide Push-ups', nameRu: 'Широкие отжимания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'strength', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Hands wider than shoulders', 'Lower and push up'], instructionsRu: ['Руки шире плеч', 'Опуститесь и вернитесь'] },
  { id: 'fb-003', name: 'Diamond Push-ups', nameRu: 'Алмазные отжимания', category: 'strength', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['triceps'], secondaryMuscles: ['chest'], difficulty: 4, instructions: ['Hands close together', 'Form diamond shape'], instructionsRu: ['Руки близко друг к другу', 'Образуйте алмаз'] },
  { id: 'fb-004', name: 'Incline Push-ups', nameRu: 'Отжимания от скамьи', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 1, instructions: ['Hands on elevated surface', 'Perform push-up'], instructionsRu: ['Руки на возвышенности', 'Выполните отжимание'] },
  { id: 'fb-005', name: 'Decline Push-ups', nameRu: 'Отжимания с ногами на скамье', category: 'strength', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['upper_chest'], secondaryMuscles: ['shoulders'], difficulty: 4, instructions: ['Feet on elevated surface', 'Perform push-up'], instructionsRu: ['Ноги на возвышенности', 'Выполните отжимание'] },

  // Bodyweight - Legs
  { id: 'fb-006', name: 'Bodyweight Squats', nameRu: 'Приседания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 2, instructions: ['Feet shoulder-width', 'Squat down', 'Stand back up'], instructionsRu: ['Ноги на ширине плеч', 'Присядьте', 'Встаньте'] },
  { id: 'fb-007', name: 'Sumo Squats', nameRu: 'Сумо-приседания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'strength', primaryMuscles: ['quadriceps', 'adductors'], secondaryMuscles: ['glutes'], difficulty: 2, instructions: ['Wide stance, toes out', 'Squat down', 'Push through heels'], instructionsRu: ['Широкая стойка, носки врозь', 'Присядьте', 'Тянитесь пятками'] },
  { id: 'fb-008', name: 'Lunges', nameRu: 'Выпады', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 3, instructions: ['Step forward', 'Lower back knee', 'Return to start'], instructionsRu: ['Шагните вперёд', 'Опустите колено', 'Вернитесь'] },
  { id: 'fb-009', name: 'Bulgarian Split Squats', nameRu: 'Болгарские сплит-приседания', category: 'strength', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 4, instructions: ['Rear foot on bench', 'Squat with front leg'], instructionsRu: ['Задняя нога на скамье', 'Присядьте на передней ноге'] },
  { id: 'fb-010', name: 'Glute Bridges', nameRu: 'Ягодичный мост', category: 'strength', equipment: 'none', level: 'beginner', goal: 'strength', primaryMuscles: ['glutes'], secondaryMuscles: ['hamstrings'], difficulty: 2, instructions: ['Lie on back', 'Lift hips up', 'Squeeze glutes'], instructionsRu: ['Лягте на спину', 'Поднимите таз', 'Напрягите ягодицы'] },
  { id: 'fb-011', name: 'Calf Raises', nameRu: 'Подъёмы на носки', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['calves'], secondaryMuscles: [], difficulty: 1, instructions: ['Stand on edge', 'Rise up on toes', 'Lower back down'], instructionsRu: ['Встаньте на край', 'Поднимитесь на носки', 'Опуститесь'] },

  // Bodyweight - Core
  { id: 'fb-012', name: 'Plank', nameRu: 'Планка', category: 'core', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['core'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Hold push-up position', 'Keep body straight'], instructionsRu: ['Держите позицию отжимания', 'Держите тело прямо'] },
  { id: 'fb-013', name: 'Mountain Climbers', nameRu: 'Альпинист', category: 'cardio', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['core'], secondaryMuscles: ['shoulders'], difficulty: 3, instructions: ['In plank position', 'Drive knees to chest alternately'], instructionsRu: ['В позиции планки', 'Поочерёдно тяните колени к груди'] },
  { id: 'fb-014', name: 'Bicycle Crunches', nameRu: 'Велосипед', category: 'core', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['core', 'obliques'], secondaryMuscles: [], difficulty: 2, instructions: ['Lie on back', 'Alternate elbow to knee'], instructionsRu: ['Лягте на спину', 'Поочерёдно тяните локоть к колену'] },
  { id: 'fb-015', name: 'Leg Raises', nameRu: 'Подъёмы ног', category: 'core', equipment: 'none', level: 'intermediate', goal: 'strength', primaryMuscles: ['lower_abs'], secondaryMuscles: ['core'], difficulty: 3, instructions: ['Lie on back', 'Raise legs up', 'Lower slowly'], instructionsRu: ['Лягте на спину', 'Поднимите ноги', 'Опустите медленно'] },
  { id: 'fb-016', name: 'Russian Twists', nameRu: 'Русские скручивания', category: 'core', equipment: 'none', level: 'intermediate', goal: 'fat_loss', primaryMuscles: ['obliques'], secondaryMuscles: ['core'], difficulty: 3, instructions: ['Sit with feet up', 'Rotate torso side to side'], instructionsRu: ['Сидя с поднятыми ногами', 'Вращайте корпус'] },

  // Bodyweight - Back
  { id: 'fb-017', name: 'Superman', nameRu: 'Супермен', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['lower_back'], secondaryMuscles: ['glutes'], difficulty: 2, instructions: ['Lie on stomach', 'Lift arms and legs', 'Hold and lower'], instructionsRu: ['Лягте на живот', 'Поднимите руки и ноги', 'Удержите и опустите'] },
  { id: 'fb-053', name: 'Pull-ups', nameRu: 'Подтягивания', category: 'strength', equipment: 'pull_up_bar', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps'], difficulty: 5, instructions: ['Hang from bar with overhand grip', 'Pull chin above bar', 'Lower with control'], instructionsRu: ['Вис на перекладине прямым хватом', 'Поднимите подбородок над перекладиной', 'Опуститесь подконтрольно'] },
  { id: 'fb-054', name: 'Chin-ups', nameRu: 'Подтягивания обратным хватом', category: 'strength', equipment: 'pull_up_bar', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back', 'biceps'], secondaryMuscles: ['lats'], difficulty: 4, instructions: ['Hang with underhand grip', 'Pull chin above bar', 'Lower slowly'], instructionsRu: ['Вис обратным хватом', 'Поднимите подбородок над перекладиной', 'Опуститесь медленно'] },
  { id: 'fb-055', name: 'Inverted Rows', nameRu: 'Австралийские подтягивания', category: 'strength', equipment: 'none', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps', 'rear_delts'], difficulty: 3, instructions: ['Lie under bar or table', 'Pull chest to bar', 'Lower with control'], instructionsRu: ['Лягте под перекладину или стол', 'Потяните грудь к перекладине', 'Опуститесь подконтрольно'] },
  { id: 'fb-056', name: 'Door Frame Rows', nameRu: 'Тяга к дверному косяку', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 2, instructions: ['Grab door frame with both hands', 'Lean back', 'Pull chest to frame'], instructionsRu: ['Возьмитесь за дверной косяк', 'Отклонитесь назад', 'Потяните грудь к косяку'] },
  { id: 'fb-057', name: 'Prone W Raise', nameRu: 'Лыжник лёжа', category: 'strength', equipment: 'none', level: 'beginner', goal: 'general', primaryMuscles: ['rear_delts', 'upper_back'], secondaryMuscles: ['back'], difficulty: 2, instructions: ['Lie face down', 'Raise arms in W shape', 'Squeeze shoulder blades'], instructionsRu: ['Лягте лицом вниз', 'Поднимите руки в форме W', 'Сведите лопатки'] },

  // Pull-up Bar Exercises
  { id: 'fb-058', name: 'Wide Grip Pull-ups', nameRu: 'Подтягивания широким хватом', category: 'strength', equipment: 'pull_up_bar', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps'], difficulty: 5, instructions: ['Hang with wide overhand grip', 'Pull chin above bar', 'Lower with control'], instructionsRu: ['Вис широким хватом', 'Поднимите подбородок над перекладиной', 'Опуститесь подконтрольно'] },
  { id: 'fb-059', name: 'Hanging Leg Raises', nameRu: 'Подъём ног в висе', category: 'core', equipment: 'pull_up_bar', level: 'intermediate', goal: 'strength', primaryMuscles: ['core', 'lower_abs'], secondaryMuscles: ['hip_flexors'], difficulty: 4, instructions: ['Hang from bar', 'Raise legs to bar', 'Lower with control'], instructionsRu: ['Вис на перекладине', 'Поднимите ноги к перекладине', 'Опустите подконтрольно'] },
  { id: 'fb-060', name: 'Dead Hang', nameRu: 'Вис на перекладине', category: 'strength', equipment: 'pull_up_bar', level: 'beginner', goal: 'general', primaryMuscles: ['back', 'forearms'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Hang from bar with straight arms', 'Keep shoulders active', 'Hold for time'], instructionsRu: ['Вис на прямых руках', 'Держите плечи в напряжении', 'Удержите время'] },
  { id: 'fb-062', name: 'Hanging Knee Raises', nameRu: 'Подъём коленей в висе', category: 'core', equipment: 'pull_up_bar', level: 'beginner', goal: 'strength', primaryMuscles: ['core', 'lower_abs'], secondaryMuscles: [], difficulty: 3, instructions: ['Hang from bar', 'Raise knees to chest', 'Lower with control'], instructionsRu: ['Вис на перекладине', 'Поднимите колени к груди', 'Опустите подконтрольно'] },
  { id: 'fb-063', name: 'Archer Pull-ups', nameRu: 'Лучник на турнике', category: 'strength', equipment: 'pull_up_bar', level: 'advanced', goal: 'muscle_gain', primaryMuscles: ['back', 'lats'], secondaryMuscles: ['biceps'], difficulty: 5, instructions: ['Hang with one arm wider', 'Pull shifting weight to one side', 'Alternate sides'], instructionsRu: ['Вис с одной рукой шире', 'Тянитесь перенося вес на одну сторону', 'Чередуйте стороны'] },

  // Dumbbell Exercises
  { id: 'fb-019', name: 'Dumbbell Bench Press', nameRu: 'Жим гантелей лёжа', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'], difficulty: 3, instructions: ['Lie on bench', 'Press dumbbells up', 'Lower with control'], instructionsRu: ['Лягте на скамью', 'Выжмите гантели', 'Опустите подконтрольно'] },
  { id: 'fb-020', name: 'Dumbbell Rows', nameRu: 'Тяга гантелей', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 3, instructions: ['One hand on bench', 'Row dumbbell up', 'Lower slowly'], instructionsRu: ['Одна рука на скамье', 'Потяните гантель вверх', 'Опустите медленно'] },
  { id: 'fb-061', name: 'Reverse Fly', nameRu: 'Обратная бабочка', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['rear_delts', 'upper_back'], secondaryMuscles: ['back'], difficulty: 3, instructions: ['Bend over with dumbbells', 'Raise arms to sides', 'Squeeze shoulder blades'], instructionsRu: ['Наклонитесь с гантелями', 'Разведите руки в стороны', 'Сведите лопатки'] },
  { id: 'fb-021', name: 'Dumbbell Shoulder Press', nameRu: 'Жим гантелей сидя', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], difficulty: 3, instructions: ['Sit with dumbbells at shoulders', 'Press overhead', 'Lower with control'], instructionsRu: ['Сидя с гантелями у плеч', 'Выжмите вверх', 'Опустите подконтрольно'] },
  { id: 'fb-022', name: 'Dumbbell Bicep Curls', nameRu: 'Сгибания на бицепс', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['biceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Stand with dumbbells', 'Curl up', 'Lower slowly'], instructionsRu: ['Стоя с гантелями', 'Согните руки', 'Опустите медленно'] },
  { id: 'fb-023', name: 'Dumbbell Tricep Extensions', nameRu: 'Разгибания на трицепс', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['triceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Hold dumbbell overhead', 'Lower behind head', 'Extend back up'], instructionsRu: ['Держите гантель над головой', 'Опустите за голову', 'Разогните обратно'] },
  { id: 'fb-024', name: 'Dumbbell Goblet Squats', nameRu: 'Гоблет-приседания', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['core'], difficulty: 3, instructions: ['Hold dumbbell at chest', 'Squat down', 'Stand back up'], instructionsRu: ['Держите гантель у груди', 'Присядьте', 'Встаньте'] },
  { id: 'fb-025', name: 'Dumbbell Lunges', nameRu: 'Выпады с гантелями', category: 'strength', equipment: 'dumbbells', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 3, instructions: ['Hold dumbbells at sides', 'Step forward into lunge', 'Return to start'], instructionsRu: ['Гантели по бокам', 'Шагните в выпад', 'Вернитесь'] },
  { id: 'fb-026', name: 'Dumbbell Deadlifts', nameRu: 'Становая тяга с гантелями', category: 'strength', equipment: 'dumbbells', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower_back'], difficulty: 4, instructions: ['Stand with dumbbells', 'Hinge at hips', 'Lower and return'], instructionsRu: ['Стоя с гантелями', 'Наклонитесь в тазу', 'Опуститесь и вернитесь'] },

  // Barbell Exercises
  { id: 'fb-027', name: 'Barbell Bench Press', nameRu: 'Жим штанги лёжа', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], difficulty: 4, instructions: ['Lie on bench', 'Grip bar slightly wider than shoulders', 'Lower to chest and press up'], instructionsRu: ['Лягте на скамью', 'Возьмитесь шире плеч', 'Опустите к груди и выжмите'] },
  { id: 'fb-028', name: 'Barbell Squats', nameRu: 'Приседания со штангой', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings', 'core'], difficulty: 5, instructions: ['Bar on upper back', 'Squat down', 'Drive up through heels'], instructionsRu: ['Штанга на верхней части спины', 'Присядьте', 'Встаньте через пятки'] },
  { id: 'fb-029', name: 'Barbell Deadlifts', nameRu: 'Становая тяга', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['hamstrings', 'glutes', 'back'], secondaryMuscles: ['core'], difficulty: 5, instructions: ['Bend at hips and knees', 'Grip bar', 'Stand up straight'], instructionsRu: ['Согнитесь в тазу и коленях', 'Возьмитесь за штангу', 'Встаньте прямо'] },
  { id: 'fb-030', name: 'Barbell Rows', nameRu: 'Тяга штанги в наклоне', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 4, instructions: ['Bend over with flat back', 'Pull bar to lower chest', 'Lower with control'], instructionsRu: ['Наклонитесь с прямой спиной', 'Потяните штангу к низу груди', 'Опустите подконтрольно'] },
  { id: 'fb-031', name: 'Barbell Overhead Press', nameRu: 'Армейский жим', category: 'strength', equipment: 'barbell', level: 'intermediate', goal: 'muscle_gain', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], difficulty: 4, instructions: ['Start bar at shoulders', 'Press overhead', 'Lower with control'], instructionsRu: ['Штанга у плеч', 'Выжмите вверх', 'Опустите подконтрольно'] },

  // Cardio
  { id: 'fb-032', name: 'Jumping Jacks', nameRu: 'Прыжки звёздочкой', category: 'cardio', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['full_body'], secondaryMuscles: [], difficulty: 2, instructions: ['Jump feet apart while raising arms', 'Jump back together'], instructionsRu: ['Разведите ноги и поднимите руки', 'Вернитесь в исходную'] },
  { id: 'fb-033', name: 'Burpees', nameRu: 'Бёрпи', category: 'cardio', equipment: 'none', level: 'intermediate', goal: 'fat_loss', primaryMuscles: ['full_body'], secondaryMuscles: [], difficulty: 5, instructions: ['Squat down', 'Jump feet back to plank', 'Do push-up', 'Jump feet forward', 'Jump up'], instructionsRu: ['Присядьте', 'Прыгните в планку', 'Отжимание', 'Прыгните ногами к рукам', 'Прыжок вверх'] },
  { id: 'fb-034', name: 'High Knees', nameRu: 'Бег с высоким подниманием бедра', category: 'cardio', equipment: 'none', level: 'beginner', goal: 'fat_loss', primaryMuscles: ['quadriceps', 'core'], secondaryMuscles: [], difficulty: 3, instructions: ['Run in place', 'Bring knees up to hip level'], instructionsRu: ['Бегите на месте', 'Поднимайте колени до уровня бёдер'] },

  // Gym Machine Exercises
  { id: 'fb-036', name: 'Leg Press', nameRu: 'Жим ногами', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings'], difficulty: 3, instructions: ['Sit in machine', 'Press platform away', 'Return with control'], instructionsRu: ['Сядьте в тренажёр', 'Выжмите платформу', 'Верните подконтрольно'] },
  { id: 'fb-037', name: 'Lat Pulldown', nameRu: 'Тяга верхнего блока', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 3, instructions: ['Grip bar wide', 'Pull down to chest', 'Return with control'], instructionsRu: ['Возьмитесь широко', 'Потяните к груди', 'Верните подконтрольно'] },
  { id: 'fb-038', name: 'Seated Cable Row', nameRu: 'Тяга нижнего блока', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], difficulty: 3, instructions: ['Sit at machine', 'Pull handle to torso', 'Return with control'], instructionsRu: ['Сядьте в тренажёр', 'Потяните рукоять к себе', 'Верните подконтрольно'] },
  { id: 'fb-039', name: 'Chest Fly Machine', nameRu: 'Сведение рук в тренажёре', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 2, instructions: ['Sit in machine', 'Bring arms together', 'Return slowly'], instructionsRu: ['Сядьте в тренажёр', 'Сведите руки', 'Верните медленно'] },
  { id: 'fb-041', name: 'Leg Extension', nameRu: 'Разгибание ног', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['quadriceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Sit in machine', 'Extend legs fully', 'Lower with control'], instructionsRu: ['Сядьте в тренажёр', 'Разогните ноги', 'Опустите подконтрольно'] },
  { id: 'fb-042', name: 'Leg Curl', nameRu: 'Сгибание ног', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['hamstrings'], secondaryMuscles: [], difficulty: 2, instructions: ['Lie on machine', 'Curl legs up', 'Lower with control'], instructionsRu: ['Лягте на тренажёр', 'Согните ноги', 'Опустите подконтрольно'] },
  { id: 'fb-044', name: 'Cable Tricep Pushdown', nameRu: 'Разгибание на блоке', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['triceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Grip bar at high pulley', 'Push down', 'Return with control'], instructionsRu: ['Возьмитесь за рукоять', 'Толкните вниз', 'Верните подконтрольно'] },
  { id: 'fb-045', name: 'Cable Bicep Curl', nameRu: 'Сгибание на блоке', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['biceps'], secondaryMuscles: [], difficulty: 2, instructions: ['Use low pulley', 'Curl handle up', 'Lower with control'], instructionsRu: ['Используйте нижний блок', 'Согните рукоять вверх', 'Опустите подконтрольно'] },
  { id: 'fb-077', name: 'Cable Face Pull', nameRu: 'Лицевая тяга', category: 'strength', equipment: 'machine', level: 'beginner', goal: 'muscle_gain', primaryMuscles: ['rear_delts', 'upper_back'], secondaryMuscles: ['back'], difficulty: 2, instructions: ['Use rope attachment', 'Pull to face level', 'Externally rotate arms', 'Return slowly'], instructionsRu: ['Используйте канат', 'Потяните к уровню лица', 'Разверните руки наружу', 'Верните медленно'] },

  // Stretching & Recovery
  { id: 'fb-049', name: 'Hamstring Stretch', nameRu: 'Растяжка бицепса бедра', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['hamstrings'], secondaryMuscles: [], difficulty: 1, instructions: ['Sit with legs extended', 'Reach toward toes', 'Hold 30 seconds'], instructionsRu: ['Сидя с вытянутыми ногами', 'Тянитесь к носкам', 'Удержите 30 секунд'] },
  { id: 'fb-050', name: 'Quad Stretch', nameRu: 'Растяжка квадрицепса', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['quadriceps'], secondaryMuscles: [], difficulty: 1, instructions: ['Stand on one leg', 'Pull other foot to glutes', 'Hold 30 seconds'], instructionsRu: ['Стоя на одной ноге', 'Потяните стопу к ягодицам', 'Удержите 30 секунд'] },
  { id: 'fb-051', name: 'Chest Stretch', nameRu: 'Растяжка груди', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], difficulty: 1, instructions: ['Place hand on wall', 'Turn body away', 'Hold 30 seconds'], instructionsRu: ['Рука на стене', 'Поверните корпус', 'Удержите 30 секунд'] },
  { id: 'fb-052', name: 'Cat-Cow Stretch', nameRu: 'Кошка-корова', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['back', 'core'], secondaryMuscles: [], difficulty: 1, instructions: ['On hands and knees', 'Alternate arching and rounding back'], instructionsRu: ['На четвереньках', 'Поочерёдно прогибайте и округляйте спину'] },
  { id: 'fb-081', name: 'Child Pose', nameRu: 'Поза ребёнка', category: 'stretching', equipment: 'none', level: 'beginner', goal: 'maintenance', primaryMuscles: ['lower_back', 'back'], secondaryMuscles: ['shoulders'], difficulty: 1, instructions: ['Kneel on floor', 'Sit back on heels', 'Stretch arms forward', 'Hold 30-60 seconds'], instructionsRu: ['Встаньте на колени', 'Сядьте на пятки', 'Потяните руки вперёд', 'Удержите 30-60 секунд'] },
]

// ============================================================================
// WORKOUT TYPE DEFINITIONS - Target muscles for each workout type
// ============================================================================

interface WorkoutTypeConfig {
  id: string
  nameRu: string
  nameEn: string
  primaryTargets: string[]      // Main muscle groups for this workout
  secondaryTargets: string[]    // Secondary muscles that can be included
  excludeTargets: string[]      // Muscles to EXCLUDE from this workout
}

// Define workout types with their target muscles
const WORKOUT_TYPES: WorkoutTypeConfig[] = [
  {
    id: 'legs',
    nameRu: 'Ноги',
    nameEn: 'Legs',
    primaryTargets: ['quadriceps', 'hamstrings', 'glutes'],
    secondaryTargets: ['calves', 'adductors', 'hip_flexors'],
    excludeTargets: ['chest', 'back', 'shoulders', 'triceps', 'biceps', 'lats']
  },
  {
    id: 'chest_back',
    nameRu: 'Грудь + Спина',
    nameEn: 'Chest + Back',
    primaryTargets: ['chest', 'back', 'lats'],
    secondaryTargets: ['triceps', 'biceps', 'shoulders'],
    excludeTargets: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'obliques']
  },
  {
    id: 'shoulders_arms',
    nameRu: 'Плечи + Руки',
    nameEn: 'Shoulders + Arms',
    primaryTargets: ['shoulders', 'biceps', 'triceps'],
    secondaryTargets: ['upper_chest', 'rear_delts', 'upper_back'],
    excludeTargets: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'back', 'lats', 'lower_back']
  },
  {
    id: 'push',
    nameRu: 'Толкай (Грудь, Плечи, Трицепс)',
    nameEn: 'Push (Chest, Shoulders, Triceps)',
    primaryTargets: ['chest', 'shoulders', 'triceps'],
    secondaryTargets: ['upper_chest', 'front_delts'],
    excludeTargets: ['back', 'lats', 'biceps', 'quadriceps', 'hamstrings', 'glutes']
  },
  {
    id: 'pull',
    nameRu: 'Тяни (Спина, Бицепс)',
    nameEn: 'Pull (Back, Biceps)',
    primaryTargets: ['back', 'lats', 'biceps'],
    secondaryTargets: ['rear_delts', 'upper_back', 'lower_back', 'traps'],
    excludeTargets: ['chest', 'shoulders', 'triceps', 'quadriceps', 'hamstrings', 'glutes']
  },
  {
    id: 'full_body',
    nameRu: 'Всё тело',
    nameEn: 'Full Body',
    primaryTargets: ['chest', 'back', 'quadriceps', 'glutes'],
    secondaryTargets: ['shoulders', 'triceps', 'biceps', 'hamstrings', 'core'],
    excludeTargets: []
  },
  {
    id: 'core_cardio',
    nameRu: 'Пресс + Кардио',
    nameEn: 'Core + Cardio',
    primaryTargets: ['core', 'obliques', 'lower_abs', 'full_body'],
    secondaryTargets: ['shoulders', 'quadriceps', 'hip_flexors'],
    excludeTargets: ['chest', 'back', 'lats', 'biceps', 'triceps'] // Less restrictive - allow legs for cardio
  },
  {
    id: 'upper_body',
    nameRu: 'Верх тела',
    nameEn: 'Upper Body',
    primaryTargets: ['chest', 'back', 'shoulders', 'arms'],
    secondaryTargets: ['triceps', 'biceps', 'lats', 'rear_delts'],
    excludeTargets: ['quadriceps', 'hamstrings', 'glutes', 'calves']
  },
  {
    id: 'lower_body',
    nameRu: 'Низ тела',
    nameEn: 'Lower Body',
    primaryTargets: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    secondaryTargets: ['adductors', 'hip_flexors', 'core'],
    excludeTargets: ['chest', 'back', 'shoulders', 'triceps', 'biceps', 'lats']
  },
  {
    id: 'hiit',
    nameRu: 'HIIT',
    nameEn: 'HIIT',
    primaryTargets: ['full_body'],
    secondaryTargets: ['core', 'quadriceps', 'shoulders'],
    excludeTargets: []
  },
  {
    id: 'functional',
    nameRu: 'Функциональная',
    nameEn: 'Functional',
    primaryTargets: ['core', 'full_body'],
    secondaryTargets: ['quadriceps', 'glutes', 'shoulders'],
    excludeTargets: []
  }
]

// ============================================================================
// PRE-COMPUTED EXERCISE POOLS (computed once at module load)
// ============================================================================

const POOLS = {
  upperBodyPush: EXERCISES.filter(ex => 
    ['chest', 'shoulders', 'triceps'].some(m => ex.primaryMuscles.includes(m))
  ),
  upperBodyPull: EXERCISES.filter(ex => 
    ['back', 'lats', 'lower_back', 'rear_delts', 'upper_back', 'traps', 'biceps'].some(m => ex.primaryMuscles.includes(m))
  ),
  lowerBody: EXERCISES.filter(ex => 
    ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'hip_flexors', 'hips'].some(m => ex.primaryMuscles.includes(m))
  ),
  core: EXERCISES.filter(ex => 
    ex.category === 'core' || ex.primaryMuscles.includes('core') || ex.primaryMuscles.includes('obliques')
  ),
  cardio: EXERCISES.filter(ex => ex.category === 'cardio' || ex.goal === 'fat_loss'),
  stretching: EXERCISES.filter(ex => ex.category === 'stretching'),
  byEquipment: {
    none: EXERCISES.filter(ex => ex.equipment === 'none'),
    dumbbells: EXERCISES.filter(ex => ex.equipment === 'none' || ex.equipment === 'dumbbells'),
    barbell: EXERCISES.filter(ex => ['none', 'dumbbells', 'barbell'].includes(ex.equipment)),
    machine: EXERCISES.filter(ex => ex.equipment === 'machine'),
    pull_up_bar: EXERCISES.filter(ex => ex.equipment === 'none' || ex.equipment === 'pull_up_bar'),
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface UserProfile {
  age: number
  gender: string
  currentWeight: number
  targetWeight: number
  height: number
  fitnessGoal: string
  fitnessLevel: string
  equipment: string[]
  trainingLocation?: string
  customEquipment?: string
  daysPerWeek: number
  language: Language
}

interface UserProgressData {
  muscleGroupLevels?: Record<string, number>
  skippedExercises?: Array<{ exerciseId: string; reason: string }>
  workoutFeedback?: Array<{ feedback: string; adjustments?: { setsChange: number; repsChange: number; restChange: number } }>
  preferredRestTime?: number
  exerciseFeedbackStats?: Record<string, {
    exerciseId: string
    muscleGroup: string
    tooEasyCount: number
    normalCount: number
    hardCount: number
    couldNotCompleteCount: number
    totalSessions: number
    suggestedAction: 'advance' | 'maintain' | 'decrease' | 'replace'
  }>
  exerciseFeedbackHistory?: Array<{ exerciseId: string; muscleGroup: string; rpe: string; date: string }>
  workoutFeedbackSummaries?: Array<{
    workoutId: string
    date: string
    overallFeeling: string
    suggestedAdjustments: {
      increaseSets: string[]
      decreaseSets: string[]
      increaseReps: string[]
      decreaseReps: string[]
      replaceExercises: { exerciseId: string; reason: string }[]
      progressExercises: string[]
    }
  }>
}

interface AdaptiveAdjustments {
  increaseSets: string[]
  decreaseSets: string[]
  increaseReps: string[]
  decreaseReps: string[]
  replaceExercises: { exerciseId: string; reason: string }[]
  progressExercises: string[]
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { user, daysPerWeek = 3, userProgress, adaptiveAdjustments }: {
      user: UserProfile
      daysPerWeek: number
      userProgress?: UserProgressData
      adaptiveAdjustments?: AdaptiveAdjustments
    } = body

    if (!user || !user.fitnessGoal || !user.fitnessLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const language = user.language || 'ru'
    
    // Generate plan using pre-computed pools (no DB access = instant)
    const plan = generateLocalPlan(daysPerWeek, language, user, userProgress, adaptiveAdjustments)
    
    const elapsedMs = Date.now() - startTime

    return NextResponse.json({ plan, generationTimeMs: elapsedMs })
  } catch (error) {
    const elapsedMs = Date.now() - startTime
    console.error(`[Generate Plan] Error after ${elapsedMs}ms:`, error)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}

// ============================================================================
// FAST PLAN GENERATION - TARGETED WORKOUTS BY MUSCLE GROUP
// ============================================================================

/**
 * Check if an exercise matches the workout type's target muscles
 * Uses a smarter exclusion logic: only exclude if the PRIMARY muscle is excluded,
 * not if it just happens to work an excluded muscle as secondary
 */
function exerciseMatchesWorkoutType(
  exercise: ExerciseData, 
  workoutType: WorkoutTypeConfig,
  strictExclusion: boolean = true
): boolean {
  // In strict mode, check if exercise's PRIMARY muscle is excluded
  // This prevents chest exercises in a leg workout
  if (strictExclusion && workoutType.excludeTargets.length > 0) {
    // The primary muscle is the first one in the array
    const primaryMuscle = exercise.primaryMuscles[0]
    if (primaryMuscle && workoutType.excludeTargets.includes(primaryMuscle)) {
      return false
    }
  }
  
  // Check if exercise primary muscles include ANY primary or secondary target
  const hasTargetMuscle = exercise.primaryMuscles.some(m => 
    workoutType.primaryTargets.includes(m) || 
    workoutType.secondaryTargets.includes(m)
  )
  
  return hasTargetMuscle
}

/**
 * Check if an exercise should be completely excluded (all primary muscles excluded)
 */
function isExerciseCompletelyExcluded(
  exercise: ExerciseData,
  workoutType: WorkoutTypeConfig
): boolean {
  // Only exclude if ALL primary muscles are in the exclude list
  return exercise.primaryMuscles.every(m => 
    workoutType.excludeTargets.includes(m)
  )
}

/**
 * Get exercises for a specific workout type, respecting target muscles
 * With FALLBACK: if not enough matching exercises, use any available exercise
 * GUARANTEE: Always returns at least 3 exercises if available
 */
function getExercisesForWorkoutType(
  availableExercises: ExerciseData[],
  workoutType: WorkoutTypeConfig,
  usedExercises: Set<string>,
  maxExercises: number,
  allExercises: ExerciseData[] // For fallback
): ExerciseData[] {
  const MIN_EXERCISES = 3 // Minimum guaranteed exercises
  
  // STEP 1: Try to get exercises that match the workout type (smart matching)
  const matchingExercises = availableExercises.filter(ex => 
    !usedExercises.has(ex.id) && 
    exerciseMatchesWorkoutType(ex, workoutType)
  )
  
  // Sort by primary target match (prioritize primary muscles)
  const sorted = matchingExercises.sort((a, b) => {
    const aPrimaryMatch = a.primaryMuscles.filter(m => workoutType.primaryTargets.includes(m)).length
    const bPrimaryMatch = b.primaryMuscles.filter(m => workoutType.primaryTargets.includes(m)).length
    return bPrimaryMatch - aPrimaryMatch
  })
  
  // If we have enough, return them
  if (sorted.length >= maxExercises) {
    return sorted.slice(0, maxExercises)
  }
  
  // STEP 2: FALLBACK - Add exercises from category-based matching
  // For core_cardio, also include cardio and core category exercises
  const categoryMatches = availableExercises.filter(ex => 
    !usedExercises.has(ex.id) && 
    !sorted.find(s => s.id === ex.id) &&
    (
      // Include if category matches workout type focus
      (workoutType.id === 'core_cardio' && (ex.category === 'core' || ex.category === 'cardio')) ||
      (workoutType.id === 'hiit' && (ex.category === 'cardio' || ex.goal === 'fat_loss')) ||
      (workoutType.id === 'functional' && ex.category === 'core') ||
      // Include if any primary muscle matches secondary targets
      ex.primaryMuscles.some(m => workoutType.secondaryTargets.includes(m))
    )
  )
  
  const withCategory = [...sorted, ...categoryMatches]
  
  if (withCategory.length >= maxExercises) {
    return withCategory.slice(0, maxExercises)
  }
  
  // STEP 3: FALLBACK - Use ANY available exercise that isn't completely excluded
  const nonExcluded = allExercises.filter(ex => 
    !usedExercises.has(ex.id) && 
    !withCategory.find(w => w.id === ex.id) &&
    !isExerciseCompletelyExcluded(ex, workoutType)
  )
  
  const withNonExcluded = [...withCategory, ...nonExcluded]
  
  if (withNonExcluded.length >= maxExercises) {
    return withNonExcluded.slice(0, maxExercises)
  }
  
  // STEP 4: LAST RESORT - Use absolutely any available exercise
  const anyAvailable = allExercises.filter(ex => 
    !usedExercises.has(ex.id) && 
    !withNonExcluded.find(w => w.id === ex.id)
  )
  
  const finalResult = [...withNonExcluded, ...anyAvailable].slice(0, Math.max(MIN_EXERCISES, maxExercises))
  
  // Log if we're using fallback exercises (for debugging)
  if (finalResult.length < MIN_EXERCISES) {
    console.warn(`[Workout Generation] CRITICAL: Not enough exercises for workout type "${workoutType.id}". Requested: ${maxExercises}, Got: ${finalResult.length}. Available pool: ${allExercises.length}`)
  } else if (finalResult.length < maxExercises) {
    console.log(`[Workout Generation] Using fallback for "${workoutType.id}". Requested: ${maxExercises}, Got: ${finalResult.length}`)
  }
  
  return finalResult
}

/**
 * Get workout schedule based on goal and days per week
 */
function getWorkoutSchedule(
  goal: string, 
  daysPerWeek: number, 
  language: Language
): WorkoutTypeConfig[] {
  // Schedule templates for different goals
  const schedules: Record<string, WorkoutTypeConfig[][]> = {
    muscle_gain: [
      // 3 days: Push, Pull, Legs
      [
        WORKOUT_TYPES.find(w => w.id === 'push')!,
        WORKOUT_TYPES.find(w => w.id === 'pull')!,
        WORKOUT_TYPES.find(w => w.id === 'legs')!,
      ],
      // 4 days: Upper, Lower, Push, Pull
      [
        WORKOUT_TYPES.find(w => w.id === 'upper_body')!,
        WORKOUT_TYPES.find(w => w.id === 'lower_body')!,
        WORKOUT_TYPES.find(w => w.id === 'push')!,
        WORKOUT_TYPES.find(w => w.id === 'pull')!,
      ],
      // 5 days: Push, Pull, Legs, Upper, Lower
      [
        WORKOUT_TYPES.find(w => w.id === 'push')!,
        WORKOUT_TYPES.find(w => w.id === 'pull')!,
        WORKOUT_TYPES.find(w => w.id === 'legs')!,
        WORKOUT_TYPES.find(w => w.id === 'upper_body')!,
        WORKOUT_TYPES.find(w => w.id === 'lower_body')!,
      ],
    ],
    fat_loss: [
      // 3 days: Full Body variations
      [
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
      ],
      // 4 days
      [
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
      ],
      // 5 days
      [
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
      ],
    ],
    endurance: [
      // 3 days
      [
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
      ],
      // 4 days
      [
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
      ],
      // 5 days
      [
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'hiit')!,
      ],
    ],
    maintenance: [
      // 3 days
      [
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
        WORKOUT_TYPES.find(w => w.id === 'legs')!,
      ],
      // 4 days
      [
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'upper_body')!,
        WORKOUT_TYPES.find(w => w.id === 'lower_body')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
      ],
      // 5 days
      [
        WORKOUT_TYPES.find(w => w.id === 'full_body')!,
        WORKOUT_TYPES.find(w => w.id === 'upper_body')!,
        WORKOUT_TYPES.find(w => w.id === 'lower_body')!,
        WORKOUT_TYPES.find(w => w.id === 'functional')!,
        WORKOUT_TYPES.find(w => w.id === 'core_cardio')!,
      ],
    ],
  }
  
  const goalSchedules = schedules[goal] || schedules.maintenance
  const scheduleIndex = Math.min(daysPerWeek - 3, goalSchedules.length - 1)
  return goalSchedules[scheduleIndex] || goalSchedules[0]
}

function generateLocalPlan(
  daysPerWeek: number,
  language: Language,
  user: UserProfile,
  userProgress?: UserProgressData,
  adaptiveAdjustments?: AdaptiveAdjustments
) {
  // Get user preferences
  const muscleLevels = userProgress?.muscleGroupLevels || {}
  const skippedIds = new Set(userProgress?.skippedExercises?.map(s => s.exerciseId) || [])
  const preferredRest = userProgress?.preferredRestTime || 60
  
  // Adaptive adjustments
  const increaseSetsIds = new Set(adaptiveAdjustments?.increaseSets || [])
  const decreaseSetsIds = new Set(adaptiveAdjustments?.decreaseSets || [])
  const increaseRepsIds = new Set(adaptiveAdjustments?.increaseReps || [])
  const decreaseRepsIds = new Set(adaptiveAdjustments?.decreaseReps || [])
  const replaceExerciseIds = new Set(adaptiveAdjustments?.replaceExercises?.map(r => r.exerciseId) || [])

  // Filter exercises by equipment using smart filtering logic
  const trainingLocation = user.trainingLocation || 'home'
  const userEquipment = user.equipment || []
  
  let availableExercises: ExerciseData[] = []
  
  // Smart equipment filtering based on location and selected equipment
  if (trainingLocation === 'home') {
    // Home: bodyweight always + selected free weights + pullup_bar if selected
    const allowedEquipment = ['none']
    if (userEquipment.includes('dumbbells')) allowedEquipment.push('dumbbells')
    if (userEquipment.includes('barbell')) allowedEquipment.push('barbell')
    if (userEquipment.includes('kettlebells')) allowedEquipment.push('kettlebells')
    if (userEquipment.includes('pullup_bar')) allowedEquipment.push('pull_up_bar')
    availableExercises = EXERCISES.filter(ex => allowedEquipment.includes(ex.equipment))
  } else if (trainingLocation === 'gym') {
    // Gym: machines always + bodyweight (warmup) + pullup_bar always (common in gyms) + selected free weights
    const allowedEquipment = ['machine', 'none', 'pull_up_bar']
    if (userEquipment.includes('dumbbells')) allowedEquipment.push('dumbbells')
    if (userEquipment.includes('barbell')) allowedEquipment.push('barbell')
    if (userEquipment.includes('kettlebells')) allowedEquipment.push('kettlebells')
    availableExercises = EXERCISES.filter(ex => allowedEquipment.includes(ex.equipment))
  } else {
    // Both: everything
    availableExercises = EXERCISES
  }

  // Exclude skipped and replaced exercises
  const excludeIds = new Set(Array.from(skippedIds).concat(Array.from(replaceExerciseIds)))
  availableExercises = availableExercises.filter(ex => !excludeIds.has(ex.id))

  // Goal-specific configurations
  const goalConfigs: Record<string, { reps: string; sets: number; rest: number }> = {
    fat_loss: { reps: '15-20', sets: 3, rest: 30 },
    muscle_gain: { reps: '8-12', sets: 4, rest: 90 },
    endurance: { reps: '20-30', sets: 3, rest: 20 },
    maintenance: { reps: '12-15', sets: 3, rest: 60 },
  }

  const config = goalConfigs[user.fitnessGoal] || goalConfigs.maintenance
  
  // Level adjustments
  const levelMultiplier = user.fitnessLevel === 'beginner' ? 0.8 : user.fitnessLevel === 'advanced' ? 1.2 : 1

  // Get workout schedule based on goal
  const workoutSchedule = getWorkoutSchedule(user.fitnessGoal, daysPerWeek, language)
  
  // Generate workouts
  const workouts: any[] = []
  const usedExercises = new Set<string>()
  
  // Shuffle available exercises for variety (but keep order consistent within a plan)
  const shuffled = [...availableExercises].sort(() => Math.random() - 0.5)

  for (let i = 0; i < daysPerWeek; i++) {
    const workoutType = workoutSchedule[i] || workoutSchedule[0]
    
    // Determine number of exercises based on workout type and goal
    const isFullBody = workoutType.id === 'full_body' || workoutType.id === 'hiit' || workoutType.id === 'functional'
    const baseExerciseCount = isFullBody ? 6 : 5
    const exerciseCount = Math.max(3, Math.round(baseExerciseCount * levelMultiplier)) // Minimum 3 exercises
    
    // Get exercises that match this workout type
    const dayExercises = getExercisesForWorkoutType(
      shuffled,
      workoutType,
      usedExercises,
      exerciseCount,
      EXERCISES // Pass all exercises for fallback
    )
    
    // Mark exercises as used
    dayExercises.forEach(ex => usedExercises.add(ex.id))

    // Build workout items
    const exerciseItems = dayExercises.map((ex, idx) => {
      let sets = Math.round(config.sets * levelMultiplier)
      let reps = config.reps
      let rest = config.rest

      // Apply adaptive adjustments
      if (increaseSetsIds.has(ex.id)) sets = Math.min(6, sets + 1)
      if (decreaseSetsIds.has(ex.id)) sets = Math.max(2, sets - 1)
      if (increaseRepsIds.has(ex.id)) {
        const base = parseInt(reps.split('-')[1] || '15')
        reps = `${base}-${base + 3}`
      }
      if (decreaseRepsIds.has(ex.id)) {
        const base = parseInt(reps.split('-')[0] || '10')
        reps = `${Math.max(6, base - 3)}-${base}`
      }

      // Muscle level adjustment
      const muscleLevel = muscleLevels[ex.primaryMuscles[0]] || 1
      const difficulty = Math.min(5, Math.max(1, Math.round(muscleLevel)))

      return {
        id: ex.id,
        slug: ex.id,
        name: ex.name,
        nameRu: ex.nameRu || ex.name,
        level: ex.level,
        goal: ex.goal,
        category: ex.category,
        equipment: ex.equipment,
        difficulty,
        primaryMuscles: ex.primaryMuscles,
        secondaryMuscles: ex.secondaryMuscles,
        gifUrl: null,
        videoUrl: null,
        sets,
        reps,
        restSeconds: rest,
        completedSets: 0,
        instructions: ex.instructions,
        instructionsRu: ex.instructionsRu || ex.instructions,
        order: idx + 1,
      }
    })

    // Get workout name based on type and language
    const workoutName = language === 'ru' ? workoutType.nameRu : workoutType.nameEn

    workouts.push({
      id: `workout-${Date.now()}-${i}`,
      name: workoutName,
      dayOfWeek: i + 1,
      weekNumber: 1,
      exercises: exerciseItems,
      completed: false,
      warmup: generateWarmup(
        user.fitnessGoal as 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintenance',
        user.age,
        user.currentWeight,
        user.height,
        user.gender as 'male' | 'female' | 'other',
        language
      ),
    })
  }

  const goalNames: Record<string, { ru: string; en: string }> = {
    fat_loss: { ru: 'Похудение', en: 'Fat Loss' },
    muscle_gain: { ru: 'Набор массы', en: 'Muscle Gain' },
    endurance: { ru: 'Выносливость', en: 'Endurance' },
    maintenance: { ru: 'Поддержание', en: 'Maintenance' },
  }

  const goalName = goalNames[user.fitnessGoal] || goalNames.maintenance

  return {
    id: `plan-${Date.now()}`,
    name: language === 'ru' 
      ? `${goalName.ru} - ${daysPerWeek} тренировок` 
      : `${goalName.en} - ${daysPerWeek} workouts`,
    goal: user.fitnessGoal,
    level: user.fitnessLevel,
    daysPerWeek,
    duration: 4,
    workouts,
    createdAt: new Date().toISOString(),
  }
}

// Helper function for safe JSON parsing (not used but kept for compatibility)
function safeJsonParse<T>(value: string | T, fallback: T): T {
  if (typeof value !== 'string') return value as T
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
