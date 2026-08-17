import { useMemo, useState } from 'react'
import { FiCalendar, FiCheck, FiFileText, FiFilter, FiLock, FiTag, FiUsers } from 'react-icons/fi'
import './rapportGenerate.css'

const types = [
  ['MEMBRES', 'Rapport des membres', 'Registre complet, statuts et coordonnées', FiUsers, 'green'],
  ['BAPTEMES', 'Rapport des baptêmes', 'Personnes baptisées sur la période', FiCheck, 'blue'],
  ['AFFILIATION', 'Rapport des affiliations', 'Nouvelles affiliations à l’assemblée', FiFileText, 'purple'],
  ['MARIAGE', 'Rapport des mariages', 'Cérémonies et événements familiaux', FiCalendar, 'amber'],
  ['FUNERAILLE', 'Rapport des funérailles', 'Accompagnement et registre pastoral', FiFileText, 'red'],
  ['PRESENTATION_ENFANTS', 'Présentation des enfants', 'Enfants présentés à l’église', FiUsers, 'blue'],
  ['PRESENTATION_TEMPLE', 'Présentation au temple', 'Registre des présentations', FiCheck, 'green'],
]

export default function RapportForm({ initialData = {}, onSubmit, isLoading, statuts = [], isEditing = false, onCancel }) {
  const statutsList = Array.isArray(statuts) ? statuts : statuts?.results || []
  const [form, setForm] = useState({ titre: initialData.titre || '', type_rapport: initialData.type_rapport || 'MEMBRES', statut: initialData.statut || '', periode: initialData.periode || '', date_debut: initialData.date_debut || '', date_fin: initialData.date_fin || '' })
  const [errors, setErrors] = useState({})
  const selectedType = useMemo(() => types.find(([value]) => value === form.type_rapport) || types[0], [form.type_rapport])
  const change = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: null })) }
  const period = (value) => { const today = new Date(); const finish = today.toISOString().slice(0, 10); const start = new Date(today); if (value === 'month') start.setMonth(today.getMonth() - 1); if (value === 'quarter') start.setMonth(today.getMonth() - 3); if (value === 'year') start.setFullYear(today.getFullYear() - 1); change('date_debut', start.toISOString().slice(0, 10)); change('date_fin', finish); change('periode', value) }
  const submit = (event) => { event.preventDefault(); if (!form.titre.trim()) return setErrors({ titre: 'Donnez un titre à votre rapport.' }); onSubmit(form) }
  return <form className="report-generate-form" onSubmit={submit}>
    <div className="report-generate-preview"><i><FiFileText /></i><div><small>APERÇU DU RAPPORT</small><b>{form.titre.trim() || 'Nouveau rapport'}</b><span>{selectedType[1]} · {form.statut || 'Tous les statuts'}</span></div></div>
    <section><header><b>1</b><div>Informations du rapport<small>Donnez un nom clair à votre génération</small></div></header><label>Titre du rapport <em>*</em><span className={errors.titre ? 'error' : ''}><FiFileText /><input value={form.titre} onChange={(event) => change('titre', event.target.value)} placeholder="Ex. Rapport mensuel des membres actifs" />{form.titre && <FiCheck />}</span>{errors.titre && <p>{errors.titre}</p>}</label></section>
    <section><header><b>2</b><div>Type de rapport<small>Choisissez les données à consolider</small></div></header><div className="report-type-grid">{types.map(([value, title, description, Icon, tone]) => <button type="button" key={value} className={`${tone} ${form.type_rapport === value ? 'selected' : ''}`} onClick={() => change('type_rapport', value)}><i><Icon /></i><strong>{title}</strong><small>{description}</small><span><FiCheck /></span></button>)}</div></section>
    <section><header><b>3</b><div>Critères de sélection<small>Affinez les informations incluses dans le rapport</small></div></header><div className="report-filter-grid"><label>Filtrer par statut<div><FiTag /><select value={form.statut} onChange={(event) => change('statut', event.target.value)}><option value="">Tous les statuts</option>{statutsList.map((status) => <option key={status.id || status.libelle} value={status.libelle}>{status.libelle}</option>)}</select></div></label><label>Période rapide<div><FiFilter /><select value={form.periode} onChange={(event) => period(event.target.value)}><option value="">Période personnalisée</option><option value="month">30 derniers jours</option><option value="quarter">3 derniers mois</option><option value="year">12 derniers mois</option></select></div></label></div><div className="report-filter-grid"><label>Date de début<div><FiCalendar /><input type="date" value={form.date_debut} onChange={(event) => change('date_debut', event.target.value)} /></div></label><label>Date de fin<div><FiCalendar /><input type="date" value={form.date_fin} onChange={(event) => change('date_fin', event.target.value)} /></div></label></div></section>
    <footer><p><FiLock />Les données sont traitées de façon sécurisée et le rapport sera disponible dans votre liste.</p><div><button type="button" onClick={onCancel || (() => window.history.back())}>Annuler</button><button type="submit" disabled={isLoading}>{isLoading ? 'Génération…' : <><FiFileText />{isEditing ? 'Enregistrer le rapport' : 'Générer le rapport'}</>}</button></div></footer>
  </form>
}
