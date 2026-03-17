import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/exercises - Get all exercises with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const goal = searchParams.get('goal')
    const equipment = searchParams.get('equipment')
    const category = searchParams.get('category')
    
    const where: Record<string, unknown> = { isActive: true }
    
    if (level) where.level = level
    if (goal) where.goal = goal
    if (equipment) where.equipment = equipment
    if (category) where.category = category
    
    const exercises = await db.exercise.findMany({
      where,
      orderBy: { difficulty: 'asc' }
    })
    
    // Parse JSON fields
    const parsedExercises = exercises.map(ex => ({
      ...ex,
      primaryMuscles: JSON.parse(ex.primaryMuscles as string || '[]'),
      secondaryMuscles: JSON.parse(ex.secondaryMuscles as string || '[]'),
      instructions: JSON.parse(ex.instructions as string || '[]'),
      tips: JSON.parse(ex.tips as string || '[]'),
      warnings: JSON.parse(ex.warnings as string || '[]'),
    }))
    
    return NextResponse.json({ exercises: parsedExercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}
