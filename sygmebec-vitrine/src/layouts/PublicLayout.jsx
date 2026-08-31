// src/layouts/PublicLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from '../components/common/ScrollToTop'
import { useScrollRestoration } from '../hooks/useScrollRestoration'

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.98 },
}

const pageTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
}

const PublicLayout = () => {
  const location = useLocation()
  useScrollRestoration()

  useEffect(() => {
    // Préchargement des polices
    document.fonts.load('1rem Playfair Display')
    document.fonts.load('1rem Inter')
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background décoratif */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white/80 to-gold-50/40" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Orbes flottantes */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gold-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <Header />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-grow relative z-10 pt-20"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default PublicLayout