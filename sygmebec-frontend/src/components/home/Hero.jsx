// src/components/home/Hero.jsx
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Button } from '../ui/Button'
import { Users, Calendar, Star, Crown, CheckCircle } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const Hero = () => {
  const heroRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15])
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      
      tl.from('.hero-title > *', {
        y: 100,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
      .from('.hero-description', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-actions', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-stats', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-visual', {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      }, '-=1')
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-gold-50/30" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gold-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <motion.div
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full mb-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Crown className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-semibold text-primary-700">
                Plateforme de Gestion de Membres
              </span>
              <div className="flex text-gold-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </motion.div>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold leading-[1.1] mb-6">
              <span className="block text-navy-900">Gérez vos</span>
              <span className="block gradient-text">Membres</span>
              <span className="block gold-gradient-text">et Événements</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl text-navy-600 font-medium mt-2">
                en Toute Simplicité
              </span>
            </h1>

            <p className="hero-description text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed mb-8">
              Une plateforme complète pour gérer votre communauté, organiser des événements 
              et suivre vos membres. Simple, efficace et conçu pour vous.
            </p>

            <div className="hero-actions flex flex-wrap gap-4">
              <Link to="/adhesion">
                <Button variant="gold" size="lg" className="group">
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Devenir membre
                </Button>
              </Link>
              <Link to="/evenements">
                <Button variant="outline" size="lg">
                  <Calendar className="w-5 h-5" />
                  Voir les événements
                </Button>
              </Link>
            </div>

            <div className="hero-stats flex flex-wrap gap-8 mt-8 pt-8 border-t border-gray-200">
              <motion.div
                className="group cursor-default"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="text-3xl font-playfair font-bold text-primary-700">150+</div>
                <div className="text-sm text-gray-500">Membres actifs</div>
              </motion.div>
              <motion.div
                className="group cursor-default"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="text-3xl font-playfair font-bold text-primary-700">45+</div>
                <div className="text-sm text-gray-500">Événements organisés</div>
              </motion.div>
              <motion.div
                className="group cursor-default"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="text-3xl font-playfair font-bold text-gold-500">4.9/5</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
              </motion.div>
            </div>
          </div>

          {/* Visual avec effet 3D */}
          <motion.div
            className="hero-visual relative perspective-1000"
            style={{ rotateX, rotateY }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left - rect.width / 2
              const y = e.clientY - rect.top - rect.height / 2
              mouseX.set(x)
              mouseY.set(y)
            }}
            onMouseLeave={() => {
              mouseX.set(0)
              mouseY.set(0)
            }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-premium">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070"
                alt="Équipe collaborative"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 glass text-white text-sm border border-white/20 rounded-full">
                  <CheckCircle className="w-4 h-4 text-gold-400" />
                  Plateforme certifiée
                </span>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 -right-5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">+150 membres</div>
                  <div className="text-xs text-gray-500">actifs</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 7, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-24 -left-5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl flex items-center justify-center text-gold-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">45 événements</div>
                  <div className="text-xs text-gray-500">organisés</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -25, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 8, delay: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 -right-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">4.9/5</div>
                  <div className="text-xs text-gray-500">satisfaction</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero