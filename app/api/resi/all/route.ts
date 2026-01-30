import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log('Fetching all resi:', { page, limit, search, status })

    let whereClause = 'WHERE 1=1'
    let queryParams: any[] = []
    let paramIndex = 1

    // Add search filter
    if (search) {
      whereClause += ` AND (kode_resi ILIKE $${paramIndex} OR nama ILIKE $${paramIndex} OR spesies ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // Add status filter
    if (status) {
      whereClause += ` AND status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM satwa ${whereClause}`
    const countResult = await db.query(countQuery, queryParams)
    const total = parseInt(countResult.rows[0].total)

    // Get paginated data
    const offset = (page - 1) * limit
    const dataQuery = `
      SELECT * FROM satwa 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    const result = await db.query(dataQuery, queryParams)

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching all resi:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch resi'
    }, { status: 500 })
  }
}
