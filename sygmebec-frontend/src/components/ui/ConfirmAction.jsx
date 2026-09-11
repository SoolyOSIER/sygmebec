import { useEffect, useRef, useState } from 'react'
export default function ConfirmAction({ title, description, word = 'CONFIRMER', passwordRequired = false, onConfirm, onClose }) {
  const ref = useRef(null)
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { ref.current?.showModal() }, [])
  return <dialog ref={ref} className="system-dialog system-console" onCancel={onClose} aria-labelledby="confirmation-title">
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); try { await onConfirm({ confirmation, password }); onClose() } catch (err) { setError(err.message) } finally { setBusy(false) } }}>
      <h2 id="confirmation-title">{title}</h2><p>{description}</p>
      <label>Saisissez {word}<input autoFocus value={confirmation} onChange={e => setConfirmation(e.target.value)} required /></label>
      {passwordRequired && <label>Mot de passe administrateur<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>}
      {error && <p role="alert">{error}</p>}
      <footer><button type="button" disabled={busy} onClick={onClose}>Annuler</button><button className="primary" disabled={busy || confirmation !== word}>{busy ? 'Op?ration en cours?' : 'Confirmer'}</button></footer>
    </form>
  </dialog>
}
