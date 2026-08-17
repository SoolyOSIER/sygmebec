// ============================================
// src/pages/evenements/EvenementEditPage.jsx - Complété
// ============================================
import { useParams, useNavigate } from 'react-router-dom'
import { useEvenement, useUpdateEvenement } from '../../hooks/useEvenements'
import { useMembres } from '../../hooks/useMembres'
import EvenementForm from '../../components/evenements/EvenementForm'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function EvenementEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: evenement, isLoading } = useEvenement(id)
  const { mutate: updateEvenement, isPending } = useUpdateEvenement()
  const { data: membres } = useMembres({ page_size: 1000 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-secondary-400">Chargement...</div>
      </div>
    )
  }

  if (!evenement) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-400">Événement non trouvé</p>
      </div>
    )
  }

  const handleSubmit = (data) => {
    updateEvenement({ id, data }, {
      onSuccess: () => {
        navigate(`/evenements/${id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Modifier {evenement.titre}
        </h1>
        <p className="text-secondary-500 mt-1">Modifier les informations de l'événement</p>
      </div>

      <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
        <EvenementForm
          initialData={{
            ...evenement,
            responsable: evenement.responsable?.id || '',
          }}
          onSubmit={handleSubmit}
          isLoading={isPending}
          membres={membres?.results || []}
          isEditing
        />
      </AnimatedCard>
    </div>
  )
}