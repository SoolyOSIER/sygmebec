// src/pages/Contact.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock
} from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { contactService } from '../services/contactService'
import { validateContactForm } from '../utils/validation'

const Contact = () => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validation = validateContactForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error('Veuillez corriger les champs indiqués avant l’envoi.')
      return
    }

    setLoading(true)
    try {
      await contactService.envoyerMessage(formData)
      toast.success('Votre message a été envoyé avec succès !')
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      })
      setErrors({})
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message")
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: ['contact@gestmembres.com', 'support@gestmembres.com'],
      color: 'from-primary-600 to-primary-400'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      details: ['+33 1 23 45 67 89', '+33 1 23 45 67 90'],
      color: 'from-gold-500 to-gold-300'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      details: ['123 Avenue des Champs-Élysées', '75008 Paris, France'],
      color: 'from-green-500 to-green-300'
    },
    {
      icon: Clock,
      title: 'Horaires',
      details: ['Lun - Ven: 9h - 18h', 'Sam: 10h - 14h'],
      color: 'from-purple-500 to-purple-300'
    }
  ]

  const socialLinks = [
    { icon: FaFacebookF, url: '#', color: '#1877F2' },
    { icon: FaTwitter, url: '#', color: '#1DA1F2' },
    { icon: FaInstagram, url: '#', color: '#E4405F' },
    { icon: FaLinkedinIn, url: '#', color: '#0A66C2' },
    { icon: FaYoutube, url: '#', color: '#FF0000' },
  ]

  return (
    <>
      <SEO 
        title="Contact - GESTMEMBRES"
        description="Contactez-nous pour toute question, suggestion ou demande d'information."
      />
      
      <div className="py-20">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedSection>
              <span className="section-subtitle">
                <Mail className="w-4 h-4" />
                Contact
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h1 className="section-title mt-4">
                <span className="gradient-text">Contactez-nous</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-gray-600 mt-4 text-lg">
                Une question ? Une suggestion ? N'hésitez pas à nous contacter, 
                nous vous répondrons dans les plus brefs délais.
              </p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <AnimatedSection>
                <div className="grid gap-4">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="bg-white rounded-2xl p-6 shadow-elegant border border-gray-100"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                        <info.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-navy-900 mb-1">{info.title}</h4>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600 text-sm">{detail}</p>
                      ))}
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Social Links */}
              <AnimatedSection>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-navy-900 mb-4">Suivez-nous</h4>
                    <div className="flex gap-3">
                      {socialLinks.map((social, index) => (
                        <motion.a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ y: -3, scale: 1.05 }}
                          className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-primary-50 flex items-center justify-center transition-colors"
                          style={{ color: social.color }}
                        >
                          <social.icon className="w-5 h-5" />
                        </motion.a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <Card>
                  <CardContent className="p-8">
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
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${errors.nom ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                          />
                          {errors.nom && <p className="field-feedback">{errors.nom}</p>}
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
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${errors.prenom ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                          />
                          {errors.prenom && <p className="field-feedback">{errors.prenom}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${errors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                          />
                          {errors.email && <p className="field-feedback">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${errors.telephone ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                          />
                          {errors.telephone && <p className="field-feedback">{errors.telephone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sujet *
                        </label>
                        <input
                          type="text"
                          name="sujet"
                          required
                          value={formData.sujet}
                          onChange={handleChange}
                          placeholder="Objet de votre message"
                          className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${errors.sujet ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                        />
                        {errors.sujet && <p className="field-feedback">{errors.sujet}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          rows="5"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Décrivez votre demande..."
                          className={`w-full px-4 py-2.5 rounded-xl border transition-colors resize-none ${errors.message ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                        />
                        {errors.message && <p className="field-feedback">{errors.message}</p>}
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
                            <Send className="w-4 h-4 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
