// src/components/home/Temoignages.jsx
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const testimonials = [
  {
    id: 1,
    name: 'Marie Dupont',
    role: 'Présidente d\'association',
    content: 'Une plateforme exceptionnelle qui a transformé notre gestion associative. L\'organisation des événements n\'a jamais été aussi simple.',
    rating: 5,
    initials: 'MD',
    color: 'from-primary-600 to-primary-400'
  },
  {
    id: 2,
    name: 'Jean Lefèvre',
    role: 'Secrétaire général',
    content: 'La gestion des membres est devenue un jeu d\'enfant. Le suivi des statuts et des participations est très intuitif.',
    rating: 5,
    initials: 'JL',
    color: 'from-gold-500 to-gold-300'
  },
  {
    id: 3,
    name: 'Sophie Martin',
    role: 'Responsable événementiel',
    content: 'Les notifications par email et SMS nous ont permis d\'augmenter significativement la participation à nos événements.',
    rating: 5,
    initials: 'SM',
    color: 'from-green-500 to-green-300'
  },
  {
    id: 4,
    name: 'Pierre Dubois',
    role: 'Membre actif',
    content: 'Interface intuitive et fonctionnalités complètes. Je recommande vivement à toutes les associations.',
    rating: 5,
    initials: 'PD',
    color: 'from-purple-500 to-purple-300'
  },
  {
    id: 5,
    name: 'Isabelle Moreau',
    role: 'Trésorière',
    content: 'Un outil indispensable pour notre association. La gestion des adhésions et des événements n\'a jamais été aussi fluide.',
    rating: 5,
    initials: 'IM',
    color: 'from-pink-500 to-pink-300'
  }
]

const Temoignages = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <div className="container-custom relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedSection>
            <span className="section-subtitle">
              <Star className="w-4 h-4 fill-current" />
              Témoignages
            </span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="section-title mt-4">
              Ce qu'ils <span className="gradient-text">Disent</span> de Nous
            </h2>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-white rounded-3xl p-8 shadow-elegant hover:shadow-premium transition-all duration-500 border border-gray-100 h-full relative group"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-primary-100 to-gold-100 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Quote className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="flex text-gold-400 gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-600 italic leading-relaxed mb-6 text-lg">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-semibold text-navy-900 text-lg">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Temoignages