import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/publicApi'

export const DAILY_VERSE_FALLBACK = Object.freeze({
  texte: 'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux.',
  reference: 'Matthieu 18:20',
})

export const normalizeDailyVerse = (verse) => {
  const texte = typeof verse?.texte === 'string' ? verse.texte.trim() : ''
  const reference = typeof verse?.reference === 'string' ? verse.reference.trim() : ''

  if (!texte || !reference) return DAILY_VERSE_FALLBACK

  return {
    date: verse.date,
    texte,
    reference,
  }
}

export const useVersetDuJour = () => useQuery({
  queryKey: ['verset-du-jour'],
  queryFn: () => publicApi.getDailyVerse().then(({ data }) => normalizeDailyVerse(data)),
  placeholderData: DAILY_VERSE_FALLBACK,
  staleTime: 15 * 60 * 1000,
  retry: 1,
})
