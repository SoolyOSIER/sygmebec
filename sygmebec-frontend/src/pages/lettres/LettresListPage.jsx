import { useMemo, useState } from 'react'
import { FiActivity, FiArrowRight, FiCalendar, FiCheck, FiDownload, FiFileText, FiInfo, FiPlus, FiSend, FiTrendingUp } from 'react-icons/fi'

import { useMembres } from '../../hooks/useMembres'
import { useCreateLettre, useDownloadLettre, useLettres } from '../../hooks/useLettres'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import './lettresReference.css'

const today = new Date().toISOString().slice(0, 10)
const initialForm = (type = 'ATTESTATION') => ({ type_lettre: type, membre_id: '', destinataire: '', date_emission: today })
const isAttestation = (letter) => letter.type_lettre !== 'TRANSFERT'
const memberInitials = (member) => (member?.nom_complet || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'MB'
const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-HT') : '—'

export default function LettresListPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState(initialForm)
  const { data: lettersData, isLoading } = useLettres({ page_size: 1000 })
  const { data: membersData } = useMembres({ page_size: 1000 })
  const { mutate: create, isPending } = useCreateLettre()
  const { mutate: download, isPending: isDownloading } = useDownloadLettre()
  const letters = lettersData?.results || lettersData || []
  const members = membersData?.results || membersData || []
  const memberOptions = useMemo(() => members.map((member) => ({ value: String(member.id), label: member.nom_complet || `${member.prenom || ''} ${member.nom || ''}`.trim() })), [members])
  const attestationCount = letters.filter(isAttestation).length
  const transferCount = letters.filter((letter) => letter.type_lettre === 'TRANSFERT').length
  const visibleLetters = filter === 'ALL' ? letters : letters.filter((letter) => filter === 'ATTESTATION' ? isAttestation(letter) : letter.type_lettre === filter)
  const latestLetters = [...letters].sort((a, b) => String(b.created_at || b.date_emission).localeCompare(String(a.created_at || a.date_emission))).slice(0, 4)
  const now = new Date()
  const monthCount = letters.filter((letter) => {
    const date = new Date(`${letter.date_emission}T00:00:00`)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const nextReference = `EBEC-${now.getFullYear()}-${String((lettersData?.count || letters.length) + 1).padStart(4, '0')}`
  const attestationPercent = letters.length ? Math.round((attestationCount / letters.length) * 100) : 0
  const transferPercent = letters.length ? 100 - attestationPercent : 0
  const selectedMember = memberOptions.find((member) => member.value === form.membre_id)?.label

  const close = () => { setIsOpen(false); setForm(initialForm()) }
  const openCreate = (type = 'ATTESTATION') => { setForm(initialForm(type)); setIsOpen(true) }
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    create({ ...form, membre_id: Number(form.membre_id) }, { onSuccess: close })
  }

  return <div className="letters-reference">
    <div className="lr-page-head">
      <div><div className="lr-eyebrow">Gestion des lettres</div><h1>Lettres</h1><p>Générez les lettres officielles à partir des modèles de l’église.</p></div>
      <button className="lr-create" onClick={() => openCreate()}><FiPlus size={16} />Nouvelle lettre</button>
    </div>

    <div className="lr-template-grid">
      <button className="lr-template attestation" onClick={() => openCreate('ATTESTATION')}><span className="lr-template-arrow"><FiArrowRight size={14} /></span><span className="lr-template-icon"><FiFileText size={20} /></span><h3>Lettre d’attestation</h3><p>Le nom du membre et la date sont insérés automatiquement.</p></button>
      <button className="lr-template transfert" onClick={() => openCreate('TRANSFERT')}><span className="lr-template-arrow"><FiArrowRight size={14} /></span><span className="lr-template-icon"><FiSend size={20} /></span><h3>Lettre de transfert</h3><p>Indiquez le membre, l’église destinataire et la date.</p></button>
    </div>

    <div className="lr-results"><span className="lr-results-badge"><FiCheck size={13} />{letters.length} lettre{letters.length > 1 ? 's' : ''} générée{letters.length > 1 ? 's' : ''}</span><span className="lr-divider-dot" /><span className="lr-meta">Dernière génération · {letters[0] ? formatDate(letters[0].date_emission) : 'Aucune lettre'}</span></div>

    <div className="lr-stats">
      <article className="lr-stat lr-blue"><span className="lr-stat-icon"><FiSend size={21} /></span><div className="lr-stat-num">{letters.length}</div><div className="lr-stat-label">Total lettres</div><div className="lr-trend positive"><FiTrendingUp size={11} />Historique des documents</div></article>
      <article className="lr-stat lr-purple"><span className="lr-stat-icon"><FiFileText size={21} /></span><div className="lr-stat-num">{attestationCount}</div><div className="lr-stat-label">Attestations</div><div className="lr-trend">{letters.length ? `${attestationPercent} % des lettres émises` : 'Aucune attestation'}</div></article>
      <article className="lr-stat lr-amber"><span className="lr-stat-icon"><FiSend size={21} /></span><div className="lr-stat-num">{transferCount}</div><div className="lr-stat-label">Transferts</div><div className="lr-trend">{transferCount ? 'Lettres vers une autre église' : 'Aucun transfert'}</div></article>
      <article className="lr-stat lr-green"><span className="lr-stat-icon"><FiCalendar size={21} /></span><div className="lr-stat-num">{monthCount}</div><div className="lr-stat-label">Générées ce mois-ci</div><div className="lr-trend">{now.toLocaleDateString('fr-HT', { month: 'long', year: 'numeric' })}</div></article>
    </div>

    <div className="lr-overview">
      <section className="lr-panel"><div className="lr-panel-head"><div><h3>Répartition par type</h3><p>Lettres générées selon leur nature</p></div><span className="lr-tag">{letters.length} au total</span></div><div className="lr-donut-body"><div className="lr-donut" style={{ '--lr-attestation': attestationPercent, '--lr-transfert': transferPercent }}><div className="lr-donut-content"><strong>{letters.length}</strong><span>LETTRE{letters.length > 1 ? 'S' : ''}</span></div></div><div className="lr-legend"><div className="lr-legend-row"><span className="lr-dot" style={{ background: '#7c50d1' }} /><span className="lr-legend-label">Lettre d’attestation</span><span className="lr-legend-value">{attestationCount}</span></div><div className="lr-legend-row"><span className="lr-dot" style={{ background: '#c17f18' }} /><span className="lr-legend-label">Lettre de transfert</span><span className="lr-legend-value">{transferCount}</span></div></div></div></section>
      <section className="lr-panel"><div className="lr-panel-head"><div><h3>Activité récente</h3><p>Derniers documents générés</p></div><span className="lr-tag">Récent</span></div><div className="lr-feed">{latestLetters.length ? latestLetters.map((letter) => <div className="lr-feed-item" key={letter.id}><span className={`lr-feed-icon ${isAttestation(letter) ? 'lr-purple' : 'lr-amber'}`}><FiFileText size={16} /></span><div><div className="lr-feed-text"><b>{letter.type_lettre_libelle}</b> générée pour {letter.membre?.nom_complet || 'un membre'} — réf. {letter.reference}</div><div className="lr-feed-time">{formatDate(letter.date_emission)}</div></div></div>) : <div className="lr-feed-item"><span className="lr-feed-icon lr-green"><FiActivity size={16} /></span><div><div className="lr-feed-text">Aucune lettre générée pour le moment.</div><div className="lr-feed-time">Créez votre première lettre</div></div></div>}</div></section>
    </div>

    <div className="lr-kpis">
      <article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#1fa060', '--lr-progress': 65 }}><span>8s</span></span><div><div className="lr-kpi-num">Temps moyen</div><div className="lr-kpi-label">Génération par lettre</div></div></article>
      <article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#3768d6', '--lr-progress': Math.min(monthCount * 25, 100) }}><span>{monthCount}</span></span><div><div className="lr-kpi-num">Lettres ce mois</div><div className="lr-kpi-label">{now.toLocaleDateString('fr-HT', { month: 'long', year: 'numeric' })}</div></div></article>
      <article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#7c50d1', '--lr-progress': 100 }}><span>#</span></span><div><div className="lr-kpi-num">Prochaine référence</div><div className="lr-kpi-label">{nextReference}</div></div></article>
      <article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#c17f18', '--lr-progress': 100 }}><span>2</span></span><div><div className="lr-kpi-num">Formats disponibles</div><div className="lr-kpi-label">Word · PDF</div></div></article>
    </div>

    <section className="lr-list"><div className="lr-list-head"><h2>Historique des lettres</h2><p>Téléchargez une lettre au format Word ou PDF.</p></div><div className="lr-chips"><button className={`lr-chip ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Toutes ({letters.length})</button><button className={`lr-chip ${filter === 'ATTESTATION' ? 'active' : ''}`} onClick={() => setFilter('ATTESTATION')}>Attestations ({attestationCount})</button><button className={`lr-chip ${filter === 'TRANSFERT' ? 'active' : ''}`} onClick={() => setFilter('TRANSFERT')}>Transferts ({transferCount})</button></div><div className="lr-table-wrap"><table><thead><tr><th>Référence</th><th>Type</th><th>Membre</th><th>Église destinataire</th><th>Date</th><th>Actions</th></tr></thead><tbody>{visibleLetters.map((letter) => <tr key={letter.id}><td><span className="lr-reference">{letter.reference}</span></td><td><span className={`lr-pill ${isAttestation(letter) ? 'attestation' : 'transfert'}`}>{letter.type_lettre_libelle}</span></td><td><div className="lr-member"><span className="lr-avatar">{memberInitials(letter.membre)}</span><span className="lr-member-name">{letter.membre?.nom_complet || '—'}</span></div></td><td>{letter.destinataire || <span className="lr-empty">—</span>}</td><td>{formatDate(letter.date_emission)}</td><td><div className="lr-actions"><button className="lr-export word" disabled={isDownloading} onClick={() => download({ id: letter.id, format: 'docx' })}><FiFileText size={14} />Word</button><button className="lr-export pdf" disabled={isDownloading} onClick={() => download({ id: letter.id, format: 'pdf' })}><FiDownload size={14} />PDF</button></div></td></tr>)}</tbody></table></div><div className="lr-list-foot"><span>{isLoading ? 'Chargement…' : `Affichage de ${visibleLetters.length} lettre${visibleLetters.length > 1 ? 's' : ''} sur ${letters.length}`}</span><span>{filter === 'ALL' ? 'Toutes les lettres' : filter === 'ATTESTATION' ? 'Attestations' : 'Transferts'}</span></div></section>

    <Modal isOpen={isOpen} onClose={close} title="Nouvelle lettre" size="lg">
      <form onSubmit={submit} className="space-y-5">
        <p className="lr-form-intro">Choisissez le modèle, le membre et la date. Le document officiel sera ensuite prêt à exporter en Word ou PDF.</p>
        <div><p className="mb-2 text-sm font-medium text-secondary-700">Modèle de lettre</p><div className="lr-form-types"><button type="button" className={`lr-form-type attestation ${form.type_lettre === 'ATTESTATION' ? 'selected' : ''}`} onClick={() => setForm((current) => ({ ...current, type_lettre: 'ATTESTATION', destinataire: '' }))}><FiFileText size={19} /><span><strong>Attestation</strong><span>Pour confirmer l’appartenance d’un membre.</span></span></button><button type="button" className={`lr-form-type transfert ${form.type_lettre === 'TRANSFERT' ? 'selected' : ''}`} onClick={() => setForm((current) => ({ ...current, type_lettre: 'TRANSFERT' }))}><FiSend size={19} /><span><strong>Transfert</strong><span>Pour recommander un membre à une autre église.</span></span></button></div></div>
        <div className="grid gap-4 md:grid-cols-2"><Select label="Membre concerné" value={form.membre_id} onChange={update('membre_id')} placeholder="Sélectionnez un membre" options={memberOptions} required /><Input label="Date d’émission" type="date" value={form.date_emission} onChange={update('date_emission')} required />{form.type_lettre === 'TRANSFERT' && <Input label="Nom de l’église destinataire" value={form.destinataire} onChange={update('destinataire')} placeholder="Ex. Église Baptiste …" required containerClassName="md:col-span-2" />}</div>
        <div className="lr-form-preview"><FiInfo size={17} /><span>{selectedMember ? <>La lettre <b>{form.type_lettre === 'TRANSFERT' ? 'de transfert' : 'd’attestation'}</b> sera préparée pour <b>{selectedMember}</b>{form.type_lettre === 'TRANSFERT' && form.destinataire ? <> à destination de <b>{form.destinataire}</b></> : ''}.</> : 'Sélectionnez un membre pour préparer la lettre.'}</span></div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5"><Button type="button" variant="ghost" onClick={close}>Annuler</Button><Button type="submit" icon={FiFileText} isLoading={isPending}>Créer la lettre</Button></div>
      </form>
    </Modal>
  </div>
}
