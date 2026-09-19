import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, BarChart3, BookOpenText, CalendarDays, ChevronRight, CirclePlay,
  Globe2, Menu, Moon, Newspaper, Search, Send, ShieldCheck,
  Sun, Target, Trophy, UserRound, Video, X,
} from 'lucide-react'
import { FaFacebookF as Facebook, FaYoutube as Youtube } from 'react-icons/fa'

import { useTheme } from '../theme/ThemeProvider'
import { COUNTRIES, FALLBACK_ARTICLES, OFFICIAL_SOCIAL, SPORTS, categoryTone, formatDate } from './content'
import { globeApi, responseMessage } from './globeApi'
import './globeInfoSport.css'

const navigation = [
  ['/', 'À la une'], ['/actualites', 'Actualités'], ['/haiti', 'Haïti'], ['/videos', 'Vidéos'], ['/redaction', 'Rédaction'],
]

const initialArticle = {
  title: '', excerpt: '', body: '', category: '', sport: 'Football', country: 'Haïti',
  haiti_focus: false, is_featured: false, status: 'DRAFT', cover_image: '', source_url: '', video_url: '', tags: '',
}

const facebookTimeline = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(OFFICIAL_SOCIAL.facebook)}&tabs=timeline&width=500&height=510&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`

function useArticles(params = {}) {
  const [state, setState] = useState({ articles: FALLBACK_ARTICLES, loading: true, error: '' })
  const queryKey = JSON.stringify(params)

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    try {
      const articles = await globeApi.listArticles(params)
      setState({ articles: articles.length ? articles : FALLBACK_ARTICLES, loading: false, error: '' })
    } catch (error) {
      setState({ articles: FALLBACK_ARTICLES, loading: false, error: responseMessage(error, 'Les publications de la rédaction ne sont pas encore disponibles.') })
    }
  }

  useEffect(() => { load() }, [queryKey])
  return { ...state, reload: load }
}

function GlobeMark({ compact = false }) {
  return <span className={`gis-mark ${compact ? 'compact' : ''}`} aria-hidden="true"><Globe2 /><span className="gis-mark-orbit" /><Trophy /></span>
}

function Header() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return <>
    <div className="gis-topline"><div className="gis-container"><span><span className="gis-live-dot" /> MÉDIA SPORTIF · HAÏTI & MONDE</span><div><a href={OFFICIAL_SOCIAL.facebook} target="_blank" rel="noreferrer"><Facebook size={14} /> Facebook Globein21</a><a href={OFFICIAL_SOCIAL.youtube} target="_blank" rel="noreferrer"><Youtube size={15} /> Globe Infosports 21</a></div></div></div>
    <header className="gis-header"><div className="gis-container gis-header-inner"><Link className="gis-brand" to="/" onClick={() => setOpen(false)}><GlobeMark /><span><b>GLOBE</b><strong>INFO SPORT</strong><small>Haïti · Caraïbe · Monde</small></span></Link><nav className={open ? 'open' : ''} aria-label="Navigation principale">{navigation.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav><div className="gis-header-actions"><button className="gis-icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Changer de thème">{theme === 'dark' ? <Sun /> : <Moon />}</button><Link className="gis-editor-cta" to="/redaction"><BookOpenText size={17} /> Écrire</Link><button className="gis-menu-button" type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>{open ? <X /> : <Menu />}</button></div></div></header>
  </>
}

function Footer() {
  return <footer className="gis-footer"><div className="gis-container gis-footer-grid"><section><div className="gis-footer-brand"><GlobeMark compact /><b>GLOBE INFO SPORT</b></div><p>Un regard haïtien, caribéen et mondial sur les terrains, les athlètes, les clubs et les grandes compétitions.</p><div className="gis-socials"><a href={OFFICIAL_SOCIAL.facebook} target="_blank" rel="noreferrer" aria-label="Facebook Globein21"><Facebook /></a><a href={OFFICIAL_SOCIAL.youtube} target="_blank" rel="noreferrer" aria-label="YouTube Globe Infosports 21"><Youtube /></a></div></section><section><h2>Explorer</h2><Link to="/actualites">Toutes les actualités</Link><Link to="/haiti">Sport haïtien</Link><Link to="/videos">Vidéos & émissions</Link><Link to="/redaction">Espace rédaction</Link></section><section><h2>Notre ligne</h2><p>Information, analyses, portraits et résultats. Chaque article peut référencer sa source et sa vidéo officielle.</p><span className="gis-footer-note"><ShieldCheck size={16} /> Publication responsable</span></section></div><div className="gis-container gis-footer-bottom"><span>© {new Date().getFullYear()} Globe Info Sport</span><span>Le sport connecte le monde.</span></div></footer>
}

function Shell({ children }) {
  return <div className="gis-shell"><Header /><main>{children}</main><Footer /></div>
}

function SectionHeading({ eyebrow, title, text, link }) {
  return <div className="gis-section-heading"><div><span className="gis-eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{link && <Link className="gis-text-link" to={link.to}>{link.label} <ArrowRight size={17} /></Link>}</div>
}

function ArticleCard({ article, feature = false }) {
  const tone = categoryTone(article.sport)
  const tags = Array.isArray(article.tags) ? article.tags : String(article.tags || '').split(',').filter(Boolean)
  return <article className={`gis-article-card ${feature ? 'featured' : ''}`}><Link to={`/actualites/${article.slug || article.id}`} className={`gis-card-cover ${tone}`} aria-label={`Lire ${article.title}`}>{article.cover_image && <img src={article.cover_image} alt="" />}<span>{article.sport || 'Multisport'}</span>{article.haiti_focus && <b>Haïti</b>}<i><Trophy /></i></Link><div className="gis-card-copy"><div className="gis-card-meta"><span>{article.category_name || article.category_detail?.name || 'Actualités'}</span><time>{formatDate(article.published_at)}</time></div><h3><Link to={`/actualites/${article.slug || article.id}`}>{article.title}</Link></h3><p>{article.excerpt}</p><div className="gis-card-footer"><span><UserRound size={14} /> {article.author_name || article.author?.identifiant || 'Globe Info Sport'}</span><span>{article.reading_time || 2} min</span></div>{tags.slice(0, 2).length > 0 && <div className="gis-tags">{tags.slice(0, 2).map((tag) => <span key={tag}>#{String(tag).trim()}</span>)}</div>}</div></article>
}

function FeaturedLead({ article }) {
  const tone = categoryTone(article.sport)
  return <article className="gis-featured-lead"><div className={`gis-featured-visual ${tone}`}>{article.cover_image && <img src={article.cover_image} alt="" />}<div className="gis-grid-globe" /><span className="gis-featured-kicker"><Globe2 size={15} /> {article.country || 'International'}</span><div className="gis-featured-sport">{article.sport || 'Multisport'}</div></div><div className="gis-featured-copy"><span className="gis-eyebrow">À LA UNE</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="gis-author-line"><span>{article.author_name || 'La rédaction Globe Info Sport'}</span><i /> <time>{formatDate(article.published_at)}</time></div><Link className="gis-primary-button" to={`/actualites/${article.slug || article.id}`}>Lire l’article <ArrowRight size={18} /></Link></div></article>
}

function SportRail() {
  return <div className="gis-sport-rail"><div className="gis-container"><span>Explorer par sport</span>{SPORTS.map((sport) => <Link key={sport} to={`/actualites?sport=${encodeURIComponent(sport)}`}>{sport}</Link>)}</div></div>
}

function HomePage() {
  const { articles, loading, error, reload } = useArticles({ page_size: 12 })
  const lead = articles.find((article) => article.is_featured) || articles[0] || FALLBACK_ARTICLES[0]
  const latest = articles.filter((article) => article.id !== lead.id).slice(0, 3)
  const haiti = articles.filter((article) => article.haiti_focus || article.country === 'Haïti').slice(0, 2)

  return <Shell><SportRail /><section className="gis-hero gis-container"><div><span className="gis-eyebrow">GLOBE INFO SPORT</span><h1>Le sport <em>sans frontières.</em></h1><p>Une information sportive vivante, précise et ouverte sur Haïti, la Caraïbe et le monde.</p><div className="gis-hero-actions"><Link className="gis-primary-button" to="/actualites">Voir les actualités <ArrowRight size={18} /></Link><a className="gis-outline-button" href={OFFICIAL_SOCIAL.youtube} target="_blank" rel="noreferrer"><CirclePlay size={18} /> Voir la chaîne</a></div></div><div className="gis-hero-score"><div><span>GL</span><strong>INFO</strong><small>SPORT</small></div><p>Une rédaction prête à raconter chaque terrain.</p><i><Target /></i></div></section><section className="gis-container gis-main-feature">{loading ? <LoadingCards /> : <FeaturedLead article={lead} />}{error && <ApiNotice error={error} retry={reload} />}</section><section className="gis-container gis-section"><SectionHeading eyebrow="À SUIVRE" title="Les dernières publications" text="La rédaction organise chaque information par sport, pays et sujet." link={{ to: '/actualites', label: 'Tout voir' }} /><div className="gis-article-grid">{latest.map((article) => <ArticleCard key={article.id} article={article} />)}</div></section><section className="gis-haiti-band"><div className="gis-container"><div><span className="gis-eyebrow">FOCUS HAÏTI</span><h2>Le sport haïtien, au centre du monde.</h2><p>Suivez les clubs, les sélections, les talents locaux et la diaspora avec une place éditoriale dédiée.</p><Link className="gis-outline-button light" to="/haiti">Explorer le focus Haïti <ChevronRight size={18} /></Link></div><div className="gis-haiti-stories">{(haiti.length ? haiti : FALLBACK_ARTICLES.filter((item) => item.haiti_focus)).map((article) => <Link key={article.id} to={`/actualites/${article.slug || article.id}`}><span>{article.sport}</span><strong>{article.title}</strong><ArrowRight size={17} /></Link>)}</div></div></section><section className="gis-container gis-section"><SectionHeading eyebrow="CANAL OFFICIEL" title="Suivez Globe Info Sport au quotidien" text="Retrouvez les publications sur Facebook et les vidéos de la chaîne YouTube officielle." /><div className="gis-social-panel"><a className="facebook" href={OFFICIAL_SOCIAL.facebook} target="_blank" rel="noreferrer"><Facebook /><div><small>FACEBOOK</small><strong>Globein21</strong><span>Publications, alertes et échanges avec la communauté.</span></div><ArrowRight /></a><a className="youtube" href={OFFICIAL_SOCIAL.youtube} target="_blank" rel="noreferrer"><Youtube /><div><small>YOUTUBE</small><strong>Globe Infosports 21</strong><span>Émissions, analyses et contenus vidéo.</span></div><ArrowRight /></a></div><div className="gis-community-feed"><div><span className="gis-eyebrow">FIL FACEBOOK</span><h2>Les publications de Globein21</h2><p>Le fil est diffusé directement par Facebook. Il reste à jour sans recopier les publications dans votre base de données.</p><a className="gis-outline-button" href={OFFICIAL_SOCIAL.facebook} target="_blank" rel="noreferrer">Ouvrir la page Facebook <ArrowRight size={17} /></a></div><iframe title="Fil Facebook Globein21" src={facebookTimeline} width="500" height="510" scrolling="no" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /></div></section></Shell>
}

function ApiNotice({ error, retry }) {
  return <aside className="gis-api-notice"><span><ShieldCheck size={17} /> {error}</span><button type="button" onClick={retry}>Réessayer</button></aside>
}

function LoadingCards() {
  return <div className="gis-loading-cards" aria-label="Chargement des actualités" aria-busy="true"><i /><i /><i /></div>
}

function NewsPage({ haitiOnly = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [term, setTerm] = useState(searchParams.get('q') || '')
  const [sport, setSport] = useState(searchParams.get('sport') || '')
  const [country, setCountry] = useState(haitiOnly ? 'Haïti' : searchParams.get('country') || '')
  const params = useMemo(() => ({ page_size: 48, ...(sport ? { sport } : {}), ...(country ? { country } : {}), ...(haitiOnly ? { haiti_focus: 'true' } : {}) }), [country, haitiOnly, sport])
  const { articles, loading, error, reload } = useArticles(params)
  const visible = articles.filter((article) => {
    const haystack = [article.title, article.excerpt, article.sport, article.country, article.category_name].join(' ').toLowerCase()
    return haystack.includes(term.toLowerCase()) && (!haitiOnly || article.haiti_focus || article.country === 'Haïti')
  })
  const updateSearch = () => { const next = {}; if (term) next.q = term; if (sport) next.sport = sport; if (country && !haitiOnly) next.country = country; setSearchParams(next) }

  return <Shell><section className="gis-page-hero"><div className="gis-container"><span className="gis-eyebrow">{haitiOnly ? 'FOCUS HAÏTI' : 'ACTUALITÉS SPORTIVES'}</span><h1>{haitiOnly ? 'Haïti joue sur tous les terrains.' : 'Le monde du sport, raconté avec exigence.'}</h1><p>{haitiOnly ? 'Une sélection de la rédaction consacrée aux athlètes, clubs et compétitions liés à Haïti.' : 'Filtrez les publications par sport ou pays pour suivre exactement ce qui vous intéresse.'}</p></div></section><section className="gis-container gis-section"><form className="gis-filters" onSubmit={(event) => { event.preventDefault(); updateSearch() }}><label><Search size={17} /><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Rechercher une information" /></label><select value={sport} onChange={(event) => setSport(event.target.value)}><option value="">Tous les sports</option>{SPORTS.map((item) => <option key={item}>{item}</option>)}</select>{!haitiOnly && <select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">Tous les pays</option>{COUNTRIES.map((item) => <option key={item}>{item}</option>)}</select>}<button className="gis-primary-button" type="submit">Filtrer</button></form><div className="gis-results-bar"><span>{loading ? 'Recherche…' : `${visible.length} publication${visible.length > 1 ? 's' : ''}`}</span>{(term || sport || country) && <button type="button" onClick={() => { setTerm(''); setSport(''); setCountry(haitiOnly ? 'Haïti' : ''); setSearchParams({}) }}>Réinitialiser</button>}</div>{error && <ApiNotice error={error} retry={reload} />}{loading ? <LoadingCards /> : <div className="gis-article-grid gis-news-grid">{visible.map((article) => <ArticleCard key={article.id} article={article} />)}</div>}{!loading && !visible.length && <Empty title="Aucune publication trouvée" text="Essayez un autre sport, un autre pays ou un autre mot-clé." />}</section></Shell>
}

function youtubeEmbed(url) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    if (hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : ''
    }
  } catch {
    return ''
  }
  return ''
}

function ArticlePage() {
  const { slug } = useParams()
  const [state, setState] = useState({ article: null, loading: true, error: '' })
  useEffect(() => {
    let active = true
    globeApi.getArticle(slug).then((article) => active && setState({ article, loading: false, error: '' })).catch((error) => {
      const fallback = FALLBACK_ARTICLES.find((item) => item.slug === slug)
      if (active) setState({ article: fallback || null, loading: false, error: responseMessage(error, 'Cet article est indisponible.') })
    })
    return () => { active = false }
  }, [slug])
  if (state.loading) return <Shell><section className="gis-container gis-section"><LoadingCards /></section></Shell>
  if (!state.article) return <Shell><section className="gis-container gis-section"><Empty title="Article introuvable" text="Cette publication a peut-être été retirée ou déplacée." link="/actualites" /></section></Shell>
  const article = state.article
  const embed = youtubeEmbed(article.video_url)
  const paragraphs = String(article.body || article.excerpt || '').split(/\n{2,}/).filter(Boolean)
  return <Shell><article className="gis-article"><div className="gis-container gis-article-header"><Link className="gis-back" to="/actualites">← Toutes les actualités</Link><div className="gis-card-meta"><span>{article.category_name || article.category_detail?.name || 'Actualités'}</span><time>{formatDate(article.published_at)}</time></div><h1>{article.title}</h1><p className="gis-article-lead">{article.excerpt}</p><div className="gis-article-byline"><span><UserRound size={16} /> {article.author_name || article.author?.identifiant || 'Globe Info Sport'}</span><span>{article.reading_time || 2} min de lecture</span>{article.haiti_focus && <b>Focus Haïti</b>}</div></div><div className={`gis-article-cover ${categoryTone(article.sport)}`}>{article.cover_image && <img src={article.cover_image} alt="" />}<span>{article.sport || 'Multisport'}</span><Globe2 /></div><div className="gis-container gis-article-layout"><div className="gis-prose">{state.error && <ApiNotice error={state.error} retry={() => window.location.reload()} />}{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{embed && <div className="gis-video-embed"><iframe src={embed} title={article.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>}{article.source_url && <a className="gis-source-link" href={article.source_url} target="_blank" rel="noreferrer"><BadgeCheck size={18} /> Consulter la source associée <ArrowRight size={16} /></a>}</div><aside className="gis-article-aside"><span>À RETENIR</span><strong>{article.country || 'International'}</strong><p>{article.sport || 'Multisport'}</p><Link to={`/actualites?sport=${encodeURIComponent(article.sport || 'Multisport')}`}>Plus de {article.sport || 'sport'} <ArrowRight size={16} /></Link></aside></div></article></Shell>
}

function VideoPage() {
  const { articles, loading, error, reload } = useArticles({ page_size: 24 })
  const videos = articles.filter((article) => article.video_url)
  return <Shell><section className="gis-page-hero videos"><div className="gis-container"><span className="gis-eyebrow">VIDÉOS & ÉMISSIONS</span><h1>Regarder, comprendre, partager.</h1><p>Les formats vidéo de Globe Info Sport et les liens associés aux analyses de la rédaction.</p><a className="gis-primary-button" href={OFFICIAL_SOCIAL.youtube} target="_blank" rel="noreferrer"><Youtube size={18} /> Ouvrir la chaîne officielle</a></div></section><section className="gis-container gis-section">{error && <ApiNotice error={error} retry={reload} />}{loading ? <LoadingCards /> : videos.length ? <div className="gis-video-grid">{videos.map((article) => { const embed = youtubeEmbed(article.video_url); return <article key={article.id}>{embed ? <iframe src={embed} title={article.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <a href={article.video_url} target="_blank" rel="noreferrer"><Video /><span>Voir la vidéo</span></a>}<div><span>{article.sport || 'Multisport'}</span><h2>{article.title}</h2><Link to={`/actualites/${article.slug || article.id}`}>Lire l’analyse <ArrowRight size={16} /></Link></div></article> })}</div> : <div className="gis-channel-empty"><Youtube /><h2>La sélection vidéo arrive ici.</h2><p>Ajoutez le lien d’une vidéo YouTube dans l’espace Rédaction pour la publier sur cette page.</p><Link className="gis-primary-button" to="/redaction">Ouvrir la rédaction</Link></div>}</section></Shell>
}

function Empty({ title, text, link }) {
  return <div className="gis-empty"><Newspaper /><h2>{title}</h2><p>{text}</p>{link && <Link className="gis-primary-button" to={link}>Voir les actualités</Link>}</div>
}

function EditorialLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ identifiant: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { onLogin(await globeApi.login(credentials)) } catch (error) { setMessage(responseMessage(error, 'Connexion rédaction refusée.')) } finally { setBusy(false) }
  }
  return <section className="gis-editor-login"><div><span className="gis-eyebrow">ESPACE RÉDACTION</span><h1>Écrivez. Vérifiez. Publiez.</h1><p>Votre espace pour rédiger une information, enregistrer un brouillon, ajouter une source et diffuser un article vers le monde.</p><ul><li><ShieldCheck /> Publication contrôlée par le serveur</li><li><Globe2 /> Haïti, Caraïbe et compétitions internationales</li><li><Video /> Liens Facebook, YouTube et sources intégrés</li></ul></div><form onSubmit={submit}><GlobeMark /><h2>Connexion rédaction</h2><label>Identifiant<input required autoComplete="username" value={credentials.identifiant} onChange={(event) => setCredentials({ ...credentials, identifiant: event.target.value })} /></label><label>Mot de passe<input required type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>{message && <p role="alert">{message}</p>}<button className="gis-primary-button" disabled={busy}>{busy ? 'Connexion…' : 'Accéder à l’espace'}</button></form></section>
}

function EditorialDesk() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('globe-editor-session') || 'null') } catch { return null }
  })
  const [form, setForm] = useState(initialArticle)
  const [editing, setEditing] = useState(null)
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const token = session?.access

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [rows, categoryRows, summary] = await Promise.all([
        globeApi.listArticles({ page_size: 100, mine: 'true' }), globeApi.listCategories(), globeApi.getEditorialSummary(token).catch(() => null),
      ])
      setArticles(rows); setCategories(categoryRows); setDashboard(summary)
    } catch (error) { setMessage(responseMessage(error, 'Impossible de charger les publications de la rédaction.')) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [token])
  const login = (data) => {
    const next = { access: data.access, user: data.user }
    sessionStorage.setItem('globe-editor-session', JSON.stringify(next)); setSession(next)
  }
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const edit = (article) => {
    setEditing(article.id)
    setForm({ ...initialArticle, ...article, category: article.category?.id || article.category || article.category_detail?.id || '', tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '', cover_image: article.cover_image || article.cover_image_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const reset = () => { setEditing(null); setForm(initialArticle); setMessage('') }
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setMessage('')
    const payload = { ...form, tags: String(form.tags).split(',').map((item) => item.trim()).filter(Boolean), category: form.category || null }
    try {
      if (editing) await globeApi.updateArticle(editing, payload, token)
      else await globeApi.createArticle(payload, token)
      setMessage(editing ? 'Publication mise à jour.' : form.status === 'PUBLISHED' ? 'Article publié.' : 'Brouillon enregistré.')
      reset(); await load()
    } catch (error) { setMessage(responseMessage(error, 'La publication n’a pas été enregistrée.')) } finally { setLoading(false) }
  }
  const remove = async (article) => {
    if (!window.confirm(`Supprimer « ${article.title} » ?`)) return
    try { await globeApi.removeArticle(article.id, token); setMessage('Publication supprimée.'); await load() } catch (error) { setMessage(responseMessage(error)) }
  }
  if (!token) return <Shell><EditorialLogin onLogin={login} /></Shell>
  const stats = dashboard || { total_articles: articles.length, published_articles: articles.filter((article) => article.status === 'PUBLISHED').length, draft_articles: articles.filter((article) => article.status === 'DRAFT').length }
  return <Shell><section className="gis-editor-header"><div className="gis-container"><div><span className="gis-eyebrow">RÉDACTION GLOBE INFO SPORT</span><h1>Votre bureau de publication.</h1><p>Rédigez une information complète ; vous gardez la maîtrise du brouillon, des sources et de la mise en ligne.</p></div><div className="gis-editor-user"><UserRound /><span>{session.user?.identifiant || 'Rédacteur'}</span><button type="button" onClick={() => { sessionStorage.removeItem('globe-editor-session'); setSession(null) }}>Déconnexion</button></div></div></section><section className="gis-container gis-editor-layout"><div className="gis-editor-main"><form className="gis-editor-form" onSubmit={submit}><header><div><span className="gis-eyebrow">{editing ? 'MODIFIER' : 'NOUVEL ARTICLE'}</span><h2>{editing ? 'Améliorer votre publication' : 'Commencer à écrire'}</h2></div>{editing && <button type="button" onClick={reset}>Nouveau brouillon</button>}</header>{message && <p className="gis-editor-message" role="status">{message}</p>}<label className="full">Titre de l’article<input required maxLength="180" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Un titre clair, précis et utile" /></label><label className="full">Résumé<input required maxLength="360" value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} placeholder="Ce que le lecteur doit retenir en quelques lignes" /></label><label className="full">Article<textarea required rows="16" value={form.body} onChange={(event) => update('body', event.target.value)} placeholder="Rédigez l’information. Séparez les paragraphes par une ligne vide." /></label><div className="gis-editor-fields"><label>Catégorie<select value={form.category} onChange={(event) => update('category', event.target.value)}><option value="">Choisir une catégorie</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Sport<select value={form.sport} onChange={(event) => update('sport', event.target.value)}>{SPORTS.map((item) => <option key={item}>{item}</option>)}</select></label><label>Pays / zone<input required value={form.country} onChange={(event) => update('country', event.target.value)} list="gis-countries" /><datalist id="gis-countries">{COUNTRIES.map((item) => <option key={item} value={item} />)}</datalist></label><label>Tags<input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="football, sélection, analyse" /></label><label className="full">Image de couverture (URL)<input type="url" value={form.cover_image} onChange={(event) => update('cover_image', event.target.value)} placeholder="https://…" /></label><label>Source officielle (URL)<input type="url" value={form.source_url} onChange={(event) => update('source_url', event.target.value)} placeholder="https://…" /></label><label>Vidéo YouTube (URL)<input type="url" value={form.video_url} onChange={(event) => update('video_url', event.target.value)} placeholder="https://youtube.com/watch?v=…" /></label></div><div className="gis-editor-switches"><label><input type="checkbox" checked={Boolean(form.haiti_focus)} onChange={(event) => update('haiti_focus', event.target.checked)} /> Mettre Haïti en avant</label><label><input type="checkbox" checked={Boolean(form.is_featured)} onChange={(event) => update('is_featured', event.target.checked)} /> Mettre à la une</label><label>Statut<select value={form.status} onChange={(event) => update('status', event.target.value)}><option value="DRAFT">Brouillon</option><option value="PUBLISHED">Publier</option></select></label></div><footer><span>Les liens et médias restent vérifiables avant publication.</span><button className="gis-primary-button" disabled={loading}>{loading ? 'Enregistrement…' : form.status === 'PUBLISHED' ? 'Publier l’article' : 'Enregistrer le brouillon'} <Send size={17} /></button></footer></form></div><aside className="gis-editor-aside"><div className="gis-editor-stats"><article><BarChart3 /><strong>{stats.total_articles ?? articles.length}</strong><span>Articles</span></article><article><BadgeCheck /><strong>{stats.published_articles ?? 0}</strong><span>Publiés</span></article><article><BookOpenText /><strong>{stats.draft_articles ?? 0}</strong><span>Brouillons</span></article></div><section><header><h2>Mes publications</h2><button type="button" onClick={load}>Actualiser</button></header>{loading && <p>Chargement…</p>}{!loading && !articles.length && <p>Aucun article pour le moment. Commencez votre première publication.</p>}{articles.slice(0, 8).map((article) => <article className="gis-editor-row" key={article.id}><span className={article.status === 'PUBLISHED' ? 'published' : ''}>{article.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}</span><strong>{article.title}</strong><small>{formatDate(article.published_at || article.updated_at)}</small><div><button type="button" onClick={() => edit(article)}>Modifier</button><button type="button" onClick={() => remove(article)}>Supprimer</button></div></article>)}</section></aside></section></Shell>
}

export default function GlobeInfoSport() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/actualites" element={<NewsPage />} /><Route path="/actualites/:slug" element={<ArticlePage />} /><Route path="/haiti" element={<NewsPage haitiOnly />} /><Route path="/videos" element={<VideoPage />} /><Route path="/redaction" element={<EditorialDesk />} /><Route path="*" element={<HomePage />} /></Routes>
}
