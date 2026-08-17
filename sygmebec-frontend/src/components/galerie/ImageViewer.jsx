// src/components/galerie/ImageViewer.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download, Share2, Heart } from 'lucide-react'
import { Button } from '../ui/Button'

const ImageViewer = ({ image, images = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(images.findIndex(img => img.id === image.id))
  const [currentImage, setCurrentImage] = useState(image)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigateImage(-1)
      if (e.key === 'ArrowRight') navigateImage(1)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const navigateImage = (direction) => {
    if (images.length === 0) return
    const newIndex = (currentIndex + direction + images.length) % images.length
    setCurrentIndex(newIndex)
    setCurrentImage(images[newIndex])
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentImage.url
    link.download = currentImage.title || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-navy-900/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage(-1) }}
            className="absolute left-4 text-white/60 hover:text-white transition-colors z-10 hidden md:block"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage(1) }}
            className="absolute right-4 text-white/60 hover:text-white transition-colors z-10 hidden md:block"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Image */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative max-w-5xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.title}
          className="w-full h-full max-h-[80vh] object-contain rounded-xl"
        />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy-900/80 to-transparent rounded-b-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20 mb-2">
                {currentImage.category || 'Galerie'}
              </span>
              <h3 className="text-2xl font-playfair font-bold text-white">
                {currentImage.title}
              </h3>
              <p className="text-white/60 text-sm">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80%] px-4 py-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
                setCurrentImage(img)
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex ? 'border-gold-400 shadow-lg' : 'border-white/20 hover:border-white/40'
              }`}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ImageViewer