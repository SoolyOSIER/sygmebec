// src/components/evenements/FiltresEvenements.jsx
import { useState } from 'react'
import { Calendar, MapPin, Search, X } from 'lucide-react'
import { Button } from '../ui/Button'

const FiltresEvenements = ({ onFilterChange }) => {
  const [filtres, setFiltres] = useState({
    type: '',
    date: '',
    lieu: '',
    statut: 'a_venir'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const newFiltres = { ...filtres, [name]: value }
    setFiltres(newFiltres)
    onFilterChange(newFiltres)
  }

  const handleReset = () => {
    const resetFiltres = {
      type: '',
      date: '',
      lieu: '',
      statut: 'a_venir'
    }
    setFiltres(resetFiltres)
    onFilterChange(resetFiltres)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type d'événement
        </label>
        <select
          name="type"
          value={filtres.type}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        >
          <option value="">Tous les types</option>
          <option value="assemblee">Assemblée</option>
          <option value="atelier">Atelier</option>
          <option value="gala">Gala</option>
          <option value="conference">Conférence</option>
          <option value="seminaire">Séminaire</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            name="date"
            value={filtres.date}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lieu
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="lieu"
            value={filtres.lieu}
            onChange={handleChange}
            placeholder="Rechercher un lieu..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Statut
        </label>
        <select
          name="statut"
          value={filtres.statut}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        >
          <option value="a_venir">À venir</option>
          <option value="passe">Passés</option>
          <option value="tous">Tous</option>
        </select>
      </div>

      <div className="md:col-span-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  )
}

export default FiltresEvenements