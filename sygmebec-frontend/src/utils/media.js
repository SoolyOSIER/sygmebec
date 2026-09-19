/**
 * Converts a media path returned by Django into a URL the React app can use.
 * DRF usually returns an absolute URL, but this also supports relative paths.
 */
export const getMediaUrl = (value) => {
  if (!value) return undefined
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
  const origin = apiUrl.replace(/\/api\/v1\/?$/, '')
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`
}
