// src/pages/espace-membre/MesInscriptions.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../../components/common/SEO'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { evenementService } from '../../services/evenementService'
import { useMemberAuthStore } from '../../store/memberAuthStore'

const MesInscriptions = () => {
  const { accessToken, user } = useMemberAuthStore()
  const isAuthenticated = Boolean(accessToken && user)
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInscriptions = async () => {
      if (!isAuthenticated) return
      try {
        const data = await evenementService.getMesInscriptions()
        setInscriptions(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInscriptions()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-playfair font-bold text-navy-900 mb-4">
            Accès réservé
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour voir vos inscriptions.
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
      <SEO title="Mes inscriptions - GESTMEMBRES" />
      
      <div className="py-20">
        <div className="container-custom max-w-4xl">
          <AnimatedSection>
            <div className="mb-8">
              <span className="section-subtitle">
                <Calendar className="w-4 h-4" />
                Mes Inscriptions
              </span>
              <h1 className="section-title mt-4">
                <span className="gradient-text">Mes événements</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Retrouvez toutes vos inscriptions aux événements
              </p>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : inscriptions.length > 0 ? (
            <div className="space-y-4">
              {inscriptions.map((inscription, index) => (
                <AnimatedSection key={inscription.id} delay={index * 0.05}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-white rounded-2xl shadow-elegant border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="default">
                              {inscription.statut || 'Confirmée'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(inscription.inscrit_le).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-playfair font-bold text-navy-900">
                            {inscription.evenement?.titre || 'Événement'}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {inscription.evenement?.date_ev || 'Date à venir'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {inscription.evenement?.heure_ev || 'Horaire'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {inscription.evenement?.lieu || 'Lieu'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="gold">
                            {inscription.nombre_places || 1} place(s)
                          </Badge>
                          <Link to={`/evenement/${inscription.evenement?.id}`}>
                            <Button variant="outline" size="sm" className="group">
                              Voir
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <AnimatedSection>
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">
                    Aucune inscription
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Vous n'êtes inscrit à aucun événement pour le moment.
                  </p>
                  <Link to="/evenements">
                    <Button variant="gold">
                      Découvrir les événements
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>
      </div>
    </>
  )
}

export default MesInscriptions
