// ============================================
// src/components/membres/MembreForm.jsx - Version Complète
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiTag, FiUsers, FiFileText, FiBookOpen } from 'react-icons/fi'

export default function MembreForm({
  initialData = {},
  onSubmit,
  isLoading,
  statuts = [],
  fonctions = [],
  isEditing = false,
}) {
  const statutsList = Array.isArray(statuts) ? statuts : (statuts && statuts.results) ? statuts.results : []
  const fonctionsList = Array.isArray(fonctions) ? fonctions : (fonctions && fonctions.results) ? fonctions.results : []

  const [formData, setFormData] = useState({
    nom: initialData.nom || '',
    prenom: initialData.prenom || '',
    telephone: initialData.telephone || '',
    email: initialData.email || '',
    adresse: initialData.adresse || '',
    date_naissance: initialData.date_naissance || '',
    sexe: initialData.sexe || '',
    etat_matrimonial: initialData.etat_matrimonial || '',
    actuellement_employe: Boolean(initialData.actuellement_employe),
    actuellement_etudiant: Boolean(initialData.actuellement_etudiant),
    anciennete_ebec: initialData.anciennete_ebec || '',
    membre_petit_groupe: Boolean(initialData.membre_petit_groupe),
    dans_ecole_dimanche: Boolean(initialData.dans_ecole_dimanche),
    classe_ecole_dimanche: initialData.classe_ecole_dimanche || '',
    date_bapteme: initialData.date_bapteme || initialData.date_signature || '',
    statut: initialData.statut?.id || '',
    fonctions: initialData.fonctions?.map(f => f.id) || [],
  })

  const [errors, setErrors] = useState({})
  const [photoPreview, setPhotoPreview] = useState(initialData.photo || '')
  const [fonctionInput, setFonctionInput] = useState(
    Array.isArray(initialData.fonctions) && initialData.fonctions.length > 0
      ? (initialData.fonctions.find((f) => typeof f === 'object' && f?.nomFonction)?.nomFonction || '')
      : ''
  )

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.nom) newErrors.nom = 'Le nom est requis'
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis'
    if (!formData.sexe) newErrors.sexe = 'Le sexe est requis'
    if (!formData.telephone) newErrors.telephone = 'Le téléphone est requis'
    if (!formData.adresse) newErrors.adresse = 'L\'adresse est requise'
    if (!formData.statut) newErrors.statut = 'Le statut est requis'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = new FormData()

    Object.entries({
      ...formData,
      statut_id: formData.statut ? parseInt(formData.statut, 10) : null,
      fonctions_ids: formData.fonctions.map(f => parseInt(f, 10)),
      actuellement_employe: Boolean(formData.actuellement_employe),
      actuellement_etudiant: Boolean(formData.actuellement_etudiant),
      membre_petit_groupe: Boolean(formData.membre_petit_groupe),
      dans_ecole_dimanche: Boolean(formData.dans_ecole_dimanche),
    }).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return
      if (Array.isArray(value)) {
        value.forEach((item) => submitData.append(key, item))
        return
      }
      submitData.append(key, value)
    })

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Nom"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          error={errors.nom}
          required
          icon={FiUser}
          placeholder="Nom du membre"
        />
        <Input
          label="Prénom"
          value={formData.prenom}
          onChange={(e) => handleChange('prenom', e.target.value)}
          error={errors.prenom}
          required
          icon={FiUser}
          placeholder="Prénom du membre"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Téléphone"
          value={formData.telephone}
          onChange={(e) => handleChange('telephone', e.target.value)}
          error={errors.telephone}
          required
          icon={FiPhone}
          placeholder="Numéro de téléphone"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          icon={FiMail}
          placeholder="Adresse email"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          label="Adresse"
          value={formData.adresse}
          onChange={(e) => handleChange('adresse', e.target.value)}
          error={errors.adresse}
          required
          icon={FiMapPin}
          placeholder="Adresse complète"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Date de naissance"
          type="date"
          value={formData.date_naissance}
          onChange={(e) => handleChange('date_naissance', e.target.value)}
          icon={FiCalendar}
        />
        <Select
          label="Sexe"
          value={formData.sexe}
          onChange={(e) => handleChange('sexe', e.target.value)}
          error={errors.sexe}
          required
          placeholder="Sélectionner le sexe"
          icon={FiUsers}
          options={[
            { value: 'MALE', label: 'Masculin' },
            { value: 'FEMELLE', label: 'Femelle' },
          ]}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Select
          label="État matrimonial"
          value={formData.etat_matrimonial}
          onChange={(e) => handleChange('etat_matrimonial', e.target.value)}
          placeholder="Sélectionner l'état matrimonial"
          icon={FiUsers}
          options={[
            { value: 'CELIBATAIRE', label: 'Célibataire' },
            { value: 'MARIE', label: 'Marié(e)' },
            { value: 'SEPARE', label: 'Séparé(e)' },
            { value: 'DIVORCE', label: 'Divorcé(e)' },
            { value: 'VEUF', label: 'Veuf(ve)' },
          ]}
        />
        <Select
          label="Statut"
          value={formData.statut}
          onChange={(e) => handleChange('statut', e.target.value)}
          error={errors.statut}
          required
          placeholder="Sélectionner un statut"
          icon={FiTag}
          options={statutsList.map(s => ({ value: s.id, label: s.libelle }))}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700">
          <input
            type="checkbox"
            checked={formData.actuellement_employe}
            onChange={(e) => handleChange('actuellement_employe', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>Actuellement employé</span>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700">
          <input
            type="checkbox"
            checked={formData.actuellement_etudiant}
            onChange={(e) => handleChange('actuellement_etudiant', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>Actuellement étudiant</span>
        </label>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Depuis combien de temps êtes-vous membre de l'EBEC ?"
          value={formData.anciennete_ebec}
          onChange={(e) => handleChange('anciennete_ebec', e.target.value)}
          icon={FiFileText}
          placeholder="Ex. 3 ans"
        />
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700">
          <input
            type="checkbox"
            checked={formData.membre_petit_groupe}
            onChange={(e) => handleChange('membre_petit_groupe', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>Membre d'un petit groupe de l'église</span>
        </label>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700">
          <input
            type="checkbox"
            checked={formData.dans_ecole_dimanche}
            onChange={(e) => handleChange('dans_ecole_dimanche', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>Vous êtes dans une classe d'école du dimanche</span>
        </label>
        <Input
          label="Si oui, laquelle ?"
          value={formData.classe_ecole_dimanche}
          onChange={(e) => handleChange('classe_ecole_dimanche', e.target.value)}
          icon={FiBookOpen}
          placeholder="Nom de la classe"
          disabled={!formData.dans_ecole_dimanche}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
      >
        <Input
          label="Date de baptême"
          type="date"
          value={formData.date_bapteme}
          onChange={(e) => handleChange('date_bapteme', e.target.value)}
          icon={FiCalendar}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-700">Photo du membre</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              if (file) {
                setPhotoPreview(URL.createObjectURL(file))
                handleChange('photo', file)
              }
            }}
            className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {photoPreview && (
            <img src={photoPreview} alt="Aperçu de la photo" className="h-24 w-24 rounded-full object-cover border border-gray-200" />
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-700">Fonctions</label>
          <input
            list="fonctions-list"
            value={fonctionInput}
            onChange={(e) => {
              const selectedValue = e.target.value
              setFonctionInput(selectedValue)
              const selectedFunction = fonctionsList.find(
                (f) => String(f.id) === String(selectedValue) || f.nomFonction?.toLowerCase() === selectedValue.trim().toLowerCase()
              )
              if (selectedFunction) {
                handleChange('fonctions', [selectedFunction.id])
              } else {
                handleChange('fonctions', [])
              }
            }}
            placeholder="Tapez ou choisissez une fonction"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <datalist id="fonctions-list">
            {fonctionsList.map((f) => (
              <option key={f.id} value={f.nomFonction} />
            ))}
          </datalist>
          <p className="text-xs text-secondary-400">Vous pouvez saisir une fonction ou choisir dans la liste.</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
          {isEditing ? 'Modifier le membre' : 'Enregistrer'}
        </Button>
      </motion.div>
    </form>
  )
}