import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '-'

  try {
    return format(parseISO(date), pattern, { locale: fr })
  } catch {
    return '-'
  }
}

export const formatDateTime = (date) => formatDate(date, 'dd/MM/yyyy HH:mm')

export const formatRelativeTime = (date) => {
  if (!date) return '-'

  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: fr })
  } catch {
    return '-'
  }
}
