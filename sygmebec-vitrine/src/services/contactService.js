import api from './api'

export const contactService = {
  envoyerMessage: async (payload) => {
    const { data } = await api.post('/public/contact/', payload)
    return data
  },
}
