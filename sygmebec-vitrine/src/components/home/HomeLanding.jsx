import { Link } from 'react-router-dom'
import { BookOpen, Church, HandHeart, Heart, MapPin, Music2, Send, Sparkles, Star, Users, Wheat } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import './homeLanding.css'

const values = [
  { icon: Sparkles, title: 'Foi', text: 'Une confiance vivante en Dieu qui guide chaque décision et chaque pas de la communauté.' },
  { icon: BookOpen, title: 'Fidélité', text: 'Un enseignement fidèle à la Parole de Dieu, transmis avec constance et intégrité.' },
  { icon: Users, title: 'Communion', text: 'Une fraternité authentique où chacun trouve sa place et grandit avec les autres.' },
  { icon: Heart, title: 'Amour', text: 'Une compassion concrète, tournée vers les membres comme vers toute la communauté.' },
  { icon: HandHeart, title: 'Service', text: 'Mettre nos dons et nos talents au service de Dieu et de notre prochain, avec joie.' },
]

const ministries = [
  ['Conseil des Anciens', "Responsable de l'orientation spirituelle et de la supervision administrative."],
  ['Corps pastoral', "Prend soin du peuple de Dieu par la prédication, l'enseignement, la prière et le soutien spirituel."],
  ['Éducation chrétienne', "Promeut l'enseignement biblique, la formation des membres et le développement spirituel."],
  ['Ministère de la Jeunesse', 'Encadre les jeunes, développe leur leadership chrétien et les prépare à servir Dieu.'],
  ['Direction des Enfants', "Assure l'encadrement spirituel, moral et éducatif des enfants à travers des activités adaptées."],
  ['Ministère de la Musique', "Responsable de l'organisation de la louange, de l'adoration et du développement musical."],
  ['Évangélisation & Missions', "Coordonne les activités d'évangélisation locale et les actions missionnaires."],
  ['Comité administratif', 'Assure la gestion des biens, des ressources financières et des affaires administratives.'],
  ['Diacres & Diaconesses', "Collabore aux services spirituels et à l'assistance des membres."],
  ['Secrétariat', "Assure la gestion administrative, la communication interne et le suivi des membres."],
]

const stats = [
  ['1998', 'Année de fondation'],
  ['28', 'Années de service'],
  ['10', 'Ministères & instances'],
  ['4', 'Générations réunies'],
]

export default function HomeLanding() {
  return (
    <div className="ebec-home">
      <section className="ebec-hero">
        <div className="ebec-stars" aria-hidden="true">{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ '--x': `${(index * 37) % 100}%`, '--y': `${(index * 19) % 65}%`, '--delay': `${(index % 7) * 0.45}s` }} />)}</div>
        <div className="ebec-rays" aria-hidden="true">{[-30, -20, -10, 0, 10, 20, 30].map((angle) => <i key={angle} style={{ '--angle': `${angle}deg`, '--opacity': 0.48 - Math.abs(angle) / 85 }} />)}</div>
        <div className="ebec-halo" aria-hidden="true" />
        <div className="ebec-container ebec-hero-content">
          <div className="ebec-kicker"><span /> Fondée en 1998 · Vertières, Cap-Haïtien</div>
          <h1>Découvrir l'espérance <em>véritable</em> en Jésus-Christ</h1>
          <p>Une communauté chrétienne évangélique qui accueille avec joie toute personne désireuse de connaître Dieu, de grandir dans sa foi et de vivre une réelle communion fraternelle.</p>
          <div className="ebec-actions">
            <a className="ebec-button ebec-button-gold" href="#notre-eglise">Découvrir notre église</a>
            <Link className="ebec-button ebec-button-outline" to="/contact">Nous rendre visite</Link>
          </div>
        </div>
        <div className="ebec-hero-address"><MapPin size={14} /> Ruelle Jean-Jacques Dessalines #4, Village Christophe</div>
        <a className="ebec-explore" href="#notre-eglise">Explorer <span /></a>
      </section>

      <section className="ebec-stat-bar" aria-label="Quelques chiffres clés">
        <div className="ebec-container ebec-stat-grid">
          {stats.map(([number, label], index) => <AnimatedSection key={label} delay={index * 0.08}><div className="ebec-stat"><strong>{number}</strong><span>{label}</span></div></AnimatedSection>)}
        </div>
      </section>

      <section className="ebec-section" id="notre-eglise">
        <div className="ebec-container">
          <AnimatedSection className="ebec-heading"><span>À propos de nous</span><h2>Une église enracinée dans la Parole, tournée vers la communauté</h2></AnimatedSection>
          <div className="ebec-about-grid">
            <AnimatedSection>
              <div className="ebec-founded"><i /> Fondée en juin 1998</div>
              <div className="ebec-body-copy">
                <p>L'Église Baptiste de l'Espoir du Cap-Haïtien est une institution chrétienne évangélique fondée dans le but de glorifier Dieu, d'annoncer l'Évangile de Jésus-Christ et de contribuer au développement spirituel, moral et social de la communauté.</p>
                <p>Située à la Ruelle Jean-Jacques Dessalines #4, Village Christophe, Vertières, Cap-Haïtien, elle accueille avec joie toutes les personnes désireuses de connaître Dieu, de grandir dans leur foi et de vivre une véritable communion fraternelle.</p>
              </div>
              <div className="ebec-timeline">
                <article><b>1998 — Fondation</b><p>Naissance de l'Église Baptiste de l'Espoir, avec pour objectif de glorifier Dieu et d'annoncer fidèlement l'Évangile à Vertières.</p></article>
                <article><b>Croissance — Structuration des ministères</b><p>Mise en place progressive des instances et ministères pour servir chaque génération.</p></article>
                <article><b>Aujourd'hui — Une communauté vivante</b><p>L'Église poursuit sa mission avec foi, amour et engagement, au service de la communauté.</p></article>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.12}>
              <div className="ebec-vision-card"><span>Notre vision</span><p>Former des disciples de Jésus-Christ capables d'impacter positivement leur famille, leur communauté et leur pays par leur témoignage, leur amour et leur engagement au service de Dieu.</p></div>
              <div className="ebec-mission-card"><span>Notre mission</span><ul><li>Proclamer fidèlement l'Évangile de Jésus-Christ</li><li>Former des disciples enracinés dans la Parole de Dieu</li><li>Favoriser la croissance spirituelle des croyants</li><li>Développer les dons et talents pour le service chrétien</li><li>Servir la communauté avec amour et intégrité</li></ul></div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="ebec-section ebec-values" id="valeurs">
        <div className="ebec-container"><AnimatedSection className="ebec-heading"><span>Ce qui nous anime</span><h2>Nos valeurs fondamentales</h2><p>Cinq convictions qui inspirent chaque enseignement, chaque service et chaque relation au sein de notre église.</p></AnimatedSection></div>
        <div className="ebec-value-grid">
          {values.map(({ icon: Icon, title, text }, index) => <AnimatedSection key={title} delay={index * 0.07}><article className="ebec-value"><Icon /><h3>{title}</h3><p>{text}</p></article></AnimatedSection>)}
        </div>
      </section>

      <section className="ebec-section ebec-ministries" id="ministeres">
        <div className="ebec-container"><AnimatedSection className="ebec-heading ebec-heading-light"><span>Nos instances & ministères</span><h2>Organisée pour servir, unie dans la mission</h2><p>Afin d'accomplir efficacement sa mission, l'Église est structurée autour d'instances administratives et de ministères spirituels qui travaillent en harmonie.</p></AnimatedSection></div>
        <div className="ebec-ministry-grid">
          {ministries.map(([title, text], index) => <AnimatedSection key={title} delay={(index % 5) * 0.06}><article className="ebec-ministry"><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article></AnimatedSection>)}
        </div>
      </section>

      <div className="ebec-marquee" aria-hidden="true"><div>Foi <b>·</b> Espérance <b>·</b> Amour <b>·</b> Communion <b>·</b> Service <b>·</b> Intégrité <b>·</b> Foi <b>·</b> Espérance <b>·</b> Amour <b>·</b> Communion <b>·</b> Service <b>·</b> Intégrité</div></div>

      <AnimatedSection className="ebec-quote"><blockquote>« Former des disciples de Jésus-Christ capables d'impacter positivement leur famille, leur communauté et leur pays. »</blockquote><cite>Vision de l'Église Baptiste de l'Espoir</cite></AnimatedSection>

      <section className="ebec-section ebec-welcome">
        <div className="ebec-container">
          <AnimatedSection className="ebec-heading"><span>Nous rejoindre</span><h2>Venez comme vous êtes</h2></AnimatedSection>
          <div className="ebec-welcome-grid">
            <AnimatedSection><div className="ebec-info-row"><MapPin /><div><b>Adresse</b><p>Ruelle Jean-Jacques Dessalines #4<br />Village Christophe, Vertières<br />Cap-Haïtien, Haïti</p></div></div><div className="ebec-info-row"><Church /><div><b>Nos cultes</b><p>Dimanche : 7h00 et 10h00<br />Dimanche soir : 17h00<br />Vendredi : 17h00</p></div></div><div className="ebec-info-row"><Music2 /><div><b>Vie d'église</b><p>Adoration, prière, étude biblique et activités pour toutes les générations.</p></div></div></AnimatedSection>
            <AnimatedSection delay={0.12}><aside className="ebec-invitation"><Wheat /><h3>Une porte toujours ouverte</h3><p>Que vous cherchiez une communauté, des réponses ou simplement un lieu de paix, vous êtes le bienvenu. Venez vivre un temps d'adoration, de prière et de communion fraternelle.</p><Link className="ebec-button ebec-button-gold" to="/contact">Planifier ma visite <Send size={15} /></Link></aside></AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
