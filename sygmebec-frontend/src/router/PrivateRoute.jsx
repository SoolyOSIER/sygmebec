import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/** The administrative application always starts at the login screen.
 * A dashboard is only accessible after an explicit login during this visit. */
export default function PrivateRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
