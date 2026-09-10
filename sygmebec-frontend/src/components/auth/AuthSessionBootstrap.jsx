import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'

/**
 * The administration area deliberately starts unauthenticated.  A browser
 * refresh cookie must not open the dashboard by itself: the user always sees
 * the login screen first, then the successful login redirects to the
 * dashboard.
 */
export default function AuthSessionBootstrap({ children }) {
  const markAuthReady = useAuthStore((state) => state.markAuthReady)

  useEffect(() => {
    markAuthReady()
  }, [markAuthReady])

  return children
}
