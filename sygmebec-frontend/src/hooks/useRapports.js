// ============================================
// src/hooks/useRapports.js
// ============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { rapportsApi } from '../api/rapportsApi'

export const useRapports = (params = {}) => {
  return useQuery({
    queryKey: ['rapports', params],
    queryFn: () => rapportsApi.getAll(params).then((res) => res.data),
    staleTime: 2 * 60 * 1000,
  })
}

export const useRapport = (id) => {
  return useQuery({
    queryKey: ['rapport', id],
    queryFn: () => rapportsApi.getOne(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGenerateRapport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rapportsApi.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports'] })
      toast.success('Rapport généré avec succès 🎉')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la génération du rapport')
    },
  })
}

export const useDownloadRapport = () => {
  return useMutation({
    mutationFn: rapportsApi.download,
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'rapport.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Téléchargement du rapport en cours 📥')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors du téléchargement')
    },
  })
}