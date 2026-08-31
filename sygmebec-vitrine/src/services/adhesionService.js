import api from './api'

export const adhesionService = {
  demanderAdhesion: async (payload) => {
    const { data } = await api.post('/public/adhesion/', payload)
    return data
  },
}
