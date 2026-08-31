// ============================================
// src/pages/membres/MembreEditPage.jsx
// ============================================
import { useParams, useNavigate } from 'react-router-dom'
import { useMembre, useUpdateMembre, useStatuts, useFonctions } from '../../hooks/useMembres'
import MembreForm from '../../components/membres/MembreForm'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function MembreEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: membre, isLoading } = useMembre(id)
  const { mutate: updateMembre, isPending } = useUpdateMembre()
  const { data: statuts } = useStatuts()
  const { data: fonctions } = useFonctions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-secondary-400">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!membre) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-400">Membre non trouvé</p>
      </div>
    )
  }

  const handleSubmit = (data) => {
    updateMembre({ id, data }, {
      onSuccess: () => {
        navigate(`/membres/${id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Modifier {membre.nom} {membre.prenom || ''}
        </h1>
        <p className="text-secondary-500 mt-1">Modifier les informations du membre</p>
      </div>

      <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
        <MembreForm
          initialData={membre}
          onSubmit={handleSubmit}
          isLoading={isPending}
          statuts={statuts || []}
          fonctions={fonctions || []}
          isEditing
        />
      </AnimatedCard>
    </div>
  )
}