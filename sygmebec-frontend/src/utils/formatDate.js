// ============================================
// src/utils/formatDate.js
// ============================================
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useUIStore } from '../store/uiStore'
import { languageLocales } from '../i18n/useT'

const currentLocale = () => languageLocales[useUIStore.getState().language] || languageLocales.fr

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '-'
  try {
    return format(parseISO(date), pattern, { locale: fr })
  } catch {
    return '-'
  }
}

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export const formatRelativeTime = (date) => {
  if (!date) return '-'
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: fr })
  } catch {
    return '-'
  }
}

/** Formatage natif, adapté à la langue sélectionnée. */
export const formatLocalizedDate = (date, options = { dateStyle: 'medium' }) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  return new Intl.DateTimeFormat(currentLocale(), options).format(parsed)
}
