import api from './axiosClient'

export const lettresApi = {
  getAll: (params) => api.get('/lettres/', { params }),
  create: (data) => api.post('/lettres/', data),
  update: (id, data) => api.patch(`/lettres/${id}/`, data),
  remove: (id) => api.delete(`/lettres/${id}/`),
  download: (id) => api.get(`/lettres/${id}/telecharger/`, { responseType: 'blob' }),
}
