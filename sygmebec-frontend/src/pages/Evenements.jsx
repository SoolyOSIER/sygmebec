// src/pages/Evenements.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, MapPin, ChevronDown, X } from 'lucide-react'
import SEO from '../components/common/SEO'
import EvenementCard from '../components/evenements/EvenementCard'
import FiltresEvenements from '../components/evenements/FiltresEvenements'
import Loader from '../components/common/Loader'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { evenementService } from '../services/evenementService'

const Evenements = () => {
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtres, setFiltres] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  useEffect(() => {
    const fetchEvenements = async () => {
      setLoading(true)
      try {
        const params = { ...filtres, search: searchTerm }
        const data = await evenementService.getEvenements(params)
        setEvenements(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvenements()
  }, [filtres, searchTerm])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (newFilters) => {
    setFiltres(newFilters)
  }

  const clearFilters = () => {
    setFiltres({})
    setSearchTerm('')
  }

  const hasActiveFilters = Object.keys(filtres).length > 0 || searchTerm

  return (
    <>
      <SEO 
        title="Événements - GESTMEMBRES"
        description="Découvrez tous nos événements à venir et inscrivez-vous en quelques clics."
      />
      
      <div className="py-20">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <AnimatedSection>
              <span className="section-subtitle">
                <Calendar className="w-4 h-4" />
                Événements
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h1 className="section-title mt-4">
                Tous nos <span className="gradient-text">Événements</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-gray-600 mt-4 text-lg">
                Découvrez notre programme d'événements et inscrivez-vous en quelques clics.
              </p>
            </AnimatedSection>
          </div>

          {/* Search & Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-12 pr-4 h-12 rounded-xl border-gray-200 focus:border-primary-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {hasActiveFilters && (
                    <Badge variant="default" className="ml-1">
                      {Object.keys(filtres).length + (searchTerm ? 1 : 0)}
                    </Badge>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 transition-colors border-l border-gray-200 ${
                      viewMode === 'list' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-6 bg-white rounded-2xl shadow-elegant border border-gray-100">
                    <FiltresEvenements onFilterChange={handleFilterChange} />
                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {Object.keys(filtres).length + (searchTerm ? 1 : 0)} filtre(s) actif(s)
                        </span>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Effacer tous les filtres
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results */}
          {loading ? (
            <Loader />
          ) : evenements.length > 0 ? (
            <AnimatePresence>
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }
              >
                {evenements.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {viewMode === 'grid' ? (
                      <EvenementCard evenement={event} />
                    ) : (
                      <EvenementCardList evenement={event} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-gray-500">
                Aucun événement ne correspond à vos critères de recherche.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Effacer les filtres
                </Button>
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {evenements.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Précédent
                </Button>
                <Button variant="default" size="sm" className="w-10">1</Button>
                <Button variant="outline" size="sm" className="w-10">2</Button>
                <Button variant="outline" size="sm" className="w-10">3</Button>
                <span className="text-gray-400">...</span>
                <Button variant="outline" size="sm" className="w-10">8</Button>
                <Button variant="outline" size="sm">
                  Suivant
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Composant pour la vue liste
const EvenementCardList = ({ evenement }) => {
  const { id, titre, lieu, date_ev, heure_ev, description, image_bandeau } = evenement

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-elegant hover:shadow-premium transition-all duration-300 border border-gray-100 overflow-hidden group"
      whileHover={{ x: 5 }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={image_bandeau || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2070'}
            alt={titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="default" className="mb-2">Événement</Badge>
                <h3 className="text-xl font-playfair font-bold text-navy-900 group-hover:text-primary-700 transition-colors">
                  {titre}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-primary-700">{date_ev}</div>
                <div className="text-sm text-gray-500">{heure_ev}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {lieu}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-3 line-clamp-2">{description}</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              Inscriptions ouvertes
            </span>
            <Link to={`/evenement/${id}`}>
              <Button variant="outline" size="sm" className="group">
                S'inscrire
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Evenements