import api from './axiosClient.js'

export const publicApi = {
  getDailyVerse: () => api.get('/public/verset-du-jour/'),
}
