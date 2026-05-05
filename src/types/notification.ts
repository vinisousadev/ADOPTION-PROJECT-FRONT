export type NotificationResponse = {
  id: number
  title: string
  message: string
  type: string
  relatedEntityType?: string
  relatedEntityId?: number
  actionUrl?: string
  createdAt: string
  readAt?: string
  read: boolean
}
