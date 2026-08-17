// ============================================
// src/components/evenements/EvenementForm.jsx - Version Complète
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { FiCalendar, FiMapPin, FiUser, FiFileText } from 'react-icons/fi'

export default function EvenementForm({
  initialData = {},
  onSubmit,
  isLoading,
  membres = [],
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    titre: initialData.titre || '',
    date: initialData.date || '',
    lieu: initialData.lieu || '',
    description: initialData.description || '',
    responsable: initialData.responsable || '',
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
    if (!formData.date) newErrors.date = 'La date est requise'
    if (!formData.lieu) newErrors.lieu = 'Le lieu est requis'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = {
      ...formData,
      responsable_id: formData.responsable ? parseInt(formData.responsable, 10) : null,
    }

    delete submitData.responsable

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          label="Titre de l'événement"
          value={formData.titre}
          onChange={(e) => handleChange('titre', e.target.value)}
          error={errors.titre}
          required
          icon={FiFileText}
          placeholder="Ex: Culte dominical, Réunion de prière..."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Date et heure"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          error={errors.date}
          required
          icon={FiCalendar}
        />
        <Input
          label="Lieu"
          value={formData.lieu}
          onChange={(e) => handleChange('lieu', e.target.value)}
          error={errors.lieu}
          required
          icon={FiMapPin}
          placeholder="Lieu de l'événement"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description détaillée de l'événement (optionnel)"
          as="textarea"
          rows={4}
          className="resize-none"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Select
          label="Responsable"
          value={formData.responsable}
          onChange={(e) => handleChange('responsable', e.target.value)}
          placeholder="Sélectionner un responsable"
          icon={FiUser}
          options={membres.map(m => ({ 
            value: m.id, 
            label: `${m.nom} ${m.prenom || ''}` 
          }))}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 justify-end pt-4 border-t border-gray-100"
      >
        <Button
          variant="ghost"
          type="button"
          onClick={() => window.history.back()}
        >
          Annuler
        </Button>
        <Button type="submit" isLoading={isLoading} size="lg" variant="success">
          {isEditing ? (
            'Modifier l\'événement'
          ) : (
            'Enregistrer'
          )}
        </Button>
      </motion.div>
    </form>
  )
}