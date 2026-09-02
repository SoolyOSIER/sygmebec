// ============================================
// src/hooks/useEvenements.js - Version complète
// ============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { evenementsApi } from '../api/evenementsApi'

export const useEvenements = (params = {}) => {
  return useQuery({
    queryKey: ['evenements', params],
    queryFn: () => evenementsApi.getAll(params).then((res) => res.data),
    staleTime: 2 * 60 * 1000,
  })
}

export const useEvenement = (id) => {
  return useQuery({
    queryKey: ['evenement', id],
    queryFn: () => evenementsApi.getOne(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateEvenement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evenements'] })
      toast.success('Événement créé avec succès 🎉')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    },
  })
}

export const useUpdateEvenement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => evenementsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['evenements'] })
      queryClient.invalidateQueries({ queryKey: ['evenement', id] })
      toast.success('Événement modifié avec succès ✨')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    },
  })
}

export const useDeleteEvenement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evenementsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evenements'] })
      toast.success('Événement déplacé dans la corbeille.')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}

export const useTypesEvenements = () => useQuery({
  queryKey: ['types-evenements'],
  queryFn: () => evenementsApi.getTypes().then((res) => res.data),
  staleTime: 10 * 60 * 1000,
})
