// ============================================
// src/hooks/useUtilisateurs.js
// ============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { utilisateursApi } from '../api/utilisateursApi'

export const useUtilisateurs = (params = {}) => {
  return useQuery({
    queryKey: ['utilisateurs', params],
    queryFn: () => utilisateursApi.getAll(params).then((res) => res.data),
    staleTime: 2 * 60 * 1000,
  })
}

export const useUtilisateur = (id) => {
  return useQuery({
    queryKey: ['utilisateur', id],
    queryFn: () => utilisateursApi.getOne(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateUtilisateur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: utilisateursApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] })
      toast.success('Utilisateur créé avec succès 🎉')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    },
  })
}

export const useUpdateUtilisateur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => utilisateursApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] })
      queryClient.invalidateQueries({ queryKey: ['utilisateur', id] })
      toast.success('Utilisateur modifié avec succès ✨')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    },
  })
}

export const useDeleteUtilisateur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: utilisateursApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] })
      toast.success('Utilisateur supprimé avec succès 🗑️')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }) => utilisateursApi.resetPassword(id, data),
    onSuccess: () => {
      toast.success('Mot de passe réinitialisé avec succès.')
    },
    onError: (error) => {
      const data = error.response?.data
      const message = data?.error?.message ?? data?.detail ?? data?.message
      toast.error(Array.isArray(message) ? message.join(' ') : message || 'Erreur lors de la réinitialisation')
    },
  })
}
