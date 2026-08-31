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
import './statistiquesPage.css'

const COLORS = ['#28396b', '#4c7a5e', '#c6a15b', '#a9536a', '#5b7298', '#8b6f43', '#7565a9', '#2d8a99']

const number = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const percent = (value) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(number(value)) + ' %'

const cleanLabel = (value, fallback = 'Non renseigné') => {
  const label = String(value || '').trim()
  return label || fallback
}

const normaliseGender = (label) => {
  const value = cleanLabel(label).toLocaleLowerCase('fr-FR')
  if (value === 'm' || value.includes('homme') || value.includes('masculin')) return 'Hommes'
  if (value === 'f' || value.includes('femme') || value.includes('féminin') || value.includes('feminin')) return 'Femmes'
  return cleanLabel(label)
}

const normaliseRows = (source, total, labelTransform) => {
  const entries = Array.isArray(source)
    ? source
    : (source && typeof source === 'object' ? Object.entries(source).map(([label, count]) => ({ label, count })) : [])

  return entries.map((entry, index) => {
    const label = labelTransform
      ? labelTransform(entry?.label ?? entry?.name ?? entry?.libelle ?? entry?.nom)
      : cleanLabel(entry?.label ?? entry?.name ?? entry?.libelle ?? entry?.nom)
    const count = number(entry?.count ?? entry?.value ?? entry?.total)
    const suppliedPercentage = entry?.percentage ?? entry?.pourcentage
    const percentage = suppliedPercentage === undefined || suppliedPercentage === null
      ? (total ? (count / total) * 100 : 0)
      : number(suppliedPercentage)

    return {
      id: label + '-' + index,
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

const includeUnspecified = (rows, total, quality) => {
  if (!total || rows.some((row) => row.label.toLocaleLowerCase('fr-FR') === 'non renseigné')) return rows

  const filled = quality ? quality.filled : rows.reduce((sum, row) => sum + row.count, 0)
  const missing = Math.max(0, total - filled)
  if (!missing) return rows

  return [...rows, {
    id: 'non-renseigne',
    label: 'Non renseigné',
    count: missing,
    percentage: total ? (missing / total) * 100 : 0,
    color: COLORS[rows.length % COLORS.length],
  }]
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null

  return (
    <div className="member-stats-tooltip">
      <strong>{item.label}</strong>
      <span>{item.count} membre{item.count > 1 ? 's' : ''}</span>
      <small>{percent(item.percentage)} de l'effectif</small>
    </div>
  )
}

function QualityNote({ quality, label }) {
  if (!quality) return null

  return (
    <p className="member-stats-quality">
      <FiCheckCircle />
      <span>
        {label || 'Complétude'} : <b>{percent(quality.percentage)}</b>
        {quality.total ? ' (' + quality.filled + '/' + quality.total + ' profils renseignés)' : ''}
      </span>
    </p>
  )
}

function EmptyDistribution({ label }) {
  return (
    <div className="member-stats-empty-distribution">
      <FiBarChart2 />
      <p>Aucune donnée de {label.toLocaleLowerCase('fr-FR')} n'est encore disponible.</p>
    </div>
  )
}

function DistributionTable({ title, rows, quality, qualityLabel }) {
  return (
    <div className="member-stats-table-wrap">
      <table className="member-stats-table">
        <thead>
          <tr>
            <th scope="col">{title}</th>
            <th scope="col">Effectif</th>
            <th scope="col">Pourcentage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><span className="member-stats-dot" style={{ backgroundColor: row.color }} />{row.label}</td>
              <td>{row.count}</td>
              <td><b>{percent(row.percentage)}</b></td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan="3" className="member-stats-table-empty">Aucune donnée disponible.</td>
            </tr>
          )}
        </tbody>
      </table>
      <QualityNote quality={quality} label={qualityLabel} />
    </div>
  )
}

function CardHeader({ eyebrow, title, description, quality, qualityLabel }) {
  return (
    <header className="member-stats-card-head">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {quality && <QualityNote quality={quality} label={qualityLabel} />}
    </header>
  )
}

function HorizontalDistribution({ title, eyebrow, description, rows, quality, qualityLabel, icon: Icon }) {
  const chartHeight = Math.max(220, rows.length * 42)

  return (
    <article className="member-stats-card member-stats-card-wide">
      <CardHeader eyebrow={eyebrow} title={title} description={description} quality={quality} qualityLabel={qualityLabel} />
      {rows.length ? (
        <div className="member-stats-chart" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 6, right: 46, left: 5, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#ebe8df" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={116} axisLine={false} tickLine={false} tick={{ fill: '#596174', fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(40, 57, 107, .05)' }} content={<TooltipContent />} />
              <Bar dataKey="count" radius={[0, 7, 7, 0]} fill="#28396b" maxBarSize={24}>
                {rows.map((row) => <Cell key={row.id} fill={row.color} />)}
                <LabelList dataKey="percentage" position="right" formatter={(value) => percent(value)} fill="#596174" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyDistribution label={title} />
      )}
      <DistributionTable title={Icon ? <><Icon /> {title}</> : title} rows={rows} quality={null} />
    </article>
  )
}

function SexDistribution({ rows }) {
  const chartRows = rows.length ? rows : []

  return (
    <article className="member-stats-card">
      <CardHeader
        eyebrow="Démographie"
        title="Répartition par sexe"
        description="Hommes, femmes et autres valeurs enregistrées."
      />
      {chartRows.length ? (
        <div className="member-stats-sex-layout">
          <div className="member-stats-pie-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartRows} dataKey="count" nameKey="label" innerRadius={58} outerRadius={85} paddingAngle={3} stroke="none">
                  {chartRows.map((row) => <Cell key={row.id} fill={row.color} />)}
                </Pie>
                <Tooltip content={<TooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="member-stats-pie-center">
              <b>{chartRows.reduce((sum, row) => sum + row.count, 0)}</b>
              <span>MEMBRES</span>
            </div>
          </div>
          <DistributionTable title="Sexe" rows={chartRows} />
        </div>
      ) : (
        <EmptyDistribution label="répartition par sexe" />
      )}
    </article>
  )
}

function CompactDistribution({ title, eyebrow, description, rows, quality, qualityLabel, icon: Icon }) {
  return (
    <article className="member-stats-card">
      <CardHeader eyebrow={eyebrow} title={title} description={description} quality={quality} qualityLabel={qualityLabel} />
      {rows.length ? (
        <div className="member-stats-compact-bars">
          {rows.map((row) => (
            <div className="member-stats-compact-row" key={row.id}>
              <div>
                <span>{row.label}</span>
                <b>{row.count} <small>· {percent(row.percentage)}</small></b>
              </div>
              <i><em style={{ width: Math.min(100, Math.max(0, row.percentage)) + '%', backgroundColor: row.color }} /></i>
            </div>
          ))}
        </div>
      ) : (
        <EmptyDistribution label={title} />
      )}
      <DistributionTable title={Icon ? <><Icon /> {title}</> : title} rows={rows} quality={null} />
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

function LoadingState() {
  return (
    <div className="member-stats-loading" role="status" aria-live="polite">
      <i /><i /><i />
      <span>Chargement des statistiques membres…</span>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="member-stats-error" role="alert">
      <FiAlertCircle />
      <div>
        <h2>Les statistiques ne sont pas disponibles pour le moment.</h2>
        <p>Vérifiez la connexion au serveur puis réessayez.</p>
      </div>
      <button type="button" onClick={onRetry}><FiRefreshCw /> Réessayer</button>
    </div>
  )
}

export default function StatistiquesPage() {
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useMembreStatistiques()

  const view = useMemo(() => {
    const total = number(data?.total)
    const repartition = data?.repartition || {}
    const dataQuality = data?.data_quality || {}
    const zonesQuality = qualityFor(dataQuality, ['zones', 'zone_habitation', 'adresse'], total)
    const professionsQuality = qualityFor(dataQuality, ['professions', 'profession'], total)
    const educationQuality = qualityFor(dataQuality, ['education', 'niveau_etude', 'niveau_etudes'], total)
    const maritalStatusesQuality = qualityFor(dataQuality, ['marital_statuses', 'etat_matrimonial'], total)
    const ages = normaliseRows(repartition.ages, total)
    const sexes = normaliseRows(repartition.sexes, total, normaliseGender)
    const education = normaliseRows(repartition.education, total)
    const zones = includeUnspecified(normaliseRows(repartition.zones, total), total, zonesQuality)
    const maritalStatuses = normaliseRows(repartition.marital_statuses, total)
    const professions = includeUnspecified(normaliseRows(repartition.professions, total), total, professionsQuality)
    const categories = normaliseRows(repartition.categories, total)
    const functions = normaliseRows(repartition.functions, total)
    const active = number(data?.active)
    const women = sexes.filter((row) => row.label === 'Femmes').reduce((sum, row) => sum + row.count, 0)
    const men = sexes.filter((row) => row.label === 'Hommes').reduce((sum, row) => sum + row.count, 0)

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
  }, [data])

  const syncedAt = dataUpdatedAt
    ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(dataUpdatedAt))
    : null

  return (
    <div className="member-statistics">
      <header className="member-stats-hero">
        <div>
          <p><i /> Analyse démographique</p>
          <h1>Statistiques des membres</h1>
          <span>Une lecture complète de l'effectif, des profils et de la répartition de la communauté.</span>
        </div>
        <div className="member-stats-hero-actions">
          {syncedAt && <small><FiClock /> Mise à jour à {syncedAt}</small>}
          <button type="button" onClick={() => refetch()} disabled={isLoading}>
            <FiRefreshCw className={isLoading ? 'is-spinning' : ''} />
            Actualiser
          </button>
          <Link to="/membres">Voir les membres</Link>
        </div>
      </header>

      {isLoading && <LoadingState />}
      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          <section className="member-stats-metrics" aria-label="Indicateurs clés">
            <Metric icon={FiUsers} label="Effectif total" value={view.total} note="membres au registre" />
            <Metric icon={FiActivity} label="Membres actifs" value={view.active} note={view.total ? percent((view.active / view.total) * 100) + ' de l’effectif' : 'Aucun membre'} tone="green" />
            <Metric icon={FiUsers} label="Hommes" value={view.men} note={view.total ? percent((view.men / view.total) * 100) : '0 %'} tone="blue" />
            <Metric icon={FiUsers} label="Femmes" value={view.women} note={view.total ? percent((view.women / view.total) * 100) : '0 %'} tone="burgundy" />
          </section>

          {!view.total && (
            <div className="member-stats-zero">
              <FiUsers />
              <div>
                <h2>Aucun membre enregistré pour l'instant</h2>
                <p>Les répartitions apparaîtront automatiquement dès l'ajout du premier profil.</p>
              </div>
              <Link to="/membres/nouveau">Ajouter un membre</Link>
            </div>
          )}

          <section className="member-stats-grid member-stats-demographics">
            <HorizontalDistribution
              eyebrow="Démographie"
              title="Répartition par âge"
              description="Effectif et poids de chaque tranche d'âge."
              rows={view.ages}
              icon={FiBarChart2}
            />
            <SexDistribution rows={view.sexes} />
          </section>

          <section className="member-stats-grid">
            <HorizontalDistribution
              eyebrow="Parcours"
              title="Niveau d'étude"
              description="Primaire, secondaire, universitaire, professionnel et autres niveaux renseignés."
              rows={view.education}
              quality={view.quality.education}
              qualityLabel="Niveaux renseignés"
              icon={FiCheckCircle}
            />
            <CompactDistribution
              eyebrow="Statut"
              title="État matrimonial"
              description="Répartition selon la situation matrimoniale disponible."
              rows={view.maritalStatuses}
              quality={view.quality.maritalStatuses}
              qualityLabel="États renseignés"
              icon={FiUsers}
            />
          </section>

          <section className="member-stats-grid">
            <CompactDistribution
              eyebrow="Territoire"
              title="Zone d'habitation"
              description="Chaque zone, son effectif et son pourcentage dans la communauté."
              rows={view.zones}
              quality={view.quality.zones}
              qualityLabel="Adresses renseignées"
              icon={FiMapPin}
            />
            <CompactDistribution
              eyebrow="Vie professionnelle"
              title="Profession"
              description="Professions connues, y compris « Non renseigné » lorsque nécessaire."
              rows={view.professions}
              quality={view.quality.professions}
              qualityLabel="Professions renseignées"
              icon={FiBriefcase}
            />
          </section>

          <section className="member-stats-grid">
            <CompactDistribution
              eyebrow="Registre"
              title="Répartition par catégories"
              description="Catégories correspondant aux statuts des membres."
              rows={view.categories}
              icon={FiUsers}
            />
            <CompactDistribution
              eyebrow="Service"
              title="Fonctions et responsabilités"
              description="Fonctions attribuées aux membres, lorsqu'elles sont disponibles."
              rows={view.functions}
              icon={FiCheckCircle}
            />
          </section>
        </>
      )}
    </div>
  )
}
