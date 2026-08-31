// ============================================
// src/router/RoleRoute.jsx
// ============================================
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { hasMinRole } from '../utils/roleHierarchy'

export default function RoleRoute({ requiredRole }) {
  const { role, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasMinRole(role, requiredRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}