import axios from 'axios'
import { useAuthStore } from '../store/authStore.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    // Let the browser add the multipart boundary required for file uploads.
    config.headers?.delete?.('Content-Type')
    if (config.headers) delete config.headers['Content-Type']
  }

  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingQueue = []

const announceDataChange = () => {
  window.dispatchEvent(new Event('sygmebec:data-changed'))
  if (!('BroadcastChannel' in window)) return
  const channel = new BroadcastChannel('sygmebec-live-sync')
  channel.postMessage({ type: 'mutation' })
  channel.close()
}


const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => {
    if (['post', 'put', 'patch', 'delete'].includes(response.config?.method?.toLowerCase())) announceDataChange()
    return response
  },
  async (error) => {
    const original = error.config
    const isAuthenticationRequest =
      original?.url?.includes('/auth/login/') ||
      original?.url?.includes('/auth/token/refresh/')

    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !isAuthenticationRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        )
        const newToken = data.access
        useAuthStore.getState().setAccessToken(newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
