// ============================================
// src/hooks/useAuth.js
// ============================================
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { settingsApi } from '../api/settingsApi'
import { applyPreferences } from '../components/ui/PreferenceSync'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      const { access, user } = response.data
      login(user, access)
      toast.success('Bienvenue dans SYGMEBEC!')
      try {
        const prefs = await settingsApi.get('me')
        applyPreferences(prefs.data, prefs.organization_theme)
        navigate(prefs.data.landing_page || '/')
      } catch { navigate('/') }
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
