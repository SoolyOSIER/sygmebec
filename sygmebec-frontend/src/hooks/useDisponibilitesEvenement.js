// src/hooks/useDisponibilitesEvenement.js
import { useState, useEffect } from 'react'
import { evenementService } from '../services/evenementService'

export const useDisponibilitesEvenement = (evenementId) => {
  const [disponibilites, setDisponibilites] = useState({
    total: 0,
    disponibles: 0,
    inscrits: 0,
    charge: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!evenementId) {
      setLoading(false)
      return
    }

    const fetchDisponibilites = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await evenementService.getDisponibilites(evenementId)
        setDisponibilites(data)
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des disponibilités")
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDisponibilites()
  }, [evenementId])

  const isComplet = disponibilites.charge >= 100
  const isDisponible = disponibilites.disponibles > 0
  const placesRestantes = disponibilites.disponibles
  const tauxRemplissage = disponibilites.charge

  return {
    ...disponibilites,
    loading,
    error,
    isComplet,
    isDisponible,
    placesRestantes,
    tauxRemplissage,
  }
}