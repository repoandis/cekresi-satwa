import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/server-helpers'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 })
    }

    const user = await users.findByUsername(username)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 401 })
    }
    
    // Check if password is bcrypt hash or plain text
    let isValidPassword = false
    
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Bcrypt hash
      isValidPassword = await bcrypt.compare(password, user.password)
    } else {
      // Plain text (for backward compatibility)
      isValidPassword = user.password === password
    }
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password'
      }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
