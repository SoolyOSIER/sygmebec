// ============================================
// src/pages/DashboardPage.jsx - Version Ultra Premium
// ============================================
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers, FiUserCheck, FiCalendar, FiArrowRight,
  FiActivity, FiPieChart, FiBarChart2, FiClock,
  FiMapPin, FiBell, FiPlus, FiDollarSign, FiShoppingBag,
  FiTrendingUp, FiTrendingDown, FiMoreHorizontal,
  FiEye, FiEdit, FiTrash2, FiStar, FiAward,
  FiGlobe, FiMail, FiPhone, FiBriefcase, FiCreditCard,
  FiLayers, FiTarget, FiZap, FiGift, FiAperture, FiSearch
} from 'react-icons/fi'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, Legend, LineChart, Line,
  RadialBarChart, RadialBar, PolarAngleAxis,
  ScatterChart, Scatter, ZAxis,
  ComposedChart
} from 'recharts'
import { useMembres } from '../hooks/useMembres'
import { useEvenements } from '../hooks/useEvenements'
import { useAuthStore } from '../store/authStore'
import StatCard from '../components/ui/StatCard'
import AnimatedCard from '../components/ui/AnimatedCard'
import Badge from '../components/ui/Badge'
import api from '../api/axiosClient'

// === COULEURS ===
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316']
const GRADIENT_COLORS = [
  'from-indigo-500 to-indigo-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-purple-500 to-pink-400',
  'from-rose-500 to-red-400',
  'from-cyan-500 to-blue-400',
]

const STATUS_COLORS = {
  'Actif': '#10B981',
  'Inactif': '#EF4444',
  'En attente': '#F59E0B',
  'Suspendu': '#8B5CF6',
  'Banni': '#DC2626',
  'Premium': '#8B5CF6',
}

// === UTILS ===
const toTimestamp = (value) => {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const formatDate = (value) => {
  if (!value) return 'À définir'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// === DONNÉES SIMULÉES ===
const generateSalesData = () => [
  { month: 'Jan', ventes: 42000, profit: 28000, target: 38000 },
  { month: 'Fév', ventes: 38000, profit: 22000, target: 35000 },
  { month: 'Mar', ventes: 45000, profit: 32000, target: 40000 },
  { month: 'Avr', ventes: 52000, profit: 38000, target: 45000 },
  { month: 'Mai', ventes: 48000, profit: 34000, target: 42000 },
  { month: 'Juin', ventes: 58000, profit: 42000, target: 48000 },
]

const generateTopStores = () => [
  { name: 'Gateway str', sales: 874000, growth: 12.4, region: 'USA' },
  { name: 'The Rustic Fox', sales: 721000, growth: 8.7, region: 'UK' },
  { name: 'Velvet Vine', sales: 598000, growth: -2.1, region: 'FR' },
  { name: 'Blue Harbor', sales: 506000, growth: 15.3, region: 'DE' },
  { name: 'Nebula Novelties', sales: 395000, growth: 5.8, region: 'JP' },
]

const generateRegionData = () => [
  { name: 'Amérique', value: 45, color: '#4F46E5' },
  { name: 'Europe', value: 30, color: '#10B981' },
  { name: 'Asie', value: 15, color: '#F59E0B' },
  { name: 'Afrique', value: 10, color: '#8B5CF6' },
]

const generateWeeklyActivity = () => [
  { day: 'Lun', value: 45 },
  { day: 'Mar', value: 72 },
  { day: 'Mer', value: 58 },
  { day: 'Jeu', value: 83 },
  { day: 'Ven', value: 94 },
  { day: 'Sam', value: 67 },
  { day: 'Dim', value: 34 },
]

const generatePaymentHistory = () => [
  { id: 1, name: 'Dribbble Design', date: '16 Jun 2025', time: '10:30 PM', status: 'Successful', amount: 89345.23, method: 'VISA' },
  { id: 2, name: 'Google Pay', date: '15 Jun 2025', time: '11:45 PM', status: 'Successful', amount: 12345.89, method: 'Google' },
  { id: 3, name: 'Amazon Shopping', date: '14 Jun 2025', time: '10:15 PM', status: 'Successful', amount: 32123.67, method: 'VISA' },
  { id: 4, name: 'Spotify Premium', date: '13 Jun 2025', time: '09:30 PM', status: 'Pending', amount: 1499.00, method: 'PayPal' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: membresData } = useMembres()
  const { data: evenementsData } = useEvenements()
  const [auditLogs, setAuditLogs] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await api.get('/audit-logs/')
        const data = res.data.results || res.data || []
        setAuditLogs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      }
    }
    loadLogs()
  }, [])

  // === DATA PROCESSING ===
  const membres = useMemo(() => {
    const data = membresData?.results || membresData || []
    return Array.isArray(data) ? data : []
  }, [membresData])

  const evenements = useMemo(() => {
    const data = evenementsData?.results || evenementsData || []
    return Array.isArray(data) ? data : []
  }, [evenementsData])

  const stats = useMemo(() => {
    const total = membres.length
    const actifs = membres.filter((m) => String(m.statut?.libelle || '').toLowerCase() === 'actif').length
    const inactifs = membres.filter((m) => String(m.statut?.libelle || '').toLowerCase() === 'inactif').length
    const upcoming = evenements.filter((e) => toTimestamp(e.date || e.date_evenement || e.debut) >= Date.now()).length
    const today = evenements.filter((e) => {
      const date = new Date(e.date || e.date_evenement || e.debut)
      return !Number.isNaN(date.getTime()) && date.toDateString() === new Date().toDateString()
    }).length
    const totalEvenements = evenements.length
    return { total, actifs, inactifs, upcoming, today, evenements: totalEvenements }
  }, [membres, evenements])

  const statusData = useMemo(() => {
    const counts = membres.reduce((acc, membre) => {
      const label = membre.statut?.libelle || 'Sans statut'
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  }, [membres])

  const activityData = useMemo(() => {
    const total = Math.max(1, stats.total)
    const evenementsCount = Math.max(1, stats.evenements)
    return [
      { month: 'Jan', membres: Math.max(4, total - 3), evenements: Math.max(1, Math.round(evenementsCount * 0.7)) },
      { month: 'Fév', membres: Math.max(5, total - 2), evenements: Math.max(1, Math.round(evenementsCount * 0.8)) },
      { month: 'Mar', membres: Math.max(6, total - 1), evenements: Math.max(1, Math.round(evenementsCount * 0.9)) },
      { month: 'Avr', membres: Math.max(7, total), evenements: Math.max(1, Math.round(evenementsCount * 1.0)) },
      { month: 'Mai', membres: Math.max(8, total + 1), evenements: Math.max(1, Math.round(evenementsCount * 1.15)) },
      { month: 'Juin', membres: Math.max(9, total + 2), evenements: Math.max(1, Math.round(evenementsCount * 1.25)) },
    ]
  }, [stats.total, stats.evenements])

  // === DONNÉES SIMULÉES ===
  const salesData = useMemo(() => generateSalesData(), [])
  const topStores = useMemo(() => generateTopStores(), [])
  const regionData = useMemo(() => generateRegionData(), [])
  const weeklyActivity = useMemo(() => generateWeeklyActivity(), [])
  const paymentHistory = useMemo(() => generatePaymentHistory(), [])

  const recentMembers = useMemo(() => {
    return [...membres]
      .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
      .slice(0, 6)
  }, [membres])

  const upcomingEvents = useMemo(() => {
    return [...evenements]
      .filter((event) => toTimestamp(event.date || event.date_evenement || event.debut) >= Date.now())
      .sort((a, b) => toTimestamp(a.date || a.date_evenement || a.debut) - toTimestamp(b.date || b.date_evenement || b.debut))
      .slice(0, 5)
  }, [evenements])

  const recentActivities = useMemo(() => {
    const activities = []
    recentMembers.forEach((membre, index) => {
      activities.push({
        id: `member-${membre.id || index}`,
        title: 'Nouveau membre',
        description: `${[membre.prenom, membre.nom].filter(Boolean).join(' ').trim() || 'Un membre'} a rejoint le système`,
        time: membre.created_at ? formatDate(membre.created_at) : 'Récemment',
        icon: FiUsers,
        tone: 'primary',
        user: membre,
      })
    })
    upcomingEvents.forEach((event, index) => {
      activities.push({
        id: `event-${event.id || index}`,
        title: 'Événement à venir',
        description: event.titre || event.nom || 'Événement planifié',
        time: event.date ? formatDate(event.date) : 'À venir',
        icon: FiCalendar,
        tone: 'warning',
        event: event,
      })
    })
    auditLogs.slice(0, 4).forEach((log, index) => {
      activities.push({
        id: `log-${log.id || index}`,
        title: 'Action système',
        description: log.object_repr || log.content_type || 'Activité détectée',
        time: log.timestamp ? formatDate(log.timestamp) : 'Récemment',
        icon: FiActivity,
        tone: 'success',
      })
    })
    return activities.slice(0, 8)
  }, [recentMembers, upcomingEvents, auditLogs])

  // === STATISTIQUES MÉTRIQUES ===
  const metrics = {
    totalSales: 59690,
    totalOrders: 4865,
    totalCustomers: 2245,
    growth: 13.4,
    avgOrderValue: 89.50,
    conversionRate: 3.2,
    bounceRate: 24.6,
  }

  // === VARIANTES D'ANIMATION ===
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-8"
    >
      {/* === HEADER ULTRA PREMIUM === */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 shadow-2xl"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full">
            <div className="absolute top-0 left-10 h-16 w-16 rounded-full bg-white/5 animate-pulse" />
            <div className="absolute bottom-10 right-20 h-12 w-12 rounded-full bg-white/5 animate-pulse delay-500" />
            <div className="absolute top-1/2 right-10 h-8 w-8 rounded-full bg-white/5 animate-pulse delay-1000" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl"
              >
                👋
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl lg:text-3xl font-bold text-white"
                >
                  Bonjour, {user?.membre?.nom || user?.identifiant || 'Admin'} !
                </motion.h1>
                <p className="text-indigo-100/80 mt-1 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-indigo-200/60">{stats.total} membres</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur border border-white/20"
            >
              <FiSearch className="text-white/60" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent text-white placeholder-white/50 outline-none text-sm w-32 lg:w-48"
              />
              <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] text-white/60 bg-white/10 rounded border border-white/10">
                ⌘K
              </kbd>
            </motion.div>

            {/* Period Selector */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-1">
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/30"
            >
              <FiPlus size={18} />
              Nouveau
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* === STATISTIQUES PRINCIPALES === */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Membres"
          value={stats.total}
          icon={FiUsers}
          color="primary"
          change={8}
          delay={0.05}
          subtitle="+12 ce mois"
        />
        <StatCard
          title="Membres Actifs"
          value={stats.actifs}
          icon={FiUserCheck}
          color="success"
          change={5}
          delay={0.1}
          subtitle={`${Math.round((stats.actifs / stats.total) * 100)}% du total`}
        />
        <StatCard
          title="Événements"
          value={stats.evenements}
          icon={FiCalendar}
          color="warning"
          change={12}
          delay={0.15}
          subtitle={`${stats.upcoming} à venir`}
        />
        <StatCard
          title="Taux d'Activité"
          value={`${stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}%`}
          icon={FiActivity}
          color="purple"
          change={3}
          delay={0.2}
          subtitle="Membres engagés"
        />
      </motion.div>

      {/* === SECTION GRAPHIQUE PRINCIPALE === */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Graphique Évolution */}
        <AnimatedCard className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Évolution des données</h3>
              <p className="text-sm text-secondary-400">Membres et événements enregistrés</p>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-secondary-500">Membres</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-400" />
                <span className="text-secondary-500">Événements</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="gradientMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: '#94A3B8', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="membres" stroke="#4F46E5" strokeWidth={3} fill="url(#gradientMembers)" />
              <Area type="monotone" dataKey="evenements" stroke="#8B5CF6" strokeWidth={3} fill="url(#gradientEvents)" />
            </AreaChart>
          </ResponsiveContainer>
        </AnimatedCard>

        {/* Répartition des statuts - Style Anneau */}
        <AnimatedCard className="rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Répartition</h3>
              <p className="text-sm text-secondary-400">Statuts des membres</p>
            </div>
            <Badge variant="primary" size="sm">+{stats.actifs} actifs</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {statusData.slice(0, 4).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-secondary-600 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-secondary-900">{item.value}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* === SECTION MÉTRIQUES AVANCÉES === */}
      <motion.div variants={itemVariants}>
        <AnimatedCard className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-card border border-indigo-100/50">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Métriques de Performance</h3>
              <p className="text-sm text-secondary-400">Aperçu des indicateurs clés</p>
            </div>
            <Badge variant="primary" dot size="md">En direct</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Ventes', value: `$${metrics.totalSales.toLocaleString()}`, change: '+13.4%', icon: FiDollarSign, color: 'emerald' },
              { label: 'Total Commandes', value: metrics.totalOrders.toLocaleString(), change: '+8.2%', icon: FiShoppingBag, color: 'indigo' },
              { label: 'Total Clients', value: metrics.totalCustomers.toLocaleString(), change: '+5.7%', icon: FiUsers, color: 'blue' },
              { label: 'Panier Moyen', value: `$${metrics.avgOrderValue.toFixed(2)}`, change: '+2.1%', icon: FiCreditCard, color: 'purple' },
              { label: 'Taux Conversion', value: `${metrics.conversionRate}%`, change: '+0.8%', icon: FiTarget, color: 'amber' },
              { label: 'Taux Rebond', value: `${metrics.bounceRate}%`, change: '-4.3%', icon: FiAperture, color: 'rose' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl bg-white p-4 shadow-sm border border-${metric.color}-100 hover:shadow-lg transition-all`}
              >
                <div className={`flex items-center gap-2 text-${metric.color}-600`}>
                  <metric.icon size={16} />
                  <span className="text-xs font-medium text-secondary-500">{metric.label}</span>
                </div>
                <p className="mt-2 text-xl font-bold text-secondary-900">{metric.value}</p>
                <span className={`text-xs font-medium ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {metric.change}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* === DÉPENSES vs PROFITS + TOP STORES === */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dépenses vs Profits */}
        <AnimatedCard className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Dépenses vs Profits</h3>
              <p className="text-sm text-secondary-400">Évolution sur 6 mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-secondary-500">Profit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="text-secondary-500">Dépense</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="profit" fill="#10B981" radius={[6, 6, 0, 0]} barSize={32} />
              <Bar dataKey="ventes" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={32} />
              <Line type="monotone" dataKey="target" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-secondary-400">Derniers 6 mois</span>
            <Link to="/statistiques" className="flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Voir plus <FiArrowRight size={14} />
            </Link>
          </div>
        </AnimatedCard>

        {/* Top Stores - Style classement */}
        <AnimatedCard className="rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Top Stores</h3>
              <p className="text-sm text-secondary-400">Meilleures performances</p>
            </div>
            <Badge variant="warning" size="sm">🏆 Classement</Badge>
          </div>
          <div className="space-y-2.5">
            {topStores.map((store, index) => (
              <motion.div
                key={store.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, backgroundColor: '#F8FAFC' }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 text-center ${
                    index === 0 ? 'text-indigo-600' : 
                    index === 1 ? 'text-emerald-600' : 
                    index === 2 ? 'text-amber-600' : 'text-secondary-400'
                  }`}>
                    {index + 1}
                  </span>
                  {index === 0 && <FiStar className="text-indigo-500" size={14} />}
                  <span className="text-sm text-secondary-700">{store.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-secondary-900">
                    {formatCurrency(store.sales)}
                  </span>
                  <Badge variant={store.growth > 0 ? 'success' : 'danger'} size="sm">
                    {store.growth > 0 ? '+' : ''}{store.growth}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* === SECTION PAYMENTS / ACTIVITÉS === */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membres récents */}
        <AnimatedCard className="h-full rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Membres récents</h3>
              <p className="text-sm text-secondary-400">Dernières inscriptions</p>
            </div>
            <Link to="/membres" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
              Voir tout <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
            {recentMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-secondary-400">
                <FiUsers className="mx-auto mb-2 text-2xl text-secondary-300" />
                Aucun membre enregistré
              </div>
            ) : recentMembers.map((membre, idx) => {
              const fullName = [membre.prenom, membre.nom].filter(Boolean).join(' ').trim() || 'Membre'
              const status = membre.statut?.libelle || 'Actif'
              const isActive = status.toLowerCase() === 'actif'
              return (
                <motion.div
                  key={membre.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: '#F8FAFC' }}
                  className="flex items-center justify-between rounded-2xl px-3 py-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-secondary-900 truncate">{fullName}</p>
                      <p className="text-xs text-secondary-400 truncate">{membre.telephone || membre.email || 'Profil'}</p>
                    </div>
                  </div>
                  <Badge variant={isActive ? 'success' : 'default'} size="sm">
                    {status}
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </AnimatedCard>

        {/* Événements */}
        <AnimatedCard className="h-full rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Événements</h3>
              <p className="text-sm text-secondary-400">Prochains rendez-vous</p>
            </div>
            <Link to="/evenements" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
              Voir tout <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-secondary-400">
                <FiCalendar className="mx-auto mb-2 text-2xl text-secondary-300" />
                Aucun événement prévu
              </div>
            ) : upcomingEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-secondary-900 truncate">
                      {event.titre || event.nom || 'Événement'}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-secondary-400 truncate">
                      <FiMapPin size={12} className="flex-shrink-0" />
                      {event.lieu || 'Lieu à définir'}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">À venir</Badge>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-secondary-400">
                  <FiClock size={12} />
                  {formatDate(event.date || event.date_evenement || event.debut)}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        {/* Activités récentes */}
        <AnimatedCard className="h-full rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Activités</h3>
              <p className="text-sm text-secondary-400">Dernières actions</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <FiBell size={18} />
            </div>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-secondary-400">
                <FiActivity className="mx-auto mb-2 text-2xl text-secondary-300" />
                Aucune activité récente
              </div>
            ) : recentActivities.map((activity, idx) => {
              const Icon = activity.icon
              const toneClasses = {
                primary: 'bg-indigo-50 text-indigo-600',
                success: 'bg-emerald-50 text-emerald-600',
                warning: 'bg-amber-50 text-amber-600',
                info: 'bg-blue-50 text-blue-600',
              }
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex gap-3 rounded-2xl bg-gray-50 p-3 transition-all hover:bg-gray-100"
                >
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${toneClasses[activity.tone] || toneClasses.primary}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-secondary-900 truncate">{activity.title}</p>
                    <p className="text-xs text-secondary-500 truncate">{activity.description}</p>
                    <p className="mt-1 text-[10px] text-secondary-400">{activity.time}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatedCard>
      </motion.div>

      {/* === SECTION D'ACTIVITÉ HEBDOMADAIRE === */}
      <motion.div variants={itemVariants}>
        <AnimatedCard className="rounded-3xl bg-white p-6 shadow-card border border-gray-100/80">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Activité Hebdomadaire</h3>
              <p className="text-sm text-secondary-400">Répartition des interactions</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Cette semaine</Badge>
              <Badge variant="outline" size="sm">Comparer</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#weeklyGradient)"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                  />
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2 bg-indigo-50/50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Total</span>
                <span className="text-2xl font-bold text-secondary-900">
                  {weeklyActivity.reduce((acc, d) => acc + d.value, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Moyenne</span>
                <span className="text-lg font-semibold text-secondary-900">
                  {Math.round(weeklyActivity.reduce((acc, d) => acc + d.value, 0) / weeklyActivity.length)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Pic</span>
                <span className="text-lg font-semibold text-emerald-600">
                  {Math.max(...weeklyActivity.map(d => d.value))}
                </span>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  )
}
