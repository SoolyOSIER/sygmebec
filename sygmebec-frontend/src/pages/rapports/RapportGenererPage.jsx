import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiFileText, FiInfo, FiLock } from 'react-icons/fi'
import { useGenerateRapport } from '../../hooks/useRapports'
import { useStatuts } from '../../hooks/useMembres'
import RapportForm from '../../components/rapports/RapportForm'
import '../programmeReference.css'

export default function RapportGenererPage() {
  const navigate = useNavigate()
  const { mutate: generate, isPending } = useGenerateRapport()
  const { data: statuts } = useStatuts()
  const submit = (data) => generate({ titre: data.titre, type_rapport: data.type_rapport, statut: data.statut || undefined, periode: data.periode || undefined, date_debut: data.date_debut || undefined, date_fin: data.date_fin || undefined }, { onSuccess: () => navigate('/rapports') })
  return <div className="programme-page report-generate-page">
    <button type="button" className="report-back" onClick={() => navigate('/rapports')}><FiArrowLeft />Retour aux rapports</button>
    <div className="programme-head"><div><span>Gestion des rapports</span><h1>Générer un rapport</h1><p>Créez un rapport personnalisé à partir des membres et activités de l’assemblée.</p></div><div className="report-ready"><i /><span>Prêt à générer</span></div></div>
    <div className="report-generate-layout"><section className="report-generate-card"><RapportForm onSubmit={submit} onCancel={() => navigate('/rapports')} isLoading={isPending} statuts={statuts || []} /></section><aside><article><i><FiInfo /></i><div><b>Rapport personnalisé</b><p>Sélectionnez un type, ajoutez vos critères, puis lancez la génération.</p></div></article><article><i><FiClock /></i><div><b>Génération en arrière-plan</b><p>Votre rapport apparaîtra dans la liste dès qu’il sera prêt.</p></div></article><article><i><FiLock /></i><div><b>Données protégées</b><p>Seuls les utilisateurs autorisés peuvent consulter les rapports.</p></div></article><div className="report-generate-note"><FiFileText /><p><b>Astuce :</b> laissez les filtres vides pour inclure tous les membres de l’assemblée.</p></div></aside></div>
  </div>
}
