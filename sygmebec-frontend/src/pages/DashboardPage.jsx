import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FiActivity, FiArrowRight, FiArrowUpRight, FiCalendar, FiCheckCircle, FiFileText, FiHeart, FiMapPin, FiPlus, FiUserCheck, FiUsers } from 'react-icons/fi'
import { useMembreStatistiques, useMembres } from '../hooks/useMembres'
import { useEvenements } from '../hooks/useEvenements'
import { DAILY_VERSE_FALLBACK, useVersetDuJour } from '../hooks/useVersetDuJour'
import { useAuthStore } from '../store/authStore'
import useT from '../i18n/useT'
import './dashboardReference.css'
import './dashboardExtras.css'
import './dashboardDemographics.css'

const colors = ['#4c7a5e', '#a9536a', '#c6a15b', '#28396b', '#8b6f43']
const list = (value) => Array.isArray(value?.results) ? value.results : (Array.isArray(value) ? value : [])
const timestamp = (value) => new Date(value || 0).getTime()
const asNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0
const statsRows = (source, total) => {
  const values = Array.isArray(source)
    ? source
    : (source && typeof source === 'object' ? Object.entries(source).map(([label, count]) => ({ label, count })) : [])

  return values.map((entry, index) => {
    const count = asNumber(entry?.count ?? entry?.value ?? entry?.total)
    const percentage = entry?.percentage ?? entry?.pourcentage
    return {
      id: String(entry?.label ?? entry?.name ?? entry?.libelle ?? 'item') + '-' + index,
      label: String(entry?.label ?? entry?.name ?? entry?.libelle ?? entry?.nom ?? 'Non renseigné'),
      count,
      percentage: percentage === undefined || percentage === null ? (total ? (count / total) * 100 : 0) : asNumber(percentage),
    }
  })
}
const formatPercentage = (value, locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(asNumber(value)) + '%'
const genderLabel = (label, t, locale) => {
  const normalized = String(label || '').toLocaleLowerCase(locale)
  if (normalized === 'm' || normalized.includes('homme') || normalized.includes('masculin')) return t('dashboard.men')
  if (normalized === 'f' || normalized.includes('femme') || normalized.includes('féminin') || normalized.includes('feminin')) return t('dashboard.women')
  return String(label || t('common.notSpecified'))
}
const formatDate = (value, locale, fallback) => value ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : fallback

function SectionTitle({ children, link, to }) {
  return <div className="dash-section-title"><div><i /><h2>{children}</h2></div>{link && <Link to={to}>{link}<FiArrowRight /></Link>}</div>
}
function Metric({ icon: Icon, label, value, note, tone = 'gold', t }) {
  return <article className="dash-metric"><div className="dash-metric-top"><span>{label}</span><b className={`dash-icon ${tone}`}><Icon /></b></div><strong>{value}</strong><p><em><FiArrowUpRight /> {t('dashboard.live')}</em>{note}</p></article>
}

function DemographicOverview({ demographics, total, isLoading, locale, t }) {
  const topZone = [...demographics.zones].sort((left, right) => right.count - left.count)[0]
  const visibleEducation = demographics.education.slice(0, 4)
  const visibleCategories = demographics.categories.slice(0, 4)
  const visibleAges = demographics.ages.slice(0, 6)
  const dataAvailable = demographics.sexes.length || demographics.ages.length || demographics.education.length || demographics.zones.length || demographics.categories.length

  return (
    <section className="dash-demographic-section">
      <article className="dash-card">
        <SectionTitle link={t('dashboard.viewAll')} to="/statistiques">{t('dashboard.demographicOverview')}</SectionTitle>
        <p className="dash-subtitle">{t('dashboard.demographicDescription')}</p>
        {isLoading ? (
          <p className="dash-demographic-loading">{t('dashboard.demographicLoading')}</p>
        ) : dataAvailable ? (
          <div className="dash-demographic-content">
            <div className="dash-sex-cards">
              {demographics.sexes.map((item) => (
                <div key={item.id}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                  <small>{total ? formatPercentage(item.percentage, locale) : '0%'}</small>
                </div>
              ))}
            </div>
            <div className="dash-demographic-details">
              <div>
                <span>{t('dashboard.educationLevels')}</span>
                {visibleEducation.length ? visibleEducation.map((item) => (
                  <p key={item.id}><b>{item.label}</b><small>{item.count} · {formatPercentage(item.percentage, locale)}</small></p>
                )) : <p><small>{t('common.notSpecified')}</small></p>}
              </div>
              <div>
                <span>{t('dashboard.mainArea')}</span>
                {topZone ? <p><b>{topZone.label}</b><small>{t('dashboard.membersCount', { count: topZone.count })} · {formatPercentage(topZone.percentage, locale)}</small></p> : <p><small>{t('dashboard.feminineNotSpecified')}</small></p>}
                <span className="dash-category-title">{t('dashboard.categories')}</span>
                <div className="dash-category-chips">
                  {visibleCategories.map((item) => <i key={item.id}>{item.label} <b>{item.count}</b></i>)}
                  {!visibleCategories.length && <small>{t('dashboard.noCategories')}</small>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="dash-empty">{t('dashboard.noDemographicData')}</p>
        )}
      </article>
      <article className="dash-card">
        <SectionTitle link={t('dashboard.ageDetails')} to="/statistiques">{t('dashboard.ageDistribution')}</SectionTitle>
        <p className="dash-subtitle">{t('dashboard.ageDescription')}</p>
        {isLoading ? (
          <p className="dash-demographic-loading">{t('dashboard.ageLoading')}</p>
        ) : visibleAges.length ? (
          <div className="dash-age-list dash-age-list-detailed">
            {visibleAges.map((item) => (
              <div key={item.id}>
                <span>{item.label}</span>
                <i><b style={{ width: Math.min(100, Math.max(0, item.percentage)) + '%' }} /></i>
                <strong>{item.count}</strong>
                <small>{formatPercentage(item.percentage, locale)}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="dash-empty">{t('dashboard.noAgeData')}</p>
        )}
      </article>
    </section>
  )
}

export default function DashboardPage() {
  const { t, locale } = useT()
  const { user } = useAuthStore()
  const { data: membresData } = useMembres()
  const { data: eventsData } = useEvenements()
  const { data: memberStatistics, isLoading: isStatisticsLoading } = useMembreStatistiques()
  const { data: dailyVerse } = useVersetDuJour()
  const [period, setPeriod] = useState('Mois')
  const membres = useMemo(() => list(membresData), [membresData])
  const events = useMemo(() => list(eventsData), [eventsData])
  const stats = useMemo(() => {
    const actifs = membres.filter((m) => String(m.statut?.libelle || '').toLowerCase() === 'actif').length
    const upcoming = events.filter((e) => timestamp(e.date || e.date_evenement || e.debut) >= Date.now()).length
    const hasApiTotal = memberStatistics?.total !== undefined && memberStatistics?.total !== null
    const hasApiActive = memberStatistics?.active !== undefined && memberStatistics?.active !== null
    const total = hasApiTotal ? asNumber(memberStatistics.total) : membres.length
    const active = hasApiActive ? asNumber(memberStatistics.active) : actifs
    return { total, actifs: active, events: events.length, upcoming, rate: total ? Math.round((active / total) * 100) : 0 }
  }, [membres, events, memberStatistics])
  const recentMembers = useMemo(() => [...membres].sort((a, b) => timestamp(b.date_adhesion || b.created_at) - timestamp(a.date_adhesion || a.created_at)).slice(0, 5), [membres])
  const upcomingEvents = useMemo(() => events.filter((e) => timestamp(e.date || e.date_evenement || e.debut) >= Date.now()).sort((a, b) => timestamp(a.date || a.date_evenement || a.debut) - timestamp(b.date || b.date_evenement || b.debut)).slice(0, 4), [events])
  const statusData = useMemo(() => {
    const categories = statsRows(memberStatistics?.repartition?.categories, stats.total)
    if (categories.length) {
      return categories.map((item, index) => ({
        name: item.label,
        value: item.count,
        color: colors[index % colors.length],
      }))
    }
    const count = membres.reduce((all, member) => { const label = member.statut?.libelle || 'Sans statut'; all[label] = (all[label] || 0) + 1; return all }, {})
    return Object.entries(count).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
  }, [membres, memberStatistics, stats.total])
  const demographics = useMemo(() => {
    const repartition = memberStatistics?.repartition || {}
    const total = stats.total
    const sexes = statsRows(repartition.sexes, total).map((row) => ({ ...row, label: genderLabel(row.label, t, locale) }))
    const bySex = sexes.reduce((all, row) => {
      all[row.label] = (all[row.label] || 0) + row.count
      return all
    }, {})
    const men = asNumber(bySex[t('dashboard.men')])
    const women = asNumber(bySex[t('dashboard.women')])
    const ages = statsRows(repartition.ages, total)
    const education = statsRows(repartition.education, total)
    const zones = statsRows(repartition.zones, total)
    const categories = statsRows(repartition.categories, total)
    return { sexes, men, women, ages, education, zones, categories }
  }, [memberStatistics, stats.total, t, locale])
  const growth = useMemo(() => ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((month, index) => ({ month, membres: Math.max(0, stats.total - (5 - index)), evenements: Math.max(0, stats.events - Math.round((5 - index) / 2)) })), [stats])
  const pastoral = [
    ['Baptêmes', membres.filter((m) => m.date_bapteme).length, FiActivity], ['Affiliations', membres.filter((m) => m.date_affiliation).length, FiUsers], ['Mariages', events.filter((e) => /mariage|nuptial/i.test(e.titre || '')).length, FiHeart], ['Présentation enfants', events.filter((e) => /enfant/i.test(e.titre || '')).length, FiUserCheck], ['Événements à venir', stats.upcoming, FiCalendar], ['Membres actifs', stats.actifs, FiCheckCircle], ['Rapports', 0, FiFileText],
  ]
  const attendance = [{ day: 'S1', value: 78 }, { day: 'S2', value: 82 }, { day: 'S3', value: 74 }, { day: 'S4', value: 90 }, { day: 'S5', value: 96 }, { day: 'S6', value: 88 }]
  const name = user?.membre?.prenom || user?.membre?.nom || user?.identifiant || t('dashboard.administrator')
  const verse = dailyVerse || DAILY_VERSE_FALLBACK

  return <div className="reference-dashboard">
    <DemographicOverview demographics={demographics} total={stats.total} isLoading={isStatisticsLoading} locale={locale} t={t} />
    <header className="dash-hero"><div><p><span /> {t('dashboard.communityMonitoring')}</p><h1>{t('dashboard.hello')}, {name}.</h1><small>{t('dashboard.overview')}</small></div><div className="dash-hero-actions"><div className="dash-segments">{[t('dashboard.weekly'), t('dashboard.monthly'), t('dashboard.yearly')].map((item) => <button key={item} type="button" className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div><Link to="/membres/nouveau" className="dash-gold-button"><FiPlus /> {t('dashboard.newMember')}</Link></div></header>

    <section className="dash-metrics"><Metric t={t} icon={FiUsers} label={t('dashboard.totalMembers')} value={stats.total} note={t('dashboard.inTheRegistry')} /><Metric t={t} icon={FiUserCheck} label={t('dashboard.activeMembers')} value={stats.actifs} note={`${stats.rate}% du total`} tone="sage" /><Metric t={t} icon={FiCalendar} label={t('navigation.events')} value={stats.events} note={`${stats.upcoming} ${t('dashboard.upcoming')}`} tone="burgundy" /><Metric t={t} icon={FiActivity} label={t('dashboard.activityRate')} value={`${stats.rate}%`} note={t('dashboard.engagedMembers')} tone="navy" /></section>

    <section className="dash-grid-two"><article className="dash-card"><SectionTitle>Évolution du registre</SectionTitle><p className="dash-subtitle">Membres et événements enregistrés</p><div className="dash-chart"><ResponsiveContainer width="100%" height={230}><AreaChart data={growth}><defs><linearGradient id="memberFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#28396b" stopOpacity=".24" /><stop offset="100%" stopColor="#28396b" stopOpacity="0" /></linearGradient></defs><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="membres" name="Membres" stroke="#28396b" strokeWidth={2.5} fill="url(#memberFill)" /><Area type="monotone" dataKey="evenements" name="Événements" stroke="#a9536a" strokeWidth={2.5} fill="transparent" /></AreaChart></ResponsiveContainer></div></article><article className="dash-card"><SectionTitle>Répartition des membres</SectionTitle><p className="dash-subtitle">Selon le statut enregistré</p><div className="dash-donut"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={statusData.length ? statusData : [{ name: 'Aucun membre', value: 1, color: '#e7e3d8' }]} dataKey="value" innerRadius={52} outerRadius={75} paddingAngle={3}>{(statusData.length ? statusData : [{ color: '#e7e3d8' }]).map((item, index) => <Cell key={index} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="dash-legend">{statusData.map((item) => <span key={item.name}><i style={{ background: item.color }} /> {item.name} <b>{item.value}</b></span>)}</div></article></section>

    <section className="dash-section-wrap"><SectionTitle>Croissance & présence</SectionTitle><div className="dash-grid-two"><article className="dash-card"><SectionTitle>Croissance cumulée</SectionTitle><p className="dash-subtitle">Total des membres au registre, avec projection</p><div className="dash-chart"><ResponsiveContainer width="100%" height={200}><AreaChart data={growth}><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="membres" name="Réel" stroke="#28396b" strokeWidth={2.5} fill="rgba(28,44,82,.08)" /></AreaChart></ResponsiveContainer></div><div className="dash-mini-stats"><span><b>{stats.total}</b> cette année</span><span><b>—</b> objectif Q4</span><span><b>{stats.rate}%</b> rétention</span></div></article><article className="dash-card"><SectionTitle>Assiduité aux cultes</SectionTitle><p className="dash-subtitle">Présence dominicale — 6 dernières semaines</p><div className="dash-chart"><ResponsiveContainer width="100%" height={200}><BarChart data={attendance}><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" name="Présence" fill="#28396b" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="dash-mini-stats"><span><b>87%</b> présence moy.</span><span><b>S5</b> meilleur dimanche</span></div></article></div></section>


    <section className="dash-grid-three"><article className="dash-card"><SectionTitle link={t('dashboard.viewAll')} to="/membres">{t('dashboard.recentMembers')}</SectionTitle><p className="dash-subtitle">{t('dashboard.latestRegistrations')}</p><div className="dash-list">{recentMembers.length ? recentMembers.map((m) => { const fullName = `${m.prenom || ''} ${m.nom || ''}`.trim() || t('navigation.members'); return <Link to={`/membres/${m.id}`} key={m.id} className="dash-list-item"><span className="dash-avatar">{fullName[0]}</span><div><b>{fullName}</b><small>{m.telephone || m.email || t('dashboard.memberProfile')}</small></div><em className={String(m.statut?.libelle || '').toLowerCase() === 'actif' ? 'green' : 'gold'}>{m.statut?.libelle || t('dashboard.new')}</em></Link> }) : <p className="dash-empty">{t('dashboard.noMember')}</p>}</div></article><article className="dash-card"><SectionTitle link={t('dashboard.viewAll')} to="/evenements">{t('navigation.events')}</SectionTitle><p className="dash-subtitle">{t('dashboard.upcomingAppointments')}</p><div className="dash-events">{upcomingEvents.length ? upcomingEvents.map((event) => { const date = new Date(event.date || event.date_evenement || event.debut); return <Link key={event.id} to={`/evenements/${event.id}`} className="dash-event"><span><b>{Number.isNaN(date.getTime()) ? '—' : date.getDate()}</b><small>{Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(locale, { month: 'short' })}</small></span><div><b>{event.titre || t('notifications.scheduledEvent')}</b><small><FiMapPin /> {event.lieu || t('dashboard.locationToSet')}</small></div></Link> }) : <p className="dash-empty">{t('dashboard.noPlannedEvent')}</p>}</div></article><article className="dash-card"><SectionTitle>{t('dashboard.activities')}</SectionTitle><p className="dash-subtitle">{t('dashboard.latestActions')}</p><div className="dash-feed">{recentMembers.slice(0, 3).map((m) => <div key={m.id}><span><FiUsers /></span><p><b>{t('notifications.newMember')}</b><small>{`${m.prenom || ''} ${m.nom || ''}`.trim() || t('dashboard.aMember')} {t('dashboard.joinedDirectory')}</small><time>{formatDate(m.date_adhesion || m.created_at, locale, t('common.dateToDefine'))}</time></p></div>)}{upcomingEvents.slice(0, 1).map((event) => <div key={`event-${event.id}`}><span className="gold"><FiCalendar /></span><p><b>{t('notifications.upcomingEvent')}</b><small>{event.titre || t('notifications.scheduledEvent')}</small><time>{formatDate(event.date || event.date_evenement || event.debut, locale, t('common.dateToDefine'))}</time></p></div>)}{!recentMembers.length && !upcomingEvents.length && <p className="dash-empty">{t('dashboard.noRecentActivity')}</p>}</div></article></section>

    <section className="dash-section-wrap"><SectionTitle>Activité hebdomadaire</SectionTitle><article className="dash-card"><div className="dash-weekly"><div><p className="dash-subtitle">Répartition des interactions de la semaine</p><ResponsiveContainer width="100%" height={170}><BarChart data={attendance.map((entry, index) => ({ ...entry, day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][index] || 'Dim' }))}><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis hide /><Tooltip /><Bar dataKey="value" fill="#28396b" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div><aside><span>Total<b>{attendance.reduce((sum, item) => sum + item.value, 0)}</b></span><span>Moyenne / jour<b>{Math.round(attendance.reduce((sum, item) => sum + item.value, 0) / attendance.length)}</b></span><span>Pic<b>96</b></span></aside></div></article></section>

    <section className="dash-section-wrap"><SectionTitle>Pilotage pastoral</SectionTitle><div className="dash-grid-two"><article className="dash-card"><SectionTitle>Objectifs du trimestre</SectionTitle><p className="dash-subtitle">Suivi des cibles fixées par le conseil</p><div className="dash-goals">{[['Nouveaux membres', stats.total, 5], ['Baptêmes prévus', pastoral[0][1], 4], ['Taux d’assiduité', 87, 90]].map(([label, value, target]) => <div key={label}><p><span>{label}</span><b>{`${value} / ${target}`}</b></p><i><em style={{ width: `${Math.min(100, target ? (value / target) * 100 : 0)}%` }} /></i></div>)}</div></article><article className="dash-verse"><div><p><i /> Verset du jour</p><blockquote>« {verse.texte} »</blockquote><cite>— {verse.reference}</cite></div><footer><span>Prochain culte<b>Dimanche · 9h00</b></span><span>Thème<b>La communion fraternelle</b></span></footer></article></div></section>

    <section><SectionTitle>Indicateurs des rapports pastoraux</SectionTitle><div className="dash-pastoral">{pastoral.map(([label, value, Icon], index) => <article key={label} className={index === 0 ? 'featured' : ''}><span><Icon /></span><strong>{value}</strong><p>{label}</p></article>)}</div></section>
  </div>
}
