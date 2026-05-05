import type {
  AnimalPhotoResponse,
  CreateAnimalPhotoRequest,
  PagedResponse,
  PatchAnimalPhotoRequest,
} from '../types'
import { api } from './api'

export async function getAnimalPhotos(
  animalId: number,
): Promise<PagedResponse<AnimalPhotoResponse>> {
  const response = await api.get<PagedResponse<AnimalPhotoResponse>>(
    '/animal-photos',
    {
      params: { animalId },
    },
  )

  return response.data
}

export async function getMainAnimalPhotoUrl(animalId: number) {
  const response = await getAnimalPhotos(animalId)
  const mainPhoto =
    response.content.find((photo) => photo.isMain === 'Y') ??
    response.content[0]

  return mainPhoto?.photoUrl
}

export async function createAnimalPhoto(
  request: CreateAnimalPhotoRequest,
): Promise<AnimalPhotoResponse> {
  const response = await api.post<AnimalPhotoResponse>('/animal-photos', request)

  return response.data
}

export async function uploadAnimalPhoto(
  animalId: number,
  file: File,
  isMain: 'Y' | 'N' = 'N',
): Promise<AnimalPhotoResponse> {
  const formData = new FormData()
  formData.append('animalId', String(animalId))
  formData.append('isMain', isMain)
  formData.append('file', file)

  const response = await api.post<AnimalPhotoResponse>(
    '/animal-photos/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function patchAnimalPhoto(
  id: number,
  request: PatchAnimalPhotoRequest,
): Promise<AnimalPhotoResponse> {
  const response = await api.patch<AnimalPhotoResponse>(
    `/animal-photos/${id}`,
    request,
  )

  return response.data
}

export async function deleteAnimalPhoto(
  id: number,
): Promise<AnimalPhotoResponse> {
  const response = await api.delete<AnimalPhotoResponse>(`/animal-photos/${id}`)

  return response.data
}
