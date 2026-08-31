import { useMemo, useState } from 'react'
import { FiCalendar, FiCheck, FiFileText, FiImage, FiMapPin, FiStar, FiUpload, FiUser } from 'react-icons/fi'
import useT from '../../i18n/useT'
import '../../pages/referenceForms.css'
import '../../pages/referenceFormsOverrides.css'

const normalizeDateTime = (value) => value ? value.slice(0, 16) : ''
const prettyDate = (value, locale, fallback) => value ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : fallback
const memberName = (member) => member?.nom_complet || `${member?.prenom || ''} ${member?.nom || ''}`.trim()

function Field({ label, optional, required, error, icon: Icon, children, full = false }) {
  return <div className={`reference-field${full ? ' full' : ''}`}><label>{label} {required && <strong>*</strong>}{optional && <em>Optionnel</em>}</label><div className="reference-control">{Icon && <Icon />}{children}</div>{error && <span className="reference-error">{error}</span>}</div>
}

export default function EvenementForm({ initialData = {}, onSubmit, isLoading, membres = [], isEditing = false }) {
  const { t, locale } = useT()
  const [data, setData] = useState({ titre: initialData.titre || '', categorie: initialData.categorie || 'CULTE', date: normalizeDateTime(initialData.date), lieu: initialData.lieu || '', description: initialData.description || '', responsable: initialData.responsable?.id || initialData.responsable || '', est_public: initialData.est_public ?? true, image: null, notifier: false })
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(initialData.image || '')
  const responsible = useMemo(() => membres.find((member) => String(member.id) === String(data.responsable)), [membres, data.responsable])
  const change = (name, value) => { setData((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!data.date) nextErrors.date = t('events.dateTimeRequired')
    if (!data.lieu.trim()) nextErrors.lieu = t('events.locationRequired')
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)
    const payload = new FormData()
    Object.entries(data).forEach(([key, value]) => { if (!['image', 'responsable', 'notifier'].includes(key) && value !== '' && value !== null) payload.append(key, String(value)) })
    if (!data.titre.trim()) payload.append('titre', t('events.defaultTitle', { date: new Date(data.date).toLocaleDateString(locale) }))
    if (data.responsable) payload.append('responsable_id', String(data.responsable))
    if (data.image instanceof File) payload.append('image', data.image)
    onSubmit(payload)
  }
  return <div className="reference-form-page"><div className="event-editor-layout"><form onSubmit={submit} className="reference-form"><section className="reference-panel"><header><i><FiCalendar /></i><div><h2>Détails de l'événement</h2><p>Définissez les informations qui apparaîtront à l'assemblée.</p></div></header><div className="reference-fields">
    <Field label="Date et heure" required error={errors.date} icon={FiCalendar}><input type="datetime-local" value={data.date} onChange={(e) => change('date', e.target.value)} /></Field><Field label="Lieu" required error={errors.lieu} icon={FiMapPin}><input value={data.lieu} onChange={(e) => change('lieu', e.target.value)} placeholder="Ex. Temple principal" /></Field>
    <Field label="Description" optional icon={FiFileText} full><textarea value={data.description} onChange={(e) => change('description', e.target.value)} placeholder="Décrivez l'événement, son déroulement et les informations importantes." /></Field>
    <Field label="Responsable" optional icon={FiUser}><select value={data.responsable} onChange={(e) => change('responsable', e.target.value)}><option value="">Sélectionner un responsable</option>{membres.map((member) => <option key={member.id} value={member.id}>{memberName(member)}</option>)}</select></Field>
    <div className="reference-field"><label>Image de couverture <em>Optionnel</em></label><label className="reference-dropzone"><i><FiUpload /></i><span><b>{data.image ? 'Image sélectionnée' : 'Choisir une image'}</b><small>PNG, JPG jusqu'à 5 Mo</small></span>{preview && <img className="reference-photo" src={preview} alt="Aperçu" />}<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { change('image', file); setPreview(URL.createObjectURL(file)) } }} /></label></div>
    <div className="reference-field full"><span>Publication</span><div className="reference-toggle-grid"><label className="reference-toggle"><input type="checkbox" checked={data.est_public} onChange={(e) => change('est_public', e.target.checked)} />Afficher sur le site vitrine</label><label className="reference-toggle"><input type="checkbox" checked={data.notifier} onChange={(e) => change('notifier', e.target.checked)} />Notifier les membres après enregistrement</label></div></div>
  </div></section><div className="reference-actions"><button type="button" onClick={() => window.history.back()}>Annuler</button><button className="save" type="submit" disabled={isLoading}><FiCheck />{isLoading ? 'Enregistrement…' : isEditing ? 'Modifier l’événement' : 'Enregistrer'}</button></div></form>
  <aside><div className="event-preview-label">Aperçu en direct</div><div className="event-preview-card"><div className="event-preview-cover">{preview ? <img src={preview} alt="" /> : <FiImage />}<span className="event-preview-badge">Événement</span></div><div className="event-preview-body"><h3>{data.titre || 'Événement'}</h3><div className={`event-preview-meta${data.date ? '' : ' empty'}`}><FiCalendar />{prettyDate(data.date, locale, t('events.dateTimeToSet'))}</div><div className={`event-preview-meta${data.lieu ? '' : ' empty'}`}><FiMapPin />{data.lieu || t('dashboard.locationToSet')}</div><div className={`event-preview-meta${responsible ? '' : ' empty'}`}><FiUser />{responsible ? memberName(responsible) : 'Responsable non assigné'}</div><p>{data.description || 'La description apparaîtra ici au fur et à mesure de votre saisie.'}</p></div></div><div className="event-tips"><h3><FiStar />Conseils</h3><ul><li>Ajoutez une date et un lieu précis pour guider les visiteurs.</li><li>Décrivez le déroulement de l’activité.</li><li>Activez la notification pour prévenir les membres après enregistrement.</li></ul></div></aside>
  </div></div>
}
