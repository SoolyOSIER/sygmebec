import { t, useTranslation } from '../../i18n'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Church, HandHeart, Heart, MapPin, Music2, Send, Sparkles, Star, Users, Wheat } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { publicApi } from '../../services/publicApi'
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

const dailyVerseFallback = Object.freeze({
  texte: 'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux.',
  reference: 'Matthieu 18:20',
})

const readDailyVerse = (verse) => {
  const texte = typeof verse?.texte === 'string' ? verse.texte.trim() : ''
  const reference = typeof verse?.reference === 'string' ? verse.reference.trim() : ''

  return texte && reference
    ? { date: verse.date, texte, reference }
    : dailyVerseFallback
}

export default function HomeLanding() {
  useTranslation()

  const [dailyVerse, setDailyVerse] = useState(dailyVerseFallback)

  useEffect(() => {
    let active = true

    publicApi.getDailyVerse()
      .then(({ data }) => {
        if (active) setDailyVerse(readDailyVerse(data))
      })
      .catch(() => {
        if (active) setDailyVerse(dailyVerseFallback)
      })

    return () => { active = false }
  }, [])

  return (
    <div className="ebec-home">
      <section className="ebec-hero">
        <div className="ebec-stars" aria-hidden="true">{t(Array.from({ length: 42 }, (_, index) => <i key={index} style={{ '--x': `${(index * 37) % 100}%`, '--y': `${(index * 19) % 65}%`, '--delay': `${(index % 7) * 0.45}s` }} />))}</div>
        <div className="ebec-rays" aria-hidden="true">{[-30, -20, -10, 0, 10, 20, 30].map((angle) => <i key={angle} style={{ '--angle': `${angle}deg`, '--opacity': 0.48 - Math.abs(angle) / 85 }} />)}</div>
        <div className="ebec-halo" aria-hidden="true" />
        <div className="ebec-container ebec-hero-content">
          <div className="ebec-kicker"><span />{t(" Fondée en 1998 · Vertières, Cap-Haïtien")}</div>
          <h1>{t("Découvrir l'espérance ")}<em>{t("véritable")}</em>{t(" en Jésus-Christ")}</h1>
          <p>{t("Une communauté chrétienne évangélique qui accueille avec joie toute personne désireuse de connaître Dieu, de grandir dans sa foi et de vivre une réelle communion fraternelle.")}</p>
          <div className="ebec-actions">
            <a className="ebec-button ebec-button-gold" href="#notre-eglise">{t("Découvrir notre église")}</a>
            <Link className="ebec-button ebec-button-outline" to="/contact">{t("Nous rendre visite")}</Link>
          </div>
        </div>
        <div className="ebec-hero-address"><MapPin size={14} />{t(" Ruelle Jean-Jacques Dessalines #4, Village Christophe")}</div>
        <a className="ebec-explore" href="#notre-eglise">{t("Explorer ")}<span /></a>
      </section>

      <section className="ebec-stat-bar" aria-label={t("Quelques chiffres clés")}>
        <div className="ebec-container ebec-stat-grid">
          {stats.map(([number, label], index) => <AnimatedSection key={label} delay={index * 0.08}><div className="ebec-stat"><strong>{t(number)}</strong><span>{t(label)}</span></div></AnimatedSection>)}
        </div>
      </section>

      <section className="ebec-section" id="notre-eglise">
        <div className="ebec-container">
          <AnimatedSection className="ebec-heading"><span>{t("À propos de nous")}</span><h2>{t("Une église enracinée dans la Parole, tournée vers la communauté")}</h2></AnimatedSection>
          <div className="ebec-about-grid">
            <AnimatedSection>
              <div className="ebec-founded"><i />{t(" Fondée en juin 1998")}</div>
              <div className="ebec-body-copy">
                <p>{t("L'Église Baptiste de l'Espoir du Cap-Haïtien est une institution chrétienne évangélique fondée dans le but de glorifier Dieu, d'annoncer l'Évangile de Jésus-Christ et de contribuer au développement spirituel, moral et social de la communauté.")}</p>
                <p>{t("Située à la Ruelle Jean-Jacques Dessalines #4, Village Christophe, Vertières, Cap-Haïtien, elle accueille avec joie toutes les personnes désireuses de connaître Dieu, de grandir dans leur foi et de vivre une véritable communion fraternelle.")}</p>
              </div>
              <div className="ebec-timeline">
                <article><b>{t("1998 — Fondation")}</b><p>{t("Naissance de l'Église Baptiste de l'Espoir, avec pour objectif de glorifier Dieu et d'annoncer fidèlement l'Évangile à Vertières.")}</p></article>
                <article><b>{t("Croissance — Structuration des ministères")}</b><p>{t("Mise en place progressive des instances et ministères pour servir chaque génération.")}</p></article>
                <article><b>{t("Aujourd'hui — Une communauté vivante")}</b><p>{t("L'Église poursuit sa mission avec foi, amour et engagement, au service de la communauté.")}</p></article>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.12}>
              <div className="ebec-vision-card"><span>{t("Notre vision")}</span><p>{t("Former des disciples de Jésus-Christ capables d'impacter positivement leur famille, leur communauté et leur pays par leur témoignage, leur amour et leur engagement au service de Dieu.")}</p></div>
              <div className="ebec-mission-card"><span>{t("Notre mission")}</span><ul><li>{t("Proclamer fidèlement l'Évangile de Jésus-Christ")}</li><li>{t("Former des disciples enracinés dans la Parole de Dieu")}</li><li>{t("Favoriser la croissance spirituelle des croyants")}</li><li>{t("Développer les dons et talents pour le service chrétien")}</li><li>{t("Servir la communauté avec amour et intégrité")}</li></ul></div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="ebec-section ebec-values" id="valeurs">
        <div className="ebec-container"><AnimatedSection className="ebec-heading"><span>{t("Ce qui nous anime")}</span><h2>{t("Nos valeurs fondamentales")}</h2><p>{t("Cinq convictions qui inspirent chaque enseignement, chaque service et chaque relation au sein de notre église.")}</p></AnimatedSection></div>
        <div className="ebec-value-grid">
          {values.map(({ icon: Icon, title, text }, index) => <AnimatedSection key={title} delay={index * 0.07}><article className="ebec-value"><Icon /><h3>{t(title)}</h3><p>{t(text)}</p></article></AnimatedSection>)}
        </div>
      </section>

      <section className="ebec-section ebec-ministries" id="ministeres">
        <div className="ebec-container"><AnimatedSection className="ebec-heading ebec-heading-light"><span>{t("Nos instances & ministères")}</span><h2>{t("Organisée pour servir, unie dans la mission")}</h2><p>{t("Afin d'accomplir efficacement sa mission, l'Église est structurée autour d'instances administratives et de ministères spirituels qui travaillent en harmonie.")}</p></AnimatedSection></div>
        <div className="ebec-ministry-grid">
          {ministries.map(([title, text], index) => <AnimatedSection key={title} delay={(index % 5) * 0.06}><article className="ebec-ministry"><span>{t(String(index + 1).padStart(2, '0'))}</span><h3>{t(title)}</h3><p>{t(text)}</p></article></AnimatedSection>)}
        </div>
      </section>

      <div className="ebec-marquee" aria-hidden="true"><div>{t("Foi ")}<b>·</b>{t(" Espérance ")}<b>·</b>{t(" Amour ")}<b>·</b>{t(" Communion ")}<b>·</b>{t(" Service ")}<b>·</b>{t(" Intégrité ")}<b>·</b>{t(" Foi ")}<b>·</b>{t(" Espérance ")}<b>·</b>{t(" Amour ")}<b>·</b>{t(" Communion ")}<b>·</b>{t(" Service ")}<b>·</b>{t(" Intégrité")}</div></div>

      <AnimatedSection className="ebec-daily-verse">
        <span>{t("Verset du jour")}</span>
        <blockquote>« {t(dailyVerse.texte)} »</blockquote>
        <cite>— {t(dailyVerse.reference)}</cite>
      </AnimatedSection>

      <AnimatedSection className="ebec-quote"><blockquote>{t("« Former des disciples de Jésus-Christ capables d'impacter positivement leur famille, leur communauté et leur pays. »")}</blockquote><cite>{t("Vision de l'Église Baptiste de l'Espoir")}</cite></AnimatedSection>

      <section className="ebec-section ebec-welcome">
        <div className="ebec-container">
          <AnimatedSection className="ebec-heading"><span>{t("Nous rejoindre")}</span><h2>{t("Venez comme vous êtes")}</h2></AnimatedSection>
          <div className="ebec-welcome-grid">
            <AnimatedSection><div className="ebec-info-row"><MapPin /><div><b>{t("Adresse")}</b><p>{t("Ruelle Jean-Jacques Dessalines #4")}<br />{t("Village Christophe, Vertières")}<br />{t("Cap-Haïtien, Haïti")}</p></div></div><div className="ebec-info-row"><Church /><div><b>{t("Nos cultes")}</b><p>{t("Dimanche : 7h00 et 10h00")}<br />{t("Dimanche soir : 17h00")}<br />{t("Vendredi : 17h00")}</p></div></div><div className="ebec-info-row"><Music2 /><div><b>{t("Vie d'église")}</b><p>{t("Adoration, prière, étude biblique et activités pour toutes les générations.")}</p></div></div></AnimatedSection>
            <AnimatedSection delay={0.12}><aside className="ebec-invitation"><Wheat /><h3>{t("Une porte toujours ouverte")}</h3><p>{t("Que vous cherchiez une communauté, des réponses ou simplement un lieu de paix, vous êtes le bienvenu. Venez vivre un temps d'adoration, de prière et de communion fraternelle.")}</p><Link className="ebec-button ebec-button-gold" to="/contact">{t("Planifier ma visite ")}<Send size={15} /></Link></aside></AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
