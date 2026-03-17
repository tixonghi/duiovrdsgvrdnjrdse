import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/weight - Get weight logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '30')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const logs = await db.weightLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching weight logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weight logs' },
      { status: 500 }
    )
  }
}

// POST /api/weight - Log new weight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      weight, 
      notes,
      bodyFatPercentage,
      muscleMass 
    } = body

    if (!userId || !weight) {
      return NextResponse.json(
        { error: 'userId and weight are required' },
        { status: 400 }
      )
    }

    const log = await db.weightLog.create({
      data: {
        userId,
        weight,
        notes,
        bodyFatPercentage,
        muscleMass,
        date: new Date()
      }
    })

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Error creating weight log:', error)
    return NextResponse.json(
      { error: 'Failed to log weight' },
      { status: 500 }
    )
  }
}
