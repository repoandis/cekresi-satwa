import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    const { data, error } = await supabase
      .from('satwa')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Update successful:', data)

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({
      error: 'Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
