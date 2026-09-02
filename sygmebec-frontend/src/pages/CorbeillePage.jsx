import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FiCalendar, FiRefreshCw, FiTrash2, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { membresApi } from '../api/membresApi'
import { evenementsApi } from '../api/evenementsApi'
import useT from '../i18n/useT'

const list = (value) => value?.results || value || []

const formatDate = (value, locale, fallback, options) => {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : new Intl.DateTimeFormat(locale, options).format(date)
}

const formatNumber = (value, locale) => new Intl.NumberFormat(locale).format(Number(value) || 0)

export default function CorbeillePage() {
  const { t, locale } = useT()
  const queryClient = useQueryClient()
  const membres = useQuery({ queryKey: ['corbeille', 'membres'], queryFn: () => membresApi.getCorbeille().then((res) => res.data) })
  const evenements = useQuery({ queryKey: ['corbeille', 'evenements'], queryFn: () => evenementsApi.getCorbeille().then((res) => res.data) })
  const refresh = () => { membres.refetch(); evenements.refetch() }
  const restore = useMutation({
    mutationFn: ({ type, id }) => type === 'membre' ? membresApi.restaurer(id) : evenementsApi.restaurer(id),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['corbeille'] })
      queryClient.invalidateQueries({ queryKey: [type === 'membre' ? 'membres' : 'evenements'] })
      if (type === 'membre') queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      toast.success(t('trash.restoreSuccess'))
    },
    onError: () => toast.error(t('trash.restoreError')),
  })
  const memberItems = list(membres.data)
  const eventItems = list(evenements.data)
  const loading = membres.isLoading || evenements.isLoading

  return (
    <div className="mx-auto max-w-6xl space-y-7" data-no-translate>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700"><FiTrash2 />{t('trash.eyebrow')}</div>
          <h1 className="text-3xl font-bold text-secondary-900">{t('trash.title')}</h1>
          <p className="mt-2 text-secondary-500">{t('trash.description')}</p>
        </div>
        <button type="button" onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary-700 shadow-sm hover:bg-gray-50"><FiRefreshCw />{t('trash.refresh')}</button>
      </header>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{t('trash.accessNotice')}</div>
      {loading ? (
        <p className="rounded-2xl bg-white p-8 text-center text-secondary-400 shadow-card">{t('trash.loading')}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <TrashSection
            title={t('trash.membersTitle')}
            icon={FiUser}
            items={memberItems}
            empty={t('trash.emptyMembers')}
            render={(item) => <><b>{`${item.prenom || ''} ${item.nom || ''}`.trim() || t('trash.unnamedMember')}</b><p>{item.email || item.telephone || t('trash.contactNotSpecified')}</p></>}
            onRestore={(id) => restore.mutate({ type: 'membre', id })}
            busy={restore.isPending}
            t={t}
            locale={locale}
          />
          <TrashSection
            title={t('trash.eventsTitle')}
            icon={FiCalendar}
            items={eventItems}
            empty={t('trash.emptyEvents')}
            render={(item) => {
              const date = formatDate(item.date, locale, null, { dateStyle: 'medium' })
              return <><b>{item.titre || t('trash.untitledEvent')}</b><p>{item.lieu || t('trash.locationNotSpecified')}{date ? ` · ${date}` : ''}</p></>
            }}
            onRestore={(id) => restore.mutate({ type: 'evenement', id })}
            busy={restore.isPending}
            t={t}
            locale={locale}
          />
        </div>
      )}
    </div>
  )
}

function TrashSection({ title, icon: Icon, items, empty, render, onRestore, busy, t, locale }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-bold text-secondary-900"><Icon className="text-amber-600" />{title}</h2>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{formatNumber(items.length, locale)}</span>
      </header>
      {items.length ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1 text-sm text-secondary-500">
                {render(item)}
                <small className="mt-1 block">
                  {t('trash.deletedAt', { date: formatDate(item.deleted_at, locale, t('trash.unknownDate'), { dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' }) })}
                  {item.deleted_by_nom ? ` ${t('trash.deletedBy', { name: item.deleted_by_nom })}` : ''}
                </small>
              </div>
              <button type="button" disabled={busy} onClick={() => onRestore(item.id)} className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{t('trash.restore')}</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-secondary-400">{empty}</p>
      )}
    </section>
  )
}
