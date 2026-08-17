// ============================================
// src/components/membres/ChangerStatutModal.jsx
// ============================================
import { useState } from 'react'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Button from '../ui/Button'

export default function ChangerStatutModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatut,
  statuts,
  isLoading,
}) {
  const statutsList = Array.isArray(statuts) ? statuts : (statuts && statuts.results) ? statuts.results : []
  const [nouveauStatut, setNouveauStatut] = useState('')

  const handleSubmit = () => {
    if (nouveauStatut) {
      onConfirm({ nouveau_statut_id: parseInt(nouveauStatut) })
    }
  }

  const availableStatuts = statutsList.filter(s => s.libelle !== currentStatut)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Changer le statut">
      <div className="space-y-4">
        <p className="text-sm text-secondary-500">
          Statut actuel : <strong className="text-secondary-900">{currentStatut}</strong>
        </p>
        <Select
          label="Nouveau statut"
          value={nouveauStatut}
          onChange={(e) => setNouveauStatut(e.target.value)}
          placeholder="Sélectionner un nouveau statut"
          options={availableStatuts.map(s => ({ value: s.id, label: s.libelle }))}
          required
        />
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!nouveauStatut}
          >
            Changer le statut
          </Button>
        </div>
      </div>
    </Modal>
  )
}