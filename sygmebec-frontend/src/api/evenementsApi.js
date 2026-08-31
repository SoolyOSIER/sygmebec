import api from './axiosClient.js'

export const getEvenements    = (params)   => api.get('/evenements/', { params })
export const getEvenement     = (id)       => api.get(`/evenements/${id}/`)
export const createEvenement  = (data)     => api.post('/evenements/', data)
export const updateEvenement  = (id, data) => api.patch(`/evenements/${id}/`, data)
export const deleteEvenement  = (id)       => api.delete(`/evenements/${id}/`)
export const getEvenementsCorbeille = ()   => api.get('/evenements/corbeille/')
export const restaurerEvenement = (id)     => api.post(`/evenements/${id}/restaurer/`)
export const getTypesEvenements = ()       => api.get('/types-evenements/')

export const evenementsApi = {
  getAll: getEvenements,
  getOne: getEvenement,
  create: createEvenement,
  update: updateEvenement,
  delete: deleteEvenement,
  getCorbeille: getEvenementsCorbeille,
  restaurer: restaurerEvenement,
  getTypes: getTypesEvenements,
}
