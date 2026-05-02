import { api } from './api'
import type { CreateUserRequest, UserResponse } from '../types'

export async function createUser(
  request: CreateUserRequest,
): Promise<UserResponse> {
  const response = await api.post<UserResponse>('/users', request)

  return response.data
}
