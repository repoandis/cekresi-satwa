import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kodeResi = searchParams.get('kodeResi')

    if (!kodeResi) {
      return NextResponse.json({
        success: false,
        error: 'Kode resi is required'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('satwa')
      .select('*')
      .eq('kode_resi', kodeResi)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Kode resi tidak ditemukan'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error searching resi:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search resi'
    }, { status: 500 })
  }
}
