import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('satwa')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching satwas:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch satwas'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kodeResi, nama, spesies, asal, tujuan, status } = body

    if (!kodeResi || !nama || !spesies || !asal || !tujuan) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('satwa')
      .insert([{
        kode_resi: kodeResi,
        nama,
        spesies,
        asal,
        tujuan,
        status: status || 'PENDING'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error creating satwa:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create satwa'
    }, { status: 500 })
  }
}
