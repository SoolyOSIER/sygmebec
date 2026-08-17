import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { lettresApi } from '../api/lettresApi'

const errorMessage = (error, fallback) => {
  const data = error.response?.data
  if (data?.detail) return data.detail
  const value = data && typeof data === 'object' && Object.values(data).find((item) => Array.isArray(item))
  return value?.[0] || fallback
}

export const useLettres = (params = {}) => useQuery({
  queryKey: ['lettres', params],
  queryFn: () => lettresApi.getAll(params).then((response) => response.data),
})

export const useCreateLettre = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: lettresApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lettres'] })
      toast.success('Lettre enregistrée avec succès.')
    },
    onError: (error) => toast.error(errorMessage(error, 'Impossible d’enregistrer la lettre.')),
  })
}

export const useDownloadLettre = () => useMutation({
  mutationFn: lettresApi.download,
  onSuccess: (response) => {
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'lettre.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
  onError: () => toast.error('Impossible de télécharger la lettre.'),
})
