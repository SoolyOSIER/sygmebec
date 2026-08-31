import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiClock,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

import { galerieApi } from '../../api/galerieApi'
import { useEvenements } from '../../hooks/useEvenements'
import { getMediaUrl } from '../../utils/media'
import './galerieGestionReference.css'

const EMPTY_FORM = { titre: '', evenement: '', ordre: '', image: null }
const DISTRIBUTION_COLORS = ['#7c50d1', '#c17f18', '#3768d6', '#1fa060', '#c94f43', '#b6903f']

const getEventId = (image) => {
  const evenement = image?.evenement
  if (evenement && typeof evenement === 'object') return evenement.id ?? evenement.pk ?? null
  return evenement === '' || evenement === undefined ? null : evenement
}

const hasEvent = (image) => {
  const eventId = getEventId(image)
  return eventId !== null && eventId !== undefined
}

const imageTitle = (image) => image?.titre?.trim() || 'Image sans titre'

const formatActivityDate = (value) => {
  if (!value) return 'Date non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date non renseignée'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDifference = Math.round((today - day) / 86400000)
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date)

  if (dayDifference === 0) return 'Aujourd’hui, ' + time
  if (dayDifference === 1) return 'Hier, ' + time
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(date)
}

const isAddedThisMonth = (value) => {
  if (!value) return false
  const date = new Date(value)
  const now = new Date()
  return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

const compareRecent = (first, second) => {
  const firstDate = new Date(first.date_ajout || 0).getTime()
  const secondDate = new Date(second.date_ajout || 0).getTime()
  return secondDate - firstDate
}

export default function GalerieGestionPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [form, setForm] = useState(EMPTY_FORM)
  const formRef = useRef(null)
  const titleInputRef = useRef(null)

  const { data: evenementsData } = useEvenements({ page_size: 1000 })
  const evenements = Array.isArray(evenementsData) ? evenementsData : evenementsData?.results || []

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await galerieApi.getAll({ page_size: 100 })
      setImages(Array.isArray(data) ? data : data?.results || [])
    } catch {
      toast.error('Impossible de charger la galerie.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const eventById = useMemo(
    () => new Map(evenements.map((evenement) => [String(evenement.id), evenement])),
    [evenements],
  )

  const eventLabel = useCallback((image) => {
    const relatedEvent = image?.evenement && typeof image.evenement === 'object'
      ? image.evenement
      : eventById.get(String(getEventId(image)))
    return relatedEvent?.titre || image?.evenement_titre || 'Événement associé'
  }, [eventById])

  const orderedImages = useMemo(
    () => [...images].sort((first, second) => {
      const orderDifference = (Number(first.ordre) || 0) - (Number(second.ordre) || 0)
      return orderDifference || compareRecent(first, second)
    }),
    [images],
  )

  const linkedCount = useMemo(() => images.filter(hasEvent).length, [images])
  const withoutEventCount = images.length - linkedCount
  const imagesThisMonth = useMemo(
    () => images.filter((image) => isAddedThisMonth(image.date_ajout)).length,
    [images],
  )
  const maxOrder = useMemo(
    () => images.reduce((maximum, image) => Math.max(maximum, Number(image.ordre) || 0), 0),
    [images],
  )

  const distribution = useMemo(() => {
    const groups = new Map()
    images.forEach((image) => {
      const eventId = getEventId(image)
      const key = hasEvent(image) ? 'event-' + String(eventId) : 'without-event'
      const label = hasEvent(image) ? eventLabel(image) : 'Sans événement associé'
      const previous = groups.get(key) || { key, label, count: 0 }
      groups.set(key, { ...previous, count: previous.count + 1 })
    })
    if (!groups.size) {
      groups.set('without-event', { key: 'without-event', label: 'Sans événement associé', count: 0 })
    }
    return [...groups.values()]
      .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label, 'fr'))
      .map((group, index) => ({ ...group, color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length] }))
  }, [eventLabel, images])

  const donutBackground = useMemo(() => {
    if (!images.length) return '#f0ece0'
    let progress = 0
    const stops = distribution.map((group) => {
      const start = progress
      progress += (group.count / images.length) * 100
      return group.color + ' ' + start + '% ' + progress + '%'
    })
    return 'conic-gradient(' + stops.join(', ') + ')'
  }, [distribution, images.length])

  const filteredImages = useMemo(() => orderedImages.filter((image) => {
    if (activeFilter === 'linked') return hasEvent(image)
    if (activeFilter === 'unlinked') return !hasEvent(image)
    return true
  }), [activeFilter, orderedImages])

  const filterOptions = [
    { key: 'all', label: 'Toutes', count: images.length },
    { key: 'linked', label: 'Avec événement', count: linkedCount },
    { key: 'unlinked', label: 'Sans événement', count: withoutEventCount },
  ]

  const upload = async (event) => {
    event.preventDefault()
    if (!form.image) {
      toast.error('Choisissez une image à publier.')
      return
    }

    const payload = new FormData()
    payload.append('image', form.image)
    if (form.titre.trim()) payload.append('titre', form.titre.trim())
    if (form.evenement) payload.append('evenement', form.evenement)
    if (form.ordre !== '') payload.append('ordre', form.ordre)

    setSending(true)
    try {
      await galerieApi.create(payload)
      toast.success('Image ajoutée à la vitrine.')
      setForm(EMPTY_FORM)
      formRef.current?.reset()
      await load()
    } catch (error) {
      toast.error(error.response?.data?.image?.[0] || error.response?.data?.detail || 'L’image n’a pas pu être enregistrée.')
    } finally {
      setSending(false)
    }
  }

  const remove = async (image) => {
    if (!window.confirm('Supprimer l’image « ' + imageTitle(image) + ' » ?')) return
    setRemovingId(image.id)
    try {
      await galerieApi.delete(image.id)
      setImages((current) => current.filter((item) => item.id !== image.id))
      toast.success('Image supprimée.')
    } catch {
      toast.error('Suppression impossible.')
    } finally {
      setRemovingId(null)
    }
  }

  const focusUpload = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => titleInputRef.current?.focus(), 450)
  }

  const statCards = [
    {
      className: 'is-blue',
      icon: FiImage,
      value: images.length,
      label: 'Images publiées',
      hint: imagesThisMonth ? '+' + imagesThisMonth + ' ce mois-ci' : 'Aucune ce mois-ci',
      trend: imagesThisMonth ? 'up' : 'flat',
    },
    {
      className: 'is-green',
      icon: FiCheck,
      value: images.length,
      label: 'Visibles sur le site',
      hint: images.length ? '100 % de la galerie' : 'La galerie est prête',
      trend: 'flat',
    },
    {
      className: 'is-purple',
      icon: FiCalendar,
      value: linkedCount,
      label: 'Liées à un événement',
      hint: linkedCount ? linkedCount + ' image' + (linkedCount > 1 ? 's classées' : ' classée') : 'Aucune image liée',
      trend: 'flat',
    },
    {
      className: 'is-amber',
      icon: FiBarChart2,
      value: maxOrder,
      label: 'Ordre maximum utilisé',
      hint: 'Prochaine image : ordre ' + (maxOrder + 1),
      trend: 'flat',
    },
  ]

  return (
    <div className="galerie-reference">
      <header className="galerie-reference-page-head">
        <p className="galerie-reference-eyebrow">Galerie publique</p>
        <h1>Images de la vitrine</h1>
        <p>Ajoutez vos propres photos : elles apparaîtront immédiatement dans la galerie publique.</p>
      </header>

      <section className="galerie-reference-upload-panel" aria-labelledby="gallery-upload-title">
        <div className="galerie-reference-upload-head">
          <span className="galerie-reference-upload-icon" aria-hidden="true"><FiImage /></span>
          <div>
            <h2 id="gallery-upload-title">Publier une nouvelle image</h2>
            <p>Elle sera immédiatement visible sur le site vitrine de l’église.</p>
          </div>
        </div>

        <form ref={formRef} className="galerie-reference-upload-body" onSubmit={upload}>
          <div className="galerie-reference-upload-grid">
            <label className="galerie-reference-field" htmlFor="gallery-image-title">
              <span>Titre de l’image</span>
              <input
                ref={titleInputRef}
                id="gallery-image-title"
                type="text"
                value={form.titre}
                onChange={(event) => setForm((current) => ({ ...current, titre: event.target.value }))}
                placeholder="Ex. Baptême de juillet"
              />
            </label>

            <label className="galerie-reference-field" htmlFor="gallery-event">
              <span>Événement associé</span>
              <span className="galerie-reference-select-wrap">
                <select
                  id="gallery-event"
                  value={form.evenement}
                  onChange={(event) => setForm((current) => ({ ...current, evenement: event.target.value }))}
                >
                  <option value="">Aucun</option>
                  {evenements.map((evenement) => (
                    <option key={evenement.id} value={evenement.id}>{evenement.titre}</option>
                  ))}
                </select>
              </span>
            </label>

            <label className="galerie-reference-field" htmlFor="gallery-order">
              <span>Ordre</span>
              <input
                id="gallery-order"
                type="number"
                min="0"
                value={form.ordre}
                onChange={(event) => setForm((current) => ({ ...current, ordre: event.target.value }))}
                placeholder={String(maxOrder + 1)}
              />
            </label>

            <div className="galerie-reference-field">
              <span>Fichier image</span>
              <label className="galerie-reference-file-drop" htmlFor="gallery-image-file">
                <span className="galerie-reference-file-button">Choisir un fichier</span>
                <span className="galerie-reference-file-name">{form.image?.name || 'Aucun fichier choisi'}</span>
                <input
                  id="gallery-image-file"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null }))}
                />
              </label>
            </div>
          </div>

          <div className="galerie-reference-publish-row">
            <button type="submit" className="galerie-reference-publish-button" disabled={sending}>
              <FiUpload aria-hidden="true" />
              {sending ? 'Publication…' : 'Publier l’image'}
            </button>
            <span>Formats acceptés : JPG, PNG, WEBP · 10 Mo maximum</span>
          </div>
        </form>
      </section>

      <section className="galerie-reference-stats-grid" aria-label="Statistiques de la galerie">
        {statCards.map(({ className, icon: Icon, value, label, hint, trend }) => (
          <article className={'galerie-reference-stat-card ' + className} key={label}>
            <span className="galerie-reference-stat-icon" aria-hidden="true"><Icon /></span>
            <strong>{value}</strong>
            <p>{label}</p>
            <span className={'galerie-reference-stat-trend ' + trend}>
              {trend === 'up' && <FiBarChart2 aria-hidden="true" />}
              {hint}
            </span>
          </article>
        ))}
      </section>

      <section className="galerie-reference-overview-grid">
        <article className="galerie-reference-panel">
          <div className="galerie-reference-panel-head">
            <div>
              <h2>Répartition par événement</h2>
              <p>Images classées selon leur association.</p>
            </div>
            <span>{images.length} image{images.length > 1 ? 's' : ''}</span>
          </div>

          <div className="galerie-reference-donut-body">
            <div className="galerie-reference-donut" style={{ background: donutBackground }}>
              <div>
                <strong>{images.length}</strong>
                <span>IMAGE{images.length > 1 ? 'S' : ''}</span>
              </div>
            </div>
            <div className="galerie-reference-legend">
              {distribution.map((group) => (
                <div className="galerie-reference-legend-row" key={group.key}>
                  <span className="galerie-reference-legend-dot" style={{ backgroundColor: group.color }} aria-hidden="true" />
                  <span>{group.label}</span>
                  <strong>{group.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="galerie-reference-panel">
          <div className="galerie-reference-panel-head">
            <div>
              <h2>Activité récente</h2>
              <p>Derniers mouvements dans la galerie.</p>
            </div>
            <span>Récent</span>
          </div>

          <div className="galerie-reference-feed">
            {orderedImages.slice().sort(compareRecent).slice(0, 4).map((image) => (
              <div className="galerie-reference-feed-item" key={image.id}>
                <span className="galerie-reference-feed-icon" aria-hidden="true"><FiUpload /></span>
                <div>
                  <p><strong>{imageTitle(image)}</strong> publiée dans la galerie — ordre {Number(image.ordre) || 0}</p>
                  <span>{hasEvent(image) ? eventLabel(image) + ' · ' : ''}{formatActivityDate(image.date_ajout)}</span>
                </div>
              </div>
            ))}
            {!images.length && (
              <div className="galerie-reference-feed-empty">
                <FiClock aria-hidden="true" />
                <span>Aucune activité dans la galerie pour le moment.</span>
              </div>
            )}
          </div>
        </article>
      </section>

      <section aria-labelledby="gallery-list-title">
        <div className="galerie-reference-gallery-head">
          <div>
            <h2 id="gallery-list-title">Galerie publique</h2>
            <p>Ces images sont visibles par tous les visiteurs du site vitrine.</p>
          </div>
          <div className="galerie-reference-chips" role="group" aria-label="Filtrer les images">
            {filterOptions.map((filter) => (
              <button
                type="button"
                className={activeFilter === filter.key ? 'is-active' : ''}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        <div className="galerie-reference-gallery-grid">
          {loading && (
            <div className="galerie-reference-gallery-state">
              <span className="galerie-reference-spinner" aria-hidden="true" />
              Chargement de la galerie…
            </div>
          )}

          {!loading && !filteredImages.length && (
            <div className="galerie-reference-gallery-state">
              <FiImage aria-hidden="true" />
              {images.length ? 'Aucune image ne correspond à ce filtre.' : 'Aucune image publiée pour le moment.'}
            </div>
          )}

          {!loading && filteredImages.map((image) => (
            <article className="galerie-reference-card" key={image.id}>
              <div className="galerie-reference-card-image">
                {hasEvent(image) && <span className="galerie-reference-event-badge">{eventLabel(image)}</span>}
                <span className="galerie-reference-order-badge">Ordre : {Number(image.ordre) || 0}</span>
                <img src={getMediaUrl(image.image)} alt={imageTitle(image)} />
              </div>
              <div className="galerie-reference-card-info">
                <div>
                  <h3>{imageTitle(image)}</h3>
                  <p>{hasEvent(image) ? eventLabel(image) : 'Sans événement associé'}</p>
                </div>
                <button
                  type="button"
                  className="galerie-reference-delete-button"
                  onClick={() => remove(image)}
                  disabled={removingId === image.id}
                  aria-label={'Supprimer ' + imageTitle(image)}
                >
                  <FiTrash2 aria-hidden="true" />
                  {removingId === image.id ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </article>
          ))}

          {!loading && (
            <button type="button" className="galerie-reference-add-card" onClick={focusUpload}>
              <FiPlus aria-hidden="true" />
              <span>Ajouter une image</span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
