export type FeedPostResponse = {
  id: number
  authorUserId: number
  authorName: string
  authorProfilePhotoUrl?: string
  authorRoleLabel?: string
  content: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  likeCount: number
  commentCount: number
  likedByCurrentUser: boolean
}

export type CreateFeedPostRequest = {
  content: string
}

export type PatchFeedPostRequest = Partial<CreateFeedPostRequest>
