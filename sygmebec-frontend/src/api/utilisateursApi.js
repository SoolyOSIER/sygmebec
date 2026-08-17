// ============================================
// src/api/utilisateursApi.js
// ============================================
import api from './axiosClient'

export const utilisateursApi = {
  getAll: (params) => api.get('/utilisateurs/', { params }),
  getOne: (id) => api.get(`/utilisateurs/${id}/`),
  create: (data) => api.post('/utilisateurs/', data),
  update: (id, data) => api.patch(`/utilisateurs/${id}/`, data),
  delete: (id) => api.delete(`/utilisateurs/${id}/`),
  resetPassword: (id, data = {}) => api.post(`/utilisateurs/${id}/reset-password/`, data),
  desactiver: (id) => api.post(`/utilisateurs/${id}/desactiver/`),
}
