import { Link } from 'react-router-dom'

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </section>
  )
}

export function ErrorMessage({ error }) {
  if (!error) return null
  return <p className="notice notice-error">{error}</p>
}

export function Loading({ label = 'Chargement…' }) {
  return <div className="loading">{label}</div>
}

export function EventCard({ event }) {
  const eventDate = new Date(event.date)
  const places = event.places_restantes === null ? 'Places libres' : `${event.places_restantes} place(s) restante(s)`

  return (
    <article className="event-card">
      {event.image ? <img src={event.image} alt="" /> : <div className="event-image-placeholder">Événement</div>}
      <div className="event-content">
        <span className="event-category">{event.categorie}</span>
        <h3>{event.titre}</h3>
        <p className="event-meta">{eventDate.toLocaleDateString('fr-FR', { dateStyle: 'full' })} · {event.lieu}</p>
        <p>{event.description || 'Retrouvez-nous pour ce temps de partage et de communion.'}</p>
        <div className="event-footer">
          <span>{places}</span>
          <Link className="text-link" to={`/evenements/${event.id}`}>Voir l’événement</Link>
        </div>
      </div>
    </article>
  )
}

export function HoneypotField({ value, onChange }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label htmlFor="website">Votre site web</label>
      <input id="website" name="honeypot" value={value} onChange={onChange} tabIndex="-1" autoComplete="off" />
    </div>
  )
}

export function apiError(error) {
  const data = error?.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.error === 'string') return data.error
  if (data && typeof data === 'object') {
    const message = Object.values(data).flat().find(Boolean)
    if (message) return String(message)
  }
  return 'Une erreur est survenue. Veuillez réessayer.'
}
