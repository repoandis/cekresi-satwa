// Client-side authentication functions (no database access)
export type User = {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// Client-side auth functions that call API routes
export const clientAuth = {
  signIn: async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    
    if (!response.ok) {
      throw new Error('Login failed')
    }
    
    return response.json()
  },
  
  signUp: async (username: string, password: string, role: 'admin' | 'user' = 'user') => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    })
    
    if (!response.ok) {
      throw new Error('Registration failed')
    }
    
    return response.json()
  },
  
  signOut: () => {
    // Client-side sign out (clear session/localStorage)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
    }
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },
  
  setCurrentUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }
}
