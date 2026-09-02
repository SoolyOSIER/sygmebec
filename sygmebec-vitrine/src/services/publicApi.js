import api from './api'

export const toMediaUrl = (path) => {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) return path
  return `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${path}`
}

export const publicApi = {
  getEvents: (params) => api.get('/public/evenements/', { params }),
  getEvent: (eventId) => api.get(`/public/evenements/${eventId}/`),
  registerForEvent: (eventId, payload) => api.post(`/public/evenements/${eventId}/inscription/`, payload),
  submitAdhesion: (payload) => api.post('/public/adhesion/', payload),
  submitContact: (payload) => api.post('/public/contact/', payload),
  getGallery: (params) => api.get('/public/galerie/', { params }),
  getDailyVerse: () => api.get('/public/verset-du-jour/'),
}

export const memberApi = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  refresh: () => api.post('/auth/token/refresh/'),
  getCurrentUser: () => api.get('/auth/me/'),
  getProfile: () => api.get('/auth/me/profile/'),
  updateProfile: (payload) => api.patch('/auth/me/profile/', payload),
  changePassword: (payload) => api.post('/auth/me/change-password/', payload),
  getRegistrations: () => api.get('/membre/mes-inscriptions/'),
}
