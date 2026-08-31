// src/pages/Galerie.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

const galleryImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2070',
    title: 'Événement principal',
    category: 'Événements'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?q=80&w=2070',
    title: 'Atelier créatif',
    category: 'Ateliers'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070',
    title: 'Assemblée générale',
    category: 'Assemblées'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070',
    title: 'Gala de bienfaisance',
    category: 'Galas'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070',
    title: 'Dîner de gala',
    category: 'Galas'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
    title: 'Conférence',
    category: 'Conférences'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070',
    title: 'Réception',
    category: 'Événements'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
    title: 'Séminaire',
    category: 'Séminaires'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2070',
    title: 'Suite royale',
    category: 'Espaces'
  },
]

const categories = ['Tous', 'Événements', 'Ateliers', 'Assemblées', 'Galas', 'Conférences', 'Séminaires', 'Espaces']

const Galerie = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [selectedImage, setSelectedImage] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [currentIndex, setCurrentIndex] = useState(0)

  const filteredImages = selectedCategory === 'Tous'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory)

  const openLightbox = (image, index) => {
    setSelectedImage(image)
    setCurrentIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'auto'
  }

  const navigateLightbox = (direction) => {
    const newIndex = (currentIndex + direction + filteredImages.length) % filteredImages.length
    setCurrentIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
  }

  return (
    <>
      <SEO 
        title="Galerie - GESTMEMBRES"
        description="Découvrez notre galerie photos des événements et moments forts de notre communauté."
      />
      
      <div className="py-20">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <AnimatedSection>
              <span className="section-subtitle">
                <ImageIcon className="w-4 h-4" />
                Galerie
              </span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h1 className="section-title mt-4">
                Nos <span className="gradient-text">Souvenirs</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-gray-600 mt-4 text-lg">
                Découvrez en images les moments forts de notre communauté.
              </p>
            </AnimatedSection>
          </div>

          {/* Filters */}
          <AnimatedSection>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-primary-700 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-700 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-10 h-10 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-10 h-10 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Gallery Grid */}
          <AnimatePresence>
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }
            >
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`group cursor-pointer overflow-hidden rounded-2xl shadow-elegant hover:shadow-premium transition-all duration-500 ${
                    viewMode === 'grid' ? 'relative' : ''
                  }`}
                  onClick={() => openLightbox(image, index)}
                >
                  <div className={viewMode === 'grid' ? 'aspect-square' : 'flex'}>
                    <img
                      src={image.url}
                      alt={image.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                        viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : ''
                      }`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      viewMode === 'list' ? 'hidden' : ''
                    }`}>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <Badge variant="gold" className="mb-2">
                          {image.category}
                        </Badge>
                        <h4 className="text-white font-semibold">{image.title}</h4>
                      </div>
                    </div>
                    {viewMode === 'list' && (
                      <div className="flex-1 p-6 flex flex-col justify-center bg-white">
                        <Badge variant="default" className="mb-2 self-start">
                          {image.category}
                        </Badge>
                        <h4 className="text-xl font-playfair font-bold text-navy-900">{image.title}</h4>
                        <p className="text-gray-500 text-sm mt-2">Cliquez pour agrandir</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune image dans cette catégorie.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-900/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}
              className="absolute left-4 text-white/60 hover:text-white transition-colors hidden md:block"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}
              className="absolute right-4 text-white/60 hover:text-white transition-colors hidden md:block"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-full max-h-[80vh] object-contain rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy-900/80 to-transparent">
                <Badge variant="gold" className="mb-2">
                  {selectedImage.category}
                </Badge>
                <h3 className="text-2xl font-playfair font-bold text-white">{selectedImage.title}</h3>
                <p className="text-white/60 text-sm">
                  {currentIndex + 1} / {filteredImages.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Galerie