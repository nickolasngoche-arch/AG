import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from '../api/client.js'
import { AuthContext } from './AuthContext.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  // Restore the session if a token is saved from a previous visit.
  useEffect(() => {
    if (!tokenStore.get()) return undefined
    let cancelled = false
    api
      .get('/auth/me/')
      .then((me) => !cancelled && setUser(me))
      .catch((error) => {
        if (error.status === 401) tokenStore.clear() // expired/invalid token
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const startSession = useCallback((data) => {
    tokenStore.set(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(
    async (email, password) => startSession(await api.post('/auth/login/', { email, password }, { auth: false })),
    [startSession],
  )

  const signup = useCallback(
    async (payload) => startSession(await api.post('/auth/signup/', payload, { auth: false })),
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout/')
    } catch {
      /* the token is discarded locally either way */
    }
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
