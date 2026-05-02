import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { login as loginRequest } from '../services/authService'
import type { AuthenticatedUser, LoginRequest } from '../types'
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  storeAuthSession,
} from '../utils/authStorage'

type AuthContextValue = {
  user: AuthenticatedUser | null
  token: string | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() =>
    getStoredUser(),
  )
  const [token, setToken] = useState<string | null>(() => getStoredToken())

  async function login(request: LoginRequest) {
    const loginResponse = await loginRequest(request)

    const authenticatedUser = {
      userId: loginResponse.userId,
      name: loginResponse.name,
      email: loginResponse.email,
      userType: loginResponse.userType,
    }

    storeAuthSession(loginResponse.token, authenticatedUser)
    setToken(loginResponse.token)
    setUser(authenticatedUser)
  }

  function logout() {
    clearAuthSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
