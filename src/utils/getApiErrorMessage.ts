import axios from 'axios'
import type { ApiErrorResponse } from '../types'

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const errorData = error.response?.data

    if (errorData?.fields) {
      return Object.entries(errorData.fields)
        .map(([field, message]) => `${field}: ${message}`)
        .join(' | ')
    }

    return errorData?.message ?? 'Nao foi possivel concluir a acao.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Nao foi possivel concluir a acao.'
}
