// ============================================
// src/components/membres/StatutBadge.jsx
// ============================================
import Badge from '../ui/Badge'

const statusMap = {
  'Actif': { variant: 'success', label: 'Actif' },
  'Inactif': { variant: 'danger', label: 'Inactif' },
  'Suspendu': { variant: 'warning', label: 'Suspendu' },
  'Visiteur': { variant: 'info', label: 'Visiteur' },
  'Nouveau converti': { variant: 'purple', label: 'Nouveau converti' },
}

export default function StatutBadge({ statut }) {
  const config = statusMap[statut] || { variant: 'default', label: statut }
  return <Badge variant={config.variant}>{config.label}</Badge>
}