import type { NotificationResponse, PagedResponse } from '../types'
import { api } from './api'

export async function getNotifications(): Promise<
  PagedResponse<NotificationResponse>
> {
  const response = await api.get<PagedResponse<NotificationResponse>>(
    '/notifications',
    {
      params: {
        page: 0,
        size: 8,
      },
    },
  )

  return response.data
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<{ count: number }>(
    '/notifications/unread-count',
  )

  return response.data.count
}

export async function markNotificationAsRead(
  id: number,
): Promise<NotificationResponse> {
  const response = await api.patch<NotificationResponse>(
    `/notifications/${id}/read`,
  )

  return response.data
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch('/notifications/read-all')
}
