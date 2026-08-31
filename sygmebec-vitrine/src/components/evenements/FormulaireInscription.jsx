// src/components/evenements/FormulaireInscription.jsx
import { useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { toast } from 'react-hot-toast'

const FormulaireInscription = ({ evenementId, onSuccess, capaciteMax }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    nombre_places: 1
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Appel API d'inscription
      await evenementService.inscrire(evenementId, formData)
      toast.success('Inscription réussie !')
      onSuccess?.()
    } catch (error) {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
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
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
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
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
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
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        />
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
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de places
        </label>
        <input
          type="number"
          name="nombre_places"
          min="1"
          max={capaciteMax || 10}
          value={formData.nombre_places}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        />
        {capaciteMax && (
          <p className="text-xs text-gray-500 mt-1">
            Maximum {capaciteMax} places disponibles
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="gold"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Inscription en cours...
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            S'inscrire
          </>
        )}
      </Button>
    </form>
  )
}

export default FormulaireInscription