import { useEffect } from 'react'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'

/**
 * Restores the short-lived access token from the httpOnly refresh cookie.
 * This lets the dashboard accept a session opened from the public site,
 * while keeping the access token out of shared browser storage.
 */
export default function AuthSessionBootstrap({ children }) {
  const login = useAuthStore((state) => state.login)
  const markAuthReady = useAuthStore((state) => state.markAuthReady)

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      try {
        const { data: refresh } = await authApi.refresh()
        const { data: user } = await authApi.getMe()
        if (active && refresh?.access && user) {
          login(user, refresh.access)
        } else if (active) {
          markAuthReady()
        }
      } catch {
        if (active) markAuthReady()
      }
    }

    restoreSession()
    return () => { active = false }
  }, [login, markAuthReady])

  return children
}
