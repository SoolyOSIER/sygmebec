// src/components/home/AppelAdhesion.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Mail, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import AnimatedSection from '../ui/AnimatedSection'

const AppelAdhesion = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-primary-950" />
      
      {/* Effets de fond */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Particules flottantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="scale-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-white/80 font-medium">
                Rejoignez une communauté dynamique
              </span>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white leading-tight">
              Prêt à Rejoindre Notre <br />
              <span className="gold-gradient-text">Communauté</span> ?
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <p className="text-lg md:text-xl text-primary-100/80 mt-6 mb-10 max-w-2xl mx-auto leading-relaxed">
              Inscrivez-vous dès aujourd'hui et découvrez tous les avantages 
              de notre plateforme de gestion de membres. Une équipe dédiée vous accompagne.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.3}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/adhesion">
                <Button 
                  variant="gold" 
                  size="lg" 
                  className="group shadow-gold shadow-gold-200/20 hover:shadow-gold-200/40"
                >
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Devenir membre
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="outlineGold" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                >
                  <Mail className="w-5 h-5" />
                  Nous contacter
                </Button>
              </Link>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.4}>
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap justify-center gap-8 text-white/60 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  Sans engagement
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  Essai gratuit 30 jours
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  Support dédié
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  Annulation à tout moment
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

export default AppelAdhesion