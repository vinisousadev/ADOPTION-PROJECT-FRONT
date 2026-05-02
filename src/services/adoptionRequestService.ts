import type {
  AdoptionRequestResponse,
  CreateAdoptionRequest,
  PagedResponse,
} from '../types'
import { api } from './api'

export async function getMyAdoptionRequests(): Promise<
  PagedResponse<AdoptionRequestResponse>
> {
  const response =
    await api.get<PagedResponse<AdoptionRequestResponse>>(
      '/adoption-requests/mine',
    )

  return response.data
}

export async function getReceivedAdoptionRequests(): Promise<
  PagedResponse<AdoptionRequestResponse>
> {
  const response =
    await api.get<PagedResponse<AdoptionRequestResponse>>(
      '/adoption-requests/received',
    )

  return response.data
}

export async function createAdoptionRequest(
  request: CreateAdoptionRequest,
): Promise<AdoptionRequestResponse> {
  const response = await api.post<AdoptionRequestResponse>(
    '/adoption-requests',
    request,
  )

  return response.data
}

export async function approveAdoptionRequest(
  id: number,
): Promise<AdoptionRequestResponse> {
  const response = await api.patch<AdoptionRequestResponse>(
    `/adoption-requests/${id}/approve`,
  )

  return response.data
}

export async function rejectAdoptionRequest(
  id: number,
): Promise<AdoptionRequestResponse> {
  const response = await api.patch<AdoptionRequestResponse>(
    `/adoption-requests/${id}/reject`,
  )

  return response.data
}

export async function cancelAdoptionRequest(
  id: number,
): Promise<AdoptionRequestResponse> {
  const response = await api.patch<AdoptionRequestResponse>(
    `/adoption-requests/${id}/cancel`,
  )

  return response.data
}
