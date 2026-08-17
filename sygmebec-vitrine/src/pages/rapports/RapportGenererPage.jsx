// ============================================
// src/pages/rapports/RapportGenererPage.jsx - Version complète
// ============================================
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFileText, FiInfo } from 'react-icons/fi'
import { useGenerateRapport } from '../../hooks/useRapports'
import { useStatuts } from '../../hooks/useMembres'
import RapportForm from '../../components/rapports/RapportForm'
import AnimatedCard from '../../components/ui/AnimatedCard'
import Alert from '../../components/ui/Alert'

export default function RapportGenererPage() {
  const navigate = useNavigate()
  const { mutate: generate, isPending } = useGenerateRapport()
  const { data: statuts } = useStatuts()

  const handleSubmit = (data) => {
    const submitData = {
      titre: data.titre,
      statut: data.statut || undefined,
      periode: data.periode || undefined,
      dateFin: data.dateFin || undefined,
    }

    generate(submitData, {
      onSuccess: () => {
        navigate('/rapports')
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Générer un rapport</h1>
        <p className="text-secondary-500 mt-1">Créez un rapport personnalisé sur les membres de l'église</p>
      </div>

      <Alert
        type="info"
        title="Information"
        message="Les rapports sont générés en arrière-plan et seront disponibles dans la liste des rapports."
        icon={FiInfo}
      />

      <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6 max-w-2xl">
        <RapportForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          statuts={statuts || []}
        />
      </AnimatedCard>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-2xl"
      >
        <p className="text-sm text-amber-700 flex items-start gap-2">
          <FiInfo className="mt-0.5 flex-shrink-0" />
          <span>
            <strong>Astuce :</strong> Vous pouvez filtrer les membres par statut et période.
            Laissez les champs vides pour inclure tous les membres.
          </span>
        </p>
      </motion.div>
    </div>
  )
}