import { api } from './api'
import type { AnimalResponse, CreateAnimalRequest, PagedResponse } from '../types'

export async function getAvailableAnimals(): Promise<
  PagedResponse<AnimalResponse>
> {
  const response =
    await api.get<PagedResponse<AnimalResponse>>('/animals/available')

  return response.data
}

export async function getMyAnimals(): Promise<PagedResponse<AnimalResponse>> {
  const response = await api.get<PagedResponse<AnimalResponse>>('/animals/mine')

  return response.data
}

export async function createAnimal(
  request: CreateAnimalRequest,
): Promise<AnimalResponse> {
  const response = await api.post<AnimalResponse>('/animals', request)

  return response.data
}

export async function deleteAnimal(id: number): Promise<AnimalResponse> {
  const response = await api.delete<AnimalResponse>(`/animals/${id}`)

  return response.data
}
