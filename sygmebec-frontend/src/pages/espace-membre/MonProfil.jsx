// src/pages/espace-membre/MonProfil.jsx
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Save, 
  Edit2, 
  Shield,
  Users,
  Crown
} from 'lucide-react'
import { toast } from 'react-toastify'
import SEO from '../../components/common/SEO'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { authMembreService } from '../../services/authMembreService'
import { updateUser } from '../../store/slices/authMembreSlice'

const MonProfil = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.authMembre)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    fonction: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        date_naissance: user.date_naissance || '',
        fonction: user.fonction || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authMembreService.updateProfile(formData)
      dispatch(updateUser(response))
      setIsEditing(false)
      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-playfair font-bold text-navy-900 mb-4">
            Accès réservé
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre profil.
          </p>
          <Button variant="gold" onClick={() => window.location.href = '/connexion'}>
            Se connecter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO title="Mon profil - GESTMEMBRES" />
      
      <div className="py-20">
        <div className="container-custom max-w-4xl">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="section-subtitle">
                  <User className="w-4 h-4" />
                  Mon Profil
                </span>
                <h1 className="section-title mt-4">
                  <span className="gradient-text">Informations personnelles</span>
                </h1>
              </div>
              <Badge variant="gold" className="text-sm px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                {user?.role || 'Membre'}
              </Badge>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <AnimatedSection>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                  <h3 className="text-xl font-playfair font-bold text-navy-900">
                    {user?.prenom} {user?.nom}
                  </h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Statut</span>
                      <Badge variant="success">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Membre depuis</span>
                      <span className="font-medium">{new Date(user?.date_creation_compte).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Form */}
            <div className="md:col-span-2">
              <AnimatedSection delay={0.1}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-navy-900">
                        {isEditing ? 'Modifier mes informations' : 'Mes informations'}
                      </h3>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            required
                            value={formData.nom}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            required
                            value={formData.prenom}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de naissance
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              name="date_naissance"
                              value={formData.date_naissance}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fonction
                          </label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              name="fonction"
                              value={formData.fonction}
                              onChange={handleChange}
                              disabled={!isEditing}
                              placeholder="Votre fonction"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <Button
                            type="submit"
                            variant="gold"
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading ? (
                              'Enregistrement...'
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setFormData({
                                nom: user.nom || '',
                                prenom: user.prenom || '',
                                email: user.email || '',
                                telephone: user.telephone || '',
                                adresse: user.adresse || '',
                                date_naissance: user.date_naissance || '',
                                fonction: user.fonction || ''
                              })
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MonProfil