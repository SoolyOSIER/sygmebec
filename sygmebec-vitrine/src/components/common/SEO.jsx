import { t, useTranslation } from '../../i18n'
// src/components/common/SEO.jsx
import { Helmet } from 'react-helmet-async'

const SEO = ({
  title = 'GESTMEMBRES - Gestion de Membres & Événements',
  description = 'Plateforme complète pour gérer votre communauté, organiser des événements et suivre vos membres.',
  keywords = 'gestion membres, événements, association, communauté, plateforme',
  image = '/og-image.jpg',
  url = window.location.href,
  author = 'GESTMEMBRES',
  type = 'website',
}) => {
  const { language } = useTranslation()

  return (
    <Helmet>
      {/* Basic */}
      <title>{t(title)}</title>
      <meta name="description" content={t(description)} />
      <meta name="keywords" content={t(keywords)} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={t(title)} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={{ fr: "fr_HT", ht: "ht_HT", en: "en_US" }[language]} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="GESTMEMBRES" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t(title)} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Theme */}
      <meta name="theme-color" content="#0000ff" />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
    </Helmet>
  )
}

export default SEO