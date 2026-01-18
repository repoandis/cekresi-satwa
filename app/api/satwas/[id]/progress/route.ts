import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('satwa_id', id)
      .order('tanggal', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({
      error: 'Failed to fetch progress'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, lokasi, keterangan, tanggal } = body

    if (!status || !lokasi || !tanggal) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('progress')
      .insert([{
        satwa_id: id,
        status,
        lokasi,
        keterangan,
        tanggal: new Date(tanggal).toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating progress:', error)
    return NextResponse.json({
      error: 'Failed to create progress'
    }, { status: 500 })
  }
}
