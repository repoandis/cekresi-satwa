import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Status update request for satwa:', id)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { status } = body

    if (!status) {
      console.error('Missing status in request body')
      return NextResponse.json({
        error: 'Missing status'
      }, { status: 400 })
    }

    console.log('Updating status to:', status)

    const result = await db.query(
      'UPDATE satwa SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Satwa not found' },
        { status: 404 }
      )
    }

    console.log('Update successful:', result.rows[0])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({
      error: 'Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
