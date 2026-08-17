// src/pages/EvenementDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  Heart,
  Download,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-toastify'
import SEO from '../components/common/SEO'
import Loader from '../components/common/Loader'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { evenementService } from '../services/evenementService'
import { adhesionService } from '../services/adhesionService'

const EvenementDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evenement, setEvenement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inscriptionLoading, setInscriptionLoading] = useState(false)
  const [isInscrit, setIsInscrit] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    nombre_places: 1
  })

  useEffect(() => {
    const fetchEvenement = async () => {
      try {
        const data = await evenementService.getEvenementById(id)
        setEvenement(data)
      } catch (error) {
        console.error('Erreur:', error)
        toast.error('Événement non trouvé')
        navigate('/evenements')
      } finally {
        setLoading(false)
      }
    }
    fetchEvenement()
  }, [id, navigate])

  const handleInscription = async (e) => {
    e.preventDefault()
    setInscriptionLoading(true)
    try {
      await evenementService.inscrire(id, formData)
      setIsInscrit(true)
      toast.success('Inscription réussie !')
    } catch (error) {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setInscriptionLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!evenement) return null

  const { titre, lieu, date_ev, heure_ev, description, responsable, capacite_max } = evenement

  return (
    <>
      <SEO 
        title={`${titre} - GESTMEMBRES`}
        description={description?.slice(0, 160)}
      />
      
      <div className="py-20">
        <div className="container-custom">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <div className="relative rounded-3xl overflow-hidden shadow-elegant mb-8">
                  <img
                    src={evenement.image_bandeau || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2070'}
                    alt={titre}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge variant="gold" className="mb-3">
                      Événement
                    </Badge>
                    <h1 className="text-4xl font-playfair font-bold text-white">{titre}</h1>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-2xl font-playfair font-bold text-navy-900 mb-4">
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {description || 'Aucune description disponible.'}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2} className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations pratiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-gray-600">{date_ev}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Heure</div>
                        <div className="text-gray-600">{heure_ev}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Lieu</div>
                        <div className="text-gray-600">{lieu}</div>
                      </div>
                    </div>
                    {responsable && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Organisateur</div>
                          <div className="text-gray-600">{responsable.nom} {responsable.prenom}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Sidebar - Inscription */}
            <div>
              <AnimatedSection>
                <Card className="sticky top-28">
                  <CardHeader>
                    <CardTitle>Inscription</CardTitle>
                    <CardDescription>
                      {capacite_max ? (
                        <span className="flex items-center gap-2 text-success-600">
                          <CheckCircle className="w-4 h-4" />
                          Places disponibles
                        </span>
                      ) : (
                        <span className="text-gray-500">Capacité illimitée</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isInscrit ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center text-success-600 mx-auto mb-4">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="font-semibold text-navy-900 mb-2">Inscription confirmée !</h4>
                        <p className="text-sm text-gray-500">
                          Vous recevrez une confirmation par email.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleInscription} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.prenom}
                            onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de places
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={capacite_max || 10}
                            value={formData.nombre_places}
                            onChange={(e) => setFormData({...formData, nombre_places: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="gold"
                          className="w-full"
                          disabled={inscriptionLoading}
                        >
                          {inscriptionLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Inscription en cours...
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4" />
                              S'inscrire
                            </>
                          )}
                        </Button>
                      </form>
                    )}
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

export default EvenementDetail