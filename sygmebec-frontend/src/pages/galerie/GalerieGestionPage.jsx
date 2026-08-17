import { useEffect, useState } from 'react'
import { FiImage, FiTrash2, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'

import { galerieApi } from '../../api/galerieApi'
import { useEvenements } from '../../hooks/useEvenements'
import AnimatedCard from '../../components/ui/AnimatedCard'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const mediaUrl = (url) => !url || url.startsWith('http') ? url : `http://localhost:8000${url}`

export default function GalerieGestionPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ titre: '', evenement: '', ordre: '', image: null })
  const { data: evenementsData } = useEvenements({ page_size: 1000 })
  const evenements = evenementsData?.results || evenementsData || []
  const load = async () => { setLoading(true); try { const { data } = await galerieApi.getAll({ page_size: 100 }); setImages(data.results || data || []) } catch { toast.error('Impossible de charger la galerie.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const upload = async (event) => {
    event.preventDefault()
    if (!form.image) return toast.error('Choisissez une image à publier.')
    const payload = new FormData(); payload.append('image', form.image)
    if (form.titre.trim()) payload.append('titre', form.titre.trim())
    if (form.evenement) payload.append('evenement', form.evenement)
    if (form.ordre !== '') payload.append('ordre', form.ordre)
    setSending(true)
    try { await galerieApi.create(payload); toast.success('Image ajoutée à la vitrine.'); setForm({ titre: '', evenement: '', ordre: '', image: null }); event.target.reset(); await load() } catch (error) { toast.error(error.response?.data?.image?.[0] || 'L’image n’a pas pu être enregistrée.') } finally { setSending(false) }
  }
  const remove = async (image) => { if (!window.confirm(`Supprimer l’image « ${image.titre || 'sans titre'} » ?`)) return; try { await galerieApi.delete(image.id); setImages((current) => current.filter((item) => item.id !== image.id)); toast.success('Image supprimée.') } catch { toast.error('Suppression impossible.') } }
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-secondary-900">Images de la vitrine</h1><p className="mt-1 text-secondary-500">Ajoutez vos propres photos : elles apparaîtront immédiatement dans la galerie publique.</p></div><AnimatedCard className="rounded-2xl bg-white p-6 shadow-card"><form onSubmit={upload} className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-4"><Input label="Titre de l’image" value={form.titre} onChange={(event) => setForm((current) => ({ ...current, titre: event.target.value }))} placeholder="Ex. Baptême de juillet" /><label className="block text-sm font-medium text-secondary-700">Événement associé<select value={form.evenement} onChange={(event) => setForm((current) => ({ ...current, evenement: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"><option value="">Aucun</option>{evenements.map((event) => <option key={event.id} value={event.id}>{event.titre}</option>)}</select></label><Input label="Ordre" type="number" min="0" value={form.ordre} onChange={(event) => setForm((current) => ({ ...current, ordre: event.target.value }))} placeholder="0" /><label className="block text-sm font-medium text-secondary-700">Fichier image<input type="file" accept="image/*" required onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null }))} className="mt-2 block w-full text-sm" /></label><Button type="submit" variant="success" icon={FiUpload} isLoading={sending}>Publier l’image</Button></form></AnimatedCard><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{loading ? <p className="text-secondary-400">Chargement…</p> : images.length === 0 ? <AnimatedCard className="col-span-full rounded-2xl p-10 text-center text-secondary-400"><FiImage className="mx-auto mb-3 text-4xl" />Aucune image publiée pour le moment.</AnimatedCard> : images.map((image) => <AnimatedCard key={image.id} className="overflow-hidden rounded-2xl bg-white shadow-card"><img src={mediaUrl(image.image)} alt={image.titre || 'Image de la galerie'} className="h-52 w-full object-cover" /><div className="flex items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate font-medium text-secondary-900">{image.titre || 'Sans titre'}</p><p className="text-xs text-secondary-400">Ordre : {image.ordre}</p></div><Button variant="ghost" size="sm" icon={FiTrash2} className="text-danger" onClick={() => remove(image)}>Supprimer</Button></div></AnimatedCard>)}</div></div>
}
