import { t, useTranslation } from '../i18n'
// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'
import SEO from '../components/common/SEO'
import { Button } from '../components/ui/Button'

const NotFound = () => {
  useTranslation()

  return (
    <>
      <SEO title={t("Page non trouvée - GESTMEMBRES")} />
      <div className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="container-custom max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-9xl font-playfair font-bold gradient-text mb-4">
              404
            </div>
            <h1 className="text-4xl font-playfair font-bold text-navy-900 mb-4">{t("Page non trouvée ")}</h1>
            <p className="text-gray-600 text-lg mb-8">{t("La page que vous recherchez n'existe pas ou a été déplacée. ")}</p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/">
                <Button variant="gold" className="group">
                  <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />{t("Accueil ")}</Button>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />{t("Retour ")}</button>
            </div>

            <div className="mt-8 p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <p className="text-sm text-gray-600">
                <Search className="w-4 h-4 inline mr-2 text-primary-600" />{t("Vous cherchez quelque chose en particulier ? ")}<Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium ml-1">{t("Contactez-nous ")}</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default NotFound