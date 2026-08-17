import axios from 'axios'

import { useMemberAuthStore } from '../store/memberAuthStore'

export const apiBaseUrl = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers?.delete?.('Content-Type')
    if (config.headers) delete config.headers['Content-Type']
  }
  const accessToken = useMemberAuthStore.getState().accessToken
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshingToken = false
let pendingRequests = []

function settlePendingRequests(error, accessToken = null) {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }
    resolve(accessToken)
  })
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isRefreshRequest = originalRequest?.url?.includes('/auth/token/refresh/')

    if (error.response?.status !== 401 || originalRequest?._retry || isRefreshRequest) {
      return Promise.reject(error)
    }

    if (refreshingToken) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject })
      }).then((accessToken) => {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    refreshingToken = true

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/token/refresh/`, {}, { withCredentials: true })
      const accessToken = response.data.access
      useMemberAuthStore.getState().setAccessToken(accessToken)
      settlePendingRequests(null, accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      useMemberAuthStore.getState().clearSession()
      settlePendingRequests(refreshError)
      return Promise.reject(refreshError)
    } finally {
      refreshingToken = false
    }
  },
)

export default api
