// ============================================
// src/components/comptes/UtilisateurForm.jsx
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiLock, FiTag, FiUsers } from 'react-icons/fi'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

export default function UtilisateurForm({
  initialData = {},
  onSubmit,
  isLoading,
  membres = [],
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    identifiant: initialData.identifiant || '',
    password: '',
    role_id: initialData.role_acces?.id || '',
    membre_id: initialData.membre?.id || '',
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
    if (!formData.identifiant) newErrors.identifiant = "L'identifiant est requis"
    if (!formData.password && !isEditing) newErrors.password = 'Le mot de passe est requis'
    if (!formData.role_id) newErrors.role_id = 'Le role est requis'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = {
      identifiant: formData.identifiant,
      role_id: parseInt(formData.role_id),
      membre_id: formData.membre_id ? parseInt(formData.membre_id) : null,
    }

    if (formData.password && !isEditing) {
      submitData.password = formData.password
      submitData.password_confirm = formData.password
    }

    onSubmit(submitData)
  }

  const roleOptions = [
    { value: 1, label: 'Secrétaire' },
    { value: 2, label: 'Pasteur' },
    { value: 3, label: 'Administrateur' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          label="Identifiant"
          value={formData.identifiant}
          onChange={(e) => handleChange('identifiant', e.target.value)}
          error={errors.identifiant}
          required
          icon={FiUser}
          placeholder="Nom d'utilisateur"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Input
          label={isEditing ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          required={!isEditing}
          icon={FiLock}
          placeholder="Mot de passe"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Select
          label="Rôle"
          value={formData.role_id}
          onChange={(e) => handleChange('role_id', e.target.value)}
          error={errors.role_id}
          required
          placeholder="Sélectionner un rôle"
          icon={FiTag}
          options={roleOptions}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Select
          label="Membre associé (optionnel)"
          value={formData.membre_id}
          onChange={(e) => handleChange('membre_id', e.target.value)}
          placeholder="Aucun membre associé"
          icon={FiUsers}
          options={membres?.map(m => ({ 
            value: m.id, 
            label: `${m.nom} ${m.prenom || ''}` 
          })) || []}
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
        <Button type="submit" isLoading={isLoading} size="lg">
          {isEditing ? (
            <>
              <FiUser className="mr-2" />
              Modifier l'utilisateur
            </>
          ) : (
            <>
              <FiUser className="mr-2" />
              Créer l'utilisateur
            </>
          )}
        </Button>
      </motion.div>
    </form>
  )
}
