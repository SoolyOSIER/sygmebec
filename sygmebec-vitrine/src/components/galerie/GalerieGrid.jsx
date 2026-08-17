// src/components/galerie/GalerieGrid.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Grid, List } from 'lucide-react'
import ImageViewer from './ImageViewer'
import { Button } from '../ui/Button'

const GalerieGrid = ({ images, categories = [], onCategoryChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedImage, setSelectedImage] = useState(null)

  const filteredImages = selectedCategory === 'Tous'
    ? images
    : images.filter(img => img.category === selectedCategory)

  const handleImageClick = (image) => {
    setSelectedImage(image)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseViewer = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'auto'
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category)
                onCategoryChange?.(category)
              }}
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

      {/* Grid */}
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
                viewMode === 'grid' ? 'relative aspect-square' : 'flex'
              }`}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.url}
                alt={image.title}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                  viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : ''
                }`}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                viewMode === 'list' ? 'hidden' : ''
              }`}>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20 mb-2">
                    {image.category}
                  </span>
                  <h4 className="text-white font-semibold text-sm">{image.title}</h4>
                </div>
              </div>
              {viewMode === 'list' && (
                <div className="flex-1 p-6 flex flex-col justify-center bg-white">
                  <span className="inline-block px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium self-start mb-2">
                    {image.category}
                  </span>
                  <h4 className="text-xl font-playfair font-bold text-navy-900">{image.title}</h4>
                  <p className="text-gray-500 text-sm mt-2">Cliquez pour agrandir</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune image dans cette catégorie.</p>
        </div>
      )}

      {/* Image Viewer */}
      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          images={filteredImages}
          onClose={handleCloseViewer}
        />
      )}
    </>
  )
}

export default GalerieGrid