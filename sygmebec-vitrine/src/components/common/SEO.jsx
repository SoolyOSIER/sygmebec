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
  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="GESTMEMBRES" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Theme */}
      <meta name="theme-color" content="#1E3A8A" />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
    </Helmet>
  )
}

export default SEO