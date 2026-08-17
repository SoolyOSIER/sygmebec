import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Clock3, MapPin, Ticket } from 'lucide-react'
import { toMediaUrl } from '../../services/publicApi'

const labels = {
  details: 'Voir les d\u00e9tails',
  upcoming: '\u00c0 venir',
  unlimited: 'Places illimit\u00e9es',
  soldOut: 'Complet',
  remaining: 'places restantes',
}

const getDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDay = (date) => date ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(date) : '--'
const formatMonth = (date) => date ? new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).replace('.', '').toUpperCase() : '---'
const formatFullDate = (date) => date ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date) : 'Date \u00e0 confirmer'
const formatTime = (date) => date ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date) : '--:--'

export default function EvenementCard({ evenement, index = 0 }) {
  const date = getDate(evenement.date)
  const remaining = evenement.places_restantes
  const availability = remaining === null ? labels.unlimited : remaining === 0 ? labels.soldOut : `${remaining} ${labels.remaining}`
  const type = evenement.type_evenement?.nom || evenement.categorie || labels.upcoming

  return <motion.article initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.35) }} whileHover={{ y: -7 }} className="group h-full"><Link to={`/evenements/${evenement.id}`} className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-premium"><div className="relative h-56 overflow-hidden bg-navy-900"><div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-navy-900 to-gold-700" />{evenement.image && <img src={toMediaUrl(evenement.image)} alt={evenement.titre} className="relative h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}<div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" /><div className="absolute left-5 top-5 rounded-2xl bg-white px-3 py-2 text-center shadow-lg"><span className="block text-2xl font-bold leading-none text-navy-900">{formatDay(date)}</span><span className="mt-1 block text-[10px] font-bold tracking-wider text-primary-700">{formatMonth(date)}</span></div><span className="absolute bottom-4 left-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{type}</span></div><div className="flex flex-1 flex-col p-6"><div className="flex items-start justify-between gap-3"><h2 className="font-playfair text-xl font-bold leading-snug text-navy-900 transition-colors group-hover:text-primary-700">{evenement.titre}</h2><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${remaining === 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{availability}</span></div><div className="mt-5 space-y-3 border-y border-slate-100 py-4 text-sm text-slate-600"><p className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /><span className="capitalize">{formatFullDate(date)}</span></p><p className="flex items-center gap-3"><Clock3 className="h-4 w-4 shrink-0 text-primary-600" />{formatTime(date)}</p><p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /><span>{evenement.lieu || 'Lieu \u00e0 confirmer'}</span></p></div>{evenement.description && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{evenement.description}</p>}<div className="mt-auto flex items-center justify-between pt-6 text-sm font-semibold text-primary-700"><span className="inline-flex items-center gap-2"><Ticket className="h-4 w-4" /> {labels.details}</span><ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" /></div></div></Link></motion.article>
}
