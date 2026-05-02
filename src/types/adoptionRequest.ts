export type AdoptionRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export type CreateAdoptionRequest = {
  message?: string
  animalId: number
}

export type AdoptionRequestResponse = {
  id: number
  message?: string
  status: AdoptionRequestStatus
  requestDate: string
  responseDate?: string
  animalId: number
  userId: number
}
