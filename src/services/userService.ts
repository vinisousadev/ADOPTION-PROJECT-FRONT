import { api } from './api'
import type { CreateUserRequest, UserResponse } from '../types'

export async function createUser(
  request: CreateUserRequest,
): Promise<UserResponse> {
  const response = await api.post<UserResponse>('/users', request)

  return response.data
}

export async function getUserById(id: number): Promise<UserResponse> {
  const response = await api.get<UserResponse>(`/users/${id}`)

  return response.data
}
