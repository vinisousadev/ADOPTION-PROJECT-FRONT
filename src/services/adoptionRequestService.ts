import type {
  AdoptionRequestMessageResponse,
  AdoptionRequestResponse,
  CreateAdoptionRequestMessageRequest,
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

export async function getMyAdoptionHistory(): Promise<
  PagedResponse<AdoptionRequestResponse>
> {
  const response =
    await api.get<PagedResponse<AdoptionRequestResponse>>(
      '/adoption-requests/adoption-history',
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

export async function getAdoptionRequestMessages(
  adoptionRequestId: number,
): Promise<PagedResponse<AdoptionRequestMessageResponse>> {
  const response = await api.get<PagedResponse<AdoptionRequestMessageResponse>>(
    `/adoption-requests/${adoptionRequestId}/messages`,
  )

  return response.data
}

export async function sendAdoptionRequestMessage(
  adoptionRequestId: number,
  request: CreateAdoptionRequestMessageRequest,
): Promise<AdoptionRequestMessageResponse> {
  const response = await api.post<AdoptionRequestMessageResponse>(
    `/adoption-requests/${adoptionRequestId}/messages`,
    request,
  )

  return response.data
}
