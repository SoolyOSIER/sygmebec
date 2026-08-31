import api from './axiosClient'

export const lettresApi = {
  getAll: (params) => api.get('/lettres/', { params }),
  create: (data) => api.post('/lettres/', data),
  update: (id, data) => api.patch(`/lettres/${id}/`, data),
  remove: (id) => api.delete(`/lettres/${id}/`),
  download: (id, format) => api.get(
    format === 'pdf' ? `/lettres/${id}/telecharger/` : `/lettres/${id}/exporter/`,
    { params: format === 'pdf' ? undefined : { export_format: format }, responseType: 'blob' },
  ),
}
