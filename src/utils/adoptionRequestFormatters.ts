import type { AdoptionRequestStatus } from '../types'

const statusLabels: Record<AdoptionRequestStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  CANCELLED: 'Cancelada',
}

export function formatAdoptionRequestStatus(status: AdoptionRequestStatus) {
  return statusLabels[status] ?? status
}

export function formatDateTime(value: string | undefined) {
  if (!value) {
    return 'Nao informado'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatRequestLocation(city?: string, state?: string) {
  if (city && state) {
    return `${city} - ${state}`
  }

  return city || state || 'Nao informada'
}
