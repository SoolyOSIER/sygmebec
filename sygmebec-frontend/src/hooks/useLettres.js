import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { lettresApi } from '../api/lettresApi'

const errorMessage = (error, fallback) => {
  const data = error.response?.data
  if (data?.detail) return data.detail
  const value = data && typeof data === 'object' && Object.values(data).find((item) => Array.isArray(item))
  return value?.[0] || fallback
}

const downloadFilename = (contentDisposition, fallback) => {
  const utf8Filename = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const filename = utf8Filename || contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1]
  return filename ? decodeURIComponent(filename) : fallback
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
  mutationFn: ({ id, format }) => lettresApi.download(id, format),
  onSuccess: (response, { format }) => {
    const mimeType = format === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf'
    const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }))
    const link = document.createElement('a')
    link.href = url
    link.download = downloadFilename(response.headers?.['content-disposition'], `lettre.${format}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
  onError: () => toast.error('Impossible de télécharger la lettre.'),
})
