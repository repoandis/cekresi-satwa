import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kodeResi = searchParams.get('kode_resi')

    if (!kodeResi) {
      return NextResponse.json(
        { error: 'Kode resi is required' },
        { status: 400 }
      )
    }

    const result = await db.query(
      'SELECT * FROM satwa WHERE kode_resi = $1',
      [kodeResi]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Resi not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching resi:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resi' },
      { status: 500 }
    )
  }
}
