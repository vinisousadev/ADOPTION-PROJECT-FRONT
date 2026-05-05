export type FeedPostResponse = {
  id: number
  authorUserId: number
  authorName: string
  authorProfilePhotoUrl?: string
  authorRoleLabel?: string
  content: string
  imageUrl?: string
  videoUrl?: string
  animalId?: number
  animalName?: string
  createdAt: string
  likeCount: number
  commentCount: number
  likedByCurrentUser: boolean
}

export type FeedPostLikeResponse = {
  feedPostId: number
  userId: number
  liked: boolean
  likeCount: number
}

export type FeedPostCommentResponse = {
  id: number
  feedPostId: number
  authorUserId: number
  authorName: string
  authorProfilePhotoUrl?: string
  authorRoleLabel?: string
  content: string
  createdAt: string
  updatedAt?: string
}

export type CreateFeedPostCommentRequest = {
  content: string
}

export type CreateFeedPostRequest = {
  content: string
  animalId?: number
}

export type PatchFeedPostRequest = Partial<CreateFeedPostRequest>
