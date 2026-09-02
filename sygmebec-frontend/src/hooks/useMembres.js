// ============================================
// src/hooks/useMembres.js - Version complète
// ============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { membresApi } from '../api/membresApi'

const getApiErrorMessage = (error, fallback) => {
  const responseData = error.response?.data
  const details = responseData?.error?.data || responseData
  const message = responseData?.error?.message || responseData?.message || responseData?.detail

  if (typeof message === 'string') return message

  if (details && typeof details === 'object') {
    const fieldError = Object.entries(details).find(([, value]) =>
      typeof value === 'string' || Array.isArray(value)
    )
    if (fieldError) {
      const [field, value] = fieldError
      const text = Array.isArray(value) ? value.join(' ') : value
      return `${field}: ${text}`
    }
  }

  return fallback
}

export const useMembres = (params = {}) => {
  return useQuery({
    queryKey: ['membres', params],
    queryFn: () => membresApi.getAll(params).then((res) => res.data),
    staleTime: 2 * 60 * 1000,
  })
}

export const useMembre = (id) => {
  return useQuery({
    queryKey: ['membre', id],
    queryFn: () => membresApi.getOne(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useStatuts = () => {
  return useQuery({
    queryKey: ['statuts'],
    queryFn: () => membresApi.getStatuts().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  })
}

export const useFonctions = () => {
  return useQuery({
    queryKey: ['fonctions'],
    queryFn: () => membresApi.getFonctions().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  })
}

export const useCreateMembre = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: membresApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
      queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      toast.success('Membre créé avec succès 🎉')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la création'))
    },
  })
}

export const useUpdateMembre = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => membresApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
      queryClient.invalidateQueries({ queryKey: ['membre', id] })
      queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      toast.success('Membre modifié avec succès ✨')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la modification'))
    },
  })
}

export const useDeleteMembre = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: membresApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
      queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      toast.success('Membre déplacé dans la corbeille.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}

export const useChangerStatut = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => membresApi.changerStatut(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['membres'] })
      queryClient.invalidateQueries({ queryKey: ['membre', id] })
      queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      toast.success('Statut modifié avec succès 🔄')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors du changement de statut'))
    },
  })
}

export const useCreateFonction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: membresApi.createFonction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fonctions'] })
      toast.success('Fonction ajoutée avec succès.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Impossible d'ajouter cette fonction."))
    },
  })
}

export const useMembreStatistiques = () => {
  return useQuery({
    queryKey: ['membres-statistiques'],
    queryFn: () => membresApi.getStatistiques().then((res) => res.data),
    staleTime: 2 * 60 * 1000,
  })
}
