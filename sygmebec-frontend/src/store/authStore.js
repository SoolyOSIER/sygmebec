import { create } from 'zustand'

export const getUserRole = (user) => {
  const rawRole =
    user?.role ||
    user?.role_acces?.nomRole ||
    user?.role_acces?.nom_role ||
    user?.role_acces?.nom ||
    user?.roleAcces?.nomRole ||
    user?.roleAcces?.nom_role ||
    (typeof user?.role_acces === 'string' ? user.role_acces : null)

  if (!rawRole) return null

  const normalized = String(rawRole)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (normalized.includes('ADMIN')) return 'ADMINISTRATEUR'
  if (normalized.includes('PASTEUR')) return 'PASTEUR'
  if (normalized.includes('SECRE')) return 'SECRETAIRE'

  return normalized
}

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  accessToken: null,
  isAuthenticated: false,

  login: (user, accessToken) =>
    set({
      user,
      role: getUserRole(user),
      accessToken,
      isAuthenticated: true,
    }),

  logout: () =>
    set({ user: null, role: null, accessToken: null, isAuthenticated: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setUser: (user) =>
    set({
      user,
      role: getUserRole(user),
      isAuthenticated: Boolean(user),
    }),
}))
