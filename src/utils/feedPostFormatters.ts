import type { FeedPostType } from '../types'

export const feedPostTypeLabels: Record<FeedPostType, string> = {
  GENERAL: 'Atualizacao',
  ADOPTION_SUCCESS: 'Adocao realizada',
  ANIMAL_UPDATE: 'Noticia de animal',
}

export function formatFeedDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
