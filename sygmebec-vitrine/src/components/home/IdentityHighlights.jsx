import { BookOpenCheck, HeartHandshake, MapPin } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const highlights = [
  {
    icon: BookOpenCheck,
    title: 'La Parole comme fondement',
    text: 'La Bible est notre référence pour la foi, la vie et le service.',
  },
  {
    icon: HeartHandshake,
    title: 'Une communauté qui accompagne',
    text: 'Grandir dans la foi, servir avec amour et vivre une communion authentique.',
  },
  {
    icon: MapPin,
    title: 'Au cœur du Cap-Haïtien',
    text: 'Une église missionnaire engagée auprès de sa communauté et au-delà.',
  },
]

export default function IdentityHighlights() {
  return <section className="relative -mt-7 z-[1] pb-8 md:-mt-10 md:pb-12"><div className="container-custom"><AnimatedSection><div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,42,74,0.12)] md:grid-cols-3">{highlights.map(({ icon: Icon, title, text }) => <article key={title} className="group border-b border-slate-100 p-6 transition-colors hover:bg-primary-50/60 md:border-b-0 md:border-r md:last:border-r-0 md:p-8"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-50 text-gold-600 transition-transform group-hover:-translate-y-1"><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-playfair text-xl font-bold text-navy-900">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{text}</p></article>)}</div></AnimatedSection></div></section>
}
