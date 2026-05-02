export type AnimalStatus = 'AVAILABLE' | 'ADOPTED' | 'REMOVED'

export type AnimalSex = 'M' | 'F'

export type YesNo = 'Y' | 'N'

export type AgeUnit = 'MONTHS' | 'YEARS'

export type CreateAnimalRequest = {
  animalName: string
  species: string
  breed?: string
  birthDate?: string
  ageValue?: number
  ageUnit?: AgeUnit
  animalSize?: string
  sex?: AnimalSex
  weightKg?: number
  vaccinated: YesNo
  neutered: YesNo
  description?: string
}

export type PatchAnimalRequest = Partial<CreateAnimalRequest>

export type AnimalResponse = {
  id: number
  animalName: string
  species: string
  breed?: string
  birthDate?: string
  ageValue?: number
  ageUnit?: AgeUnit
  animalSize?: string
  sex?: AnimalSex
  weightKg?: number
  vaccinated: YesNo
  neutered: YesNo
  description?: string
  status: AnimalStatus
  registrationDate: string
  userId: number
  ownerName?: string
  ownerCity?: string
  ownerState?: string
}
