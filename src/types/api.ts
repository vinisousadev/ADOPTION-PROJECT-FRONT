export type PageMetadata = {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export type PagedResponse<T> = {
  content: T[]
  page: PageMetadata
}

export type ApiErrorResponse = {
  timestamp: string
  status: number
  error: string
  message: string
  fields?: Record<string, string>
}
