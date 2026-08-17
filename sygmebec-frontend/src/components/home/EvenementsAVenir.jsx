// src/components/home/EvenementsAVenir.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { Calendar, ArrowRight, Sparkles } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import EvenementCard from '../evenements/EvenementCard'
import { evenementService } from '../../services/evenementService'
import Loader from '../common/Loader'
import AnimatedSection from '../ui/AnimatedSection'
import { Button } from '../ui/Button'

const EvenementsAVenir = () => {
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        const data = await evenementService.getEvenements({ a_venir: true, limit: 6 })
        setEvenements(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvenements()
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom text-center">
          <Loader />
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-100/30 rounded-full blur-3xl" />
      
      <div className="container-custom relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedSection>
            <span className="section-subtitle">
              <Calendar className="w-4 h-4" />
              Événements
            </span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="section-title mt-4">
              Nos <span className="gradient-text">Prochains</span> Événements
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              Découvrez les événements à venir et inscrivez-vous en quelques clics.
            </p>
          </AnimatedSection>
        </div>

        {evenements.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{ 
              delay: 5000, 
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {evenements.map((event) => (
              <SwiperSlide key={event.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EvenementCard evenement={event} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun événement à venir pour le moment.</p>
            <p className="text-gray-400 text-sm">Revenez bientôt pour découvrir nos prochains événements.</p>
          </div>
        )}

        <AnimatedSection delay={0.3} className="text-center mt-12">
          <Link to="/evenements">
            <Button variant="outline" size="lg" className="group">
              Voir tous les événements
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default EvenementsAVenir