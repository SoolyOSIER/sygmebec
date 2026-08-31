// src/pages/APropos.jsx
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Star, 
  Award, 
  Heart, 
  Target, 
  Lightbulb,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Building2,
  Globe,
  Rocket,
  Zap,
  BookOpen,
  Gift,
  TrendingUp,
  Coffee,
  Briefcase,
  GraduationCap,
  Handshake,
  Sparkles,
  Smile,
  ThumbsUp,
  Quote
} from 'lucide-react'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'

const APropos = () => {
  const values = [
    {
      icon: Heart,
      title: 'Engagement',
      description: 'Nous nous engageons à fournir des solutions de gestion de membres de la plus haute qualité, avec un service client irréprochable et une écoute attentive de vos besoins.'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Notre quête constante d\'excellence nous pousse à innover et à améliorer continuellement nos services pour vous offrir le meilleur de la technologie.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Nous intégrons les dernières technologies pour offrir des solutions modernes, efficaces et adaptées aux défis de demain.'
    },
    {
      icon: Shield,
      title: 'Confiance',
      description: 'La confiance de nos clients est notre priorité absolue. Nous garantissons la sécurité, la fiabilité et la confidentialité de vos données.'
    }
  ]

  const team = [
    {
      name: 'Marie Dubois',
      role: 'Fondatrice & CEO',
      image: 'https://images.unsplash.com/photo-1494790108375-be9c29b29330?q=80&w=400',
      initials: 'MD',
      color: 'from-primary-600 to-primary-400',
      bio: 'Plus de 15 ans d\'expérience dans la gestion de communautés et le développement de solutions innovantes.'
    },
    {
      name: 'Jean Martin',
      role: 'Directeur Technique',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
      initials: 'JM',
      color: 'from-gold-500 to-gold-300',
      bio: 'Expert en architecture logicielle et en sécurité des données, passionné par les nouvelles technologies.'
    },
    {
      name: 'Sophie Laurent',
      role: 'Responsable Produit',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400',
      initials: 'SL',
      color: 'from-green-500 to-green-300',
      bio: 'Spécialiste en expérience utilisateur et en design thinking, elle veille à la qualité de nos solutions.'
    },
    {
      name: 'Pierre Durand',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
      initials: 'PD',
      color: 'from-purple-500 to-purple-300',
      bio: 'Développeur full-stack avec une expertise en React, Django et architecture cloud.'
    },
    {
      name: 'Emma Bernard',
      role: 'Responsable Marketing',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400',
      initials: 'EB',
      color: 'from-pink-500 to-pink-300',
      bio: 'Stratège en marketing digital et communication, elle développe notre présence et notre notoriété.'
    },
    {
      name: 'Thomas Petit',
      role: 'Support Client',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
      initials: 'TP',
      color: 'from-indigo-500 to-indigo-300',
      bio: 'Expert en relation client, il assure un support de qualité et une écoute attentive de nos utilisateurs.'
    }
  ]

  const stats = [
    { value: '10+', label: 'Ans d\'expertise', icon: Award, description: 'Plus d\'une décennie d\'innovation' },
    { value: '120+', label: 'Organisations accompagnées', icon: Users, description: 'Associations, entreprises, ONG' },
    { value: '98%', label: 'Taux de satisfaction', icon: Star, description: 'Basé sur 500+ avis clients' },
    { value: '500+', label: 'Événements organisés', icon: Calendar, description: 'Et des milliers de participants' },
    { value: '50K+', label: 'Membres gérés', icon: Users, description: 'Communautés actives et engagées' },
    { value: '4.9/5', label: 'Note moyenne', icon: Star, description: 'Sur les plateformes d\'avis' },
  ]

  const history = [
    {
      year: '2014',
      title: 'La naissance de GESTMEMBRES',
      description: 'Création de la plateforme avec la vision de simplifier la gestion des communautés et des associations.',
      icon: Rocket
    },
    {
      year: '2016',
      title: 'Première version majeure',
      description: 'Lancement de la version 2.0 avec de nouvelles fonctionnalités : gestion des événements et des inscriptions en ligne.',
      icon: Zap
    },
    {
      year: '2018',
      title: 'Expansion internationale',
      description: 'Ouverture à l\'international avec des clients dans plus de 15 pays et une équipe qui s\'agrandit.',
      icon: Globe
    },
    {
      year: '2020',
      title: 'Innovation et digitalisation',
      description: 'Intégration de nouvelles technologies : intelligence artificielle, automatisation et analytics avancés.',
      icon: TrendingUp
    },
    {
      year: '2022',
      title: 'Nouvelle ère',
      description: 'Refonte complète de la plateforme avec une nouvelle interface moderne, intuitive et accessible.',
      icon: Sparkles
    },
    {
      year: '2024',
      title: 'L\'avenir s\'écrit',
      description: 'Nous continuons d\'innover pour vous offrir le meilleur de la gestion de communautés.',
      icon: Rocket
    }
  ]

  const testimonials = [
    {
      quote: 'GESTMEMBRES a totalement transformé notre façon de gérer notre association. La plateforme est intuitive et nos membres adorent !',
      author: 'Julie Lefèvre',
      role: 'Présidente d\'association sportive',
      rating: 5
    },
    {
      quote: 'Un outil indispensable pour notre ONG. La gestion des événements et des membres n\'a jamais été aussi simple et efficace.',
      author: 'Marc Dupont',
      role: 'Directeur d\'ONG',
      rating: 5
    },
    {
      quote: 'Le support client est exceptionnel et l\'équipe est toujours à l\'écoute de nos besoins. Une véritable valeur ajoutée.',
      author: 'Sarah Martin',
      role: 'Responsable événementiel',
      rating: 5
    }
  ]

  const engagements = [
    {
      icon: Shield,
      title: 'Sécurité des données',
      description: 'Protection RGPD, chiffrement SSL, sauvegardes automatiques et authentification sécurisée.'
    },
    {
      icon: Coffee,
      title: 'Support 24/7',
      description: 'Une équipe dédiée disponible à tout moment pour vous accompagner et répondre à vos questions.'
    },
    {
      icon: BookOpen,
      title: 'Formation continue',
      description: 'Des ressources pédagogiques, des webinaires et des tutoriels pour vous former en continu.'
    },
    {
      icon: Gift,
      title: 'Mises à jour régulières',
      description: 'Des améliorations et nouvelles fonctionnalités chaque mois pour rester à la pointe.'
    }
  ]

  return (
    <>
      <SEO 
        title="À propos - GESTMEMBRES"
        description="Découvrez notre mission, nos valeurs, notre histoire et notre équipe dédiée à la gestion de membres et d'événements."
      />
      
      <div className="py-20">
        <div className="container-custom">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <AnimatedSection>
              <span className="section-subtitle">
                <Users className="w-4 h-4" />
                À propos
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h1 className="section-title mt-4 mb-6">
                Une Communauté <span className="gradient-text">Soudée</span> et <span className="gold-gradient-text">Engagée</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                GESTMEMBRES est né de la volonté de simplifier la gestion des communautés. 
                Notre plateforme réunit tous les outils nécessaires pour une gestion efficace 
                et transparente de vos membres et événements.
              </p>
            </AnimatedSection>
          </div>

          {/* Stats Section Améliorée */}
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="card-premium p-6 text-center group"
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <stat.icon className="w-6 h-6 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl md:text-3xl font-playfair font-bold gradient-text">{stat.value}</div>
                  <p className="text-xs text-gray-600 font-medium mt-1">{stat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1 hidden md:block">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <AnimatedSection>
              <Card className="h-full p-8 border-primary-200/30 hover:shadow-xl transition-shadow duration-500">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-navy-900 mb-4">Notre Mission</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Permettre aux organisations de toutes tailles de gérer efficacement leur communauté 
                  grâce à des outils simples, puissants et adaptés à leurs besoins.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Nous croyons que la technologie doit être au service de l'humain, facilitant les échanges 
                  et renforçant les liens au sein des communautés.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge-premium">Simplification</span>
                  <span className="badge-premium">Efficacité</span>
                  <span className="badge-premium">Humanité</span>
                </div>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <Card className="h-full p-8 border-gold-200/30 hover:shadow-xl transition-shadow duration-500">
                <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-300 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-navy-900 mb-4">Notre Vision</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Devenir la référence en matière de gestion de communautés en offrant une plateforme 
                  innovante, intuitive et évolutive.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Nous souhaitons permettre à chaque organisation de se concentrer sur l'essentiel : 
                  ses membres et ses projets.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge-gold">Innovation</span>
                  <span className="badge-gold">Intuition</span>
                  <span className="badge-gold">Évolution</span>
                </div>
              </Card>
            </AnimatedSection>
          </div>

          {/* Notre Histoire */}
          <div className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <AnimatedSection>
                <span className="section-subtitle">
                  <Clock className="w-4 h-4" />
                  Notre Histoire
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <h2 className="section-title mt-4">
                  Une <span className="gradient-text">Décennie</span> d'Innovation
                </h2>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-gray-600 mt-4 text-lg">
                  Découvrez les étapes clés qui ont façonné GESTMEMBRES au fil des années.
                </p>
              </AnimatedSection>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 via-gold-300 to-primary-300 transform -translate-x-1/2 hidden md:block" />
              
              <div className="space-y-8 md:space-y-0">
                {history.map((item, index) => (
                  <AnimatedSection key={index} delay={index * 0.1}>
                    <div className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className="md:w-1/2 p-4">
                        <div className={`bg-white rounded-2xl p-6 shadow-elegant hover:shadow-premium transition-all duration-500 border border-gray-100 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-primary-600">{item.year}</div>
                              <h4 className="text-lg font-playfair font-bold text-navy-900">{item.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex w-12 h-12 bg-white rounded-full border-4 border-primary-500 items-center justify-center text-primary-600 font-bold z-10">
                        {index + 1}
                      </div>
                      <div className="md:w-1/2 p-4" />
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>

          {/* Valeurs */}
          <div className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <AnimatedSection>
                <span className="section-subtitle">
                  <Heart className="w-4 h-4" />
                  Nos Valeurs
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <h2 className="section-title mt-4">
                  Ce qui nous <span className="gradient-text">Anime</span>
                </h2>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-gray-600 mt-4 text-lg">
                  Des valeurs fondamentales qui guident chacune de nos actions et décisions.
                </p>
              </AnimatedSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <AnimatedSection key={index} delay={index * 0.05}>
                  <motion.div
                    className="card-premium p-6 text-center group"
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-gradient-to-br group-hover:from-primary-600 group-hover:to-primary-400 group-hover:text-white transition-all duration-500 mx-auto mb-4 shadow-md group-hover:shadow-lg">
                      <value.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-playfair font-bold text-navy-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Engagements */}
          <div className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <AnimatedSection>
                <span className="section-subtitle">
                  <CheckCircle className="w-4 h-4" />
                  Nos Engagements
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <h2 className="section-title mt-4">
                  <span className="gradient-text">Pourquoi</span> Nous Choisir
                </h2>
              </AnimatedSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {engagements.map((engagement, index) => (
                <AnimatedSection key={index} delay={index * 0.05}>
                  <motion.div
                    className="bg-white rounded-2xl p-6 shadow-elegant hover:shadow-premium transition-all duration-500 border border-gray-100 text-center group"
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-gold-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform mx-auto mb-4">
                      <engagement.icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-playfair font-bold text-navy-900 mb-2">{engagement.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{engagement.description}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Témoignages */}
          <div className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <AnimatedSection>
                <span className="section-subtitle">
                  <Quote className="w-4 h-4" />
                  Témoignages
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <h2 className="section-title mt-4">
                  Ce qu'ils disent de <span className="gradient-text">Nous</span>
                </h2>
              </AnimatedSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <Card className="p-6 h-full flex flex-col">
                    <div className="flex text-gold-400 gap-0.5 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="font-semibold text-navy-900">{testimonial.author}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Équipe */}
          <div className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <AnimatedSection>
                <span className="section-subtitle">
                  <Users className="w-4 h-4" />
                  Notre Équipe
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <h2 className="section-title mt-4">
                  Des <span className="gradient-text">Passionnés</span> à Votre Service
                </h2>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-gray-600 mt-4 text-lg">
                  Une équipe multidisciplinaire dédiée à votre succès.
                </p>
              </AnimatedSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <AnimatedSection key={index} delay={index * 0.05}>
                  <motion.div
                    className="card-premium p-6 text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className={`w-24 h-24 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4 transition-transform group-hover:scale-105`}>
                      {member.initials}
                    </div>
                    <h4 className="text-lg font-playfair font-bold text-navy-900">{member.name}</h4>
                    <p className="text-sm text-primary-600 font-medium">{member.role}</p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{member.bio}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-r from-primary-900 via-primary-950 to-navy-900">
              {/* Background decorations */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <Sparkles className="w-12 h-12 text-gold-400 mx-auto mb-4" />
                <h3 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">
                  Prêt à Rejoindre Notre <span className="gold-gradient-text">Communauté</span> ?
                </h3>
                <p className="text-primary-100/80 mb-8 max-w-2xl mx-auto text-lg">
                  Rejoignez des centaines d'organisations qui nous font confiance pour gérer 
                  leur communauté et leurs événements.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/adhesion">
                    <Button variant="gold" size="lg" className="group shadow-xl shadow-gold-200/20 hover:shadow-gold-200/40">
                      Devenir membre
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outlineGold" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                      Nous contacter
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 text-white/50 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                    Satisfaction garantie
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                    Support dédié
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                    Sécurité des données
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                    Mises à jour gratuites
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  )
}

export default APropos