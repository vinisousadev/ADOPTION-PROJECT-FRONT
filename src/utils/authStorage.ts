import type { AuthenticatedUser } from '../types'

const TOKEN_STORAGE_KEY = 'adoption:token'
const USER_STORAGE_KEY = 'adoption:user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredUser(): AuthenticatedUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AuthenticatedUser
  } catch {
    return null
  }
}

export function storeAuthSession(token: string, user: AuthenticatedUser) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}
