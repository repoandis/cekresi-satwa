import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for RLS bypass
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log('Fetching all resi:', { page, limit, search, status })

    let query = supabaseService
      .from('satwa')
      .select('*')
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`kode_resi.ilike.%${search}%,nama.ilike.%${search}%,spesies.ilike.%${search}%`)
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Get total count
    let countQuery = supabaseService
      .from('satwa')
      .select('*', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`kode_resi.ilike.%${search}%,nama.ilike.%${search}%,spesies.ilike.%${search}%`)
    }

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting resi:', countError)
    }

    // Get paginated data
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await query.range(from, to)

    if (error) {
      console.error('Error fetching resi:', error)
      throw error
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
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
