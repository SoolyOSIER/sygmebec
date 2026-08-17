import api from './api'

export const authMembreService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login/', credentials)
    return data
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout/')
    return data
  },
  updateProfile: async (payload) => {
    const { data } = await api.patch('/auth/me/profile/', payload)
    return data
  },
  changePassword: async (payload) => {
    const { data } = await api.post('/auth/me/change-password/', payload)
    return data
  },
}
