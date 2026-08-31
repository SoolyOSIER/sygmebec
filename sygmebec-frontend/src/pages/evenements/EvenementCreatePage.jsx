import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useCreateEvenement } from '../../hooks/useEvenements'
import { useMembres } from '../../hooks/useMembres'
import EvenementForm from '../../components/evenements/EvenementForm'

export default function EvenementCreatePage() {
  const navigate = useNavigate()
  const { mutate: createEvenement, isPending } = useCreateEvenement()
  const { data: membres } = useMembres({ page_size: 1000 })
  const handleSubmit = (data) => createEvenement(data, { onSuccess: () => navigate('/evenements') })
  return <div className="programme-page">
    <button type="button" className="reference-back" onClick={() => navigate('/evenements')}><FiArrowLeft />Retour aux événements</button>
    <div className="programme-head"><div><span>Gestion des événements</span><h1>Nouvel événement</h1><p>Créez un événement, préparez sa publication et visualisez immédiatement sa présentation.</p></div></div>
    <EvenementForm onSubmit={handleSubmit} isLoading={isPending} membres={membres?.results || []} />
  </div>
}
