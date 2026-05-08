import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService, setAuthToken } from '../services/api'

const AuthContext = createContext()

const STORAGE_KEY = 'pt_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null }
    catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  // On mount: validate session via /me (works for both cookie and Bearer token)
  useEffect(() => {
    authService.me()
      .then(res => {
        const nextUser = res?.user || res || null
        setUser(nextUser)
      })
      .catch(() => {
        setUser(null)
        setAuthToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    const nextUser = data?.user || null
    if (data?.accessToken) setAuthToken(data.accessToken)
    setUser(nextUser)
    return nextUser
  }, [])

  const register = useCallback(async (credentials) => {
    const data = await authService.register(credentials)
    const nextUser = data?.user || null
    if (data?.accessToken) setAuthToken(data.accessToken)
    setUser(nextUser)
    return nextUser
  }, [])

  const googleLogin = useCallback(async (credential) => {
    const data = await authService.googleSignIn(credential)
    const nextUser = data?.user || null
    if (data?.accessToken) setAuthToken(data.accessToken)
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    const data = await authService.updateProfile(updates)
    const nextUser = data?.user || { ...user, ...updates }
    setUser(nextUser)
    return nextUser
  }, [user])

  const markEmailVerified = useCallback(() => {
    setUser(prev => prev ? { ...prev, isEmailVerified: true } : prev)
  }, [])

  const isLoggedIn = !!user
  const isEmailVerified = user?.isEmailVerified === true || user?.is_email_verified === true

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoggedIn,
      isEmailVerified,
      login,
      register,
      googleLogin,
      logout,
      updateProfile,
      markEmailVerified,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
