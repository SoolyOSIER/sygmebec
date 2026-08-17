import { HandHeart, ScrollText, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { membershipCommitment, membershipCovenant, membershipSteps, paragraphs } from '../../content/churchContent'

const labels = {
  process: 'Marche \u00e0 suivre',
  heading: 'Notre d\u00e9marche et nos engagements',
  description: 'D\u00e9couvrez les informations destin\u00e9es aux personnes qui souhaitent s\u2019unir \u00e0 la famille de l\u2019\u00c9glise Baptiste de l\u2019Espoir.',
}

const TextContent = ({ value, className = '' }) => <div className={`space-y-4 leading-relaxed ${className}`}>{paragraphs(value).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>

export default function MembershipInfo() {
  return <section className="bg-gray-50 py-20"><div className="container-custom max-w-6xl"><AnimatedSection><div className="mx-auto max-w-3xl text-center"><span className="section-subtitle"><Users className="h-4 w-4" /> Devenir membre</span><h2 className="section-title mt-4">{labels.heading}</h2><p className="mt-4 text-gray-600">{labels.description}</p></div></AnimatedSection><AnimatedSection delay={0.08}><article className="mx-auto mt-10 max-w-4xl rounded-3xl border border-primary-100 bg-white p-7 shadow-sm md:p-10"><span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700"><HandHeart className="h-4 w-4" /> {labels.process}</span><TextContent value={membershipSteps} className="mt-5 text-gray-700" /></article></AnimatedSection><div className="mt-10 grid gap-8 lg:grid-cols-2"><AnimatedSection><article className="h-full rounded-3xl border border-primary-100 bg-primary-50/60 p-7 md:p-10"><HandHeart className="h-10 w-10 text-primary-600" /><h3 className="mt-5 font-playfair text-3xl font-bold text-navy-900">Engagement des membres</h3><TextContent value={membershipCommitment} className="mt-5 text-gray-700" /></article></AnimatedSection><AnimatedSection delay={0.1}><article className="h-full rounded-3xl bg-navy-900 p-7 text-white shadow-premium md:p-10"><ScrollText className="h-10 w-10 text-gold-300" /><h3 className="mt-5 font-playfair text-3xl font-bold">Alliance des membres</h3><TextContent value={membershipCovenant} className="mt-5 text-slate-200" /></article></AnimatedSection></div></div></section>
}
