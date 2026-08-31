// src/pages/Adhesion.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle,
  ArrowRight,
  Shield,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-toastify'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { adhesionService } from '../services/adhesionService'

const Adhesion = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    sexe: '',
    fonction: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adhesionService.demanderAdhesion(formData)
      toast.success('Votre demande d\'adhésion a été envoyée avec succès !')
      navigate('/')
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande")
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: Users,
      title: 'Accès à la communauté',
      description: 'Rejoignez une communauté dynamique de membres engagés.'
    },
    {
      icon: Calendar,
      title: 'Événements exclusifs',
      description: 'Accédez à tous nos événements et ateliers.'
    },
    {
      icon: Shield,
      title: 'Sécurité des données',
      description: 'Vos données sont protégées et confidentielles.'
    },
    {
      icon: Sparkles,
      title: 'Avantages membres',
      description: 'Bénéficiez de tarifs préférentiels et d\'offres exclusives.'
    }
  ]

  return (
    <>
      <SEO 
        title="Adhésion - GESTMEMBRES"
        description="Rejoignez notre communauté en quelques clics. Remplissez le formulaire d'adhésion en ligne."
      />
      
      <div className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <AnimatedSection>
                <span className="section-subtitle">
                  <Users className="w-4 h-4" />
                  Adhésion
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <h1 className="section-title mt-4 mb-4">
                  Rejoignez <span className="gradient-text">Notre Communauté</span>
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-gray-600 text-lg mb-8">
                  Remplissez le formulaire ci-dessous pour faire partie de notre communauté.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            required
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            required
                            value={formData.prenom}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          required
                          value={formData.telephone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        <input
                          type="text"
                          name="adresse"
                          value={formData.adresse}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de naissance
                          </label>
                          <input
                            type="date"
                            name="date_naissance"
                            value={formData.date_naissance}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sexe
                          </label>
                          <select
                            name="sexe"
                            value={formData.sexe}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          >
                            <option value="">Sélectionner</option>
                            <option value="M">Homme</option>
                            <option value="F">Femme</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fonction / Poste
                        </label>
                        <input
                          type="text"
                          name="fonction"
                          value={formData.fonction}
                          onChange={handleChange}
                          placeholder="Ex: Président, Trésorier, Membre..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message (optionnel)
                        </label>
                        <textarea
                          name="message"
                          rows="3"
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
                          placeholder="Dites-nous pourquoi vous souhaitez rejoindre notre communauté..."
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          'Envoi en cours...'
                        ) : (
                          <>
                            Envoyer ma demande
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-400 text-center mt-4">
                        En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Information Sidebar */}
            <div>
              <AnimatedSection>
                <div className="sticky top-28 space-y-6">
                  <Card className="bg-gradient-to-br from-primary-900 to-navy-900 text-white">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-playfair font-bold mb-4">
                        Pourquoi adhérer ?
                      </h3>
                      <div className="space-y-4">
                        {benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <benefit.icon className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold">{benefit.title}</h4>
                              <p className="text-primary-100/70 text-sm">{benefit.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-navy-900 mb-4">Contactez-nous</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-primary-600" />
                          contact@gestmembres.com
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-primary-600" />
                          +33 1 23 45 67 89
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-primary-600" />
                          Paris, France
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-navy-900">Déjà membre ?</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Connectez-vous pour accéder à votre espace personnel.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/connexion')}
                        >
                          Se connecter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Adhesion