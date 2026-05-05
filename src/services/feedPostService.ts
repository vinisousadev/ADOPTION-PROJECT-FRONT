import type {
  CreateFeedPostCommentRequest,
  CreateFeedPostRequest,
  FeedPostCommentResponse,
  FeedPostLikeResponse,
  FeedPostResponse,
  PatchFeedPostRequest,
  PagedResponse,
} from '../types'
import { api } from './api'

export async function getFeedPosts(): Promise<PagedResponse<FeedPostResponse>> {
  const response = await api.get<PagedResponse<FeedPostResponse>>('/feed-posts')

  return response.data
}

export async function createFeedPost(
  request: CreateFeedPostRequest,
): Promise<FeedPostResponse> {
  const response = await api.post<FeedPostResponse>('/feed-posts', request)

  return response.data
}

export async function uploadFeedPostPhoto(
  id: number,
  file: File,
): Promise<FeedPostResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<FeedPostResponse>(
    `/feed-posts/${id}/photo`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function likeFeedPost(id: number): Promise<FeedPostLikeResponse> {
  const response = await api.post<FeedPostLikeResponse>(
    `/feed-posts/${id}/likes`,
  )

  return response.data
}

export async function unlikeFeedPost(
  id: number,
): Promise<FeedPostLikeResponse> {
  const response = await api.delete<FeedPostLikeResponse>(
    `/feed-posts/${id}/likes`,
  )

  return response.data
}

export async function getFeedPostComments(
  id: number,
  page = 0,
  size = 5,
): Promise<PagedResponse<FeedPostCommentResponse>> {
  const response = await api.get<PagedResponse<FeedPostCommentResponse>>(
    `/feed-posts/${id}/comments`,
    {
      params: { page, size },
    },
  )

  return response.data
}

export async function createFeedPostComment(
  id: number,
  request: CreateFeedPostCommentRequest,
): Promise<FeedPostCommentResponse> {
  const response = await api.post<FeedPostCommentResponse>(
    `/feed-posts/${id}/comments`,
    request,
  )

  return response.data
}

export async function patchFeedPost(
  id: number,
  request: PatchFeedPostRequest,
): Promise<FeedPostResponse> {
  const response = await api.patch<FeedPostResponse>(
    `/feed-posts/${id}`,
    request,
  )

  return response.data
}

export async function deleteFeedPost(id: number): Promise<void> {
  await api.delete(`/feed-posts/${id}`)
}
