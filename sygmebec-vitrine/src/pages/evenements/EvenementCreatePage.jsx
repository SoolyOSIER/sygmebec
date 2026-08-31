// ============================================
// src/pages/evenements/EvenementCreatePage.jsx - Complété
// ============================================
import { useNavigate } from 'react-router-dom'
import { useCreateEvenement } from '../../hooks/useEvenements'
import { useMembres } from '../../hooks/useMembres'
import EvenementForm from '../../components/evenements/EvenementForm'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function EvenementCreatePage() {
  const navigate = useNavigate()
  const { mutate: createEvenement, isPending } = useCreateEvenement()
  const { data: membres } = useMembres({ page_size: 1000 })

  const handleSubmit = (data) => {
    createEvenement(data, {
      onSuccess: () => {
        navigate('/evenements')
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Nouvel événement</h1>
        <p className="text-secondary-500 mt-1">Créer un nouvel événement pour l'église</p>
      </div>

      <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
        <EvenementForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          membres={membres?.results || []}
        />
      </AnimatedCard>
    </div>
  )
}