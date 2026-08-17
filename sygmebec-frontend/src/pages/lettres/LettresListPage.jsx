import { useMemo, useState } from 'react'
import { FiDownload, FiFileText, FiPlus, FiSend } from 'react-icons/fi'

import { useMembres } from '../../hooks/useMembres'
import { useCreateLettre, useDownloadLettre, useLettres } from '../../hooks/useLettres'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'

const today = new Date().toISOString().slice(0, 10)
const types = [
  { value: 'RECOMMANDATION', label: 'Lettre de recommandation' },
  { value: 'TRANSFERT', label: 'Lettre de transfert' },
]

export default function LettresListPage() {
  const [page, setPage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ type_lettre: 'RECOMMANDATION', membre_id: '', destinataire: '', objet: '', contenu: '', date_emission: today })
  const { data: lettersData, isLoading } = useLettres({ page, page_size: 10 })
  const { data: membersData } = useMembres({ page_size: 1000 })
  const { mutate: create, isPending } = useCreateLettre()
  const { mutate: download, isPending: isDownloading } = useDownloadLettre()
  const letters = lettersData?.results || []
  const members = membersData?.results || membersData || []
  const memberOptions = useMemo(() => members.map((member) => ({ value: String(member.id), label: member.nom_complet || `${member.prenom || ''} ${member.nom || ''}`.trim() })), [members])

  const reset = () => setForm({ type_lettre: 'RECOMMANDATION', membre_id: '', destinataire: '', objet: '', contenu: '', date_emission: today })
  const close = () => { setIsOpen(false); reset() }
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    create({ ...form, membre_id: Number(form.membre_id) }, { onSuccess: close })
  }

  const columns = [
    { key: 'reference', label: 'Référence', render: (_, item) => <span className="font-semibold text-secondary-900">{item.reference}</span> },
    { key: 'type_lettre', label: 'Type', render: (_, item) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.type_lettre === 'TRANSFERT' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>{item.type_lettre_libelle}</span> },
    { key: 'membre', label: 'Membre', render: (_, item) => item.membre?.nom_complet || '—' },
    { key: 'destinataire', label: 'Destinataire', render: (value) => value || '—' },
    { key: 'date_emission', label: 'Date', render: (value) => new Date(`${value}T00:00:00`).toLocaleDateString('fr-HT') },
    { key: 'actions', label: '', className: 'text-right', render: (_, item) => <Button size="sm" variant="ghost" icon={FiDownload} isLoading={isDownloading} onClick={() => download(item.id)}>PDF</Button> },
  ]

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-secondary-900">Lettres</h1><p className="mt-1 text-secondary-500">Créez et téléchargez les lettres officielles de l’église.</p></div><Button icon={FiPlus} size="lg" onClick={() => setIsOpen(true)}>Nouvelle lettre</Button></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><FiFileText className="text-indigo-700" size={24} /><p className="mt-3 font-semibold text-indigo-950">Lettre de recommandation</p><p className="mt-1 text-sm text-indigo-800">Pour recommander un membre.</p></div><div className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><FiSend className="text-amber-700" size={24} /><p className="mt-3 font-semibold text-amber-950">Lettre de transfert</p><p className="mt-1 text-sm text-amber-800">Pour le transfert vers une autre église.</p></div></div><DataTable columns={columns} data={letters} loading={isLoading} currentPage={page} totalPages={Math.max(1, Math.ceil((lettersData?.count || 0) / 10))} totalItems={lettersData?.count || 0} itemsPerPage={10} onPageChange={setPage} /><Modal isOpen={isOpen} onClose={close} title="Nouvelle lettre" size="lg"><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><Select label="Type de lettre" value={form.type_lettre} onChange={update('type_lettre')} options={types} required /><Select label="Membre concerné" value={form.membre_id} onChange={update('membre_id')} placeholder="Sélectionnez un membre" options={memberOptions} required /><Input label="Destinataire" value={form.destinataire} onChange={update('destinataire')} placeholder="Église ou institution destinataire" required={form.type_lettre === 'TRANSFERT'} /><Input label="Date d’émission" type="date" value={form.date_emission} onChange={update('date_emission')} required /></div><Input label="Objet" value={form.objet} onChange={update('objet')} placeholder="Ex. Recommandation de membre" required /><label className="block text-sm font-medium text-secondary-700">Contenu de la lettre<textarea value={form.contenu} onChange={update('contenu')} rows="6" className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-secondary-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Laissez vide pour utiliser le texte officiel par défaut." /></label><div className="flex justify-end gap-3 border-t border-gray-100 pt-5"><Button type="button" variant="ghost" onClick={close}>Annuler</Button><Button type="submit" icon={FiFileText} isLoading={isPending}>Enregistrer la lettre</Button></div></form></Modal></div>
}
