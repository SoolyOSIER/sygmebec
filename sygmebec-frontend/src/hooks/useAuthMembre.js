// src/hooks/useAuthMembre.js
import { useSelector } from 'react-redux'

export const useAuthMembre = () => {
  const { isAuthenticated, user, token, loading } = useSelector((state) => state.authMembre)

  const roles = {
    isAdmin: user?.role === 'ADMIN',
    isSecretaire: user?.role === 'SECRETAIRE' || user?.role === 'ADMIN',
    isResponsable: user?.role === 'RESPONSABLE' || user?.role === 'ADMIN',
    isMembre: user?.role === 'MEMBRE' || user?.role === 'ADMIN' || user?.role === 'RESPONSABLE' || user?.role === 'SECRETAIRE',
  }

  const hasRole = (role) => {
    if (!user) return false
    if (role === 'ADMIN') return user.role === 'ADMIN'
    if (role === 'SECRETAIRE') return user.role === 'SECRETAIRE' || user.role === 'ADMIN'
    if (role === 'RESPONSABLE') return user.role === 'RESPONSABLE' || user.role === 'ADMIN'
    if (role === 'MEMBRE') return user.role === 'MEMBRE' || user.role === 'ADMIN' || user.role === 'RESPONSABLE' || user.role === 'SECRETAIRE'
    return false
  }

  return {
    isAuthenticated,
    user,
    token,
    loading,
    ...roles,
    hasRole,
  }
}