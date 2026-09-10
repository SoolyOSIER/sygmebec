import { t, useTranslation } from '../../i18n'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronDown, Church, Heart, Landmark, MapPin, Send, Sparkles, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { aboutIntroduction, faithStatements, paragraphs } from '../../content/churchContent'
import './aboutLanding.css'

const values = [
  ['Foi', 'Une confiance vivante en Dieu qui guide chaque décision et chaque pas de la communauté.'],
  ['Fidélité', 'Un enseignement fidèle à la Parole de Dieu, transmis avec constance et intégrité.'],
  ['Communion', 'Une fraternité authentique où chacun trouve sa place et grandit avec les autres.'],
  ['Amour', 'Une compassion concrète, tournée vers les membres comme vers la communauté.'],
  ['Service', 'Mettre nos dons et nos talents au service de Dieu et de notre prochain, avec joie.'],
]

const pillars = [
  ['Cultes d’adoration', 'Des temps de louange et de prédication pour rencontrer Dieu ensemble.'],
  ['Études bibliques', 'Un approfondissement régulier de la Parole de Dieu, en groupe.'],
  ['Réunions de prière', 'Des moments dédiés à l’intercession et à la communion avec Dieu.'],
  ['Formation & évangélisation', 'Des programmes de formation et des actions tournées vers l’extérieur.'],
]

const ministries = [
  ['Conseil des Anciens', 'Orientation spirituelle et supervision administrative.'],
  ['Corps pastoral', 'Prédication, enseignement et accompagnement pastoral.'],
  ['Éducation chrétienne', 'Enseignement biblique et formation des membres.'],
  ['Ministère de la Jeunesse', 'Encadrement et leadership chrétien des jeunes.'],
  ['Direction des Enfants', 'Encadrement spirituel et éducatif adapté aux enfants.'],
  ['Ministère de la Musique', 'Louange, adoration et développement musical.'],
  ['Évangélisation & Missions', 'Actions locales et missionnaires.'],
  ['Comité administratif', 'Gestion des biens et des ressources financières.'],
  ['Diacres & Diaconesses', 'Services spirituels et assistance aux membres.'],
  ['Secrétariat', 'Gestion administrative, archives et suivi des membres.'],
]

const heading = (eyebrow, title, text) => <div className="about-heading"><span>{t(eyebrow)}</span><h2>{t(title)}</h2>{text && <p>{t(text)}</p>}</div>

export default function AboutLanding() {
  useTranslation()

  return (
    <div className="ebec-about">
      <section className="about-hero">
        <div className="about-hero-glow" aria-hidden="true" />
        <div className="about-container about-hero-content">
          <div className="about-breadcrumb"><Link to="/">{t("Accueil")}</Link><span>/</span>{t(" À propos")}</div>
          <h1>{t("Notre histoire, notre ")}<em>{t("foi")}</em>{t(", notre appel")}</h1>
          <p>{t("Depuis 1998, l’Église Baptiste de l’Espoir du Cap-Haïtien annonce l’Évangile de Jésus-Christ et accompagne chaque génération vers une foi vivante et une communion fraternelle authentique.")}</p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <AnimatedSection>{t(heading('Notre histoire', 'Une œuvre bâtie sur la fidélité, année après année'))}</AnimatedSection>
          <div className="about-story-grid">
            <AnimatedSection>
              <div className="about-founded"><i />{t(" Fondée en juin 1998")}</div>
              <div className="about-copy">
                <p>{t("L’Église Baptiste de l’Espoir du Cap-Haïtien est une institution chrétienne évangélique fondée dans le but de glorifier Dieu, d’annoncer l’Évangile de Jésus-Christ et de contribuer au développement spirituel, moral et social de la communauté.")}</p>
                <p>{t("Située à la Ruelle Jean-Jacques Dessalines #4, Village Christophe, Vertières, Cap-Haïtien, elle accueille avec joie toutes les personnes désireuses de connaître Dieu, de grandir dans leur foi et de vivre une véritable communion fraternelle.")}</p>
                <p>{t("Depuis sa création, elle organise des cultes d’adoration, des études bibliques, des réunions de prière, des formations et des activités d’évangélisation afin que chacun puisse découvrir l’espérance véritable en Jésus-Christ.")}</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}><div className="about-timeline">
              <article><b>{t("1998 — Fondation")}</b><p>{t("Naissance de l’Église à Vertières, avec une vocation claire : glorifier Dieu et annoncer fidèlement l’Évangile.")}</p></article>
              <article><b>{t("Structuration des ministères")}</b><p>{t("Mise en place des instances et ministères destinés aux enfants, aux jeunes, aux familles et à toute la communauté.")}</p></article>
              <article><b>{t("Vie communautaire")}</b><p>{t("Une vie d’église rythmée par l’adoration, la prière, l’étude biblique et le service fraternel.")}</p></article>
              <article><b>{t("Aujourd’hui")}</b><p>{t("Une communauté vivante, enracinée dans la Parole de Dieu, qui continue de servir le Cap-Haïtien avec foi et amour.")}</p></article>
            </div></AnimatedSection>
          </div>
        </div>
      </section>

      <section className="about-section about-identity">
        <div className="about-container">
          <AnimatedSection>{t(heading('Notre identité', 'Une église guidée par la Parole de Dieu'))}</AnimatedSection>
          <AnimatedSection><div className="about-identity-card"><Church /><div>{paragraphs(aboutIntroduction).map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}</div></div></AnimatedSection>
        </div>
      </section>

      <section className="about-section about-vision">
        <div className="about-container">
          <AnimatedSection>{t(heading('Vision & mission', 'Ce que nous croyons être appelés à accomplir'))}</AnimatedSection>
          <div className="about-vision-grid">
            <AnimatedSection><article className="about-vision-card"><Landmark /><span>{t("Notre vision")}</span><p>{t("Former des disciples de Jésus-Christ capables d’impacter positivement leur famille, leur communauté et leur pays par leur témoignage, leur amour et leur engagement au service de Dieu.")}</p></article></AnimatedSection>
            <AnimatedSection delay={0.1}><article className="about-mission-card"><Heart /><span>{t("Notre mission")}</span><ul><li>{t("Proclamer fidèlement l’Évangile de Jésus-Christ")}</li><li>{t("Former des disciples enracinés dans la Parole de Dieu")}</li><li>{t("Favoriser la croissance spirituelle des croyants")}</li><li>{t("Développer les dons et les talents pour le service chrétien")}</li><li>{t("Servir la communauté avec amour, compassion et intégrité")}</li></ul></article></AnimatedSection>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container"><AnimatedSection>{t(heading('Ce qui nous anime', 'Nos valeurs fondamentales', 'Cinq convictions qui inspirent chaque enseignement, chaque service et chaque relation au sein de notre église.'))}</AnimatedSection>
          <div className="about-values-grid">{values.map(([title, text], index) => <AnimatedSection key={title} delay={index * .06}><article><Sparkles /><h3>{t(title)}</h3><p>{t(text)}</p></article></AnimatedSection>)}</div>
        </div>
      </section>

      <section className="about-section about-pillars">
        <div className="about-container"><AnimatedSection>{t(heading('Vivre notre foi', 'Les piliers de notre vie communautaire', 'Nous grandissons ensemble par des rendez-vous réguliers qui nourrissent la foi et fortifient les liens.'))}</AnimatedSection>
          <div className="about-pillars-grid">{pillars.map(([title, text], index) => <AnimatedSection key={title} delay={index * .08}><article><span>{t(String(index + 1).padStart(2, '0'))}</span><h3>{t(title)}</h3><p>{t(text)}</p></article></AnimatedSection>)}</div>
        </div>
      </section>

      <section className="about-section about-instances">
        <div className="about-container"><AnimatedSection>{t(heading('Servir ensemble', 'Nos instances & ministères, en bref'))}</AnimatedSection>
          <div className="about-instances-grid">{ministries.map(([title, text], index) => <AnimatedSection key={title} delay={(index % 2) * .07}><article><span>{t(String(index + 1).padStart(2, '0'))}</span><div><h3>{t(title)}</h3><p>{t(text)}</p></div></article></AnimatedSection>)}</div>
        </div>
      </section>

      <section className="about-section about-faith">
        <div className="about-container"><AnimatedSection>{t(heading('Confession de foi', 'Ce que nous croyons', 'Retrouvez les fondements de notre foi. Ouvrez une rubrique pour lire son contenu intégral.'))}</AnimatedSection>
          <div className="about-faith-list">{faithStatements.map(({ title, content }, index) => <AnimatedSection key={title} delay={Math.min(index * .025, .2)}><details><summary><BookOpen /><span>{t(title)}</span><ChevronDown /></summary><div className="about-faith-content">{paragraphs(content).map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}</div></details></AnimatedSection>)}</div>
        </div>
      </section>

      <section className="about-closing"><div className="about-container"><AnimatedSection><MapPin /><span>{t("Un lieu pour grandir")}</span><h2>{t("Vous avez une place ici")}</h2><p>{t("Que vous découvriez la foi ou que vous cherchiez une communauté où vous investir, nous serons heureux de vous accueillir.")}</p><div><Link className="about-button about-button-main" to="/contact">{t("Nous rendre visite ")}<Send size={15} /></Link><Link className="about-button about-button-alt" to="/adhesion">{t("Découvrir l’adhésion")}</Link></div></AnimatedSection></div></section>
    </div>
  )
}
