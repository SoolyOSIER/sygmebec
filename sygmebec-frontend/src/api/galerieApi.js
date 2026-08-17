import api from './axiosClient'

export const galerieApi = {
  getAll: (params) => api.get('/galerie-images/', { params }),
  create: (payload) => api.post('/galerie-images/', payload),
  delete: (id) => api.delete(`/galerie-images/${id}/`),
}
