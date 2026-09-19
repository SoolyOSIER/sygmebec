// ============================================
// src/api/authApi.js
// ============================================
import api from './axiosClient'

export const authApi = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  refresh: () => api.post('/auth/token/refresh/'),
  getMe: () => api.get('/auth/me/'),
  updateMyProfile: (data) => api.patch('/auth/me/profile/', data),
  changeMyPassword: (data) => api.post('/auth/me/change-password/', data),
}
