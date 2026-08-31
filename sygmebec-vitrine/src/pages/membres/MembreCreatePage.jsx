// ============================================
// src/pages/membres/MembreCreatePage.jsx
// ============================================
import { useNavigate } from 'react-router-dom'
import { useCreateMembre, useStatuts, useFonctions } from '../../hooks/useMembres'
import MembreForm from '../../components/membres/MembreForm'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function MembreCreatePage() {
  const navigate = useNavigate()
  const { mutate: createMembre, isPending } = useCreateMembre()
  const { data: statuts } = useStatuts()
  const { data: fonctions } = useFonctions()

  const handleSubmit = (data) => {
    createMembre(data, {
      onSuccess: (response) => {
        navigate(`/membres/${response.data.id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Nouveau membre</h1>
        <p className="text-secondary-500 mt-1">Enregistrer un nouveau membre dans l'église</p>
      </div>

      <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
        <MembreForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          statuts={statuts || []}
          fonctions={fonctions || []}
        />
      </AnimatedCard>
    </div>
  )
}