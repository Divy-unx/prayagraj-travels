import { createContext, useContext, useEffect, useState } from 'react'
import { authService, setAuthToken } from '../services/api'

const AuthContext = createContext()

const STORAGE_KEY = 'pt_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null }
    catch { return null }
  })

  useEffect(() => {
    const token = authService.getToken()
    if (!token) return
    authService.me()
      .then(res => {
        const nextUser = res?.user || null
        if (nextUser) {
          setUser(nextUser)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
        }
      })
      .catch(() => {
        logout()
      })
  }, [])

  const login = async (userData) => {
    const payload = 'password' in userData
      ? await authService.login({ email: userData.email, password: userData.password })
      : { user: userData, token: userData.token }

    const nextUser = payload.user || userData
    if (payload.token) setAuthToken(payload.token)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    return nextUser
  }

  const logout = () => {
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateProfile = async (updates) => {
    const payload = await authService.updateProfile(updates)
    const nextUser = payload.user || { ...user, ...updates }
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    return nextUser
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
