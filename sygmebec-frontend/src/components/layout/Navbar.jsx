import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiBell, FiCalendar, FiChevronDown, FiFileText, FiHome, FiLogOut,
  FiMoon, FiSearch, FiSettings, FiSun, FiUser, FiUsers,
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../hooks/useAuth'
import { useMembres } from '../../hooks/useMembres'
import { useEvenements } from '../../hooks/useEvenements'
import { getRoleLabel } from '../../utils/roleHierarchy'
import { useUIStore } from '../../store/uiStore'
import { useFiltersStore } from '../../store/filtersStore'
import { useNotificationStore } from '../../store/notificationStore'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import LanguageSelect from '../ui/LanguageSelect'
import useT from '../../i18n/useT'

const formatNotificationDate = (date, locale, fallback) => {
  if (!date) return fallback
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return fallback
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
}

export default function Navbar() {
  const { user, role } = useAuthStore()
  const setMemberSearch = useFiltersStore((state) => state.setSearch)
  const { mutate: logout } = useLogout()
  const { sidebarOpen, toggleTheme, theme, language, setLanguage } = useUIStore()
  const { t, locale } = useT()
  const { data: membresData } = useMembres({ page_size: 5 })
  const { data: evenementsData } = useEvenements({ page_size: 5 })
  const liveNotifications = useNotificationStore((state) => state.notifications)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const storageKey = `sygmebec-read-notifications-${user?.id || user?.identifiant || 'guest'}`
  const [readIds, setReadIds] = useState([])
  const sidebarWidth = sidebarOpen ? 288 : 80

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    try {
      setReadIds(JSON.parse(localStorage.getItem(storageKey) || '[]'))
    } catch {
      setReadIds([])
    }
  }, [storageKey])

  const notifications = useMemo(() => {
    const members = Array.isArray(membresData?.results) ? membresData.results : (Array.isArray(membresData) ? membresData : [])
    const events = Array.isArray(evenementsData?.results) ? evenementsData.results : (Array.isArray(evenementsData) ? evenementsData : [])
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const memberItems = members
      .slice()
      .sort((a, b) => new Date(b.date_adhesion || 0) - new Date(a.date_adhesion || 0))
      .slice(0, 3)
      .map((member) => ({
        id: `member-${member.id}`,
        title: t('notifications.newMember'),
        text: `${member.prenom || ''} ${member.nom || ''}`.trim() || t('notifications.memberAdded'),
        date: member.date_adhesion,
        icon: FiUsers,
        color: 'indigo',
        path: `/membres/${member.id}`,
      }))

    const eventItems = events
      .filter((event) => {
        const date = new Date(event.date || event.date_evenement || event.debut)
        return !Number.isNaN(date.getTime()) && date >= today
      })
      .sort((a, b) => new Date(a.date || a.date_evenement || a.debut) - new Date(b.date || b.date_evenement || b.debut))
      .slice(0, 3)
      .map((event) => ({
        id: `event-${event.id}`,
        title: t('notifications.upcomingEvent'),
        text: event.titre || t('notifications.scheduledEvent'),
        date: event.date || event.date_evenement || event.debut,
        icon: FiCalendar,
        color: 'purple',
        path: `/evenements/${event.id}`,
      }))

    const activityItems = liveNotifications.map((item) => {
      const isMember = item.contentType === 'Membre'
      const isEvent = item.contentType === 'Evenement'
      return {
        ...item,
        icon: isMember ? FiUsers : isEvent ? FiCalendar : FiBell,
        color: isEvent ? 'purple' : 'indigo',
        path: isMember ? `/membres/${item.objectId}` : isEvent ? `/evenements/${item.objectId}` : '/',
      }
    })
    return [...activityItems, ...memberItems, ...eventItems].slice(0, 12)
  }, [membresData, evenementsData, liveNotifications, t])

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !readIds.includes(notification.id)),
    [notifications, readIds],
  )
  const unreadCount = unreadNotifications.length
  const persistReadIds = (ids) => {
    localStorage.setItem(storageKey, JSON.stringify(ids))
    setReadIds(ids)
  }
  const markRead = (id) => {
    if (!readIds.includes(id)) persistReadIds([...readIds, id])
  }
  const markAllRead = () => persistReadIds([...new Set([...readIds, ...unreadNotifications.map((notification) => notification.id)])])
  const handleSearch = (event) => {
    event.preventDefault()
    if (!searchQuery.trim()) return
    const term = searchQuery.trim()
    setMemberSearch(term)
    navigate(`/membres?search=${encodeURIComponent(term)}`)
    setSearchQuery('')
  }

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        marginLeft: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
      className={`dashboard-topbar sticky top-0 z-30 flex h-20 items-center px-4 lg:px-6 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-lg backdrop-blur-xl' : 'bg-white/80 backdrop-blur-md'} border-b border-gray-200/60`}
    >
      <div className="flex w-full items-center gap-3">
        <form onSubmit={handleSearch} className="relative ml-1 hidden max-w-md flex-1 md:block">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder={t('common.searchMember')} />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSelect value={language} onChange={setLanguage} className="hidden sm:block" />
          <button type="button" onClick={toggleTheme} aria-label={t('common.theme')} className="rounded-xl p-2.5 text-secondary-500 transition hover:bg-gray-100 hover:text-indigo-600">
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <Dropdown
            align="right"
            className="w-80 overflow-hidden"
            trigger={
              <button type="button" aria-label={t('notifications.title')} className="relative rounded-xl p-2.5 text-secondary-500 transition hover:bg-gray-100 hover:text-indigo-600">
                <FiBell size={20} />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
              </button>
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-secondary-900">{t('notifications.title')}</p>
                <p className="text-xs text-secondary-400">{t('notifications.unread', { count: unreadCount })}</p>
              </div>
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">{t('notifications.markAllRead')}</button>
            </div>
            {unreadNotifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-secondary-400">{t('notifications.empty')}</p>
            ) : unreadNotifications.map((item) => {
              const Icon = item.icon
              const colors = item.color === 'purple' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'
              return (
                <button key={item.id} type="button" onClick={() => { markRead(item.id); navigate(item.path) }} className="flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50">
                  <span className={`mt-0.5 rounded-xl p-2 ${colors}`}><Icon size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-secondary-900">{item.title}</span>
                    <span className="block truncate text-xs text-secondary-500">{item.text}</span>
                    <span className="mt-1 block text-[10px] text-secondary-400">{formatNotificationDate(item.date, locale, t('common.recent'))}</span>
                  </span>
                  <span className="mt-2 h-2 w-2 rounded-full bg-indigo-500" />
                </button>
              )
            })}
          </Dropdown>

          <Dropdown
            align="right"
            className="w-64"
            trigger={
              <button type="button" className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-gray-100">
                <Avatar name={user?.membre?.nom_complet || user?.membre?.nom || user?.identifiant} src={user?.membre?.photo} size="md" />
                <span className="hidden text-left lg:block">
                  <span className="block max-w-32 truncate text-sm font-semibold text-secondary-900">{user?.membre?.nom_complet || user?.membre?.nom || user?.identifiant}</span>
                  <span className="block text-xs text-secondary-400">{getRoleLabel(role)}</span>
                </span>
                <FiChevronDown className="text-secondary-400" size={16} />
              </button>
            }
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <Avatar name={user?.membre?.nom_complet || user?.membre?.nom || user?.identifiant} src={user?.membre?.photo} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-secondary-900">{user?.membre?.nom_complet || user?.membre?.nom || user?.identifiant}</p>
                <p className="truncate text-xs text-secondary-400">{user?.identifiant}</p>
                <Badge variant="primary" size="sm">{getRoleLabel(role)}</Badge>
              </div>
            </div>
            <DropdownItem onClick={() => navigate('/profile')} icon={FiUser}>{t('navigation.profile')}</DropdownItem>
            <DropdownItem onClick={() => navigate('/settings')} icon={FiSettings}>{t('navigation.settings')}</DropdownItem>
            <DropdownItem onClick={() => navigate('/')} icon={FiHome}>{t('navigation.dashboard')}</DropdownItem>
            <div className="mt-1 border-t border-gray-100 pt-1"><DropdownItem onClick={() => logout()} icon={FiLogOut} danger>{t('navigation.logout')}</DropdownItem></div>
          </Dropdown>
        </div>
      </div>
    </motion.header>
  )
}
