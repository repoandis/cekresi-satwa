import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.query(
      'SELECT * FROM progress WHERE satwa_id = $1 ORDER BY created_at ASC',
      [id]
    )

    // Map database status back to Indonesian for display
    const statusMapping: { [key: string]: string } = {
      'PENDING': 'Menunggu',
      'IN_TRANSIT': 'Dalam Perjalanan', 
      'COMPLETED': 'Selesai',
      'Menunggu': 'Menunggu',
      'Dalam Perjalanan': 'Dalam Perjalanan',
      'Selesai': 'Selesai'
    }

    const mappedData = result.rows.map(row => ({
      ...row,
      status: statusMapping[row.status] || row.status
    }))

    return NextResponse.json({
      success: true,
      data: mappedData
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, lokasi, keterangan } = body

    // Map Indonesian status to English for database consistency
    const statusMapping: { [key: string]: string } = {
      'Menunggu': 'PENDING',
      'Dalam Perjalanan': 'IN_TRANSIT', 
      'Selesai': 'COMPLETED',
      'PENDING': 'PENDING',
      'IN_TRANSIT': 'IN_TRANSIT',
      'COMPLETED': 'COMPLETED'
    }

    const dbStatus = statusMapping[status] || status

    const result = await db.query(
      'INSERT INTO progress (satwa_id, status, lokasi, keterangan, tanggal) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [id, status, lokasi, keterangan] // Keep original status for display
    )

    // Update satwa status with mapped value
    await db.query(
      'UPDATE satwa SET status = $1, updated_at = NOW() WHERE id = $2',
      [dbStatus, id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating progress:', error)
    return NextResponse.json(
      { error: 'Failed to create progress' },
      { status: 500 }
    )
  }
}
