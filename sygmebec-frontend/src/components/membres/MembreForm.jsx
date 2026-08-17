import { useState } from 'react'
import { FiBookOpen, FiCalendar, FiFileText, FiMail, FiMapPin, FiPhone, FiTag, FiUser, FiUsers } from 'react-icons/fi'

import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const asList = (value) => Array.isArray(value) ? value : value?.results || []

export default function MembreForm({ initialData = {}, onSubmit, isLoading, statuts = [], fonctions = [], isEditing = false }) {
  const statutsList = asList(statuts)
  const fonctionsList = asList(fonctions)
  const [formData, setFormData] = useState({
    nom: initialData.nom || '',
    prenom: initialData.prenom || '',
    telephone: initialData.telephone || '',
    telephone_secondaire: initialData.telephone_secondaire || '',
    email: initialData.email || '',
    adresse: initialData.adresse || '',
    eglise_origine: initialData.eglise_origine || '',
    date_naissance: initialData.date_naissance || '',
    sexe: initialData.sexe || '',
    etat_matrimonial: initialData.etat_matrimonial || '',
    date_presentation: initialData.date_presentation || '',
    date_conversion: initialData.date_conversion || '',
    date_affiliation: initialData.date_affiliation || '',
    date_bapteme: initialData.date_bapteme || '',
    signature_membre: initialData.signature_membre || '',
    date_signature: initialData.date_signature || '',
    actuellement_employe: Boolean(initialData.actuellement_employe),
    actuellement_etudiant: Boolean(initialData.actuellement_etudiant),
    anciennete_ebec: initialData.anciennete_ebec || '',
    membre_petit_groupe: Boolean(initialData.membre_petit_groupe),
    dans_ecole_dimanche: Boolean(initialData.dans_ecole_dimanche),
    classe_ecole_dimanche: initialData.classe_ecole_dimanche || '',
    statut: initialData.statut?.id || initialData.statut_id || '',
    fonctions: (initialData.fonctions || []).map((fonction) => fonction.id || fonction),
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [photoPreview, setPhotoPreview] = useState(initialData.photo || '')

  const change = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!formData.nom.trim()) nextErrors.nom = 'Le nom est requis.'
    if (!formData.prenom.trim()) nextErrors.prenom = 'Le prénom est requis.'
    if (!formData.telephone.trim()) nextErrors.telephone = 'Le téléphone est requis.'
    if (!formData.statut) nextErrors.statut = 'Le statut est requis.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const payload = new FormData()
    const { statut, fonctions, photo, ...values } = formData
    Object.entries(values).forEach(([field, value]) => {
      if (value !== '' && value !== null && value !== undefined) payload.append(field, String(value))
    })
    payload.append('statut_id', String(statut))
    fonctions.forEach((id) => payload.append('fonctions_ids', String(id)))
    if (photo instanceof File) payload.append('photo', photo)
    onSubmit(payload)
  }

  const textField = (label, field, icon, type = 'text', required = false) => (
    <Input label={label} type={type} required={required} icon={icon} value={formData[field]}
      error={errors[field]} onChange={(event) => change(field, event.target.value)} />
  )

  return (
    <form onSubmit={submit} className="space-y-7">
      <section className="space-y-4">
        <div><h2 className="font-semibold text-secondary-900">Identité et contacts</h2><p className="text-sm text-secondary-500">Les informations de base du membre.</p></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {textField('Nom', 'nom', FiUser, 'text', true)}
          {textField('Prénom', 'prenom', FiUser, 'text', true)}
          {textField('Téléphone principal', 'telephone', FiPhone, 'tel', true)}
          {textField('Téléphone secondaire', 'telephone_secondaire', FiPhone, 'tel')}
          {textField('E-mail', 'email', FiMail, 'email')}
          {textField("Église d'origine", 'eglise_origine', FiUsers)}
        </div>
        {textField('Adresse', 'adresse', FiMapPin)}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {textField('Date de naissance', 'date_naissance', FiCalendar, 'date')}
          <Select label="Sexe" value={formData.sexe} onChange={(event) => change('sexe', event.target.value)} icon={FiUsers}
            placeholder="Sélectionner" options={[{ value: 'MALE', label: 'Masculin' }, { value: 'FEMELLE', label: 'Féminin' }]} />
          <Select label="État matrimonial" value={formData.etat_matrimonial} onChange={(event) => change('etat_matrimonial', event.target.value)} icon={FiUsers}
            placeholder="Sélectionner" options={[
              { value: 'CELIBATAIRE', label: 'Célibataire' }, { value: 'MARIE', label: 'Marié(e)' }, { value: 'SEPARE', label: 'Séparé(e)' }, { value: 'DIVORCE', label: 'Divorcé(e)' }, { value: 'VEUF', label: 'Veuf(ve)' },
            ]} />
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div><h2 className="font-semibold text-secondary-900">Parcours spirituel</h2><p className="text-sm text-secondary-500">Champs demandés pour les rapports et le suivi.</p></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {textField('Date de présentation', 'date_presentation', FiCalendar, 'date')}
          {textField('Date de conversion', 'date_conversion', FiCalendar, 'date')}
          {textField("Date d'affiliation", 'date_affiliation', FiCalendar, 'date')}
          {textField('Date de baptême', 'date_bapteme', FiCalendar, 'date')}
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div><h2 className="font-semibold text-secondary-900">Vie dans l'église</h2></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {textField("Ancienneté à l'EBEC", 'anciennete_ebec', FiFileText)}
          <Select label="Statut" required value={formData.statut} error={errors.statut} onChange={(event) => change('statut', event.target.value)} icon={FiTag}
            placeholder="Sélectionner un statut" options={statutsList.map((statut) => ({ value: statut.id, label: statut.libelle }))} />
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700"><input type="checkbox" checked={formData.actuellement_employe} onChange={(event) => change('actuellement_employe', event.target.checked)} /> Actuellement employé</label>
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700"><input type="checkbox" checked={formData.actuellement_etudiant} onChange={(event) => change('actuellement_etudiant', event.target.checked)} /> Actuellement étudiant</label>
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700"><input type="checkbox" checked={formData.membre_petit_groupe} onChange={(event) => change('membre_petit_groupe', event.target.checked)} /> Membre d'un petit groupe</label>
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-secondary-700"><input type="checkbox" checked={formData.dans_ecole_dimanche} onChange={(event) => change('dans_ecole_dimanche', event.target.checked)} /> Dans une classe d'école du dimanche</label>
          <Input label="Classe d'école du dimanche" icon={FiBookOpen} disabled={!formData.dans_ecole_dimanche} value={formData.classe_ecole_dimanche} onChange={(event) => change('classe_ecole_dimanche', event.target.value)} />
          <Input label="Signature du membre" icon={FiFileText} value={formData.signature_membre} onChange={(event) => change('signature_membre', event.target.value)} />
          {textField('Date de signature', 'date_signature', FiCalendar, 'date')}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 md:grid-cols-2">
        <div className="space-y-2"><label className="block text-sm font-medium text-secondary-700">Photo du membre</label><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { change('photo', file); setPhotoPreview(URL.createObjectURL(file)) } }} className="block w-full text-sm text-secondary-500" />{photoPreview && <img src={photoPreview} alt="Aperçu" className="h-24 w-24 rounded-full object-cover" />}</div>
        <div><label className="mb-2 block text-sm font-medium text-secondary-700">Fonctions</label><select multiple value={formData.fonctions.map(String)} onChange={(event) => change('fonctions', [...event.target.selectedOptions].map((option) => Number(option.value)))} className="min-h-28 w-full rounded-lg border border-gray-300 p-3 text-sm"><option disabled value="">Choisir une ou plusieurs fonctions</option>{fonctionsList.map((fonction) => <option key={fonction.id} value={fonction.id}>{fonction.nomFonction}</option>)}</select></div>
      </section>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5"><Button variant="ghost" type="button" onClick={() => window.history.back()}>Annuler</Button><Button type="submit" isLoading={isLoading} size="lg" variant="success">{isEditing ? 'Modifier le membre' : 'Enregistrer le membre'}</Button></div>
    </form>
  )
}
