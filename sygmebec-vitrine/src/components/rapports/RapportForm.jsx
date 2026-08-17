// ============================================
// src/components/rapports/RapportForm.jsx
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiCalendar, FiTag, FiClock } from 'react-icons/fi'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

export default function RapportForm({
  initialData = {},
  onSubmit,
  isLoading,
  statuts = [],
  isEditing = false,
}) {
  // Normaliser `statuts` pour accepter un tableau ou une réponse paginée { results: [...] }
  const statutsList = Array.isArray(statuts) ? statuts : (statuts && statuts.results) ? statuts.results : []
  const [formData, setFormData] = useState({
    titre: initialData.titre || '',
    statut: initialData.statut || '',
    periode: initialData.periode || '',
    dateFin: initialData.dateFin || '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.titre) newErrors.titre = 'Le titre est requis'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          label="Titre du rapport"
          value={formData.titre}
          onChange={(e) => handleChange('titre', e.target.value)}
          error={errors.titre}
          required
          icon={FiFileText}
          placeholder="Ex: Rapport des membres actifs, Bilan annuel..."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Select
          label="Filtrer par statut"
          value={formData.statut}
          onChange={(e) => handleChange('statut', e.target.value)}
          placeholder="Tous les statuts"
          icon={FiTag}
          options={statutsList.map(s => ({ value: s.libelle, label: s.libelle }))}
        />
        <Input
          label="Période"
          value={formData.periode}
          onChange={(e) => handleChange('periode', e.target.value)}
          icon={FiCalendar}
          placeholder="Ex: 2024-01:2024-12"
          helpText="Format: AAAA-MM:AAAA-MM"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          label="Date de fin"
          type="date"
          value={formData.dateFin}
          onChange={(e) => handleChange('dateFin', e.target.value)}
          icon={FiClock}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex gap-3 justify-end pt-4 border-t border-gray-100"
      >
        <Button
          variant="ghost"
          type="button"
          onClick={() => window.history.back()}
        >
          Annuler
        </Button>
        <Button type="submit" isLoading={isLoading} size="lg">
          <FiFileText className="mr-2" />
          Générer le rapport
        </Button>
      </motion.div>
    </form>
  )
}