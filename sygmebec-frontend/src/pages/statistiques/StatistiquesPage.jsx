import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi'
import { useMembreStatistiques } from '../../hooks/useMembres'
import useT from '../../i18n/useT'
import './statistiquesPage.css'

const COLORS = ['#28396b', '#4c7a5e', '#c6a15b', '#a9536a', '#5b7298', '#8b6f43', '#7565a9', '#2d8a99']

const number = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const SOURCE_NOT_SPECIFIED = 'Non renseigné'

const formatNumber = (value, locale) => new Intl.NumberFormat(locale).format(number(value))

const formatPercentage = (value, locale) => new Intl.NumberFormat(locale, {
  style: 'percent',
  maximumFractionDigits: 1,
}).format(number(value) / 100)

const cleanLabel = (value, fallback = SOURCE_NOT_SPECIFIED) => {
  const label = String(value ?? '').trim()
  return label || fallback
}

const normaliseLabel = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('fr-FR')
  .replace(/\s+/g, ' ')
  .trim()

const SHARED_LABEL_KEYS = {
  'non renseigne': 'notSpecified',
  'non renseignee': 'notSpecified',
  'pa endike': 'notSpecified',
  'not specified': 'notSpecified',
}

const DISTRIBUTION_LABEL_KEYS = {
  ages: {
    'moins de 18 ans': 'under18',
    '18 a 25 ans': 'age18To25',
    '26 a 35 ans': 'age26To35',
    '36 a 50 ans': 'age36To50',
    '51 a 65 ans': 'age51To65',
    '66 ans et plus': 'age66AndOver',
  },
  sexes: {
    male: 'male', m: 'male', masculin: 'male', homme: 'male', hommes: 'male',
    femelle: 'female', f: 'female', feminin: 'female', feminine: 'female', femme: 'female', femmes: 'female',
  },
  education: {
    primaire: 'primary', secondaire: 'secondary', universitaire: 'university', professionnel: 'vocational', autre: 'other',
  },
  maritalStatuses: {
    celibataire: 'single', marie: 'married', 'marie(e)': 'married', separe: 'separated', 'separe(e)': 'separated', divorce: 'divorced', 'divorce(e)': 'divorced', veuf: 'widowed', 'veuf(ve)': 'widowed',
  },
  categories: {
    actif: 'active', active: 'active', decede: 'deceased', deceased: 'deceased', enactif: 'inactive', inactif: 'inactive', inactive: 'inactive', 'nouveau converti': 'newConvert', 'nouveaux convertis': 'newConvert', 'new convert': 'newConvert', transfere: 'transferred', transferred: 'transferred', 'sans categorie': 'noCategory', 'pa gen kategori': 'noCategory', 'no category': 'noCategory',
  },
  functions: {
    'aucune fonction': 'noFunction', 'pa gen fonksyon': 'noFunction', 'no role assigned': 'noFunction',
  },
}

const labelKeyFor = (value, distribution) => {
  const label = normaliseLabel(value)
  return DISTRIBUTION_LABEL_KEYS[distribution]?.[label] || SHARED_LABEL_KEYS[label]
}

const genderKeyFor = (value) => labelKeyFor(value, 'sexes')

const localiseDistributionLabel = (value, distribution, t) => {
  const sourceLabel = cleanLabel(value)
  const key = labelKeyFor(sourceLabel, distribution)
  return key ? t(`statistics.labels.${key}`) : sourceLabel
}

const isNotSpecified = (value) => labelKeyFor(value) === 'notSpecified'

const normaliseRows = (source, total, { distribution, t } = {}) => {
  const entries = Array.isArray(source)
    ? source
    : (source && typeof source === 'object' ? Object.entries(source).map(([label, count]) => ({ label, count })) : [])

  return entries.map((entry, index) => {
    const sourceLabel = cleanLabel(entry?.label ?? entry?.name ?? entry?.libelle ?? entry?.nom)
    const label = t ? localiseDistributionLabel(sourceLabel, distribution, t) : sourceLabel
    const count = number(entry?.count ?? entry?.value ?? entry?.total)
    const suppliedPercentage = entry?.percentage ?? entry?.pourcentage
    const percentage = suppliedPercentage === undefined || suppliedPercentage === null
      ? (total ? (count / total) * 100 : 0)
      : number(suppliedPercentage)

    return {
      id: sourceLabel + '-' + index,
      sourceLabel,
      label,
      count,
      percentage,
      color: COLORS[index % COLORS.length],
    }
  })
}

const qualityFor = (dataQuality, names, total) => {
  const source = names.map((name) => dataQuality?.[name]).find(Boolean)
  if (!source) return null

  const filled = number(source.filled ?? source.renseigne ?? source.count)
  const denominator = number(source.total) || total
  const percentage = source.percentage ?? source.pourcentage ?? (denominator ? (filled / denominator) * 100 : 0)
  return { filled, total: denominator, percentage: number(percentage) }
}

const includeUnspecified = (rows, total, quality, { distribution, t }) => {
  if (!total || rows.some((row) => isNotSpecified(row.sourceLabel))) return rows

  const filled = quality ? quality.filled : rows.reduce((sum, row) => sum + row.count, 0)
  const missing = Math.max(0, total - filled)
  if (!missing) return rows

  return [...rows, {
    id: 'non-renseigne',
    sourceLabel: SOURCE_NOT_SPECIFIED,
    label: localiseDistributionLabel(SOURCE_NOT_SPECIFIED, distribution, t),
    count: missing,
    percentage: total ? (missing / total) * 100 : 0,
    color: COLORS[rows.length % COLORS.length],
  }]
}

function TooltipContent({ active, payload, t, locale }) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null

  return (
    <div className="member-stats-tooltip">
      <strong>{item.label}</strong>
      <span>{formatNumber(item.count, locale)} {t(item.count === 1 ? 'statistics.member' : 'statistics.members')}</span>
      <small>{t('statistics.shareOfMembership', { percentage: formatPercentage(item.percentage, locale) })}</small>
    </div>
  )
}

function QualityNote({ quality, label, t, locale }) {
  if (!quality) return null

  return (
    <p className="member-stats-quality">
      <FiCheckCircle />
      <span>
        {label || t('statistics.dataCompleteness')} : <b>{formatPercentage(quality.percentage, locale)}</b>
        {quality.total ? ` (${t('statistics.profilesCompleted', { filled: formatNumber(quality.filled, locale), total: formatNumber(quality.total, locale) })})` : ''}
      </span>
    </p>
  )
}

function EmptyDistribution({ t }) {
  return (
    <div className="member-stats-empty-distribution">
      <FiBarChart2 />
      <p>{t('statistics.emptyDistribution')}</p>
    </div>
  )
}

function DistributionTable({ title, rows, quality, qualityLabel, t, locale }) {
  return (
    <div className="member-stats-table-wrap">
      <table className="member-stats-table">
        <thead>
          <tr>
            <th scope="col">{title}</th>
            <th scope="col">{t('statistics.count')}</th>
            <th scope="col">{t('statistics.percentage')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><span className="member-stats-dot" style={{ backgroundColor: row.color }} />{row.label}</td>
              <td>{formatNumber(row.count, locale)}</td>
              <td><b>{formatPercentage(row.percentage, locale)}</b></td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan="3" className="member-stats-table-empty">{t('statistics.noData')}</td>
            </tr>
          )}
        </tbody>
      </table>
      <QualityNote quality={quality} label={qualityLabel} t={t} locale={locale} />
    </div>
  )
}

function CardHeader({ eyebrow, title, description, quality, qualityLabel, t, locale }) {
  return (
    <header className="member-stats-card-head">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {quality && <QualityNote quality={quality} label={qualityLabel} t={t} locale={locale} />}
    </header>
  )
}

function HorizontalDistribution({ title, eyebrow, description, rows, quality, qualityLabel, icon: Icon, t, locale }) {
  const chartHeight = Math.max(220, rows.length * 42)

  return (
    <article className="member-stats-card member-stats-card-wide">
      <CardHeader eyebrow={eyebrow} title={title} description={description} quality={quality} qualityLabel={qualityLabel} t={t} locale={locale} />
      {rows.length ? (
        <div className="member-stats-chart" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 6, right: 46, left: 5, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#ebe8df" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={136} axisLine={false} tickLine={false} tick={{ fill: '#596174', fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(40, 57, 107, .05)' }} content={<TooltipContent t={t} locale={locale} />} />
              <Bar dataKey="count" radius={[0, 7, 7, 0]} fill="#28396b" maxBarSize={24}>
                {rows.map((row) => <Cell key={row.id} fill={row.color} />)}
                <LabelList dataKey="percentage" position="right" formatter={(value) => formatPercentage(value, locale)} fill="#596174" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyDistribution t={t} />
      )}
      <DistributionTable title={Icon ? <><Icon /> {title}</> : title} rows={rows} quality={null} t={t} locale={locale} />
    </article>
  )
}

function SexDistribution({ rows, t, locale }) {
  const chartRows = rows.length ? rows : []

  return (
    <article className="member-stats-card">
      <CardHeader
        eyebrow={t('statistics.demographic')}
        title={t('statistics.sexDistribution')}
        description={t('statistics.sexDescription')}
        t={t}
        locale={locale}
      />
      {chartRows.length ? (
        <div className="member-stats-sex-layout">
          <div className="member-stats-pie-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartRows} dataKey="count" nameKey="label" innerRadius={58} outerRadius={85} paddingAngle={3} stroke="none">
                  {chartRows.map((row) => <Cell key={row.id} fill={row.color} />)}
                </Pie>
                <Tooltip content={<TooltipContent t={t} locale={locale} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="member-stats-pie-center">
              <b>{formatNumber(chartRows.reduce((sum, row) => sum + row.count, 0), locale)}</b>
              <span>{t('statistics.members').toLocaleUpperCase(locale)}</span>
            </div>
          </div>
          <DistributionTable title={t('statistics.sex')} rows={chartRows} t={t} locale={locale} />
        </div>
      ) : (
        <EmptyDistribution t={t} />
      )}
    </article>
  )
}

function CompactDistribution({ title, eyebrow, description, rows, quality, qualityLabel, icon: Icon, t, locale }) {
  return (
    <article className="member-stats-card">
      <CardHeader eyebrow={eyebrow} title={title} description={description} quality={quality} qualityLabel={qualityLabel} t={t} locale={locale} />
      {rows.length ? (
        <div className="member-stats-compact-bars">
          {rows.map((row) => (
            <div className="member-stats-compact-row" key={row.id}>
              <div>
                <span>{row.label}</span>
                <b>{formatNumber(row.count, locale)} <small>· {formatPercentage(row.percentage, locale)}</small></b>
              </div>
              <i><em style={{ width: Math.min(100, Math.max(0, row.percentage)) + '%', backgroundColor: row.color }} /></i>
            </div>
          ))}
        </div>
      ) : (
        <EmptyDistribution t={t} />
      )}
      <DistributionTable title={Icon ? <><Icon /> {title}</> : title} rows={rows} quality={null} t={t} locale={locale} />
    </article>
  )
}

function Metric({ icon: Icon, label, value, note, tone = 'navy' }) {
  return (
    <article className={'member-stats-metric ' + tone}>
      <span><Icon /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </article>
  )
}

function LoadingState({ t }) {
  return (
    <div className="member-stats-loading" role="status" aria-live="polite">
      <i /><i /><i />
      <span>{t('statistics.loading')}</span>
    </div>
  )
}

function ErrorState({ onRetry, t }) {
  return (
    <div className="member-stats-error" role="alert">
      <FiAlertCircle />
      <div>
        <h2>{t('status.statisticsUnavailable')}</h2>
        <p>{t('status.retryConnection')}</p>
      </div>
      <button type="button" onClick={onRetry}><FiRefreshCw /> {t('statistics.retry')}</button>
    </div>
  )
}

export default function StatistiquesPage() {
  const { t, locale } = useT()
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useMembreStatistiques()

  const view = useMemo(() => {
    const total = number(data?.total)
    const repartition = data?.repartition || {}
    const dataQuality = data?.data_quality || {}
    const zonesQuality = qualityFor(dataQuality, ['zones', 'zone_habitation', 'adresse'], total)
    const professionsQuality = qualityFor(dataQuality, ['professions', 'profession'], total)
    const educationQuality = qualityFor(dataQuality, ['education', 'niveau_etude', 'niveau_etudes'], total)
    const maritalStatusesQuality = qualityFor(dataQuality, ['marital_statuses', 'etat_matrimonial'], total)
    const ages = normaliseRows(repartition.ages, total, { distribution: 'ages', t })
    const sexes = normaliseRows(repartition.sexes, total, { distribution: 'sexes', t })
    const education = normaliseRows(repartition.education, total, { distribution: 'education', t })
    const zones = includeUnspecified(normaliseRows(repartition.zones, total, { distribution: 'zones', t }), total, zonesQuality, { distribution: 'zones', t })
    const maritalStatuses = normaliseRows(repartition.marital_statuses, total, { distribution: 'maritalStatuses', t })
    const professions = includeUnspecified(normaliseRows(repartition.professions, total, { distribution: 'professions', t }), total, professionsQuality, { distribution: 'professions', t })
    const categories = normaliseRows(repartition.categories, total, { distribution: 'categories', t })
    const functions = normaliseRows(repartition.functions, total, { distribution: 'functions', t })
    const active = number(data?.active)
    const women = sexes.filter((row) => genderKeyFor(row.sourceLabel) === 'female').reduce((sum, row) => sum + row.count, 0)
    const men = sexes.filter((row) => genderKeyFor(row.sourceLabel) === 'male').reduce((sum, row) => sum + row.count, 0)

    return {
      total,
      active,
      ages,
      sexes,
      education,
      zones,
      maritalStatuses,
      professions,
      categories,
      functions,
      women,
      men,
      quality: {
        zones: zonesQuality,
        professions: professionsQuality,
        education: educationQuality,
        maritalStatuses: maritalStatusesQuality,
      },
    }
  }, [data, t])

  const syncedAt = dataUpdatedAt
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(dataUpdatedAt))
    : null

  return (
    <div className="member-statistics" data-no-translate>
      <header className="member-stats-hero">
        <div>
          <p><i /> {t('statistics.demographicAnalysis')}</p>
          <h1>{t('statistics.title')}</h1>
          <span>{t('statistics.description')}</span>
        </div>
        <div className="member-stats-hero-actions">
          {syncedAt && <small><FiClock /> {t('statistics.updatedAt', { time: syncedAt })}</small>}
          <button type="button" onClick={() => refetch()} disabled={isLoading}>
            <FiRefreshCw className={isLoading ? 'is-spinning' : ''} />
            {t('statistics.refresh')}
          </button>
          <Link to="/membres">{t('statistics.viewMembers')}</Link>
        </div>
      </header>

      {isLoading && <LoadingState t={t} />}
      {!isLoading && isError && <ErrorState onRetry={refetch} t={t} />}

      {!isLoading && !isError && (
        <>
          <section className="member-stats-metrics" aria-label={t('statistics.keyIndicators')}>
            <Metric icon={FiUsers} label={t('statistics.totalMembers')} value={formatNumber(view.total, locale)} note={t('statistics.registeredMembers')} />
            <Metric icon={FiActivity} label={t('statistics.activeMembers')} value={formatNumber(view.active, locale)} note={view.total ? t('statistics.shareOfMembership', { percentage: formatPercentage((view.active / view.total) * 100, locale) }) : t('statistics.noMember')} tone="green" />
            <Metric icon={FiUsers} label={t('statistics.men')} value={formatNumber(view.men, locale)} note={formatPercentage(view.total ? (view.men / view.total) * 100 : 0, locale)} tone="blue" />
            <Metric icon={FiUsers} label={t('statistics.women')} value={formatNumber(view.women, locale)} note={formatPercentage(view.total ? (view.women / view.total) * 100 : 0, locale)} tone="burgundy" />
          </section>

          {!view.total && (
            <div className="member-stats-zero">
              <FiUsers />
              <div>
                <h2>{t('statistics.noMembersTitle')}</h2>
                <p>{t('statistics.noMembersDescription')}</p>
              </div>
              <Link to="/membres/nouveau">{t('statistics.addMember')}</Link>
            </div>
          )}

          <section className="member-stats-grid member-stats-demographics">
            <HorizontalDistribution
              eyebrow={t('statistics.demographic')}
              title={t('statistics.ageDistribution')}
              description={t('statistics.ageDescription')}
              rows={view.ages}
              icon={FiBarChart2}
              t={t}
              locale={locale}
            />
            <SexDistribution rows={view.sexes} t={t} locale={locale} />
          </section>

          <section className="member-stats-grid">
            <HorizontalDistribution
              eyebrow={t('statistics.journey')}
              title={t('statistics.educationLevel')}
              description={t('statistics.educationDescription')}
              rows={view.education}
              quality={view.quality.education}
              qualityLabel={t('statistics.educationCompleted')}
              icon={FiCheckCircle}
              t={t}
              locale={locale}
            />
            <CompactDistribution
              eyebrow={t('statistics.status')}
              title={t('statistics.maritalStatus')}
              description={t('statistics.maritalDescription')}
              rows={view.maritalStatuses}
              quality={view.quality.maritalStatuses}
              qualityLabel={t('statistics.maritalCompleted')}
              icon={FiUsers}
              t={t}
              locale={locale}
            />
          </section>

          <section className="member-stats-grid">
            <CompactDistribution
              eyebrow={t('statistics.territory')}
              title={t('statistics.residentialArea')}
              description={t('statistics.residentialAreaDescription')}
              rows={view.zones}
              quality={view.quality.zones}
              qualityLabel={t('statistics.addressesCompleted')}
              icon={FiMapPin}
              t={t}
              locale={locale}
            />
            <CompactDistribution
              eyebrow={t('statistics.professionalLife')}
              title={t('statistics.profession')}
              description={t('statistics.professionDescription')}
              rows={view.professions}
              quality={view.quality.professions}
              qualityLabel={t('statistics.professionsCompleted')}
              icon={FiBriefcase}
              t={t}
              locale={locale}
            />
          </section>

          <section className="member-stats-grid">
            <CompactDistribution
              eyebrow={t('statistics.registry')}
              title={t('statistics.categoryDistribution')}
              description={t('statistics.categoryDescription')}
              rows={view.categories}
              icon={FiUsers}
              t={t}
              locale={locale}
            />
            <CompactDistribution
              eyebrow={t('statistics.service')}
              title={t('statistics.functionDistribution')}
              description={t('statistics.functionDescription')}
              rows={view.functions}
              icon={FiCheckCircle}
              t={t}
              locale={locale}
            />
          </section>
        </>
      )}
    </div>
  )
}
