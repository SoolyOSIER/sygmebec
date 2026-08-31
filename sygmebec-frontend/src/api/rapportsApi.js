// ============================================
// src/api/rapportsApi.js
// ============================================
import api from './axiosClient'

export const rapportsApi = {
  getAll: (params) => api.get('/rapports/', { params }),
  getOne: (id) => api.get(`/rapports/${id}/`),
  generate: (data) => api.post('/rapports/', data),
  download: (id) => api.get(`/rapports/${id}/telecharger/`, { responseType: 'blob' }),
}