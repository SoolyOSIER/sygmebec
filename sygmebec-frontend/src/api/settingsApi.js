import api from './axiosClient'
export const settingsApi = {
  get: (path) => {
    const [pathname, query] = path.split('?')
    const endpoint = `settings/${pathname.replace(/\/$/, '')}/${query ? `?${query}` : ''}`
    return api.get(endpoint).then((response) => response.data)
  },
  save: (path, data) => api.patch(`settings/${path}/`, data).then(r => r.data),
  act: (path, data) => api.post(`settings/${path}/`, data).then(r => r.data),
}
export async function downloadFile(path, name, params) {
  const { data } = await api.get(path, { params, responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function apiError(error) {
  const data = error.response?.data
  const detail = data?.detail || data?.error?.data || data?.error?.message || data?.error || data
  return typeof detail === 'string' ? detail : detail ? JSON.stringify(detail) : 'Connexion au serveur impossible. Réessayez.'
}
