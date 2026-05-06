import type { UserType } from './user'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  userId: number
  name: string
  email: string
  userType: UserType
  message: string
  token: string
}

export type EmailConfirmationResponse = {
  message: string
  emailVerified: boolean
}

export type AuthenticatedUser = {
  userId: number
  name: string
  email: string
  userType: UserType
}
