import type { YesNo } from './animal'

export type CreateAnimalPhotoRequest = {
  photoUrl: string
  isMain: YesNo
  animalId: number
}

export type AnimalPhotoResponse = {
  id: number
  photoUrl: string
  isMain: YesNo
  animalId: number
}
