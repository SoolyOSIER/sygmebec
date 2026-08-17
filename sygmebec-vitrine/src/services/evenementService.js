import api from './api'

export const evenementService = {
  getEvenements: async (params = {}) => {
    const { data } = await api.get('/public/evenements/', { params })
    return data.results ?? data
  },
  getEvenementById: async (id) => {
    const { data } = await api.get(`/public/evenements/${id}/`)
    return data
  },
  inscrire: async (id, payload) => {
    const { data } = await api.post(`/public/evenements/${id}/inscription/`, payload)
    return data
  },
  getMesInscriptions: async () => {
    const { data } = await api.get('/membre/mes-inscriptions/')
    return data.results ?? data
  },
}
