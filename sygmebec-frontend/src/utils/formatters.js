// src/utils/formatters.js
import { format, parseISO, differenceInDays, isToday, isTomorrow, isPast, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return ''
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, pattern, { locale: fr })
  } catch {
    return date
  }
}

export const formatDateTime = (date, time) => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dateStr = format(dateObj, 'dd MMMM yyyy', { locale: fr })
    if (time) {
      const [hours, minutes] = time.split(':')
      return `${dateStr} à ${hours}h${minutes}`
    }
    return dateStr
  } catch {
    return date
  }
}

export const formatTime = (time) => {
  if (!time) return ''
  try {
    const [hours, minutes] = time.split(':')
    return `${hours}h${minutes}`
  } catch {
    return time
  }
}

export const formatRelativeDate = (date) => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (isToday(dateObj)) return "Aujourd'hui"
    if (isTomorrow(dateObj)) return 'Demain'
    const days = differenceInDays(dateObj, new Date())
    if (days < 0) return `Il y a ${Math.abs(days)} jours`
    if (days > 0 && days < 7) return `Dans ${days} jours`
    return format(dateObj, 'dd MMMM yyyy', { locale: fr })
  } catch {
    return date
  }
}

export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + suffix
}

export const capitalizeFirstLetter = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export const generateSlug = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return ''
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export const getInitialsColor = (name) => {
  const colors = [
    'from-primary-600 to-primary-400',
    'from-gold-500 to-gold-300',
    'from-green-500 to-green-300',
    'from-purple-500 to-purple-300',
    'from-pink-500 to-pink-300',
    'from-indigo-500 to-indigo-300',
    'from-red-500 to-red-300',
    'from-teal-500 to-teal-300',
    'from-orange-500 to-orange-300',
    'from-cyan-500 to-cyan-300',
  ]
  if (!name) return colors[0]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export const formatNumber = (number, options = {}) => {
  return new Intl.NumberFormat('fr-FR', options).format(number)
}

export const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : (plural || singular + 's')
}