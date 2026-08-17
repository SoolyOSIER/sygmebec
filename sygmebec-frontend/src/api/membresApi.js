import api from './axiosClient.js'

export const getMembres    = (params)    => api.get('/membres/', { params })
export const getMembre     = (id)        => api.get(`/membres/${id}/`)
export const createMembre  = (data)      => api.post('/membres/', data)
export const updateMembre  = (id, data)  => api.patch(`/membres/${id}/`, data)
export const deleteMembre  = (id)        => api.delete(`/membres/${id}/`)
export const changerStatut = (id, data)  => api.post(`/membres/${id}/changer-statut/`, data)

export const getStatuts    = ()          => api.get('/statuts/')
export const getFonctions  = ()          => api.get('/fonctions/')
export const getHistorique = (membreId)  => api.get('/historiques-statut/', { params: { membre: membreId } })
export const getStatistiques = ()        => api.get('/membres/statistiques/')

export const membresApi = {
  getAll: getMembres,
  getOne: getMembre,
  create: createMembre,
  update: updateMembre,
  delete: deleteMembre,
  changerStatut,
  getStatuts,
  getFonctions,
  getHistorique,
  getStatistiques,
}
