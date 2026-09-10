import { t, useTranslation } from '../i18n'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Search, Sparkles } from 'lucide-react'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'
import EvenementCard from '../components/evenements/EvenementCard'
import { evenementService } from '../services/evenementService'

const labels = {
  title: '\u00c9v\u00e9nements - \u00c9glise Baptiste de l\u2019Espoir',
  events: '\u00c9v\u00e9nements',
  event: '\u00e9v\u00e9nement',
  published: 'publi\u00e9',
  subtitle: 'Tous les \u00e9v\u00e9nements',
  description: 'D\u00e9couvrez les rencontres, activit\u00e9s et services publi\u00e9s par l\u2019\u00c9glise Baptiste de l\u2019Espoir.',
  search: 'Rechercher un \u00e9v\u00e9nement...',
  loading: 'Chargement des \u00e9v\u00e9nements...',
  empty: 'Aucun \u00e9v\u00e9nement ne correspond \u00e0 votre recherche.',
  error: 'Les \u00e9v\u00e9nements ne peuvent pas \u00eatre charg\u00e9s pour le moment.',
  tryAgain: 'Essayez une autre recherche ou revenez bient\u00f4t.',
}

export default function Evenements() {
  useTranslation()

  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    evenementService.getEvenements()
      .then((data) => setEvenements(Array.isArray(data) ? data : []))
      .catch(() => { setEvenements([]); setFailed(true) })
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fr-FR')
    if (!query) return evenements
    return evenements.filter((event) => `${event.titre} ${event.lieu} ${event.description || ''} ${event.type_evenement?.nom || event.categorie || ''}`.toLocaleLowerCase('fr-FR').includes(query))
  }, [evenements, search])

  return <><SEO title={t(labels.title)} description={t(labels.description)} /><main className="relative overflow-hidden py-16 md:py-20"><div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary-50 via-white to-transparent" /><div className="container-custom"><AnimatedSection><header className="mx-auto max-w-3xl text-center"><span className="section-subtitle"><CalendarDays className="h-4 w-4" /> {t(labels.events)}</span><h1 className="section-title mt-4">{t(labels.subtitle)}</h1><p className="mt-4 text-lg leading-relaxed text-gray-600">{t(labels.description)}</p><p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm"><Sparkles className="h-4 w-4 text-gold-600" /> {t(evenements.length === 1 ? '{count} événement publié' : '{count} événements publiés', { count: evenements.length })}</p></header></AnimatedSection><AnimatedSection delay={0.08}><div className="relative mx-auto mt-10 max-w-2xl"><Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t(labels.search)} className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 text-slate-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100" /></div></AnimatedSection>{loading ? <p className="py-20 text-center text-gray-500">{t(labels.loading)}</p> : failed ? <div className="py-20 text-center"><p className="text-rose-700">{t(labels.error)}</p></div> : results.length === 0 ? <div className="py-20 text-center"><CalendarDays className="mx-auto mb-4 h-14 w-14 text-slate-300" /><p className="text-lg font-semibold text-navy-900">{t(labels.empty)}</p><p className="mt-2 text-sm text-slate-500">{t(labels.tryAgain)}</p></div> : <section className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">{results.map((event, index) => <EvenementCard key={event.id} evenement={event} index={index} />)}</section>}</div></main></>
}
