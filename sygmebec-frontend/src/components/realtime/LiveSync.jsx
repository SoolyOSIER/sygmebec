import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axiosClient'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'

const list = (value) => value?.results || value || []

const isOwnProfile = (entry, user) => (
  entry.content_type === 'Membre'
  && entry.action === 'update'
  && String(entry.object_id) === String(user?.membre?.id)
  && String(entry.actor?.id) === String(user?.id)
)

const notificationText = (entry, user) => {
  if (isOwnProfile(entry, user)) return 'Votre profil a été mis à jour.'
  const type = entry.content_type === 'Membre' ? 'membre' : entry.content_type === 'Evenement' ? 'événement' : String(entry.content_type || 'élément').toLowerCase()
  const action = { create: 'créé', update: 'mis à jour', delete: 'placé dans la corbeille', restore: 'restauré' }[entry.action] || 'mis à jour'
  return `${type[0].toUpperCase()}${type.slice(1)} ${action} : ${entry.object_repr || 'élément du registre'}`
}

const toNotification = (entry, user) => ({
  id: `audit-${entry.id}`,
  title: entry.action === 'restore' ? 'Élément restauré' : entry.action === 'delete' ? 'Élément en corbeille' : entry.action === 'create' ? 'Nouvelle activité' : 'Mise à jour',
  text: notificationText(entry, user),
  date: entry.timestamp,
  action: entry.action,
  contentType: entry.content_type,
  objectId: entry.object_id,
  ...(isOwnProfile(entry, user) ? { title: 'Profil mis à jour', category: 'profile' } : { category: 'activity' }),
})

export default function LiveSync() {
  const queryClient = useQueryClient()
  const previousIds = useRef(null)
  const channel = useRef(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const setNotifications = useNotificationStore((state) => state.setNotifications)
  const { data } = useQuery({
    queryKey: ['live-activity'],
    queryFn: () => api.get('/audit-logs/', { params: { page_size: 25 } }).then((response) => response.data),
    staleTime: 0,
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
    retry: 1,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      previousIds.current = null
      setNotifications([])
    }
  }, [isAuthenticated, setNotifications])

  useEffect(() => {
    if (!isAuthenticated || !('BroadcastChannel' in window)) return undefined
    channel.current = new BroadcastChannel('sygmebec-live-sync')
    channel.current.onmessage = () => queryClient.invalidateQueries({ queryKey: ['live-activity'] })
    const handleLocalChange = () => queryClient.invalidateQueries({ queryKey: ['live-activity'] })
    window.addEventListener('sygmebec:data-changed', handleLocalChange)
    return () => { channel.current?.close(); window.removeEventListener('sygmebec:data-changed', handleLocalChange) }
  }, [isAuthenticated, queryClient])

  useEffect(() => {
    const entries = list(data)
    if (!entries.length) return
    const notifications = entries.map((entry) => toNotification(entry, user))
    setNotifications(notifications)
    const ids = new Set(notifications.map((item) => item.id))
    if (previousIds.current === null) {
      previousIds.current = ids
      return
    }
    const newItems = notifications.filter((item) => !previousIds.current.has(item.id))
    if (!newItems.length) return
    previousIds.current = ids
    newItems.slice(0, 3).reverse().forEach((item) => toast(item.text, { icon: '🔔' }))
    channel.current?.postMessage({ type: 'activity' })
    queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== 'live-activity' })
  }, [data, queryClient, setNotifications, user])

  return null
}
