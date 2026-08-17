import React from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  message,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="modal-footer">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Confirmer
        </Button>
      </div>
    </Modal>
  )
}