import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useCreateMembre, useFonctions, useStatuts } from '../../hooks/useMembres'
import MembreForm from '../../components/membres/MembreForm'

export default function MembreCreatePage() {
  const navigate = useNavigate()
  const { mutate: createMembre, isPending } = useCreateMembre()
  const { data: statuts } = useStatuts()
  const { data: fonctions } = useFonctions()
  const handleSubmit = (data) => createMembre(data, { onSuccess: (response) => navigate(`/membres/${response.data.id}`) })

  return <div className="programme-page">
    <button type="button" className="reference-back" onClick={() => navigate('/membres')}><FiArrowLeft />Retour aux membres</button>
    <div className="programme-head"><div><span>Gestion des membres</span><h1>Enregistrement d'un membre</h1><p>Ajoutez un membre dans le registre de l'assemblée, avec toutes les informations utiles au suivi.</p></div></div>
    <MembreForm onSubmit={handleSubmit} isLoading={isPending} statuts={statuts || []} fonctions={fonctions || []} />
  </div>
}
