// ============================================
// src/components/membres/HistoriqueStatutList.jsx
// ============================================
import { formatDateTime } from '../../utils/formatDate'
import Badge from '../ui/Badge'

export default function HistoriqueStatutList({ historique = [] }) {
  if (historique.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-400">
        Aucun historique de statut
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {historique.map((item, index) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {index < historique.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative px-1">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white text-xs font-medium text-secondary-600">
                    {index + 1}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-medium text-secondary-900">
                      {item.ancien_statut}
                    </span>
                    <span className="mx-2 text-secondary-400">→</span>
                    <Badge variant="info">{item.nouveau_statut}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-secondary-400">
                    {formatDateTime(item.date_changement)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}