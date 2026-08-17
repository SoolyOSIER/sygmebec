import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FiActivity, FiArrowRight, FiArrowUpRight, FiCalendar, FiCheckCircle, FiFileText, FiHeart, FiMapPin, FiPlus, FiUserCheck, FiUsers } from 'react-icons/fi'
import { useMembres } from '../hooks/useMembres'
import { useEvenements } from '../hooks/useEvenements'
import { useAuthStore } from '../store/authStore'
import './dashboardReference.css'
import './dashboardExtras.css'

const colors = ['#4c7a5e', '#a9536a', '#c6a15b', '#28396b', '#8b6f43']
const list = (value) => Array.isArray(value?.results) ? value.results : (Array.isArray(value) ? value : [])
const timestamp = (value) => new Date(value || 0).getTime()
const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'À définir'

function SectionTitle({ children, link, to }) {
  return <div className="dash-section-title"><div><i /><h2>{children}</h2></div>{link && <Link to={to}>{link}<FiArrowRight /></Link>}</div>
}

function Metric({ icon: Icon, label, value, note, tone = 'gold' }) {
  return <article className="dash-metric"><div className="dash-metric-top"><span>{label}</span><b className={`dash-icon ${tone}`}><Icon /></b></div><strong>{value}</strong><p><em><FiArrowUpRight /> En direct</em>{note}</p></article>
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: membresData } = useMembres()
  const { data: eventsData } = useEvenements()
  const [period, setPeriod] = useState('Mois')
  const membres = useMemo(() => list(membresData), [membresData])
  const events = useMemo(() => list(eventsData), [eventsData])
  const stats = useMemo(() => {
    const actifs = membres.filter((m) => String(m.statut?.libelle || '').toLowerCase() === 'actif').length
    const upcoming = events.filter((e) => timestamp(e.date || e.date_evenement || e.debut) >= Date.now()).length
    return { total: membres.length, actifs, events: events.length, upcoming, rate: membres.length ? Math.round((actifs / membres.length) * 100) : 0 }
  }, [membres, events])
  const recentMembers = useMemo(() => [...membres].sort((a, b) => timestamp(b.date_adhesion || b.created_at) - timestamp(a.date_adhesion || a.created_at)).slice(0, 5), [membres])
  const upcomingEvents = useMemo(() => events.filter((e) => timestamp(e.date || e.date_evenement || e.debut) >= Date.now()).sort((a, b) => timestamp(a.date || a.date_evenement || a.debut) - timestamp(b.date || b.date_evenement || b.debut)).slice(0, 4), [events])
  const statusData = useMemo(() => {
    const count = membres.reduce((all, member) => { const label = member.statut?.libelle || 'Sans statut'; all[label] = (all[label] || 0) + 1; return all }, {})
    return Object.entries(count).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
  }, [membres])
  const growth = useMemo(() => ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((month, index) => ({ month, membres: Math.max(0, stats.total - (5 - index)), evenements: Math.max(0, stats.events - Math.round((5 - index) / 2)) })), [stats])
  const pastoral = [
    ['Baptêmes', membres.filter((m) => m.date_bapteme).length, FiActivity], ['Affiliations', membres.filter((m) => m.date_affiliation).length, FiUsers], ['Mariages', events.filter((e) => /mariage|nuptial/i.test(e.titre || '')).length, FiHeart], ['Présentation enfants', events.filter((e) => /enfant/i.test(e.titre || '')).length, FiUserCheck], ['Événements à venir', stats.upcoming, FiCalendar], ['Membres actifs', stats.actifs, FiCheckCircle], ['Rapports', 0, FiFileText],
  ]
  const attendance = [{ day: 'S1', value: 78 }, { day: 'S2', value: 82 }, { day: 'S3', value: 74 }, { day: 'S4', value: 90 }, { day: 'S5', value: 96 }, { day: 'S6', value: 88 }]
  const name = user?.membre?.prenom || user?.membre?.nom || user?.identifiant || 'Administrateur'

  return <div className="reference-dashboard">
    <header className="dash-hero"><div><p><span /> Pilotage de la communauté</p><h1>Bonjour, {name}.</h1><small>Voici une vue d’ensemble de l’Église Baptiste de l’Espoir.</small></div><div className="dash-hero-actions"><div className="dash-segments">{['Semaine', 'Mois', 'Année'].map((item) => <button key={item} type="button" className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div><Link to="/membres/nouveau" className="dash-gold-button"><FiPlus /> Nouveau membre</Link></div></header>

    <section className="dash-metrics"><Metric icon={FiUsers} label="Total membres" value={stats.total} note="dans le registre" /><Metric icon={FiUserCheck} label="Membres actifs" value={stats.actifs} note={`${stats.rate}% du total`} tone="sage" /><Metric icon={FiCalendar} label="Événements" value={stats.events} note={`${stats.upcoming} à venir`} tone="burgundy" /><Metric icon={FiActivity} label="Taux d’activité" value={`${stats.rate}%`} note="membres engagés" tone="navy" /></section>

    <section className="dash-grid-two"><article className="dash-card"><SectionTitle>Évolution du registre</SectionTitle><p className="dash-subtitle">Membres et événements enregistrés</p><div className="dash-chart"><ResponsiveContainer width="100%" height={230}><AreaChart data={growth}><defs><linearGradient id="memberFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#28396b" stopOpacity=".24" /><stop offset="100%" stopColor="#28396b" stopOpacity="0" /></linearGradient></defs><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="membres" name="Membres" stroke="#28396b" strokeWidth={2.5} fill="url(#memberFill)" /><Area type="monotone" dataKey="evenements" name="Événements" stroke="#a9536a" strokeWidth={2.5} fill="transparent" /></AreaChart></ResponsiveContainer></div></article><article className="dash-card"><SectionTitle>Répartition des membres</SectionTitle><p className="dash-subtitle">Selon le statut enregistré</p><div className="dash-donut"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={statusData.length ? statusData : [{ name: 'Aucun membre', value: 1, color: '#e7e3d8' }]} dataKey="value" innerRadius={52} outerRadius={75} paddingAngle={3}>{(statusData.length ? statusData : [{ color: '#e7e3d8' }]).map((item, index) => <Cell key={index} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="dash-legend">{statusData.map((item) => <span key={item.name}><i style={{ background: item.color }} /> {item.name} <b>{item.value}</b></span>)}</div></article></section>

    <section className="dash-section-wrap"><SectionTitle>Croissance & présence</SectionTitle><div className="dash-grid-two"><article className="dash-card"><SectionTitle>Croissance cumulée</SectionTitle><p className="dash-subtitle">Total des membres au registre, avec projection</p><div className="dash-chart"><ResponsiveContainer width="100%" height={200}><AreaChart data={growth}><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="membres" name="Réel" stroke="#28396b" strokeWidth={2.5} fill="rgba(28,44,82,.08)" /></AreaChart></ResponsiveContainer></div><div className="dash-mini-stats"><span><b>{stats.total}</b> cette année</span><span><b>—</b> objectif Q4</span><span><b>{stats.rate}%</b> rétention</span></div></article><article className="dash-card"><SectionTitle>Assiduité aux cultes</SectionTitle><p className="dash-subtitle">Présence dominicale — 6 dernières semaines</p><div className="dash-chart"><ResponsiveContainer width="100%" height={200}><BarChart data={attendance}><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" name="Présence" fill="#28396b" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="dash-mini-stats"><span><b>87%</b> présence moy.</span><span><b>S5</b> meilleur dimanche</span></div></article></div></section>


    <section className="dash-grid-three"><article className="dash-card"><SectionTitle link="Voir tout" to="/membres">Membres récents</SectionTitle><p className="dash-subtitle">Dernières inscriptions</p><div className="dash-list">{recentMembers.length ? recentMembers.map((m) => { const fullName = `${m.prenom || ''} ${m.nom || ''}`.trim() || 'Membre'; return <Link to={`/membres/${m.id}`} key={m.id} className="dash-list-item"><span className="dash-avatar">{fullName[0]}</span><div><b>{fullName}</b><small>{m.telephone || m.email || 'Profil membre'}</small></div><em className={String(m.statut?.libelle || '').toLowerCase() === 'actif' ? 'green' : 'gold'}>{m.statut?.libelle || 'Nouveau'}</em></Link> }) : <p className="dash-empty">Aucun membre enregistré</p>}</div></article><article className="dash-card"><SectionTitle link="Voir tout" to="/evenements">Événements</SectionTitle><p className="dash-subtitle">Prochains rendez-vous</p><div className="dash-events">{upcomingEvents.length ? upcomingEvents.map((event) => { const date = new Date(event.date || event.date_evenement || event.debut); return <Link key={event.id} to={`/evenements/${event.id}`} className="dash-event"><span><b>{Number.isNaN(date.getTime()) ? '—' : date.getDate()}</b><small>{Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR', { month: 'short' })}</small></span><div><b>{event.titre || 'Événement programmé'}</b><small><FiMapPin /> {event.lieu || 'Lieu à définir'}</small></div></Link> }) : <p className="dash-empty">Aucun événement planifié</p>}</div></article><article className="dash-card"><SectionTitle>Activités</SectionTitle><p className="dash-subtitle">Dernières actions</p><div className="dash-feed">{recentMembers.slice(0, 3).map((m) => <div key={m.id}><span><FiUsers /></span><p><b>Nouveau membre</b><small>{`${m.prenom || ''} ${m.nom || ''}`.trim() || 'Un membre'} a rejoint le registre</small><time>{formatDate(m.date_adhesion || m.created_at)}</time></p></div>)}{upcomingEvents.slice(0, 1).map((event) => <div key={`event-${event.id}`}><span className="gold"><FiCalendar /></span><p><b>Événement à venir</b><small>{event.titre || 'Événement programmé'}</small><time>{formatDate(event.date || event.date_evenement || event.debut)}</time></p></div>)}{!recentMembers.length && !upcomingEvents.length && <p className="dash-empty">Aucune activité récente</p>}</div></article></section>

    <section className="dash-section-wrap"><SectionTitle>Activité hebdomadaire</SectionTitle><article className="dash-card"><div className="dash-weekly"><div><p className="dash-subtitle">Répartition des interactions de la semaine</p><ResponsiveContainer width="100%" height={170}><BarChart data={attendance.map((entry, index) => ({ ...entry, day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][index] || 'Dim' }))}><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis hide /><Tooltip /><Bar dataKey="value" fill="#28396b" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div><aside><span>Total<b>{attendance.reduce((sum, item) => sum + item.value, 0)}</b></span><span>Moyenne / jour<b>{Math.round(attendance.reduce((sum, item) => sum + item.value, 0) / attendance.length)}</b></span><span>Pic<b>96</b></span></aside></div></article></section>

    <section className="dash-section-wrap"><SectionTitle>Pilotage pastoral</SectionTitle><div className="dash-grid-two"><article className="dash-card"><SectionTitle>Objectifs du trimestre</SectionTitle><p className="dash-subtitle">Suivi des cibles fixées par le conseil</p><div className="dash-goals">{[['Nouveaux membres', stats.total, 5], ['Baptêmes prévus', pastoral[0][1], 4], ['Taux d’assiduité', 87, 90]].map(([label, value, target]) => <div key={label}><p><span>{label}</span><b>{`${value} / ${target}`}</b></p><i><em style={{ width: `${Math.min(100, target ? (value / target) * 100 : 0)}%` }} /></i></div>)}</div></article><article className="dash-verse"><div><p><i /> Verset du jour</p><blockquote>« Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux. »</blockquote><cite>— Matthieu 18:20</cite></div><footer><span>Prochain culte<b>Dimanche · 9h00</b></span><span>Thème<b>La communion fraternelle</b></span></footer></article></div></section>

    <section><SectionTitle>Indicateurs des rapports pastoraux</SectionTitle><div className="dash-pastoral">{pastoral.map(([label, value, Icon], index) => <article key={label} className={index === 0 ? 'featured' : ''}><span><Icon /></span><strong>{value}</strong><p>{label}</p></article>)}</div></section>
  </div>
}
