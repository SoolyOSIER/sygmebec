// ============================================
// src/hooks/useAuth.js
// ============================================
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { access, user } = response.data
      login(user, access)
      toast.success('Bienvenue dans SYGMEBEC!')
      navigate('/')
    },
    onError: (error) => {
      const response = error.response
      const message = !response
        ? 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée, puis réessayez.'
        : response.data?.detail || response.data?.error ||
          (response.status >= 500
            ? 'Le serveur a rencontré une erreur. Réessayez dans un instant.'
            : 'Connexion refusée. Vérifiez vos identifiants puis réessayez.')
      toast.error(message)
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      navigate('/login')
      toast.success('Déconnexion réussie')
    },
    onError: () => {
      logout()
      navigate('/login')
    },
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authApi.getMe()
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
