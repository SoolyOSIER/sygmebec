import { t, useTranslation, localizedDate } from '../i18n'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, CheckCircle, MapPin, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

import SEO from '../components/common/SEO'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { evenementService } from '../services/evenementService'
import { toMediaUrl } from '../services/publicApi'

const formatDate = (value) => localizedDate(value, { dateStyle: 'full', timeStyle: 'short' })

export default function EvenementDetail() {
  useTranslation()

  const { eventId } = useParams()
  const navigate = useNavigate()
  const [evenement, setEvenement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', nombre_places: 1 })
  useEffect(() => { evenementService.getEvenementById(eventId).then(setEvenement).catch(() => { toast.error('Événement introuvable.'); navigate('/evenements') }).finally(() => setLoading(false)) }, [eventId, navigate])
  const submit = async (event) => { event.preventDefault(); setSending(true); try { await evenementService.inscrire(eventId, form); setDone(true); toast.success('Votre inscription est enregistrée.') } catch (error) { toast.error(error.response?.data?.non_field_errors?.[0] || "L'inscription n'a pas pu être enregistrée.") } finally { setSending(false) } }
  if (loading) return <p className="py-20 text-center text-gray-500">{t("Chargement…")}</p>
  if (!evenement) return null
  return <><SEO title={t(`${evenement.titre} - SYGMEBEC`)} description={t(evenement.description || evenement.titre)} /><div className="py-16"><div className="container-custom"><button type="button" onClick={() => navigate('/evenements')} className="mb-6 text-sm text-primary-700">{t("← Retour aux événements")}</button><div className="grid grid-cols-1 gap-8 lg:grid-cols-3"><main className="lg:col-span-2">{evenement.image && <img src={toMediaUrl(evenement.image)} alt={t(evenement.titre)} className="mb-7 h-80 w-full rounded-3xl object-cover shadow-elegant" />}<span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">{t(evenement.type_evenement?.nom || evenement.categorie)}</span><h1 className="mt-4 text-4xl font-bold text-navy-900">{t(evenement.titre)}</h1><div className="mt-6 space-y-3 rounded-2xl bg-primary-50 p-5 text-gray-700"><p className="flex gap-3"><Calendar className="h-5 w-5 text-primary-600" />{t(formatDate(evenement.date))}</p><p className="flex gap-3"><MapPin className="h-5 w-5 text-primary-600" />{t(evenement.lieu)}</p>{evenement.responsable && <p className="flex gap-3"><Users className="h-5 w-5 text-primary-600" />{t("Responsable : ")}{t(evenement.responsable.nom_complet)}</p>}</div><h2 className="mt-8 text-2xl font-bold text-navy-900">{t("Description")}</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">{t(evenement.description || 'Aucune description disponible.')}</p></main><aside><Card className="sticky top-28"><CardHeader><CardTitle>{t("Inscription")}</CardTitle><p className="text-sm text-gray-500">{t(evenement.places_restantes === null ? 'Places illimitées' : t(evenement.places_restantes === 1 ? '{count} place restante' : '{count} places restantes', { count: evenement.places_restantes }))}</p></CardHeader><CardContent>{done ? <div className="py-6 text-center"><CheckCircle className="mx-auto mb-3 h-12 w-12 text-success-600" /><p className="font-semibold text-navy-900">{t("Inscription confirmée")}</p></div> : <form onSubmit={submit} className="space-y-4">{[['nom', 'Nom'], ['prenom', 'Prénom'], ['email', 'E-mail'], ['telephone', 'Téléphone']].map(([name, label]) => <label key={name} className="block text-sm font-medium text-gray-700">{t(label)}{t(name !== 'telephone' && ' *')}<input required={name !== 'telephone'} name={name} type={name === 'email' ? 'email' : 'text'} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label>)}<label className="block text-sm font-medium text-gray-700">{t("Nombre de places")}<input type="number" min="1" max={evenement.places_restantes || undefined} value={form.nombre_places} onChange={(event) => setForm((current) => ({ ...current, nombre_places: Number(event.target.value) }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label><Button type="submit" variant="gold" className="w-full" disabled={sending || evenement.places_restantes === 0}>{t(sending ? 'Inscription…' : 'M’inscrire')}</Button></form>}</CardContent></Card></aside></div></div></div></>
}
