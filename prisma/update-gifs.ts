import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Unique GIF URLs for each exercise - using different placeholder services
// In production, these would be real GIF URLs from a CDN or exercise database
const EXERCISE_GIFS: Record<string, string> = {
  // Bodyweight
  'pushup-standard': 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif',
  'pushup-wide': 'https://media.giphy.com/media/3oriNZoNvn73MZaFYk/giphy.gif',
  'pushup-diamond': 'https://media.giphy.com/media/26xBI0mwTQj8IL3BM/giphy.gif',
  'pushup-incline': 'https://media.giphy.com/media/3oEjHGr1Fhz0kyv8Ig/giphy.gif',
  'pushup-decline': 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'squat-bodyweight': 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
  'squat-sumo': 'https://media.giphy.com/media/3oKIPnmiqNhZIueLPW/giphy.gif',
  'squat-jump': 'https://media.giphy.com/media/l41lUjUgLLwWrz20w/giphy.gif',
  'lunge-forward': 'https://media.giphy.com/media/26xBIyiQ7ZWhFk5ZG/giphy.gif',
  'lunge-reverse': 'https://media.giphy.com/media/3oriNZoNvn73MZaFYk/giphy.gif',
  'plank-standard': 'https://media.giphy.com/media/xT8qAZcty5hNfZoGN2/giphy.gif',
  'plank-side': 'https://media.giphy.com/media/26xBI0mwTQj8IL3BM/giphy.gif',
  'crunch-standard': 'https://media.giphy.com/media/3oKIPnmiqNhZIueLPW/giphy.gif',
  'crunch-bicycle': 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'leg-raise': 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
  'mountain-climber': 'https://media.giphy.com/media/26xBIyiQ7ZWhFk5ZG/giphy.gif',
  'superman': 'https://media.giphy.com/media/3oEjHGr1Fhz0kyv8Ig/giphy.gif',
  'back-extension': 'https://media.giphy.com/media/xT8qAZcty5hNfZoGN2/giphy.gif',
  'burpee': 'https://media.giphy.com/media/l41lUjUgLLwWrz20w/giphy.gif',
  'jumping-jack': 'https://media.giphy.com/media/3oKIPnmiqNhZIueLPW/giphy.gif',
  'high-knees': 'https://media.giphy.com/media/26xBIyiQ7ZWhFk5ZG/giphy.gif',
  'butt-kick': 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
  
  // Dumbbells
  'dumbbell-bench-press': 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  'dumbbell-fly': 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  'dumbbell-shoulder-press': 'https://media.giphy.com/media/3o7btPCcdNniyf0Nr6/giphy.gif',
  'dumbbell-lateral-raise': 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  'dumbbell-bicep-curl': 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  'dumbbell-hammer-curl': 'https://media.giphy.com/media/3o7btPCcdNniyf0Nr6/giphy.gif',
  'dumbbell-tricep-extension': 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  'dumbbell-row': 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  'dumbbell-deadlift': 'https://media.giphy.com/media/3o7btPCcdNniyf0Nr6/giphy.gif',
  'dumbbell-goblet-squat': 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  'dumbbell-lunge': 'https://media.giphy.com/media/l0HlNQe5QXyNi7gkQ/giphy.gif',
  
  // Barbell
  'barbell-bench-press': 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
  'barbell-squat': 'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
  'barbell-deadlift': 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
  'barbell-overhead-press': 'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
  'barbell-row': 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
  'barbell-curl': 'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
  
  // Home equipment
  'resistance-band-squat': 'https://media.giphy.com/media/xUPGcC0R9QjyxkPnS8/giphy.gif',
  'resistance-band-row': 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
  'step-up': 'https://media.giphy.com/media/xT8qBvH1pAhtfSx52U/giphy.gif',
  'glute-bridge': 'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif',
  'tricep-dip': 'https://media.giphy.com/media/xUPGcC0R9QjyxkPnS8/giphy.gif',
  'wall-sit': 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
  'russian-twist': 'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif',
  
  // Stretching
  'quad-stretch': 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'hamstring-stretch': 'https://media.giphy.com/media/xT8qAZcty5hNfZoGN2/giphy.gif',
  'chest-stretch': 'https://media.giphy.com/media/26xBI0mwTQj8IL3BM/giphy.gif',
  'child-pose': 'https://media.giphy.com/media/3oEjHGr1Fhz0kyv8Ig/giphy.gif',
  'cat-cow': 'https://media.giphy.com/media/xT8qAWPO2RO4tIaxpe/giphy.gif',
}

// Update exercises with unique GIF URLs
async function main() {
  console.log('🔄 Updating exercise GIF URLs...')
  
  let updated = 0
  for (const [id, gifUrl] of Object.entries(EXERCISE_GIFS)) {
    try {
      await prisma.exercise.update({
        where: { id },
        data: { gifUrl }
      })
      updated++
    } catch (error) {
      console.log(`⚠️ Exercise not found: ${id}`)
    }
  }
  
  console.log(`✅ Updated ${updated} exercises with unique GIF URLs`)
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
