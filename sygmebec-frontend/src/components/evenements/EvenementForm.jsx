import { useState } from 'react'
import { FiCalendar, FiFileText, FiImage, FiMapPin, FiUser, FiUsers } from 'react-icons/fi'

import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const categories = [
  { value: 'CULTE', label: 'Culte' }, { value: 'PRIERE', label: 'Réunion de prière' }, { value: 'FORMATION', label: 'Formation' }, { value: 'JEUNESSE', label: 'Jeunesse' }, { value: 'CONFERENCE', label: 'Conférence' }, { value: 'SOCIAL', label: 'Activité sociale' }, { value: 'AUTRE', label: 'Autre' },
]

const normalizeDateTime = (value) => value ? value.slice(0, 16) : ''

export default function EvenementForm({ initialData = {}, onSubmit, isLoading, membres = [], typesEvenements = [], isEditing = false }) {
  const [data, setData] = useState({
    titre: initialData.titre || '',
    categorie: initialData.categorie || 'CULTE',
    type_evenement_nom: initialData.type_evenement?.nom || '',
    date: normalizeDateTime(initialData.date),
    lieu: initialData.lieu || '',
    description: initialData.description || '',
    responsable: initialData.responsable?.id || initialData.responsable || '',
    est_public: initialData.est_public ?? true,
    capacite: initialData.capacite ?? '',
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(initialData.image || '')
  const change = (field, value) => { setData((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })) }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!data.titre.trim()) nextErrors.titre = 'Le titre est requis.'
    if (!data.date) nextErrors.date = 'La date et l’heure sont requises.'
    if (!data.lieu.trim()) nextErrors.lieu = 'Le lieu est requis.'
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)

    const payload = new FormData()
    Object.entries(data).forEach(([field, value]) => {
      if (field === 'image' || field === 'responsable' || value === '' || value === null) return
      payload.append(field, String(value))
    })
    if (data.responsable) payload.append('responsable_id', String(data.responsable))
    if (data.image instanceof File) payload.append('image', data.image)
    onSubmit(payload)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input label="Titre de l’événement" value={data.titre} error={errors.titre} onChange={(event) => change('titre', event.target.value)} required icon={FiFileText} placeholder="Ex. Mariage de …" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Date et heure" type="datetime-local" value={data.date} error={errors.date} onChange={(event) => change('date', event.target.value)} required icon={FiCalendar} />
        <Input label="Lieu" value={data.lieu} error={errors.lieu} onChange={(event) => change('lieu', event.target.value)} required icon={FiMapPin} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select label="Catégorie générale" value={data.categorie} onChange={(event) => change('categorie', event.target.value)} options={categories} icon={FiUsers} />
        <div><label className="mb-2 block text-sm font-medium text-secondary-700">Type d’événement personnalisé</label><input list="types-evenements" value={data.type_evenement_nom} onChange={(event) => change('type_evenement_nom', event.target.value)} placeholder="Ex. Baptême, mariage, funérailles…" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" /><datalist id="types-evenements">{typesEvenements.filter((type) => type.actif).map((type) => <option key={type.id} value={type.nom} />)}</datalist><p className="mt-1 text-xs text-secondary-400">Un nouveau nom est mémorisé et réutilisable dès l’enregistrement.</p></div>
      </div>
      <Input label="Description" value={data.description} onChange={(event) => change('description', event.target.value)} icon={FiFileText} placeholder="Description de l’événement" as="textarea" rows={4} className="resize-none" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select label="Responsable" value={data.responsable} onChange={(event) => change('responsable', event.target.value)} placeholder="Sélectionner un responsable" icon={FiUser} options={membres.map((membre) => ({ value: membre.id, label: `${membre.prenom || ''} ${membre.nom}`.trim() }))} />
        <Input label="Capacité (facultatif)" type="number" min="1" value={data.capacite} onChange={(event) => change('capacite', event.target.value)} icon={FiUsers} placeholder="Places illimitées si vide" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><input type="checkbox" checked={data.est_public} onChange={(event) => change('est_public', event.target.checked)} /> Afficher automatiquement cet événement sur le site vitrine</label>
        <div><label className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-700"><FiImage /> Image de l’événement</label><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { change('image', file); setPreview(URL.createObjectURL(file)) } }} className="block w-full text-sm text-secondary-500" />{preview && <img src={preview} alt="Aperçu" className="mt-2 h-24 w-40 rounded-lg object-cover" />}</div>
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4"><Button variant="ghost" type="button" onClick={() => window.history.back()}>Annuler</Button><Button type="submit" isLoading={isLoading} size="lg" variant="success">{isEditing ? 'Modifier l’événement' : 'Enregistrer l’événement'}</Button></div>
    </form>
  )
}
