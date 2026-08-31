// src/components/contact/Carte.jsx
import { useEffect, useRef } from 'react'

const Carte = ({ address = 'Paris, France' }) => {
  const mapRef = useRef(null)

  useEffect(() => {
    // Simulation d'une carte - Dans la vraie vie, utilisez Leaflet ou Google Maps
    // Ici nous affichons une image statique
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-elegant">
      <div className="aspect-[16/9] bg-gradient-to-br from-primary-50 to-gold-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">{address}</p>
          <p className="text-sm text-gray-400 mt-1">
            Cliquez pour voir sur Google Maps
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs shadow-lg">
        <span className="flex items-center gap-1 text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Ouvert
        </span>
      </div>
    </div>
  )
}

export default Carte