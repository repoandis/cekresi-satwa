import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('satwa')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching satwa:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch satwa'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { kodeResi, nama, spesies, asal, tujuan, status } = body

    const { data, error } = await supabase
      .from('satwa')
      .update({
        kode_resi: kodeResi,
        nama,
        spesies,
        asal,
        tujuan,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error updating satwa:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update satwa'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('satwa')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting satwa:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete satwa'
    }, { status: 500 })
  }
}
