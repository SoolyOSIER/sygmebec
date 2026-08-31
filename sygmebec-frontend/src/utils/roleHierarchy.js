// ============================================
// src/utils/roleHierarchy.js
// ============================================
export const ROLE_HIERARCHY = {
  SECRETAIRE: 1,
  PASTEUR: 2,
  ADMINISTRATEUR: 3,
}

export const hasMinRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const canDelete = (userRole) => {
  return hasMinRole(userRole, 'PASTEUR')
}

export const canManageUsers = (userRole) => {
  return userRole === 'ADMINISTRATEUR'
}

export const getRoleLabel = (role) => {
  const labels = {
    SECRETAIRE: 'Secrétaire',
    PASTEUR: 'Pasteur',
    ADMINISTRATEUR: 'Administrateur',
  }
  return labels[role] || role
}