import type {
  CreateFeedPostRequest,
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
