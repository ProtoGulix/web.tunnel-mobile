import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    // Stocker le access_token pour les requêtes suivantes
    if (data?.data?.access_token) {
      localStorage.setItem('auth_token', data.data.access_token)
    }
    // Charger le profil utilisateur immédiatement après login
    const me = await getMe()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {})
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
