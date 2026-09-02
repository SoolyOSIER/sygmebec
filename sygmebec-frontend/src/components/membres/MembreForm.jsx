import { useMemo, useState } from 'react'
import { FiBookOpen, FiBriefcase, FiCalendar, FiCamera, FiCheck, FiClock, FiMail, FiMapPin, FiPhone, FiPlus, FiShield, FiUpload, FiUser, FiUsers } from 'react-icons/fi'
import { useCreateFonction } from '../../hooks/useMembres'
import useT from '../../i18n/useT'
import '../../pages/referenceForms.css'
import '../../pages/referenceFormsOverrides.css'

const asList = (value) => Array.isArray(value) ? value : value?.results || []
const fieldCount = 23

function formatRegistrationDate(value = new Date(), locale = 'fr-HT') {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date)
}
function Field({ label, optional, required, error, icon: Icon, children, full = false }) {
  return <div className={`reference-field${full ? ' full' : ''}`}><label>{label} {required && <strong>*</strong>}{optional && <em>Optionnel</em>}</label><div className="reference-control">{Icon && <Icon />}{children}</div>{error && <span className="reference-error">{error}</span>}</div>
}

function Panel({ id, step, icon: Icon, title, text, children }) {
  return <section id={id} className="reference-panel"><header><i><Icon /></i><div><h2>{title}</h2><p>{text}</p></div><small>Étape {step} / 4</small></header>{children}</section>
}

export default function MembreForm({ initialData = {}, onSubmit, isLoading, statuts = [], fonctions = [], isEditing = false }) {
  const { t, locale } = useT()
  const statutsList = asList(statuts)
  const fonctionsList = asList(fonctions)
  const [data, setData] = useState({
    nom: initialData.nom || '', prenom: initialData.prenom || '', telephone: initialData.telephone || '', telephone_secondaire: initialData.telephone_secondaire || '', email: initialData.email || '', adresse: initialData.adresse || '', zone_habitation: initialData.zone_habitation || '', eglise_origine: initialData.eglise_origine || '', date_naissance: initialData.date_naissance || '', sexe: initialData.sexe || '', etat_matrimonial: initialData.etat_matrimonial || '',
    date_presentation: initialData.date_presentation || '', date_conversion: initialData.date_conversion || '', date_affiliation: initialData.date_affiliation || '', date_bapteme: initialData.date_bapteme || '', anciennete_ebec: initialData.anciennete_ebec || '', statut: initialData.statut?.id || initialData.statut_id || '', niveau_etude: initialData.niveau_etude || '', profession: initialData.profession || '', actuellement_employe: Boolean(initialData.actuellement_employe), membre_petit_groupe: Boolean(initialData.membre_petit_groupe), dans_ecole_dimanche: Boolean(initialData.dans_ecole_dimanche), classe_ecole_dimanche: initialData.classe_ecole_dimanche || '', fonctions: (initialData.fonctions || []).map((item) => item.id || item), photo: null,
  })
  const [errors, setErrors] = useState({})
  const [newFunction, setNewFunction] = useState('')
  const [addedFunctions, setAddedFunctions] = useState([])
  const [photoPreview, setPhotoPreview] = useState(initialData.photo || '')
  const [registrationDate, setRegistrationDate] = useState(() => formatRegistrationDate(initialData.created_at, locale))
  const { mutate: createFonction, isPending: isCreatingFunction } = useCreateFonction()
  const availableFunctions = useMemo(() => {
    const knownIds = new Set(fonctionsList.map((fonction) => fonction.id))
    return [...fonctionsList, ...addedFunctions.filter((fonction) => !knownIds.has(fonction.id))]
  }, [fonctionsList, addedFunctions])
  const filled = useMemo(() => Object.values(data).filter((value) => Array.isArray(value) ? value.length : value instanceof File ? true : Boolean(value)).length, [data])
  const percent = Math.round((filled / fieldCount) * 100)
  const change = (name, value) => { setData((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const toggleFunction = (id) => change('fonctions', data.fonctions.includes(id) ? data.fonctions.filter((value) => value !== id) : [...data.fonctions, id])
  const addFunction = () => {
    const nomFonction = newFunction.trim()
    if (!nomFonction) return
    const existing = availableFunctions.find((fonction) => fonction.nomFonction.trim().toLocaleLowerCase() === nomFonction.toLocaleLowerCase())
    if (existing) {
      if (!data.fonctions.includes(existing.id)) toggleFunction(existing.id)
      setNewFunction('')
      return
    }
    createFonction({ nomFonction }, {
      onSuccess: ({ data: fonction }) => {
        setAddedFunctions((current) => [...current, fonction])
        change('fonctions', [...data.fonctions, fonction.id])
        setNewFunction('')
      },
    })
  }
  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!data.nom.trim()) nextErrors.nom = t('memberForm.lastNameRequired')
    if (!data.prenom.trim()) nextErrors.prenom = t('memberForm.firstNameRequired')
    if (!data.telephone.trim()) nextErrors.telephone = t('memberForm.phoneRequired')
    if (!data.statut) nextErrors.statut = t('memberForm.statusRequired')
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)
    if (!isEditing) setRegistrationDate(formatRegistrationDate(new Date(), locale))
    const payload = new FormData()
    const { statut, fonctions: selected, photo, ...values } = data
    Object.entries(values).forEach(([key, value]) => { if (value !== '' && value !== null && value !== undefined) payload.append(key, String(value)) })
    payload.append('statut_id', String(statut))
    selected.forEach((id) => payload.append('fonctions_ids', String(id)))
    if (photo instanceof File) payload.append('photo', photo)
    onSubmit(payload)
  }
  const steps = [['identite', 'Identité & contacts'], ['spirituel', 'Parcours spirituel'], ['eglise', "Vie dans l'église"], ['photo', 'Photo & fonctions']]
  return <div className="reference-form-page">
    <div className="reference-steps">{steps.map(([id, label], index) => <button type="button" key={id} className={`reference-step${index === 0 ? ' active' : ''}`} onClick={() => document.getElementById(`panel-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><b>{index + 1}</b><span>{label}</span></button>)}</div>
    <div className="reference-progress"><i><b style={{ width: `${percent}%` }} /></i><span>{percent} % complété</span></div>
    <form onSubmit={submit} className="reference-form">
      <Panel id="panel-identite" step="1" icon={FiUser} title="Identité et contacts" text="Informations personnelles et coordonnées du membre."><div className="reference-fields">
        <Field label="Nom" required error={errors.nom} icon={FiUser}><input value={data.nom} onChange={(e) => change('nom', e.target.value)} placeholder="Ex. Richard" /></Field><Field label="Prénom" required error={errors.prenom} icon={FiUser}><input value={data.prenom} onChange={(e) => change('prenom', e.target.value)} placeholder="Ex. Raybene" /></Field>
        <Field label="Téléphone principal" required error={errors.telephone} icon={FiPhone}><input type="tel" value={data.telephone} onChange={(e) => change('telephone', e.target.value)} placeholder="Ex. +509 0000 0000" /></Field><Field label="Téléphone secondaire" optional icon={FiPhone}><input type="tel" value={data.telephone_secondaire} onChange={(e) => change('telephone_secondaire', e.target.value)} /></Field>
        <Field label="E-mail" optional icon={FiMail}><input type="email" value={data.email} onChange={(e) => change('email', e.target.value)} placeholder="nom@exemple.com" /></Field><Field label="Église d'origine" optional icon={FiUsers}><input value={data.eglise_origine} onChange={(e) => change('eglise_origine', e.target.value)} /></Field>
        <Field label="Niveau d'étude" optional icon={FiBookOpen}><select value={data.niveau_etude} onChange={(e) => change('niveau_etude', e.target.value)}><option value="">Sélectionner un niveau</option><option value="PRIMAIRE">Primaire</option><option value="SECONDAIRE">Secondaire</option><option value="UNIVERSITAIRE">Universitaire</option><option value="PROFESSIONNEL">Professionnel</option><option value="AUTRE">Autre</option></select></Field><Field label="Profession" optional icon={FiBriefcase}><input value={data.profession} onChange={(e) => change('profession', e.target.value)} placeholder="Ex. Enseignant(e)" /></Field>
        <Field label="Adresse" optional icon={FiMapPin} full><input value={data.adresse} onChange={(e) => change('adresse', e.target.value)} placeholder="Rue, quartier, ville" /></Field><Field label="Zone d'habitation" optional icon={FiMapPin}><input value={data.zone_habitation} onChange={(e) => change('zone_habitation', e.target.value)} placeholder="Ex. Cap-Haïtien" /></Field><Field label="Date de naissance" optional icon={FiCalendar}><input type="date" value={data.date_naissance} onChange={(e) => change('date_naissance', e.target.value)} /></Field>
        <Field label="Sexe" optional icon={FiUsers}><select value={data.sexe} onChange={(e) => change('sexe', e.target.value)}><option value="">Sélectionner</option><option value="MALE">Masculin</option><option value="FEMELLE">Féminin</option></select></Field><Field label="État matrimonial" optional icon={FiUsers}><select value={data.etat_matrimonial} onChange={(e) => change('etat_matrimonial', e.target.value)}><option value="">Sélectionner</option>{[['CELIBATAIRE', 'Célibataire'], ['MARIE', 'Marié(e)'], ['SEPARE', 'Séparé(e)'], ['DIVORCE', 'Divorcé(e)'], ['VEUF', 'Veuf(ve)']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      </div></Panel>
      <Panel id="panel-spirituel" step="2" icon={FiShield} title="Parcours spirituel" text="Champs demandés pour les rapports et le suivi."><div className="reference-fields quad">{[['date_presentation', 'Date de présentation'], ['date_conversion', 'Date de conversion'], ['date_affiliation', "Date d'affiliation"], ['date_bapteme', 'Date de baptême']].map(([name, label]) => <Field key={name} label={label} icon={FiCalendar}><input type="date" value={data[name]} onChange={(e) => change(name, e.target.value)} /></Field>)}</div></Panel>
      <Panel id="panel-eglise" step="3" icon={FiUsers} title="Vie dans l'église" text="Statut, implication et engagement du membre."><div className="reference-fields">
        <Field label="Ancienneté à l'EBEC" optional icon={FiClock}><input value={data.anciennete_ebec} onChange={(e) => change('anciennete_ebec', e.target.value)} placeholder="Ex. 2 ans, 4 mois" /></Field><Field label="Statut" required error={errors.statut} icon={FiCheck}><select value={data.statut} onChange={(e) => change('statut', e.target.value)}><option value="">Sélectionner un statut</option>{statutsList.map((statut) => <option key={statut.id} value={statut.id}>{statut.libelle}</option>)}</select></Field>
        <div className="reference-field full"><span>Implication</span><div className="reference-toggle-grid">{[['actuellement_employe', 'Actuellement employé'], ['membre_petit_groupe', "Membre d'un petit groupe"], ['dans_ecole_dimanche', "Dans une classe d'école du dimanche"]].map(([name, label]) => <label key={name} className="reference-toggle"><input type="checkbox" checked={data[name]} onChange={(e) => change(name, e.target.checked)} />{label}</label>)}</div></div>
        <Field label="Classe d'école du dimanche" optional icon={FiBookOpen}><input disabled={!data.dans_ecole_dimanche} value={data.classe_ecole_dimanche} onChange={(e) => change('classe_ecole_dimanche', e.target.value)} placeholder="Ex. Classe des adultes" /></Field>
      </div></Panel>
      <Panel id="panel-photo" step="4" icon={FiCamera} title="Photo et fonctions" text="Ajoutez une photo et les responsabilités du membre."><div className="reference-fields"><div className="reference-field"><label>Photo du membre <em>Optionnel</em></label><label className="reference-dropzone"><i><FiUpload /></i><span><b>{data.photo ? 'Image sélectionnée' : 'Choisir un fichier'}</b><small>PNG, JPG jusqu'à 5 Mo</small></span>{photoPreview && <img className="reference-photo" src={photoPreview} alt="Aperçu" />}<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { change('photo', file); setPhotoPreview(URL.createObjectURL(file)) } }} /></label></div><div className="reference-field"><label>Fonctions <em>Optionnel</em></label><div className="reference-function-add"><input value={newFunction} onChange={(event) => setNewFunction(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addFunction() } }} placeholder="Écrire une nouvelle fonction" /><button type="button" onClick={addFunction} disabled={!newFunction.trim() || isCreatingFunction}><FiPlus />{isCreatingFunction ? 'Ajout…' : 'Ajouter'}</button></div><small className="reference-help">Écrivez une fonction puis cliquez sur Ajouter. Elle sera associée à ce membre.</small><div className="reference-chips">{availableFunctions.map((fonction) => <button type="button" key={fonction.id} className={`reference-chip${data.fonctions.includes(fonction.id) ? ' selected' : ''}`} onClick={() => toggleFunction(fonction.id)}>{fonction.nomFonction}</button>)}{!availableFunctions.length && <span className="text-xs text-secondary-400">Ajoutez votre première fonction ci-dessus.</span>}</div></div><Field label="Date d'enregistrement (automatique)" icon={FiCalendar} full><input value={registrationDate} readOnly /></Field></div></Panel>
      <div className="reference-actions"><button type="button" onClick={() => window.history.back()}>Annuler</button><button className="save" type="submit" disabled={isLoading}><FiCheck />{isLoading ? 'Enregistrement…' : isEditing ? 'Modifier le membre' : 'Enregistrer le membre'}</button></div>
    </form>
  </div>
}
