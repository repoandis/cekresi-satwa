import { supabase } from './supabase'
import { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']

export async function signIn(username: string, password: string) {
  try {
    // Query without .single() to handle multiple/no results properly
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)

    if (error) {
      throw error
    }
    
    // Check if we found exactly one user
    if (!data || data.length === 0) {
      return { user: null, error: new Error('User not found') }
    }
    
    if (data.length > 1) {
      console.warn('Multiple users found with same credentials')
    }
    
    return { user: data[0], error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { user: null, error: error as Error }
  }
}

export async function signUp(username: string, password: string, role: 'admin' | 'user' = 'user') {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password, role }])
      .select()
      .single()

    if (error) throw error
    
    return { user: data, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { user: null, error: error as Error }
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return { users: data, error: null }
  } catch (error) {
    console.error('Get users error:', error)
    return { users: null, error: error as Error }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ password: newPassword, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    
    return { user: data, error: null }
  } catch (error) {
    console.error('Update password error:', error)
    return { user: null, error: error as Error }
  }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    
    return { user: data, error: null }
  } catch (error) {
    console.error('Update role error:', error)
    return { user: null, error: error as Error }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Delete user error:', error)
    return { error: error as Error }
  }
}

export async function signOut() {
  // For custom auth, you would handle session cleanup here
  // With Supabase Auth, you would use: await supabase.auth.signOut()
  return { error: null }
}
