// src/components/home/PresentationSection.jsx
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Bell, 
  ChartLine, 
  FileDown, 
  Lock,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

const features = [
  {
    icon: Users,
    title: 'Gestion des Membres',
    description: 'Annuaire complet, suivi des statuts, historique des participations et gestion des rôles.',
    color: 'from-primary-500 to-primary-700',
    badge: 'Populaire'
  },
  {
    icon: Calendar,
    title: 'Organisation d\'Événements',
    description: 'Créez, gérez et suivez vos événements. Inscriptions en ligne, capacité, liste des participants.',
    color: 'from-gold-500 to-gold-700',
    badge: 'Nouveau'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Envoyez des notifications par email et SMS pour informer vos membres des événements à venir.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: ChartLine,
    title: 'Statistiques',
    description: 'Tableaux de bord personnalisés avec indicateurs clés pour suivre votre communauté.',
    color: 'from-green-500 to-green-700',
  },
  {
    icon: FileDown,
    title: 'Exports',
    description: 'Exportez l\'annuaire de vos membres et les listes de participants en quelques clics.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: Lock,
    title: 'Sécurité & Conformité',
    description: 'Authentification sécurisée, gestion des rôles et conformité RGPD pour la protection des données.',
    color: 'from-red-500 to-red-700',
    badge: 'Certifié'
  },
]

const PresentationSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      
      <div className="container-custom relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedSection>
            <span className="section-subtitle">
              <Sparkles className="w-4 h-4" />
              Nos Services
            </span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="section-title mt-4">
              Une Plateforme <span className="gradient-text">Complète</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              Tous les outils nécessaires pour gérer efficacement votre communauté et vos événements.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.05}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group"
              >
                <Card className="h-full hover:border-primary-200/50">
                  <CardHeader>
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      {feature.badge && (
                        <Badge variant="gold" className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-50 rounded-full border border-primary-100">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-primary-700 font-medium">
              Tous nos services sont inclus dans l'adhésion
            </span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default PresentationSection