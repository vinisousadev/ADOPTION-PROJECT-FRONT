import { api } from './api'
import type {
  EmailConfirmationResponse,
  LoginRequest,
  LoginResponse,
} from '../types'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', request)

  return response.data
}

export async function confirmEmail(
  token: string,
): Promise<EmailConfirmationResponse> {
  const response = await api.post<EmailConfirmationResponse>(
    '/auth/confirm-email',
    { token },
  )

  return response.data
}

export async function resendEmailConfirmation(
  email: string,
): Promise<EmailConfirmationResponse> {
  const response = await api.post<EmailConfirmationResponse>(
    '/auth/resend-confirmation',
    { email },
  )

  return response.data
}
