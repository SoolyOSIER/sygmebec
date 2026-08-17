// src/components/home/GaleriePreview.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import { Button } from '../ui/Button'

const previewImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=400',
    title: 'Événement principal',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?q=80&w=400',
    title: 'Atelier créatif',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400',
    title: 'Assemblée générale',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400',
    title: 'Gala de bienfaisance',
  },
]

const GaleriePreview = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <span className="section-subtitle">
              <ImageIcon className="w-4 h-4" />
              Galerie
            </span>
            <h2 className="section-title mt-2">
              Nos <span className="gradient-text">Moments</span> en Images
            </h2>
          </div>
          <Link to="/galerie">
            <Button variant="outline" className="group mt-4 md:mt-0">
              Voir toute la galerie
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm">{image.title}</p>
                </div>
              </div>
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-primary-600/20 flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GaleriePreview