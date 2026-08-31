// ============================================
// src/pages/ProfilePage.jsx - Nouveau
// ============================================
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { getRoleLabel } from '../utils/roleHierarchy'
import { formatDate } from '../utils/formatDate'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import AnimatedCard from '../components/ui/AnimatedCard'
import api from '../api/axiosClient'
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiTag, FiCamera } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, role, setUser } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !user?.membre?.id) return

    const formData = new FormData()
    formData.append('photo', file)

    setIsUploading(true)
    setUploadMessage('')

    try {
      const response = await api.patch(`/membres/${user.membre.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const updatedUser = { ...user, membre: { ...user.membre, photo: response.data.photo } }
      setUser(updatedUser)
      setUploadMessage('Photo mise à jour avec succès.')
    } catch (error) {
      setUploadMessage('Erreur lors du téléchargement de la photo.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-secondary-400">Chargement du profil...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Mon profil</h1>
        <p className="text-secondary-500 mt-1">Informations personnelles et paramètres du compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <AnimatedCard className="lg:col-span-1">
          <div className="text-center">
            <div className="relative mx-auto w-fit">
              <Avatar
                name={user.membre?.nom || user.identifiant}
                src={user.membre?.photo || null}
                size="xl"
                className="mx-auto"
              />
              {role === 'ADMINISTRATEUR' && user?.membre?.id && (
                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700">
                  <FiCamera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-secondary-900">
              {user.membre?.nom} {user.membre?.prenom || ''}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant="info">{getRoleLabel(role)}</Badge>
              {user.is_active ? (
                <Badge variant="success">Actif</Badge>
              ) : (
                <Badge variant="danger">Inactif</Badge>
              )}
            </div>
            <p className="text-sm text-secondary-400 mt-2">
              Membre depuis le {formatDate(user.date_creation_compte)}
            </p>
            {uploadMessage && (
              <p className={`text-xs mt-2 ${uploadMessage.includes('Erreur') ? 'text-danger' : 'text-success'}`}>
                {uploadMessage}
              </p>
            )}
            {isUploading && (
              <p className="text-xs text-secondary-400 mt-2">Téléchargement en cours...</p>
            )}
            {user.dernier_acces && (
              <p className="text-xs text-secondary-400 mt-1">
                Dernière connexion: {formatDate(user.dernier_acces, 'dd/MM/yyyy HH:mm')}
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            {user.membre?.email && (
              <div className="flex items-center gap-3 text-secondary-600">
                <FiMail className="text-secondary-400" />
                <span>{user.membre.email}</span>
              </div>
            )}
            {user.membre?.telephone && (
              <div className="flex items-center gap-3 text-secondary-600">
                <FiPhone className="text-secondary-400" />
                <span>{user.membre.telephone}</span>
              </div>
            )}
            {user.membre?.adresse && (
              <div className="flex items-center gap-3 text-secondary-600">
                <FiMapPin className="text-secondary-400" />
                <span>{user.membre.adresse}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-secondary-600">
              <FiUser className="text-secondary-400" />
              <span>Identifiant: {user.identifiant}</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Details */}
        <AnimatedCard className="lg:col-span-2" delay={0.1}>
          <h3 className="font-semibold text-secondary-900 mb-4">Informations détaillées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <label className="text-xs text-secondary-400 uppercase tracking-wider">Nom complet</label>
              <p className="text-secondary-900 font-medium">
                {user.membre?.nom} {user.membre?.prenom || ''}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <label className="text-xs text-secondary-400 uppercase tracking-wider">Rôle</label>
              <p className="text-secondary-900 font-medium">
                {getRoleLabel(role)}
              </p>
            </div>
            {user.membre?.date_naissance && (
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Date de naissance</label>
                <p className="text-secondary-900 font-medium">
                  {formatDate(user.membre.date_naissance)}
                </p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-gray-50">
              <label className="text-xs text-secondary-400 uppercase tracking-wider">Statut du compte</label>
              <p className="text-secondary-900 font-medium">
                {user.is_active ? 'Actif ✅' : 'Inactif ❌'}
              </p>
            </div>
            {user.membre?.fonctions?.length > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 md:col-span-2">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Fonctions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.membre.fonctions.map((f) => (
                    <Badge key={f.id} variant="info">{f.nomFonction}</Badge>
                  ))}
                </div>
              </div>
            )}
            {user.membre?.statut && (
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Statut du membre</label>
                <div className="mt-1">
                  <Badge variant={user.membre.statut.libelle === 'Actif' ? 'success' : 'default'}>
                    {user.membre.statut.libelle}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}
