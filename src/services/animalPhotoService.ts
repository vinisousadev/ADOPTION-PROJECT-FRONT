import type {
  AnimalPhotoResponse,
  CreateAnimalPhotoRequest,
  PagedResponse,
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
