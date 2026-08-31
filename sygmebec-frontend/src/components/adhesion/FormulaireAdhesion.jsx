// src/components/adhesion/FormulaireAdhesion.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, Users, Send, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '../ui/Button'
import { adhesionService } from '../../services/adhesionService'

const FormulaireAdhesion = ({ onSuccess, onError }) => {
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
    message: '',
    type_adhesion: 'membre',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adhesionService.demanderAdhesion(formData)
      toast.success('Votre demande d\'adhésion a été envoyée avec succès !')
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        date_naissance: '',
        sexe: '',
        fonction: '',
        message: '',
        type_adhesion: 'membre',
      })
      onSuccess?.()
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de l'envoi de la demande"
      toast.error(message)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type d'adhésion */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer">
          <input
            type="radio"
            name="type_adhesion"
            value="membre"
            checked={formData.type_adhesion === 'membre'}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600"
          />
          <div>
            <p className="font-medium text-navy-900">Membre</p>
            <p className="text-xs text-gray-500">Adhésion individuelle</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer">
          <input
            type="radio"
            name="type_adhesion"
            value="organisation"
            checked={formData.type_adhesion === 'organisation'}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600"
          />
          <div>
            <p className="font-medium text-navy-900">Organisation</p>
            <p className="text-xs text-gray-500">Association, entreprise...</p>
          </div>
        </label>
      </div>

      {/* Informations personnelles */}
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
          Téléphone *
        </label>
        <input
          type="tel"
          name="telephone"
          required
          value={formData.telephone}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          placeholder="06 12 34 56 78"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-3 h-3 inline mr-1" />
          Adresse
        </label>
        <input
          type="text"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          placeholder="Votre adresse"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-3 h-3 inline mr-1" />
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
            <Users className="w-3 h-3 inline mr-1" />
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
          <Users className="w-3 h-3 inline mr-1" />
          Fonction / Poste
        </label>
        <input
          type="text"
          name="fonction"
          value={formData.fonction}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          placeholder="Ex: Président, Trésorier, Membre..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message (optionnel)
        </label>
        <textarea
          name="message"
          rows="4"
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
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Envoyer ma demande
          </>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
      </p>
    </form>
  )
}

export default FormulaireAdhesion