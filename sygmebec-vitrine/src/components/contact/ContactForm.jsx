// src/components/contact/ContactForm.jsx
import { useState } from 'react'
import { Send, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '../ui/Button'
import { contactService } from '../../services/contactService'

const ContactForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      onSuccess?.()
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message")
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-3 h-3 inline mr-1" />
            Nom *
          </label>
          <input
            type="text"
            name="nom"
            required
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-3 h-3 inline mr-1" />
            Prénom *
          </label>
          <input
            type="text"
            name="prenom"
            required
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
            placeholder="Votre prénom"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Mail className="w-3 h-3 inline mr-1" />
          Email *
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Phone className="w-3 h-3 inline mr-1" />
          Téléphone
        </label>
        <input
          type="tel"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          placeholder="06 12 34 56 78"
        />
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
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          placeholder="Objet de votre message"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MessageSquare className="w-3 h-3 inline mr-1" />
          Message *
        </label>
        <textarea
          name="message"
          rows="5"
          required
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
          placeholder="Décrivez votre demande..."
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
            <Send className="w-4 h-4 mr-2" />
            Envoyer le message
          </>
        )}
      </Button>
    </form>
  )
}

export default ContactForm