export type FeedPostType = 'GENERAL' | 'ADOPTION_SUCCESS' | 'ANIMAL_UPDATE'

export type FeedPostResponse = {
  id: number
  authorUserId: number
  authorName: string
  authorProfilePhotoUrl?: string
  animalId?: number
  animalName?: string
  animalSpecies?: string
  content: string
  imageUrl?: string
  postType: FeedPostType
  createdAt: string
}

export type CreateFeedPostRequest = {
  animalId?: number
  content: string
  imageUrl?: string
  postType?: FeedPostType
}

export type PatchFeedPostRequest = Partial<CreateFeedPostRequest>
