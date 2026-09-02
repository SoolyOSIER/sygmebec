// src/pages/espace-membre/MesInscriptions.jsx
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
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
import useT from '../../i18n/useT'

const MesInscriptions = () => {
  const { t, locale } = useT()
  const { isAuthenticated, user } = useSelector((state) => state.authMembre)
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
            {t('management.accessReserved')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('management.loginToView')}
          </p>
          <Button variant="gold" onClick={() => window.location.href = '/connexion'}>
            {t('common.login')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO title={`${t('navigation.onlineRegistrations')} - GESTMEMBRES`} />
      
      <div className="py-20">
        <div className="container-custom max-w-4xl">
          <AnimatedSection>
            <div className="mb-8">
              <span className="section-subtitle">
                <Calendar className="w-4 h-4" />
                {t('navigation.onlineRegistrations')}
              </span>
              <h1 className="section-title mt-4">
                <span className="gradient-text">{t('management.onlineTitle')}</span>
              </h1>
              <p className="text-gray-600 mt-2">
                {t('management.onlineDescription')}
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
                              {inscription.statut || t('events.registrationSuccess')}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(inscription.inscrit_le).toLocaleDateString(locale)}
                            </span>
                          </div>
                          <h3 className="text-xl font-playfair font-bold text-navy-900">
                            {inscription.evenement?.titre || t('navigation.events')}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {inscription.evenement?.date_ev || t('events.upcoming')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {inscription.evenement?.heure_ev || t('common.dateToDefine')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {inscription.evenement?.lieu || t('common.notSpecified')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="gold">
                            {t('management.places', { count: inscription.nombre_places || 1 })}
                          </Badge>
                          <Link to={`/evenement/${inscription.evenement?.id}`}>
                            <Button variant="outline" size="sm" className="group">
                              {t('management.view')}
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
                    {t('management.noRegistration')}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t('management.noRegistrationDescription')}
                  </p>
                  <Link to="/evenements">
                    <Button variant="gold">
                      {t('management.discoverEvents')}
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