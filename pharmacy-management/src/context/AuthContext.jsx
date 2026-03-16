/**
 * AuthContext
 * Manages authentication state: current user, login/logout, roles & permissions.
 * Wrap the entire app with <AuthProvider> in main.jsx or App.jsx.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('pharmacy_user')
    if (storedUser) setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    setUser(data.user)
    localStorage.setItem('pharmacy_user', JSON.stringify(data.user))
    return data
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pharmacy_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
