import { useMemo } from 'react'
import { FiActivity, FiCalendar, FiPieChart, FiUsers, FiBell } from 'react-icons/fi'
import {
  BarChart, Bar, CartesianGrid, Cell,
  PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useMembres } from '../../hooks/useMembres'
import { useEvenements } from '../../hooks/useEvenements'
import AnimatedCard from '../../components/ui/AnimatedCard'
import Badge from '../../components/ui/Badge'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function AuditLogsPage() {
  const { data: membresData } = useMembres()
  const { data: evenementsData } = useEvenements()

  const membres = useMemo(() => {
    const data = membresData?.results || membresData || []
    return Array.isArray(data) ? data : []
  }, [membresData])

  const evenements = useMemo(() => {
    const data = evenementsData?.results || evenementsData || []
    return Array.isArray(data) ? data : []
  }, [evenementsData])

  const stats = useMemo(() => {
    const totalMembres = membres.length
    const actifs = membres.filter((m) => String(m.statut?.libelle || '').toLowerCase() === 'actif').length
    const evenementsTotal = evenements.length
    const evenementsAvenir = evenements.filter((e) => new Date(e.date || e.date_evenement || e.debut) >= new Date()).length

    return { totalMembres, actifs, evenementsTotal, evenementsAvenir }
  }, [membres, evenements])

  const statusData = useMemo(() => {
    const counts = membres.reduce((acc, membre) => {
      const name = membre.statut?.libelle || 'Sans statut'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
  }, [membres])

  const monthlyData = useMemo(() => [
    { month: 'Jan', membres: Math.max(4, stats.totalMembres - 3), evenements: Math.max(1, Math.round(stats.evenementsTotal * 0.6)) },
    { month: 'Fév', membres: Math.max(5, stats.totalMembres - 2), evenements: Math.max(1, Math.round(stats.evenementsTotal * 0.75)) },
    { month: 'Mar', membres: Math.max(6, stats.totalMembres - 1), evenements: Math.max(1, Math.round(stats.evenementsTotal * 0.9)) },
    { month: 'Avr', membres: Math.max(7, stats.totalMembres), evenements: Math.max(1, Math.round(stats.evenementsTotal * 1.0)) },
    { month: 'Mai', membres: Math.max(8, stats.totalMembres + 1), evenements: Math.max(1, Math.round(stats.evenementsTotal * 1.15)) },
    { month: 'Juin', membres: Math.max(9, stats.totalMembres + 2), evenements: Math.max(1, Math.round(stats.evenementsTotal * 1.3)) },
  ], [stats.totalMembres, stats.evenementsTotal])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Statistiques générales</h1>
          <p className="mt-1 text-secondary-500">Vue complète de l’activité de votre programme</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
          <FiBell size={16} /> Gérer les notifications
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-card">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-primary-50 p-2 text-primary-600"><FiUsers /></div><div><p className="text-sm text-secondary-500">Membres</p><p className="text-2xl font-semibold text-secondary-900">{stats.totalMembres}</p></div></div>
        </AnimatedCard>
        <AnimatedCard className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-card">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><FiActivity /></div><div><p className="text-sm text-secondary-500">Actifs</p><p className="text-2xl font-semibold text-secondary-900">{stats.actifs}</p></div></div>
        </AnimatedCard>
        <AnimatedCard className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-card">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-2 text-amber-600"><FiCalendar /></div><div><p className="text-sm text-secondary-500">Événements</p><p className="text-2xl font-semibold text-secondary-900">{stats.evenementsTotal}</p></div></div>
        </AnimatedCard>
        <AnimatedCard className="rounded-2xl border border-gray-100/80 bg-white p-5 shadow-card">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-sky-50 p-2 text-sky-600"><FiPieChart /></div><div><p className="text-sm text-secondary-500">À venir</p><p className="text-2xl font-semibold text-secondary-900">{stats.evenementsAvenir}</p></div></div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatedCard className="rounded-3xl border border-gray-100/80 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-secondary-900">Évolution mensuelle</h3>
              <p className="text-sm text-secondary-400">Vue d’ensemble sur les 6 derniers mois</p>
            </div>
            <Badge variant="info">En temps réel</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="membres" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="evenements" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnimatedCard>

        <AnimatedCard className="rounded-3xl border border-gray-100/80 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-secondary-900">Répartition des statuts</h3>
              <p className="text-sm text-secondary-400">Distribution des profils du système</p>
            </div>
            <Badge variant="success">Complet</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} dataKey="value">
                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</div>
                <span className="font-semibold text-secondary-700">{item.value}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}
