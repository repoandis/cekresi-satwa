import { users } from './server-helpers'

export type User = {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export async function signIn(username: string, password: string) {
  try {
    const user = await users.findByUsername(username)
    
    if (!user) {
      return { user: null, error: new Error('User not found') }
    }
    
    if (user.password !== password) {
      return { user: null, error: new Error('Invalid password') }
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { user: null, error: error as Error }
  }
}

export async function signUp(username: string, password: string, role: 'admin' | 'user' = 'user') {
  try {
    const user = await users.create({ username, password, role })
    return { user, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { user: null, error: error as Error }
  }
}

export async function getAllUsers() {
  try {
    const userList = await users.findAll()
    return { users: userList, error: null }
  } catch (error) {
    console.error('Get users error:', error)
    return { users: null, error: error as Error }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const result = await users.updatePassword(userId, newPassword)
    return { user: result, error: null }
  } catch (error) {
    console.error('Update password error:', error)
    return { user: null, error: error as Error }
  }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  try {
    const result = await users.updateRole(userId, newRole)
    return { user: result, error: null }
  } catch (error) {
    console.error('Update role error:', error)
    return { user: null, error: error as Error }
  }
}

export async function deleteUser(userId: string) {
  try {
    await users.delete(userId)
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
